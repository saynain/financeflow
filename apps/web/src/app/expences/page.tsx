'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

const expenses = [
  { id: 1, name: 'Walmart Grocery', category: 'Food & Dining', amount: 142.50, date: '2024-03-15', icon: '🛒' },
  { id: 2, name: 'Monthly Rent', category: 'Housing', amount: 1200.00, date: '2024-03-01', icon: '🏠' },
  { id: 3, name: 'Electric Bill', category: 'Utilities', amount: 85.00, date: '2024-03-02', icon: '⚡' },
  { id: 4, name: 'Shell Gas Station', category: 'Transportation', amount: 65.00, date: '2024-03-03', icon: '⛽' },
  { id: 5, name: 'Netflix Subscription', category: 'Entertainment', amount: 15.99, date: '2024-02-28', icon: '📺' },
  { id: 6, name: 'Target Shopping', category: 'Shopping', amount: 234.67, date: '2024-03-10', icon: '🛍️' },
  { id: 7, name: 'Restaurant Dinner', category: 'Food & Dining', amount: 87.50, date: '2024-03-12', icon: '🍽️' },
  { id: 8, name: 'Car Insurance', category: 'Transportation', amount: 120.00, date: '2024-03-01', icon: '🚗' },
]

const categoryColors: Record<string, string> = {
  'Food & Dining': 'bg-green-100 text-green-800',
  'Housing': 'bg-blue-100 text-blue-800',
  'Utilities': 'bg-yellow-100 text-yellow-800',
  'Transportation': 'bg-purple-100 text-purple-800',
  'Entertainment': 'bg-pink-100 text-pink-800',
  'Shopping': 'bg-orange-100 text-orange-800',
}

export default function ExpensesPage() {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const avgDaily = totalExpenses / 30

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
          <Button>
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
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground text-red-600">82% of budget used</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Housing</div>
            <p className="text-xs text-muted-foreground">$1,200 spent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgDaily.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground text-green-600">-$12 vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>Your spending history for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                    {expense.icon}
                  </div>
                  <div>
                    <p className="font-medium">{expense.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        categoryColors[expense.category] || 'bg-gray-100 text-gray-800'
                      )}>
                        {expense.category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-red-600">
                  -${expense.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
