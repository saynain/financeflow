import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@financeflow/database'
import { SUPPORTED_CURRENCIES } from '@/lib/currencies'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currency } = await request.json()

    // Validate currency
    const isValidCurrency = SUPPORTED_CURRENCIES.some(c => c.code === currency)
    if (!isValidCurrency) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
    }

    // Update user currency
    await prisma.user.update({
      where: { id: session.user.id },
      data: { currency }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating currency:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currency: true }
    })

    return NextResponse.json({ currency: user?.currency || 'USD' })
  } catch (error) {
    console.error('Error fetching currency:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 