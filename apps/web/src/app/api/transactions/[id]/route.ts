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
    const { amount, currency, type, description, date, tags } = body

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

    // Process tags - create new ones if they don't exist
    const processedTags: string[] = []
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        if (typeof tagName === 'string' && tagName.trim()) {
          const trimmedName = tagName.trim()
          
          // Check if tag exists, create if it doesn't
          let tag = await prisma.tag.findUnique({
            where: {
              name_userId: {
                name: trimmedName,
                userId: session.user.id,
              },
            },
          })

          if (!tag) {
            tag = await prisma.tag.create({
              data: {
                name: trimmedName,
                userId: session.user.id,
              },
            })
          }

          processedTags.push(tag.name)
        }
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        amount,
        currency: currency || 'USD',
        type,
        description,
        date: new Date(date),
        tags: processedTags,
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
