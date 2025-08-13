import { useQuery } from '@tanstack/react-query'
import { Transaction } from '@/types/transaction'

interface BudgetCategory {
  id: string
  name: string
  icon: string | null
  budgetLimit: number
  currency: string
  spent: number
  color: string | null
  parentId: string | null
}

interface BudgetGroup {
  id: string
  name: string
  icon: string | null
  categories: BudgetCategory[]
  totalBudget: number
  totalSpent: number
}

interface BudgetsResponse {
  budgets: BudgetGroup[]
  totalBudget: number
  totalSpent: number
  mainCategories: { id: string; name: string; icon: string | null }[]
}

export function useBudgets() {
  return useQuery<BudgetsResponse>({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await fetch('/api/budgets')
      if (!response.ok) {
        throw new Error('Failed to fetch budgets')
      }
      return response.json()
    },
  })
}

interface DashboardStats {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  currency: string
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

interface TransactionsResponse {
  transactions: Transaction[]
  total: number
  limit: number
  offset: number
}

export type TransactionsFilters = {
  type?: 'INCOME' | 'EXPENSE'
  q?: string
  tags?: string[]
  startDate?: string
  endDate?: string
  sortBy?: 'date' | 'amount' | 'description'
  sortOrder?: 'asc' | 'desc'
}

export function useTransactions(
  limit = 10,
  offset = 0,
  filters: TransactionsFilters = {}
) {
  return useQuery<TransactionsResponse>({
    queryKey: ['transactions', limit, offset, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      })
      if (filters.type) params.set('type', filters.type)
      if (filters.q) params.set('q', filters.q)
      if (filters.tags && filters.tags.length > 0)
        params.set('tags', filters.tags.join(','))
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)
      if (filters.sortBy) params.set('sortBy', filters.sortBy)
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/transactions?${params.toString()}`)
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
