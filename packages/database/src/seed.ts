import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  })

  console.log('✅ Created test user:', user.email)

  // Create categories
  const categories = await prisma.category.createMany({
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
    skipDuplicates: true,
  })

  console.log('✅ Created categories:', categories.count)

  // Get categories for transactions
  const allCategories = await prisma.category.findMany({
    where: { userId: user.id }
  })

  const salaryCategory = allCategories.find(c => c.name === 'Salary')!
  const housingCategory = allCategories.find(c => c.name === 'Housing')!
  const foodCategory = allCategories.find(c => c.name === 'Food & Dining')!
  const transportCategory = allCategories.find(c => c.name === 'Transportation')!

  // Create sample transactions
  const now = new Date()
  const transactions = await prisma.transaction.createMany({
    data: [
      {
        amount: 8500,
        type: 'INCOME',
        description: 'Monthly Salary',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        categoryId: salaryCategory.id,
        userId: user.id,
      },
      {
        amount: 1200,
        type: 'EXPENSE',
        description: 'Monthly Rent',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        categoryId: housingCategory.id,
        userId: user.id,
      },
      {
        amount: 142.50,
        type: 'EXPENSE',
        description: 'Walmart Grocery',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        categoryId: foodCategory.id,
        userId: user.id,
      },
      {
        amount: 65,
        type: 'EXPENSE',
        description: 'Shell Gas Station',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
        categoryId: transportCategory.id,
        userId: user.id,
      },
    ],
  })

  console.log('✅ Created transactions:', transactions.count)

  // Create budget
  const budget = await prisma.budget.create({
    data: {
      name: 'Monthly Budget',
      amount: 4300,
      period: 'MONTHLY',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      userId: user.id,
    },
  })

  console.log('✅ Created budget:', budget.name)

  // Create savings goals
  const savingsGoals = await prisma.savingsGoal.createMany({
    data: [
      {
        name: 'Vacation Fund',
        targetAmount: 5000,
        currentAmount: 3250,
        targetDate: new Date(now.getFullYear(), 6, 1),
        icon: '🏖️',
        userId: user.id,
      },
      {
        name: 'New Car',
        targetAmount: 20000,
        currentAmount: 8000,
        targetDate: new Date(now.getFullYear(), 11, 31),
        icon: '🚗',
        userId: user.id,
      },
      {
        name: 'Emergency Fund',
        targetAmount: 15000,
        currentAmount: 15000,
        targetDate: new Date(now.getFullYear() + 1, 0, 1),
        icon: '🏦',
        userId: user.id,
      },
    ],
  })

  console.log('✅ Created savings goals:', savingsGoals.count)

  console.log('🎉 Seed completed successfully!')
  console.log('\n📧 Test user credentials:')
  console.log('Email: test@example.com')
  console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
