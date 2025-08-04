'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, TrendingUp } from 'lucide-react'

const savingsGoals = [
  {
    id: 1,
    name: 'Vacation Fund',
    icon: '🏖️',
    target: 5000,
    current: 3250,
    deadline: 'July 2024',
    monthlyTarget: 350,
  },
  {
    id: 2,
    name: 'New Car',
    icon: '🚗',
    target: 20000,
    current: 8000,
    deadline: 'December 2024',
    monthlyTarget: 1500,
  },
  {
    id: 3,
    name: 'Tech Upgrade',
    icon: '💻',
    target: 3000,
    current: 2700,
    deadline: 'April 2024',
    monthlyTarget: 300,
  },
  {
    id: 4,
    name: 'Home Down Payment',
    icon: '🏠',
    target: 75000,
    current: 18500,
    deadline: '2026',
    monthlyTarget: 2000,
  },
]

export default function SavingsPage() {
  const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.current, 0)
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.target, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground">Track your progress towards financial goals</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground text-green-600">+$5,255 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,000</div>
            <p className="text-xs text-muted-foreground">6 months expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground text-green-600">75% on track</p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <div className="grid gap-4 md:grid-cols-2">
        {savingsGoals.map((goal) => {
          const percentage = (goal.current / goal.target) * 100
          const remaining = goal.target - goal.current
          
          return (
            <Card key={goal.id} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{goal.icon}</span>
                    <div>
                      <CardTitle>{goal.name}</CardTitle>
                      <CardDescription>Target: {goal.deadline}</CardDescription>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">${goal.current.toLocaleString()}</span>
                    <span className="text-muted-foreground">${goal.target.toLocaleString()}</span>
                  </div>
                  <Progress value={percentage} className="h-3" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% complete</span>
                    <span>${remaining.toLocaleString()} to go</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly target</span>
                    <span className="font-medium">${goal.monthlyTarget}/month</span>
                  </div>
                </div>
              </CardContent>
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 transform rounded-full bg-gradient-to-br from-primary/10 to-primary/5" />
            </Card>
          )
        })}
      </div>

      {/* Savings Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Tips</CardTitle>
          <CardDescription>Maximize your savings potential</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-2xl">💡</div>
              <h4 className="font-semibold">Automate Savings</h4>
              <p className="text-sm text-muted-foreground">Set up automatic transfers to save without thinking about it</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">📊</div>
              <h4 className="font-semibold">Track Progress</h4>
              <p className="text-sm text-muted-foreground">Review your goals monthly and adjust as needed</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎯</div>
              <h4 className="font-semibold">Start Small</h4>
              <p className="text-sm text-muted-foreground">Even $50/month adds up to $600/year</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
