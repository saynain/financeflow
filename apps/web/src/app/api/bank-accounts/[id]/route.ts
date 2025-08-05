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

    const bankAccount = await prisma.bankAccount.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      include: {
        portfolio: true,
      },
    })

    if (!bankAccount) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    return NextResponse.json(bankAccount)
  } catch (error) {
    console.error('Bank account fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bank account' },
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

    // Check if bank account exists and belongs to user
    const existingBankAccount = await prisma.bankAccount.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
    })

    if (!existingBankAccount) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
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

    const bankAccount = await prisma.bankAccount.update({
      where: { id: params.id },
      data: {
        name,
        accountType,
        accountNumber,
        routingNumber,
        institution,
        balance,
        currency,
        isConnected,
        portfolioId,
      },
      include: {
        portfolio: true,
      },
    })

    return NextResponse.json(bankAccount)
  } catch (error) {
    console.error('Bank account update error:', error)
    return NextResponse.json(
      { error: 'Failed to update bank account' },
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

    // Check if bank account exists and belongs to user
    const existingBankAccount = await prisma.bankAccount.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
    })

    if (!existingBankAccount) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    await prisma.bankAccount.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Bank account deleted successfully' })
  } catch (error) {
    console.error('Bank account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete bank account' },
      { status: 500 }
    )
  }
} 