'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/currencies'
import { getTagColor } from '@/lib/tag-colors'
import { Tag, Plus, X } from 'lucide-react'

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suggestedValues?: Record<string, number>
  availableTags?: string[]
  budget?: Budget
}

interface BudgetItem {
  tag: string
  amount: number
}

interface Budget {
  id: string
  name: string
  items: Array<{
    id: string
    tag: string
    amount: number
  }>
  createdAt: string
}

export function BudgetForm({ open, onOpenChange, suggestedValues = {}, availableTags = [], budget }: BudgetFormProps) {
  const [budgetName, setBudgetName] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [userCurrency, setUserCurrency] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Initialize form with budget data if editing
  useEffect(() => {
    if (budget) {
      setBudgetName(budget.name)
      setSelectedTags(budget.items.map(item => item.tag))
      setBudgetItems(budget.items.map(item => ({ tag: item.tag, amount: item.amount })))
    } else {
      resetForm()
    }
  }, [budget, open])

  // Fetch user currency on component mount
  useEffect(() => {
    fetch('/api/user/currency')
      .then(res => res.json())
      .then(data => {
        if (data.currency) {
          setUserCurrency(data.currency)
        } else {
          setUserCurrency('USD')
        }
      })
      .catch(error => {
        console.error('Error fetching currency:', error)
        setUserCurrency('USD')
      })
  }, [])

  const createBudgetMutation = useMutation({
    mutationFn: async (data: { name: string; items: BudgetItem[] }) => {
      const url = budget ? `/api/budgets/${budget.id}` : '/api/budgets'
      const method = budget ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error(`Failed to ${budget ? 'update' : 'create'} budget`)
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-tags'] })
      onOpenChange(false)
      resetForm()
    },
  })

  const resetForm = () => {
    setBudgetName('')
    setSelectedTags([])
    setBudgetItems([])
  }

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
      setBudgetItems(budgetItems.filter(item => item.tag !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
      const existingItem = budgetItems.find(item => item.tag === tag)
      const suggestedAmount = existingItem?.amount || suggestedValues[tag] || 0
      setBudgetItems([...budgetItems, { tag, amount: suggestedAmount }])
    }
  }

  const handleAmountChange = (tag: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0
    setBudgetItems(budgetItems.map(item => 
      item.tag === tag ? { ...item, amount: numAmount } : item
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!budgetName.trim() || budgetItems.length === 0) return

    await createBudgetMutation.mutateAsync({
      name: budgetName.trim(),
      items: budgetItems,
    })
  }

  const totalBudget = budgetItems.reduce((sum, item) => sum + Number(item.amount), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
          <DialogDescription>
            {budget ? 'Update your budget settings.' : 'Set up a budget by selecting categories and defining spending limits.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Budget Name */}
          <div className="space-y-2">
            <Label htmlFor="budget-name">Budget Name</Label>
            <Input
              id="budget-name"
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              placeholder="e.g., Monthly Budget, Grocery Budget"
              required
            />
          </div>

          {/* Tag Selection */}
          <div className="space-y-4">
            <Label>Select Categories</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  />
                  <Label
                    htmlFor={tag}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getTagColor(tag) }}
                    />
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Items */}
          {budgetItems.length > 0 && (
            <div className="space-y-4">
              <Label>Set Budget Amounts</Label>
              <div className="space-y-3">
                {budgetItems.map((item) => (
                  <Card key={item.tag} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ 
                            backgroundColor: `${getTagColor(item.tag)}20`,
                            border: `1px solid ${getTagColor(item.tag)}40`
                          }}
                        >
                          <Tag className="h-4 w-4" style={{ color: getTagColor(item.tag) }} />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.tag}</h3>
                          {suggestedValues[item.tag] && !budget && (
                            <p className="text-sm text-muted-foreground">
                              Suggested: {formatCurrency(suggestedValues[item.tag], userCurrency)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleAmountChange(item.tag, e.target.value)}
                          className="w-32"
                          min="0"
                          step="0.01"
                          required
                        />
                        <span className="text-sm text-muted-foreground">
                          {userCurrency}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-medium">Total Budget:</span>
                <span className="text-lg font-semibold">
                  {formatCurrency(totalBudget, userCurrency)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!budgetName.trim() || budgetItems.length === 0 || createBudgetMutation.isPending}
            >
              {createBudgetMutation.isPending ? (budget ? 'Updating...' : 'Creating...') : (budget ? 'Update Budget' : 'Create Budget')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
