'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTransactions, useDashboardStats } from '@/hooks/use-dashboard'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionItem } from '@/components/transaction-item'

const categoryColors: Record<string, string> = {
  'Food & Dining': 'bg-green-100 text-green-800',
  'Housing': 'bg-blue-100 text-blue-800',
  'Utilities': 'bg-yellow-100 text-yellow-800',
  'Transportation': 'bg-purple-100 text-purple-800',
  'Entertainment': 'bg-pink-100 text-pink-800',
  'Shopping': 'bg-orange-100 text-orange-800',
  'Healthcare': 'bg-red-100 text-red-800',
  'Other': 'bg-gray-100 text-gray-800',
}

export default function ExpensesPage() {
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(20)

  // Filter only expenses
  const expenses = transactionsData?.transactions.filter(t => t.type === 'EXPENSE') || []
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const avgDaily = totalExpenses / 30

  // Find highest spending category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category.name
    acc[category] = (acc[category] || 0) + Number(expense.amount)
    return acc
  }, {} as Record<string, number>)

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])
  const highestCategory = sortedCategories[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Tracking</h1>
          <p className="text-muted-foreground">Monitor and categorize your spending</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button onClick={() => setTransactionFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${stats?.monthlyExpenses.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground text-red-600">
                  {stats?.monthlyExpenses && stats.monthlyIncome > 0 
                    ? `${((stats.monthlyExpenses / stats.monthlyIncome) * 100).toFixed(0)}% of income`
                    : '0% of income'
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Category</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {highestCategory?.[0] || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  ${highestCategory?.[1]?.toFixed(2) || '0.00'} spent
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">${avgDaily.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Based on current month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>Your spending history</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No expenses found. Add your first expense to get started.
                </p>
              ) : (
                expenses.map((expense) => (
                  <TransactionItem 
                    key={expense.id} 
                    transaction={expense}
                    showCategory={true}
                  />
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form Modal */}
      <TransactionForm 
        open={transactionFormOpen} 
        onOpenChange={setTransactionFormOpen} 
      />
    </div>
  )
}
