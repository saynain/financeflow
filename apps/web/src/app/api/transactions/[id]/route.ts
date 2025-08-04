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

    const body = await request.json()
    const { amount, type, description, date, categoryId } = body

    // Verify the transaction belongs to the user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        amount,
        type,
        description,
        date: new Date(date),
        categoryId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Transaction update error:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
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

    // Verify the transaction belongs to the user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Transaction deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
