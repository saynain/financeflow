'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Calendar,
  BarChart3,
  Tag,
  DollarSign,
  Trash2,
  Edit
} from 'lucide-react'
import { useBudgetTags } from '@/hooks/use-budget-tags'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionForm } from '@/components/transaction-form'
import { BudgetForm } from '@/components/budget-form'
import { SortableBudgetList } from '@/components/sortable-budget-list'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currencies'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getTagColor } from '@/lib/tag-colors'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Icons } from '@/components/ui/icons'

const timePeriods = [
  { value: 'current', label: 'This Month' },
  { value: 'last', label: 'Previous Month' },
  { value: '6months', label: 'Last 6 Months' },
  { value: 'year', label: 'Last Year' },
]

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

export default function BudgetPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [userCurrency, setUserCurrency] = useState<string | null>(null)
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)
  const [budgetFormOpen, setBudgetFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null)
  const queryClient = useQueryClient()

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

  const { data, isLoading } = useBudgetTags(selectedPeriod)
  
  // Get suggested values from last month's expenses
  const { data: lastMonthData } = useBudgetTags('last')
  
  const suggestedValues = lastMonthData?.tagGroups.reduce((acc, tagGroup) => {
    // Use the absolute value of expenses as suggested budget
    const suggestedAmount = Math.abs(tagGroup.totalSpent)
    if (suggestedAmount > 0) {
      acc[tagGroup.tag] = suggestedAmount
    }
    return acc
  }, {} as Record<string, number>) || {}
  
  const availableTags = data?.tagGroups.map(tagGroup => tagGroup.tag) || []

  // Fetch existing budgets
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await fetch('/api/budgets')
      if (!response.ok) {
        throw new Error('Failed to fetch budgets')
      }
      return response.json() as Promise<Budget[]>
    },
  })

  // Delete budget mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: async (budgetId: string) => {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete budget')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      setDeleteDialogOpen(false)
      setDeletingBudget(null)
    },
  })

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setBudgetFormOpen(true)
  }

  const handleDeleteBudget = (budget: Budget) => {
    setDeletingBudget(budget)
    setDeleteDialogOpen(true)
  }

  const handleBudgetFormClose = () => {
    setBudgetFormOpen(false)
    setEditingBudget(undefined)
  }

  const handleReorderBudgets = async (newBudgets: Budget[]) => {
    try {
      const response = await fetch('/api/budgets/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budgetIds: newBudgets.map(budget => budget.id),
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to reorder budgets')
      }
      
      // Optimistically update the local state
      queryClient.setQueryData(['budgets'], newBudgets)
    } catch (error) {
      console.error('Error reordering budgets:', error)
      // Refetch on error to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    }
  }

  // Don't render currency-dependent content until we have the user's currency
  if (userCurrency === null) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Budget Management
            </h1>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Budget Management
          </h1>
          <p className="text-muted-foreground mt-2">Track your expenses by categories</p>
        </div>
        <Button onClick={() => setTransactionFormOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Transaction
        </Button>
      </div>

      {/* Time Period Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Time Period:</span>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timePeriods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Overview Card */}
      <Card className="rounded-xl shadow-lg border border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  Expenses Overview
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total expenses by category for the selected time period. Use this as reference when creating budgets below.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timePeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {data?.tagGroups && data.tagGroups.length > 0 ? (
                data.tagGroups.map((tagGroup) => {
                  // Calculate net amount (income - expenses)
                  const netAmount = tagGroup.totalIncome - tagGroup.totalSpent
                  
                  return (
                    <div key={tagGroup.tag} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ 
                            backgroundColor: `${getTagColor(tagGroup.tag)}20`,
                            border: `1px solid ${getTagColor(tagGroup.tag)}40`
                          }}
                        >
                          <Tag className="h-4 w-4" style={{ color: getTagColor(tagGroup.tag) }} />
                        </div>
                        <div>
                          <h3 className="font-medium">{tagGroup.tag}</h3>
                          <p className="text-sm text-muted-foreground">{tagGroup.transactionCount} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-semibold",
                          netAmount > 0 ? "text-green-600" : netAmount < 0 ? "text-red-600" : ""
                        )}>
                          {netAmount > 0 ? '+' : netAmount < 0 ? '-' : ''}{formatCurrency(Math.abs(netAmount), userCurrency)}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                // Empty state when no data exists
                <div className="text-center py-8">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                    <p className="text-muted-foreground mb-4">
                      Add transactions with tags to see your expenses overview here.
                    </p>
                    <Button onClick={() => setTransactionFormOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Transaction
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Management Section */}
      <Card className="rounded-xl shadow-lg border border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  Budget Management
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Set budget limits for each category and track your progress.
                </p>
              </div>
            </div>
            <Button onClick={() => setBudgetFormOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {budgetsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : budgets && budgets.length > 0 ? (
            <SortableBudgetList
              budgets={budgets}
              userCurrency={userCurrency}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
              onReorder={handleReorderBudgets}
              data={data}
            />
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-muted/50 rounded-lg">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Budget Management</h3>
                <p className="text-muted-foreground mb-4">
                  Create custom budgets for each category based on the expenses overview above.
                </p>
                <Button variant="outline" onClick={() => setBudgetFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Budget
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form Modal */}
      <TransactionForm
        open={transactionFormOpen}
        onOpenChange={setTransactionFormOpen}
      />

      {/* Budget Form Modal */}
      <BudgetForm
        open={budgetFormOpen}
        onOpenChange={handleBudgetFormClose}
        suggestedValues={suggestedValues}
        availableTags={availableTags}
        budget={editingBudget}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your budget.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingBudget && deleteBudgetMutation.mutate(deletingBudget.id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
