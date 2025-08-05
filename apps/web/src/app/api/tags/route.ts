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
    const query = searchParams.get('q') || ''

    const tags = await prisma.tag.findMany({
      where: {
        userId: session.user.id,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Tags fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
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
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: {
        name_userId: {
          name: trimmedName,
          userId: session.user.id,
        },
      },
    })

    if (existingTag) {
      return NextResponse.json(existingTag)
    }

    const tag = await prisma.tag.create({
      data: {
        name: trimmedName,
        userId: session.user.id,
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Tag creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
} 