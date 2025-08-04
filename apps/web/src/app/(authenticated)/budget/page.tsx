'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus } from 'lucide-react'

const budgetCategories = [
  {
    section: 'Living Essentials',
    icon: '🏠',
    total: 3000,
    spent: 2450,
    categories: [
      { name: 'Rent/Mortgage', budget: 1200, spent: 1200 },
      { name: 'Utilities', budget: 200, spent: 150 },
      { name: 'Groceries', budget: 500, spent: 450 },
      { name: 'Home Insurance', budget: 100, spent: 100 },
      { name: 'Internet & Phone', budget: 150, spent: 140 },
      { name: 'Home Maintenance', budget: 850, spent: 410 },
    ]
  },
  {
    section: 'Transportation',
    icon: '🚗',
    total: 500,
    spent: 380,
    categories: [
      { name: 'Gas', budget: 250, spent: 200 },
      { name: 'Car Insurance', budget: 120, spent: 120 },
      { name: 'Public Transit', budget: 100, spent: 60 },
      { name: 'Car Maintenance', budget: 30, spent: 0 },
    ]
  },
  {
    section: 'Personal & Lifestyle',
    icon: '🎯',
    total: 800,
    spent: 415,
    categories: [
      { name: 'Entertainment', budget: 250, spent: 150 },
      { name: 'Dining Out', budget: 400, spent: 180 },
      { name: 'Shopping', budget: 150, spent: 85 },
    ]
  },
]

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Planning</h1>
          <p className="text-muted-foreground">Manage your monthly budget and track spending by category</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,300</div>
            <p className="text-xs text-muted-foreground">Monthly allocation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,245</div>
            <p className="text-xs text-muted-foreground">75.5% of budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$1,055</div>
            <p className="text-xs text-muted-foreground">24.5% left</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <div className="space-y-6">
        {budgetCategories.map((section) => (
          <Card key={section.section}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{section.icon}</span>
                  <CardTitle>{section.section}</CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="text-lg font-semibold">
                    ${section.spent.toLocaleString()} / ${section.total.toLocaleString()}
                  </p>
                </div>
              </div>
              <Progress value={(section.spent / section.total) * 100} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.categories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ${category.spent} / ${category.budget}
                      </span>
                    </div>
                    <Progress 
                      value={(category.spent / category.budget) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
