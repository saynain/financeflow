import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@financeflow/database'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'current' // current, last, custom
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    let dateFilter: any = {}
    if (period === 'current') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      dateFilter = {
        gte: startOfMonth,
        lte: endOfMonth,
      }
    } else if (period === 'last') {
      const now = new Date()
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      dateFilter = {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      }
    } else if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Get all transactions for the user in the date range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: dateFilter,
      },
      select: {
        id: true,
        amount: true,
        type: true,
        tags: true,
        date: true,
      },
    })

    // Group transactions by tags
    const tagGroups: Record<string, {
      tag: string
      totalSpent: number
      totalIncome: number
      transactionCount: number
      transactions: Array<{
        id: string
        amount: number
        type: string
        date: string
        description?: string
      }>
    }> = {}

    transactions.forEach(transaction => {
      if (transaction.tags && transaction.tags.length > 0) {
        transaction.tags.forEach(tag => {
          if (!tagGroups[tag]) {
            tagGroups[tag] = {
              tag,
              totalSpent: 0,
              totalIncome: 0,
              transactionCount: 0,
              transactions: [],
            }
          }

          if (transaction.type === 'EXPENSE') {
            tagGroups[tag].totalSpent += Number(transaction.amount)
          } else {
            tagGroups[tag].totalIncome += Number(transaction.amount)
          }

          tagGroups[tag].transactionCount++
          tagGroups[tag].transactions.push({
            id: transaction.id,
            amount: Number(transaction.amount),
            type: transaction.type,
            date: transaction.date.toISOString(),
          })
        })
      }
    })

    // Convert to array and sort by total spent (descending)
    const tagGroupsArray = Object.values(tagGroups).sort((a, b) => b.totalSpent - a.totalSpent)

    // Calculate totals
    const totalSpent = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return NextResponse.json({
      tagGroups: tagGroupsArray,
      totalSpent,
      totalIncome,
      period,
      startDate: dateFilter.gte,
      endDate: dateFilter.lte,
    })
  } catch (error) {
    console.error('Budget tags fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budget data' },
      { status: 500 }
    )
  }
} 