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
    
    // Get user's preferred currency
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true }
    })
    const userCurrency = user?.currency || 'USD'

    const now = new Date()
    const startOfCurrentMonth = startOfMonth(now)
    const endOfCurrentMonth = endOfMonth(now)
    const startOfLastMonth = startOfMonth(subMonths(now, 1))
    const endOfLastMonth = endOfMonth(subMonths(now, 1))

    // Get current month transactions
    const currentMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    })

    // Get last month transactions
    const lastMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    })

    // Calculate current month stats
    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0)

    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0)

    // Calculate last month stats
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0)

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0)

    // Get all transactions for total balance
    const allTransactions = await prisma.transaction.findMany({
      where: { userId },
    })

    const totalIncome = allTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0)

    const totalExpenses = allTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0)

    const totalBalance = totalIncome - totalExpenses

    // Calculate changes
    const incomeChange = lastMonthIncome > 0 
      ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 
      : 0

    const expenseChange = lastMonthExpenses > 0 
      ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
      : 0

    const savingsRate = currentMonthIncome > 0 
      ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100 
      : 0

    const lastMonthSavingsRate = lastMonthIncome > 0 
      ? ((lastMonthIncome - lastMonthExpenses) / lastMonthIncome) * 100 
      : 0

    const savingsRateChange = savingsRate - lastMonthSavingsRate

    return NextResponse.json({
      totalBalance,
      monthlyIncome: currentMonthIncome,
      monthlyExpenses: currentMonthExpenses,
      savingsRate,
      currency: userCurrency,
      changes: {
        income: incomeChange,
        expenses: expenseChange,
        savingsRate: savingsRateChange,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
