'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, DollarSign, Plus, X, Pencil } from 'lucide-react'
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Icons } from '@/components/ui/icons'
import { getCurrencyByCode } from '@/lib/currencies'
import { TagInput } from '@/components/tag-input'
import { Transaction } from '@/types/transaction'

const transactionSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  tags: z.array(z.string()).optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction
}

export function TransactionForm({ open, onOpenChange, transaction }: TransactionFormProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userCurrency, setUserCurrency] = useState<string>('USD')
  const [tags, setTags] = useState<string[]>([])

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
          tags: transaction.tags || [],
        }
      : {
          type: 'EXPENSE',
          date: format(new Date(), 'yyyy-MM-dd'),
          tags: [],
        },
  })

  // Initialize tags when transaction changes
  useEffect(() => {
    if (transaction) {
      setTags(transaction.tags || [])
    } else {
      setTags([])
    }
  }, [transaction])

  // Fetch user currency on component mount
  useEffect(() => {
    fetch('/api/user/currency')
      .then(res => res.json())
      .then(data => {
        const currency = data.currency || 'USD'
        setUserCurrency(currency)
      })
      .catch(error => {
        console.error('Error fetching currency:', error)
        setUserCurrency('USD')
      })
  }, [])

  const transactionType = watch('type')

  const createMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
          currency: userCurrency,
          tags,
        }),
      })
      if (!response.ok) throw new Error('Failed to create transaction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      reset()
      setTags([])
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
          currency: userCurrency,
          tags,
        }),
      })
      if (!response.ok) throw new Error('Failed to update transaction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      reset()
      setTags([])
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {transaction ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {transaction ? 'Edit' : 'Add'} Transaction
            </DialogTitle>
            <DialogDescription>
              {transaction ? 'Update the' : 'Add a new'} transaction details
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Transaction Type */}
            <div className="grid gap-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={transactionType === 'EXPENSE' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setValue('type', 'EXPENSE')}
                >
                  Expense
                </Button>
                <Button
                  type="button"
                  variant={transactionType === 'INCOME' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setValue('type', 'INCOME')}
                >
                  Income
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {getCurrencyByCode(userCurrency)?.symbol || '$'}
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

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Grocery shopping, Salary deposit"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <TagInput
                value={tags}
                onChange={setTags}
                placeholder="Add tags like 'groceries', 'entertainment'..."
                disabled={isSubmitting}
              />
            </div>

            {/* Date */}
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
