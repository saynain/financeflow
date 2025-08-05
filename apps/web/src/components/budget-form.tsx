'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrencyByCode } from '@/lib/currencies'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const budgetSchema = z.object({
  budgetLimit: z.string().min(1, 'Budget amount is required'),
  currency: z.string().min(1, 'Currency is required'),
})

type BudgetFormData = z.infer<typeof budgetSchema>

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: {
    id: string
    name: string
    icon: string | null
    budgetLimit: number
    currency: string
  }
}

export function BudgetForm({ open, onOpenChange, category }: BudgetFormProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userCurrency, setUserCurrency] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budgetLimit: category.budgetLimit.toString(),
      currency: category.currency || 'USD',
    },
  })

  // Fetch user currency on component mount
  useEffect(() => {
    fetch('/api/user/currency')
      .then(res => res.json())
      .then(data => {
        const currency = data.currency || 'USD'
        setUserCurrency(currency)
        setValue('currency', currency)
      })
      .catch(error => {
        console.error('Error fetching currency:', error)
        setUserCurrency('USD')
        setValue('currency', 'USD')
      })
  }, [setValue])

  const updateMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          budgetLimit: parseFloat(data.budgetLimit),
          currency: data.currency,
        }),
      })
      if (!response.ok) throw new Error('Failed to update budget')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      reset()
      onOpenChange(false)
    },
  })

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true)
    try {
      await updateMutation.mutateAsync(data)
    } catch (error) {
      console.error('Error updating budget:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Set Budget for {category.name}</DialogTitle>
            <DialogDescription>
              Set a monthly spending limit for this category
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center py-4">
              <div className="text-6xl">{category.icon || '💰'}</div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budgetLimit">Monthly Budget</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {getCurrencyByCode(watch('currency'))?.symbol || '$'}
                  </span>
                  <Input
                    id="budgetLimit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    {...register('budgetLimit')}
                  />
                </div>
                <Select
                  value={watch('currency')}
                  onValueChange={(value) => setValue('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="SEK">SEK</SelectItem>
                    <SelectItem value="NOK">NOK</SelectItem>
                    <SelectItem value="DKK">DKK</SelectItem>
                    <SelectItem value="PLN">PLN</SelectItem>
                    <SelectItem value="CZK">CZK</SelectItem>
                    <SelectItem value="HUF">HUF</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="KRW">KRW</SelectItem>
                    <SelectItem value="SGD">SGD</SelectItem>
                    <SelectItem value="HKD">HKD</SelectItem>
                    <SelectItem value="NZD">NZD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.budgetLimit && (
                <p className="text-sm text-red-600">{errors.budgetLimit.message}</p>
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
              Save Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
