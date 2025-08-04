'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, Pencil, MoreVertical, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useBudgets } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { BudgetForm } from '@/components/budget-form'
import { CategoryForm } from '@/components/category-form'
import { cn } from '@/lib/utils'
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

  const overallPercentage = data?.totalBudget ? (data.totalSpent / data.totalBudget) * 100 : 0

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
      // You might want to show a toast here
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Planning</h1>
          <p className="text-muted-foreground">Manage your monthly budget and track spending by category</p>
        </div>
        <Button onClick={() => setCategoryFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <div>
                <div className="text-2xl font-bold">
                  ${data?.totalSpent.toFixed(0) || '0'} / ${data?.totalBudget.toFixed(0) || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overallPercentage.toFixed(1)}% of total budget used
                </p>
              </div>
            </div>
            <Progress 
              value={Math.min(overallPercentage, 100)} 
              className={cn(
                "h-3",
                overallPercentage > 100 && "[&>div]:bg-red-500",
                overallPercentage > 80 && overallPercentage <= 100 && "[&>div]:bg-yellow-500"
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              (data?.totalBudget || 0) - (data?.totalSpent || 0) >= 0 ? "text-green-600" : "text-red-600"
            )}>
              ${((data?.totalBudget || 0) - (data?.totalSpent || 0)).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {100 - overallPercentage > 0 ? `${(100 - overallPercentage).toFixed(1)}% left` : 'Over budget'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.budgets.reduce((sum, group) => sum + group.categories.length, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active budget categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories with Modern UI */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
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
        <div className="space-y-4">
          {data?.budgets.map((section) => {
            const sectionPercentage = section.totalBudget > 0 
              ? (section.totalSpent / section.totalBudget) * 100 
              : 0
            const isExpanded = expandedSections[section.id] !== false // Default to expanded

            return (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
                      <span className="text-3xl">{section.icon || ''}</span>
                      <div>
                        <CardTitle className="text-xl">{section.name}</CardTitle>
                        <CardDescription className="mt-1">
                          ${section.totalSpent.toFixed(0)} of ${section.totalBudget.toFixed(0)} spent
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <p className="text-2xl font-bold">
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
                            Edit
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
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(sectionPercentage, 100)} 
                    className={cn(
                      "h-2 mt-3",
                      sectionPercentage > 100 && "[&>div]:bg-red-500",
                      sectionPercentage > 80 && sectionPercentage <= 100 && "[&>div]:bg-yellow-500"
                    )}
                  />
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
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
                              "group relative p-4 rounded-lg border transition-all hover:shadow-sm",
                              isOverBudget && "border-red-200 bg-red-50/50",
                              isNearLimit && "border-yellow-200 bg-yellow-50/50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {category.icon && <span className="text-2xl">{category.icon}</span>}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{category.name}</span>
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
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-sm text-muted-foreground">
                                      ${category.spent.toFixed(0)} / ${category.budgetLimit.toFixed(0)}
                                    </span>
                                    <span className={cn(
                                      "text-sm font-medium",
                                      isOverBudget && "text-red-600",
                                      isNearLimit && "text-yellow-600"
                                    )}>
                                      {percentage.toFixed(0)}% used
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
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
                            <Progress 
                              value={Math.min(percentage, 100)} 
                              className={cn(
                                "h-2 mt-3",
                                isOverBudget && "[&>div]:bg-red-500",
                                isNearLimit && "[&>div]:bg-yellow-500"
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
