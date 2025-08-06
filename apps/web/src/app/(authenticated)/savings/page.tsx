'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Target, TrendingUp, DollarSign, Home, Car, Plane } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currencies'

// Demo savings goals data
const savingsGoals = [
  {
    id: '1',
    name: 'House Down Payment',
    target: 50000,
    current: 35000,
    icon: <Home className="h-6 w-6" />,
    color: 'bg-blue-500',
    deadline: '2025-12-31',
  },
  {
    id: '2',
    name: 'New Car',
    target: 25000,
    current: 12000,
    icon: <Car className="h-6 w-6" />,
    color: 'bg-green-500',
    deadline: '2024-06-30',
  },
  {
    id: '3',
    name: 'Vacation Fund',
    target: 8000,
    current: 6500,
    icon: <Plane className="h-6 w-6" />,
    color: 'bg-purple-500',
    deadline: '2024-03-15',
  },
  {
    id: '4',
    name: 'Emergency Fund',
    target: 15000,
    current: 15000,
    icon: <Target className="h-6 w-6" />,
    color: 'bg-red-500',
    deadline: '2024-01-31',
  },
]

export default function SavingsPage() {
  const [addGoalOpen, setAddGoalOpen] = useState(false)

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.current, 0)
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.target, 0)
  const overallProgress = (totalSaved / totalTarget) * 100

  return (
    <div className="space-y-6">
      {/* Demo Notice */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Demo Mode:</strong> This page is currently using sample data. Real savings goal tracking features are under development.
          </p>
        </div>
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Savings Goals
          </h1>
          <p className="text-muted-foreground mt-2">Track your progress towards financial goals</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            DEMO
          </Badge>
          <Button onClick={() => setAddGoalOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSaved, 'USD')}</div>
            <p className="text-xs text-muted-foreground">
              {overallProgress.toFixed(1)}% of total target
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTarget, 'USD')}</div>
            <p className="text-xs text-muted-foreground">
              Across {savingsGoals.length} goals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTarget - totalSaved, 'USD')}</div>
            <p className="text-xs text-muted-foreground">
              Still need to save
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {savingsGoals.map((goal) => {
          const progress = (goal.current / goal.target) * 100
          const remaining = goal.target - goal.current
          const isCompleted = goal.current >= goal.target

          return (
            <Card key={goal.id} className={cn(isCompleted && "border-green-200 bg-green-50")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn("p-2 rounded-lg", goal.color)}>
                      <div className="text-white">{goal.icon}</div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      <CardDescription>
                        Due {new Date(goal.deadline).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  {isCompleted && (
                    <div className="text-green-600 text-sm font-medium">✓ Complete</div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        isCompleted ? "bg-green-500" : "bg-blue-500"
                      )}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Saved</span>
                    <span className="font-medium">{formatCurrency(goal.current, 'USD')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Target</span>
                    <span className="font-medium">{formatCurrency(goal.target, 'USD')}</span>
                  </div>
                  {!isCompleted && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Remaining</span>
                      <span>{formatCurrency(remaining, 'USD')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Goal Modal Placeholder */}
      {addGoalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Savings Goal</h3>
            <p className="text-muted-foreground mb-4">
              This feature is coming soon! You'll be able to create new savings goals and track your progress.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAddGoalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
