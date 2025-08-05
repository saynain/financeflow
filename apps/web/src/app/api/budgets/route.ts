import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@financeflow/database'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Get current month's expenses grouped by tags
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        amount: true,
        tags: true,
      },
    })

    // Group expenses by tags
    const tagSpending: Record<string, number> = {}
    transactions.forEach(transaction => {
      if (transaction.tags && transaction.tags.length > 0) {
        transaction.tags.forEach(tag => {
          tagSpending[tag] = (tagSpending[tag] || 0) + Number(transaction.amount)
        })
      }
    })

    // Convert to array and sort by spending
    const tagGroups = Object.entries(tagSpending)
      .map(([tag, spent]) => ({
        id: tag,
        name: tag,
        icon: '🏷️',
        categories: [{
          id: tag,
          name: tag,
          icon: '🏷️',
          budgetLimit: 0, // No budget limits for tags yet
          currency: 'USD',
          spent,
          color: null,
          parentId: null,
        }],
        totalBudget: 0,
        totalSpent: spent,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)

    const totalSpent = Object.values(tagSpending).reduce((sum, amount) => sum + amount, 0)

    return NextResponse.json({
      budgets: tagGroups,
      totalBudget: 0, // No budget system for tags yet
      totalSpent,
      mainCategories: [], // No categories in tag system
    })
  } catch (error) {
    console.error('Budgets fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return success but no-op since we don't have budget limits for tags
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Budget update error:', error)
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    )
  }
}
