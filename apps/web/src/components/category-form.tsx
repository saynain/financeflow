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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { getCurrencyByCode } from '@/lib/currencies'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().optional(),
  budgetLimit: z.string().optional(),
  currency: z.string().optional(),
  parentId: z.string().optional(),
  isMainCategory: z.boolean().default(false),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mainCategories?: Array<{ id: string; name: string; icon: string | null }>
  category?: {
    id: string
    name: string
    icon: string | null
    budgetLimit?: number
    parentId?: string | null
    isMainCategory?: boolean
  }
}

const categoryIcons = [
  { value: '', label: 'No Icon' },
  { value: '🏠', label: 'Housing' },
  { value: '🍽️', label: 'Food & Dining' },
  { value: '🚗', label: 'Transportation' },
  { value: '🛍️', label: 'Shopping' },
  { value: '🎬', label: 'Entertainment' },
  { value: '💡', label: 'Utilities' },
  { value: '🏥', label: 'Healthcare' },
  { value: '💰', label: 'Income' },
  { value: '💼', label: 'Business' },
  { value: '🎯', label: 'Other' },
  { value: '📚', label: 'Education' },
  { value: '✈️', label: 'Travel' },
  { value: '🏋️', label: 'Fitness' },
  { value: '🎨', label: 'Hobbies' },
  { value: '📱', label: 'Technology' },
  { value: 'custom', label: 'Custom Emoji' },
]

export function CategoryForm({ open, onOpenChange, mainCategories = [], category }: CategoryFormProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || '')
  const [customEmoji, setCustomEmoji] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [userCurrency, setUserCurrency] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? {
      name: category.name,
      type: 'EXPENSE',
      icon: category.icon || '',
      budgetLimit: category.budgetLimit?.toString(),
      currency: 'USD', // Will be updated when userCurrency is loaded
      parentId: category.parentId || undefined,
      isMainCategory: category.isMainCategory || !category.parentId,
    } : {
      type: 'EXPENSE',
      icon: '',
      currency: 'USD', // Will be updated when userCurrency is loaded
      isMainCategory: false,
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

  const categoryType = watch('type')
  const isMainCategory = watch('isMainCategory')

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          icon: showCustomInput ? customEmoji : selectedIcon,
          budgetLimit: data.budgetLimit && !isMainCategory ? parseFloat(data.budgetLimit) : null,
          parentId: isMainCategory ? null : data.parentId,
        }),
      })
      if (!response.ok) throw new Error('Failed to create category')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      reset()
      setSelectedIcon('')
      setCustomEmoji('')
      setShowCustomInput(false)
      onOpenChange(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await fetch(`/api/categories/${category!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          icon: showCustomInput ? customEmoji : selectedIcon,
          budgetLimit: data.budgetLimit && !isMainCategory ? parseFloat(data.budgetLimit) : null,
        }),
      })
      if (!response.ok) throw new Error('Failed to update category')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      reset()
      onOpenChange(false)
    },
  })

  // Helper function to check if a string is a valid emoji
  const isValidEmoji = (str: string) => {
    const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u
    return emojiRegex.test(str) || str === ''
  }

  const onSubmit = async (data: CategoryFormData) => {
    // Validate custom emoji if provided
    if (showCustomInput && customEmoji && !isValidEmoji(customEmoji)) {
      // You might want to show an error message here
      return
    }
    
    setIsSubmitting(true)
    try {
      if (category) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{category ? 'Edit' : 'Create New'} Category</DialogTitle>
            <DialogDescription>
              {category ? 'Update the' : 'Add a new'} category for tracking your finances
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!category && (
              <div className="flex items-center justify-between">
                <Label htmlFor="isMainCategory">Main Category</Label>
                <Switch
                  id="isMainCategory"
                  checked={isMainCategory}
                  onCheckedChange={(checked) => setValue('isMainCategory', checked)}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder={isMainCategory ? "e.g., Living Essentials" : "e.g., Groceries, Salary"}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                {categoryIcons.map((icon) => (
                  <Button
                    key={icon.value}
                    type="button"
                    variant={selectedIcon === icon.value && !showCustomInput ? 'default' : 'outline'}
                    className={cn(
                      "h-12 text-2xl",
                      icon.value === '' && "text-muted-foreground",
                      icon.value === 'custom' && "text-base"
                    )}
                    onClick={() => {
                      if (icon.value === 'custom') {
                        setShowCustomInput(true)
                        setSelectedIcon('')
                      } else {
                        setShowCustomInput(false)
                        setSelectedIcon(icon.value)
                        setCustomEmoji('')
                      }
                    }}
                  >
                    {icon.value === '' ? 'None' : icon.value === 'custom' ? 'Custom' : icon.value}
                  </Button>
                ))}
              </div>
              {showCustomInput && (
                <div className="mt-2">
                  <Label htmlFor="customEmoji">Enter custom emoji</Label>
                  <Input
                    id="customEmoji"
                    placeholder="Enter an emoji (e.g., 🎮)"
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    maxLength={2}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste or type any emoji character
                  </p>
                </div>
              )}
            </div>

            {!isMainCategory && !category && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={categoryType}
                    onValueChange={(value) => setValue('type', value as 'INCOME' | 'EXPENSE')}
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

                {categoryType === 'EXPENSE' && mainCategories.length > 0 && (
                  <div className="grid gap-2">
                    <Label htmlFor="parentId">Parent Category</Label>
                    <Select
                      value={watch('parentId')}
                      onValueChange={(value) => setValue('parentId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent category" />
                      </SelectTrigger>
                      <SelectContent>
                        {mainCategories.map((mainCat) => (
                          <SelectItem key={mainCat.id} value={mainCat.id}>
                            <span className="flex items-center gap-2">
                              <span>{mainCat.icon}</span>
                              <span>{mainCat.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {categoryType === 'EXPENSE' && (
                  <div className="grid gap-2">
                    <Label htmlFor="budgetLimit">Monthly Budget</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {getCurrencyByCode(watch('currency') || 'USD')?.symbol || '$'}
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
                  </div>
                )}
              </>
            )}
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
              {category ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
