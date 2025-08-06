import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@financeflow/database'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { budgetIds } = await request.json()

    if (!budgetIds || !Array.isArray(budgetIds)) {
      return NextResponse.json({ error: 'Invalid budget order data' }, { status: 400 })
    }

    // Update the order of budgets
    const updates = budgetIds.map((budgetId: string, index: number) => 
      prisma.tagBudget.update({
        where: {
          id: budgetId,
          userId: session.user.id, // Ensure user owns this budget
        },
        data: {
          order: index,
        },
      })
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Budget reorder error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder budgets' },
      { status: 500 }
    )
  }
} 