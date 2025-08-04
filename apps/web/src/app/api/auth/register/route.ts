import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@financeflow/database'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    // Create default categories for the user
    await prisma.category.createMany({
      data: [
        { name: 'Salary', type: 'INCOME', userId: user.id, icon: '💰' },
        { name: 'Freelance', type: 'INCOME', userId: user.id, icon: '💻' },
        { name: 'Housing', type: 'EXPENSE', userId: user.id, icon: '🏠' },
        { name: 'Food & Dining', type: 'EXPENSE', userId: user.id, icon: '🍽️' },
        { name: 'Transportation', type: 'EXPENSE', userId: user.id, icon: '🚗' },
        { name: 'Shopping', type: 'EXPENSE', userId: user.id, icon: '🛍️' },
        { name: 'Entertainment', type: 'EXPENSE', userId: user.id, icon: '🎬' },
        { name: 'Utilities', type: 'EXPENSE', userId: user.id, icon: '💡' },
        { name: 'Healthcare', type: 'EXPENSE', userId: user.id, icon: '🏥' },
        { name: 'Other', type: 'EXPENSE', userId: user.id, icon: '📦' },
      ],
    })

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}
