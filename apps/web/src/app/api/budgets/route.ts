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

    // Get all categories with their budget limits and parent info
    const categories = await prisma.category.findMany({
      where: { 
        userId,
        type: 'EXPENSE'
      },
      include: {
        parent: true,
        children: true,
      },
      orderBy: { name: 'asc' },
    })

    // Get current month's expenses grouped by category
    const expenses = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    // Create a map of category spending
    const spendingMap = new Map(
      expenses.map(e => [e.categoryId, e._sum.amount?.toNumber() || 0])
    )

    // First, get all main categories (categories without parents)
    const mainCategories = categories.filter(cat => !cat.parentId)
    
    // Create budget groups based on actual main categories
    const budgetGroups = mainCategories.map(mainCat => {
      // Get all subcategories for this main category
      const subcategories = categories.filter(cat => cat.parentId === mainCat.id)
      
      // Calculate spending for subcategories
      const categoryData = subcategories.map(subCat => ({
        id: subCat.id,
        name: subCat.name,
        icon: subCat.icon,
        budgetLimit: subCat.budgetLimit?.toNumber() || 0,
        currency: subCat.currency || 'USD',
        spent: spendingMap.get(subCat.id) || 0,
        color: subCat.color,
        parentId: subCat.parentId,
      }))

      const totalBudget = categoryData.reduce((sum, cat) => sum + cat.budgetLimit, 0)
      const totalSpent = categoryData.reduce((sum, cat) => sum + cat.spent, 0)

      return {
        id: mainCat.id,
        name: mainCat.name,
        icon: mainCat.icon,
        categories: categoryData,
        totalBudget,
        totalSpent,
      }
    })

    // Add any orphaned categories (without parent) that are not main categories
    const orphanedCategories = categories.filter(cat => 
      cat.parentId && !mainCategories.find(main => main.id === cat.parentId)
    )

    if (orphanedCategories.length > 0) {
      const orphanedData = orphanedCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        budgetLimit: cat.budgetLimit?.toNumber() || 0,
        currency: cat.currency || 'USD',
        spent: spendingMap.get(cat.id) || 0,
        color: cat.color,
        parentId: cat.parentId,
      }))

      budgetGroups.push({
        id: 'other',
        name: 'Other',
        icon: '📦',
        categories: orphanedData,
        totalBudget: orphanedData.reduce((sum, cat) => sum + cat.budgetLimit, 0),
        totalSpent: orphanedData.reduce((sum, cat) => sum + cat.spent, 0),
      })
    }

    // Calculate totals
    const allCategories = categories.filter(cat => cat.parentId) // Only subcategories have budgets
    const totalBudget = allCategories.reduce((sum, cat) => sum + (cat.budgetLimit?.toNumber() || 0), 0)
    const totalSpent = allCategories.reduce((sum, cat) => sum + (spendingMap.get(cat.id) || 0), 0)

    return NextResponse.json({
      budgets: budgetGroups.filter(group => group.categories.length > 0 || group.id !== 'other'),
      totalBudget,
      totalSpent,
      mainCategories: mainCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
      })),
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

    const body = await request.json()
    const { categoryId, budgetLimit, currency } = body

    // Update category budget limit
    const category = await prisma.category.update({
      where: {
        id: categoryId,
        userId: session.user.id, // Ensure user owns the category
      },
      data: {
        budgetLimit,
        currency: currency || 'USD',
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Budget update error:', error)
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    )
  }
}
