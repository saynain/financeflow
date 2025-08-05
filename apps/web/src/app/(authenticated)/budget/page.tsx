'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Pencil, 
  MoreVertical, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react'
import { useBudgets } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { BudgetForm } from '@/components/budget-form'
import { CategoryForm } from '@/components/category-form'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currencies'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Icons } from '@/components/ui/icons'

export default function BudgetPage() {
  const { data, isLoading } = useBudgets()
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [deletingCategory, setDeletingCategory] = useState<any>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [userCurrency, setUserCurrency] = useState<string | null>(null)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [isEditingIncome, setIsEditingIncome] = useState(false)

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

  const overallPercentage = data?.totalBudget ? (data.totalSpent / data.totalBudget) * 100 : 0
  const totalIncome = monthlyIncome
  const totalExpenses = data?.totalSpent || 0
  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      setDeletingCategory(null)
    },
  })

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return
    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deletingCategory.id)
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const handleIncomeUpdate = async () => {
    // Here you would typically save to your backend
    setIsEditingIncome(false)
  }

  // Don't render currency-dependent content until we have the user's currency
  if (userCurrency === null) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Financial Planning</h1>
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
      {/* Header with Income Management */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Financial Planning</h1>
          <p className="text-muted-foreground mt-2">Track your income, expenses, and savings goals</p>
        </div>
        <Button onClick={() => setCategoryFormOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Category
        </Button>
      </div>

      {/* Income Section */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Monthly Income</CardTitle>
                <CardDescription>Set your total monthly income including bonuses</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingIncome(!isEditingIncome)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditingIncome ? (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="monthly-income" className="sr-only">Monthly Income</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {getCurrencyByCode(userCurrency)?.symbol || '$'}
                  </span>
                  <Input
                    id="monthly-income"
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="pl-8 text-2xl font-bold"
                    placeholder="0"
                  />
                </div>
              </div>
              <Button onClick={handleIncomeUpdate} size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditingIncome(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(monthlyIncome, userCurrency)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <TrendingDown className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Total Expenses</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(totalExpenses, userCurrency)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              {totalIncome > 0 ? `${((totalExpenses / totalIncome) * 100).toFixed(1)}% of income` : 'No income set'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <PiggyBank className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Planned Savings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold mb-2",
              savings >= 0 ? "text-purple-600" : "text-red-600"
            )}>
              {formatCurrency(savings, userCurrency)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              {savingsRate.toFixed(1)}% savings rate
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-full">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Budget Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              {savings >= 0 ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              )}
              <span className={cn(
                "text-lg font-semibold",
                savings >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {savings >= 0 ? 'On Track' : 'Over Budget'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {data?.budgets.reduce((sum, group) => sum + group.categories.length, 0) || 0} active categories
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories with Modern UI */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {data?.budgets.map((section) => {
            const sectionPercentage = section.totalBudget > 0 
              ? (section.totalSpent / section.totalBudget) * 100 
              : 0
            const isExpanded = expandedSections[section.id] !== false // Default to expanded
            const isOverBudget = sectionPercentage > 100
            const isNearLimit = sectionPercentage > 80 && sectionPercentage <= 100

            return (
              <Card key={section.id} className={cn(
                "overflow-hidden transition-all hover:shadow-lg",
                isOverBudget && "border-red-300 bg-red-50/30",
                isNearLimit && "border-yellow-300 bg-yellow-50/30"
              )}>
                <CardHeader 
                  className={cn(
                    "cursor-pointer transition-colors",
                    isOverBudget && "bg-red-50/50",
                    isNearLimit && "bg-yellow-50/50"
                  )}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSection(section.id)
                        }}
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-3 rounded-full",
                          isOverBudget && "bg-red-100",
                          isNearLimit && "bg-yellow-100",
                          !isOverBudget && !isNearLimit && "bg-blue-100"
                        )}>
                          <span className="text-2xl">{section.icon || '📊'}</span>
                        </div>
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {section.name}
                            {isOverBudget && (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                                Over Budget
                              </span>
                            )}
                            {isNearLimit && (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                Near Limit
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {formatCurrency(section.totalSpent, userCurrency)} of {formatCurrency(section.totalBudget, userCurrency)} spent
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn(
                          "text-2xl font-bold",
                          isOverBudget && "text-red-600",
                          isNearLimit && "text-yellow-600",
                          !isOverBudget && !isNearLimit && "text-blue-600"
                        )}>
                          {sectionPercentage.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">used</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingCategory({
                              id: section.id,
                              name: section.name,
                              icon: section.icon,
                              isMainCategory: true,
                            })
                            setCategoryFormOpen(true)
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Category
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeletingCategory({
                              id: section.id,
                              name: section.name,
                              icon: section.icon,
                              isMainCategory: true,
                            })}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Category
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(sectionPercentage, 100)} 
                    className={cn(
                      "h-3 mt-4",
                      isOverBudget && "[&>div]:bg-red-500",
                      isNearLimit && "[&>div]:bg-yellow-500",
                      !isOverBudget && !isNearLimit && "[&>div]:bg-blue-500"
                    )}
                  />
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {section.categories.map((category) => {
                        const percentage = category.budgetLimit > 0 
                          ? (category.spent / category.budgetLimit) * 100 
                          : 0
                        const isOverBudget = percentage > 100
                        const isNearLimit = percentage > 80 && percentage <= 100

                        return (
                          <div 
                            key={category.id} 
                            className={cn(
                              "group relative p-4 rounded-xl border-2 transition-all hover:shadow-md hover:scale-105",
                              isOverBudget && "border-red-300 bg-red-50/50",
                              isNearLimit && "border-yellow-300 bg-yellow-50/50",
                              !isOverBudget && !isNearLimit && "border-gray-200 bg-white hover:border-blue-300"
                            )}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {category.icon && (
                                  <div className={cn(
                                    "p-2 rounded-full",
                                    isOverBudget && "bg-red-100",
                                    isNearLimit && "bg-yellow-100",
                                    !isOverBudget && !isNearLimit && "bg-blue-100"
                                  )}>
                                    <span className="text-lg">{category.icon}</span>
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold text-sm">{category.name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {formatCurrency(category.spent, category.currency || userCurrency)} / {formatCurrency(category.budgetLimit, category.currency || userCurrency)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedCategory(category)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      setEditingCategory({
                                        id: category.id,
                                        name: category.name,
                                        icon: category.icon,
                                        budgetLimit: category.budgetLimit,
                                        parentId: category.parentId,
                                        isMainCategory: false,
                                      })
                                      setCategoryFormOpen(true)
                                    }}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit Category
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => setDeletingCategory({
                                        id: category.id,
                                        name: category.name,
                                        icon: category.icon,
                                        isMainCategory: false,
                                      })}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Category
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={cn(
                                "text-sm font-medium",
                                isOverBudget && "text-red-600",
                                isNearLimit && "text-yellow-600",
                                !isOverBudget && !isNearLimit && "text-blue-600"
                              )}>
                                {percentage.toFixed(0)}% used
                              </span>
                              {isOverBudget && (
                                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                                  Over budget
                                </span>
                              )}
                              {isNearLimit && (
                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                  Near limit
                                </span>
                              )}
                            </div>
                            <Progress 
                              value={Math.min(percentage, 100)} 
                              className={cn(
                                "h-2",
                                isOverBudget && "[&>div]:bg-red-500",
                                isNearLimit && "[&>div]:bg-yellow-500",
                                !isOverBudget && !isNearLimit && "[&>div]:bg-blue-500"
                              )}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Budget Form Modal */}
      {selectedCategory && (
        <BudgetForm
          open={!!selectedCategory}
          onOpenChange={(open) => !open && setSelectedCategory(null)}
          category={selectedCategory}
        />
      )}

      {/* Category Form Modal */}
      <CategoryForm
        open={categoryFormOpen}
        onOpenChange={(open) => {
          setCategoryFormOpen(open)
          if (!open) setEditingCategory(null)
        }}
        mainCategories={data?.mainCategories || []}
        category={editingCategory}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? 
              {deletingCategory?.isMainCategory && " All subcategories must be deleted first."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCategory(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory} disabled={isDeleting}>
              {isDeleting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to get currency symbol
function getCurrencyByCode(code: string) {
  const currencies: Record<string, { symbol: string; name: string }> = {
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar' },
    AUD: { symbol: 'A$', name: 'Australian Dollar' },
    CHF: { symbol: 'CHF', name: 'Swiss Franc' },
    CNY: { symbol: '¥', name: 'Chinese Yuan' },
    SEK: { symbol: 'kr', name: 'Swedish Krona' },
    NOK: { symbol: 'kr', name: 'Norwegian Krone' },
    DKK: { symbol: 'kr', name: 'Danish Krone' },
    PLN: { symbol: 'zł', name: 'Polish Złoty' },
    CZK: { symbol: 'Kč', name: 'Czech Koruna' },
    HUF: { symbol: 'Ft', name: 'Hungarian Forint' },
    BRL: { symbol: 'R$', name: 'Brazilian Real' },
    INR: { symbol: '₹', name: 'Indian Rupee' },
    KRW: { symbol: '₩', name: 'South Korean Won' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar' },
    HKD: { symbol: 'HK$', name: 'Hong Kong Dollar' },
    NZD: { symbol: 'NZ$', name: 'New Zealand Dollar' },
  }
  return currencies[code] || { symbol: '$', name: 'Unknown' }
}
