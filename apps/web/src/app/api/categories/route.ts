import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@financeflow/database'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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
    const { name, type, icon, color, budgetLimit, parentId, isMainCategory } = body

    // If creating a main category, ensure it has no parent
    if (isMainCategory) {
      const category = await prisma.category.create({
        data: {
          name,
          type,
          icon,
          color,
          budgetLimit: null, // Main categories don't have budgets
          parentId: null,
          userId: session.user.id,
        },
      })
      return NextResponse.json(category, { status: 201 })
    }

    // For subcategories
    const category = await prisma.category.create({
      data: {
        name,
        type,
        icon,
        color,
        budgetLimit,
        parentId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
