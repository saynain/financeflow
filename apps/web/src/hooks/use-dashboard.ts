import { useQuery } from '@tanstack/react-query'

interface DashboardStats {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  changes: {
    income: number
    expenses: number
    savingsRate: number
  }
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      return response.json()
    },
  })
}

interface Transaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string | null
  date: string
  category: {
    id: string
    name: string
    icon: string | null
  }
}

interface TransactionsResponse {
  transactions: Transaction[]
  total: number
  limit: number
  offset: number
}

export function useTransactions(limit = 10, offset = 0) {
  return useQuery<TransactionsResponse>({
    queryKey: ['transactions', limit, offset],
    queryFn: async () => {
      const response = await fetch(`/api/transactions?limit=${limit}&offset=${offset}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      return response.json()
    },
  })
}

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  icon: string | null
  color: string | null
  budgetLimit: number | null
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      return response.json()
    },
  })
}

interface ChartData {
  cashFlow: Array<{
    month: string
    income: number
    expenses: number
  }>
  expenseBreakdown: Array<{
    name: string
    value: number
    color: string
  }>
}

export function useChartData() {
  return useQuery<ChartData>({
    queryKey: ['dashboard-charts'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/charts')
      if (!response.ok) {
        throw new Error('Failed to fetch chart data')
      }
      return response.json()
    },
  })
}
