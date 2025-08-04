'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '@/hooks/use-dashboard'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Icons } from '@/components/ui/icons'

const transactionSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  categoryId: z.string().min(1, 'Category is required'),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: {
    id: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    description: string | null
    date: string
    categoryId: string
  }
}

export function TransactionForm({ open, onOpenChange, transaction }: TransactionFormProps) {
  const queryClient = useQueryClient()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          amount: transaction.amount.toString(),
          type: transaction.type,
          description: transaction.description || '',
          date: format(new Date(transaction.date), 'yyyy-MM-dd'),
          categoryId: transaction.categoryId,
        }
      : {
          type: 'EXPENSE',
          date: format(new Date(), 'yyyy-MM-dd'),
        },
  })

  const transactionType = watch('type')

  const createMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
        }),
      })
      if (!response.ok) throw new Error('Failed to create transaction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      reset()
      onOpenChange(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await fetch(`/api/transactions/${transaction!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
        }),
      })
      if (!response.ok) throw new Error('Failed to update transaction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      reset()
      onOpenChange(false)
    },
  })

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    try {
      if (transaction) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCategories = categories?.filter(cat => cat.type === transactionType) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{transaction ? 'Edit' : 'Add'} Transaction</DialogTitle>
            <DialogDescription>
              {transaction ? 'Update the' : 'Enter'} transaction details below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={transactionType}
                onValueChange={(value) => {
                  setValue('type', value as 'INCOME' | 'EXPENSE')
                  setValue('categoryId', '') // Reset category when type changes
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  {...register('amount')}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(value) => setValue('categoryId', value)}
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Grocery shopping at Walmart"
                {...register('description')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {transaction ? 'Update' : 'Add'} Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
