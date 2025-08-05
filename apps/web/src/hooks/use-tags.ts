import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Tag {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export function useTags(query?: string) {
  return useQuery({
    queryKey: ['tags', query],
    queryFn: async () => {
      const url = query ? `/api/tags?q=${encodeURIComponent(query)}` : '/api/tags'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }
      return response.json() as Promise<Tag[]>
    },
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) {
        throw new Error('Failed to create tag')
      }
      return response.json() as Promise<Tag>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
} 