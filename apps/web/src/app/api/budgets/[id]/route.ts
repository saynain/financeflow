import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@financeflow/database'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, items } = await request.json()

    if (!name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid budget data' }, { status: 400 })
    }

    // Update the budget
    const budget = await prisma.tagBudget.update({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user owns this budget
      },
      data: {
        name,
        items: {
          deleteMany: {}, // Delete all existing items
          create: items.map((item: { tag: string; amount: number }) => ({
            tag: item.tag,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Budget update error:', error)
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the budget (items will be deleted automatically due to cascade)
    await prisma.tagBudget.delete({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user owns this budget
      },
    })

    // Reorder remaining budgets
    const remainingBudgets = await prisma.tagBudget.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        order: 'asc',
      },
    })

    // Update order for remaining budgets
    const updates = remainingBudgets.map((budget, index) =>
      prisma.tagBudget.update({
        where: { id: budget.id },
        data: { order: index },
      })
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Budget deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    )
  }
} 