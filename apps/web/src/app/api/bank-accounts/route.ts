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
    const portfolioId = searchParams.get('portfolioId')

    const bankAccounts = await prisma.bankAccount.findMany({
      where: { 
        userId: session.user.id,
        ...(portfolioId && { portfolioId })
      },
      include: {
        portfolio: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bankAccounts)
  } catch (error) {
    console.error('Bank accounts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bank accounts' },
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
    const { 
      name, 
      accountType, 
      accountNumber, 
      routingNumber, 
      institution, 
      balance, 
      currency, 
      isConnected, 
      portfolioId 
    } = body

    if (!name || !accountType) {
      return NextResponse.json(
        { error: 'Name and account type are required' },
        { status: 400 }
      )
    }

    // If portfolioId is provided, verify it belongs to the user
    if (portfolioId) {
      const portfolio = await prisma.portfolio.findFirst({
        where: { 
          id: portfolioId,
          userId: session.user.id 
        },
      })

      if (!portfolio) {
        return NextResponse.json(
          { error: 'Portfolio not found' },
          { status: 404 }
        )
      }
    }

    const bankAccount = await prisma.bankAccount.create({
      data: {
        name,
        accountType,
        accountNumber,
        routingNumber,
        institution,
        balance: balance || 0,
        currency: currency || 'USD',
        isConnected: isConnected || false,
        portfolioId,
        userId: session.user.id,
      },
      include: {
        portfolio: true,
      },
    })

    return NextResponse.json(bankAccount, { status: 201 })
  } catch (error) {
    console.error('Bank account creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create bank account' },
      { status: 500 }
    )
  }
} 