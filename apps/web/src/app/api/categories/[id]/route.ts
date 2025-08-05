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

    // Verify the tag belongs to the user
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name,
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

    // Note: We don't delete tags that are in use by transactions
    // Tags are automatically created when used in transactions
    // This endpoint is mainly for cleanup of unused tags

    await prisma.tag.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tag deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    )
  }
}
