'use client'

import { useState } from 'react'
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

const budgetSchema = z.object({
  budgetLimit: z.string().min(1, 'Budget amount is required'),
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
  }
}

export function BudgetForm({ open, onOpenChange, category }: BudgetFormProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budgetLimit: category.budgetLimit.toString(),
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          budgetLimit: parseFloat(data.budgetLimit),
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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
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
