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
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.transaction.count({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
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
    const { amount, type, description, date, categoryId } = body

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        description,
        date: new Date(date),
        categoryId,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Transaction creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
