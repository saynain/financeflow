import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@financeflow/database'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      include: {
        bankAccounts: true,
      },
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}

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
    const { name, description, type, currency } = body

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
    })

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const portfolio = await prisma.portfolio.update({
      where: { id: params.id },
      data: {
        name,
        description,
        type,
        currency,
      },
      include: {
        bankAccounts: true,
      },
    })

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Portfolio update error:', error)
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
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

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
    })

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Delete the portfolio (this will cascade delete bank accounts due to the schema)
    await prisma.portfolio.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Portfolio deleted successfully' })
  } catch (error) {
    console.error('Portfolio deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete portfolio' },
      { status: 500 }
    )
  }
} 