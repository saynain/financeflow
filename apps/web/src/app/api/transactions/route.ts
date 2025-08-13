import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@financeflow/database'
import { getTagColor } from '@/lib/tag-colors'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') || undefined // INCOME | EXPENSE
    const q = (searchParams.get('q') || '').trim()
    const tagsParam = searchParams.get('tags') || ''
    const tags = tagsParam
      ? tagsParam
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []
    const startDateParam = searchParams.get('startDate') || undefined
    const endDateParam = searchParams.get('endDate') || undefined
    const sortBy = (searchParams.get('sortBy') || 'date') as
      | 'date'
      | 'amount'
      | 'description'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Build Prisma where clause based on filters
    const where: any = { userId: session.user.id }
    if (type === 'INCOME' || type === 'EXPENSE') {
      where.type = type
    }
    if (q) {
      where.OR = [
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }
    if (tags.length > 0) {
      where.tags = { hasSome: tags }
    }
    if (startDateParam || endDateParam) {
      where.date = {}
      if (startDateParam) where.date.gte = new Date(startDateParam)
      if (endDateParam) where.date.lte = new Date(endDateParam)
    }

    const orderBy =
      sortBy === 'amount'
        ? { amount: sortOrder }
        : sortBy === 'description'
          ? { description: sortOrder }
          : { date: sortOrder }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
    })

    const total = await prisma.transaction.count({
      where,
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
    const { amount, currency, type, description, date, tags } = body

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
            // Generate a color for the new tag
            const color = getTagColor(trimmedName)
            
            tag = await prisma.tag.create({
              data: {
                name: trimmedName,
                color,
                userId: session.user.id,
              },
            })
          }

          processedTags.push(tag.name)
        }
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        currency: currency || 'USD',
        type,
        description,
        date: new Date(date),
        tags: processedTags,
        userId: session.user.id,
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
