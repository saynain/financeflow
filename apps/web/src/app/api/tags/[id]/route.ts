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
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Check if tag belongs to user
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Check if new name conflicts with existing tag
    const conflictingTag = await prisma.tag.findUnique({
      where: {
        name_userId: {
          name: trimmedName,
          userId: session.user.id,
        },
      },
    })

    if (conflictingTag && conflictingTag.id !== params.id) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name: trimmedName,
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Tag update error:', error)
    return NextResponse.json(
      { error: 'Failed to update tag' },
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

    // Check if tag belongs to user
    const tag = await prisma.tag.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Find all transactions that use this tag
    const transactionsWithTag = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        tags: {
          has: tag.name,
        },
      },
    })

    // Remove the tag from all transactions that use it
    const updatePromises = transactionsWithTag.map(transaction => 
      prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          tags: transaction.tags.filter(t => t !== tag.name),
        },
      })
    )

    // Execute all updates
    await Promise.all(updatePromises)

    // Delete the tag
    await prisma.tag.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ 
      success: true,
      deletedTag: tag.name,
      updatedTransactions: transactionsWithTag.length
    })
  } catch (error) {
    console.error('Tag deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    )
  }
} 