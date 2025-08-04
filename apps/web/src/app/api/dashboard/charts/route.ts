import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@financeflow/database'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()

    // Get last 6 months of data
    const monthsData = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const start = startOfMonth(monthDate)
      const end = endOfMonth(monthDate)

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lte: end,
          },
        },
      })

      const income = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount.toNumber(), 0)

      const expenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount.toNumber(), 0)

      monthsData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        income,
        expenses,
      })
    }

    // Get expense breakdown for current month
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)

    const currentMonthExpenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      include: {
        category: true,
      },
    })

    // Group expenses by category
    const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
      const categoryName = transaction.category.name
      acc[categoryName] = (acc[categoryName] || 0) + transaction.amount.toNumber()
      return acc
    }, {} as Record<string, number>)

    // Convert to array format for the chart
    const expenseBreakdown = Object.entries(expensesByCategory)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 categories

    // Add "Others" category if there are more than 5
    if (Object.keys(expensesByCategory).length > 5) {
      const othersTotal = Object.entries(expensesByCategory)
        .slice(5)
        .reduce((sum, [, value]) => sum + value, 0)
      
      if (othersTotal > 0) {
        expenseBreakdown.push({ name: 'Others', value: othersTotal })
      }
    }

    // Assign colors to categories
    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
    const expenseBreakdownWithColors = expenseBreakdown.map((item, index) => ({
      ...item,
      color: colors[index % colors.length],
    }))

    return NextResponse.json({
      cashFlow: monthsData,
      expenseBreakdown: expenseBreakdownWithColors,
    })
  } catch (error) {
    console.error('Chart data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}
