import { useQuery } from '@tanstack/react-query'

export interface TagGroup {
  tag: string
  totalSpent: number
  totalIncome: number
  transactionCount: number
  transactions: Array<{
    id: string
    amount: number
    type: string
    date: string
    description?: string
  }>
}

export interface BudgetTagsData {
  tagGroups: TagGroup[]
  totalSpent: number
  totalIncome: number
  period: string
  startDate: string
  endDate: string
}

export function useBudgetTags(period: string = 'current', startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['budget-tags', period, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ period })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`/api/budget/tags?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch budget data')
      }
      return response.json() as Promise<BudgetTagsData>
    },
  })
} 