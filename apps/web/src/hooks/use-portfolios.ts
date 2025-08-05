import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Portfolio {
  id: string
  name: string
  description?: string
  type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CRYPTO' | 'OTHER'
  currency: string
  userId: string
  createdAt: string
  updatedAt: string
  bankAccounts?: BankAccount[]
}

export interface BankAccount {
  id: string
  name: string
  accountType: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'OTHER'
  accountNumber?: string
  routingNumber?: string
  institution?: string
  balance: number
  currency: string
  isConnected: boolean
  portfolioId?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export function usePortfolios() {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: async (): Promise<Portfolio[]> => {
      const response = await fetch('/api/portfolios')
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios')
      }
      return response.json()
    },
  })
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      type: Portfolio['type']
      currency?: string
    }) => {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to create portfolio')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })
}

export function useUpdatePortfolio() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string
      data: Partial<Portfolio>
    }) => {
      const response = await fetch(`/api/portfolios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to update portfolio')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })
}

export function useDeletePortfolio() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/portfolios/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete portfolio')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      name: string
      accountType: BankAccount['accountType']
      accountNumber?: string
      routingNumber?: string
      institution?: string
      balance?: number
      currency?: string
      isConnected?: boolean
      portfolioId?: string
    }) => {
      const response = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to create bank account')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string
      data: Partial<BankAccount>
    }) => {
      const response = await fetch(`/api/bank-accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to update bank account')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/bank-accounts/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete bank account')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })
} 