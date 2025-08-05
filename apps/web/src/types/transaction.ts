export interface Transaction {
  id: string
  amount: number
  currency: string
  type: 'INCOME' | 'EXPENSE'
  description: string | null
  date: string
  tags: string[]
  portfolioId?: string | null
  userId: string
  createdAt: string
  updatedAt: string
} 