'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, BarChart3, Tag } from 'lucide-react'
import { useBudgetTags } from '@/hooks/use-budget-tags'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionForm } from '@/components/transaction-form'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currencies'
import { getTagColor } from '@/lib/tag-colors'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BudgetForm } from '@/components/budget-form'

type TagBudget = {
  id: string
  name: string
  active?: boolean
  items: { id: string; tag: string; amount: number }[]
  createdAt: string
}

export default function BudgetV2Page() {
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)
  const [userCurrency, setUserCurrency] = useState<string>('USD')
  const [budgetFormOpen, setBudgetFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<TagBudget | null>(null)
  const queryClient = useQueryClient()

  // Fetch currency
  useEffect(() => {
    fetch('/api/user/currency')
      .then((r) => r.json())
      .then((d) => d?.currency && setUserCurrency(d.currency))
      .catch(() => {})
  }, [])

  const { data: actuals, isLoading: actualsLoading } = useBudgetTags(selectedPeriod)
  const { data: lastMonthActuals } = useBudgetTags('last')
  const { data: budgets, isLoading: budgetsLoading } = useQuery<TagBudget[]>({
    queryKey: ['budgets'],
    queryFn: async () => {
      const res = await fetch('/api/budgets')
      if (!res.ok) throw new Error('Failed to fetch budgets')
      return res.json()
    },
  })

  const activeBudget = budgets?.[0] // Treat first as active

  const computed = useMemo(() => {
    if (!activeBudget) return null
    const items = activeBudget.items.map((item) => {
      const tagGroup = actuals?.tagGroups.find((g) => g.tag === item.tag)
      const spent = Math.max(0, Math.abs(tagGroup?.totalSpent || 0) - Math.abs(tagGroup?.totalIncome || 0))
      const limit = Number(item.amount)
      const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : spent > 0 ? 100 : 0
      return { ...item, spent, limit, pct }
    })
    const totalLimit = items.reduce((s, x) => s + x.limit, 0)
    const totalSpent = items.reduce((s, x) => s + x.spent, 0)
    return { items, totalLimit, totalSpent, pct: totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0 }
  }, [activeBudget, actuals])

  const availableTags = actuals?.tagGroups.map((g) => g.tag) || []
  const suggestedValues = (lastMonthActuals?.tagGroups || []).reduce((acc, g) => {
    const v = Math.abs(g.totalSpent)
    if (v > 0) acc[g.tag] = v
    return acc
  }, {} as Record<string, number>)

  const makeActive = useMutation({
    mutationFn: async (id: string) => {
      if (!budgets) return
      const reordered = [id, ...budgets.filter((b) => b.id !== id).map((b) => b.id)]
      const res = await fetch('/api/budgets/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetIds: reordered })
      })
      if (!res.ok) throw new Error('Failed to set active budget')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] })
  })

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete budget')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] })
  })

  const handleCreate = () => {
    setEditingBudget(null)
    setBudgetFormOpen(true)
  }

  const handleEditActive = () => {
    if (!activeBudget) return
    setEditingBudget(activeBudget)
    setBudgetFormOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Budget (v2)
          </h1>
          <p className="text-muted-foreground mt-2">Single active budget made of tag allocations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTransactionFormOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Transaction
          </Button>
          <Button onClick={handleCreate} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Budget
          </Button>
        </div>
      </div>

      {/* Overview */}
      <Card className="rounded-xl shadow-lg border border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Active Budget</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Progress for the selected period.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="h-9 rounded-md border bg-background px-2"
              >
                <option value="current">This Month</option>
                <option value="last">Previous Month</option>
                <option value="6months">Last 6 Months</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {budgetsLoading || actualsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !activeBudget ? (
            <div className="text-center py-8">
              <div className="p-4 bg-muted/50 rounded-lg">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No budget yet</h3>
                <p className="text-muted-foreground mb-4">Create a budget in the existing Budgets page and it will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header actions */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Limit</span>
                    <div className="font-semibold">{formatCurrency(computed!.totalLimit, userCurrency)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Spent</span>
                    <div className="font-semibold">{formatCurrency(computed!.totalSpent, userCurrency)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Utilization</span>
                    <div className="font-semibold">{computed!.pct.toFixed(0)}%</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    className="h-9 rounded-md border bg-background px-2 text-sm"
                    value={activeBudget?.id}
                    onChange={(e) => makeActive.mutate(e.target.value)}
                  >
                    {budgets?.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={handleEditActive} disabled={!activeBudget}>Edit</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => activeBudget && confirm('Delete active budget?') && deleteBudget.mutate(activeBudget.id)}
                    disabled={!activeBudget}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-6 text-sm">
                {/* spacer */}
              </div>

              {/* Items */}
              <div className="grid md:grid-cols-2 gap-4">
                {computed!.items.map((item) => {
                  const color = getTagColor(item.tag)
                  const barColor = item.pct >= 90 ? 'bg-red-500' : item.pct >= 75 ? 'bg-orange-500' : item.pct >= 60 ? 'bg-blue-500' : 'bg-green-500'
                  return (
                    <div key={item.id} className="p-4 border rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
                            <Tag className="h-4 w-4" style={{ color }} />
                          </div>
                          <div>
                            <div className="font-medium">{item.tag}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(item.spent, userCurrency)} / {formatCurrency(item.limit, userCurrency)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{item.pct.toFixed(0)}%</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className={cn('h-2', barColor)} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form */}
      <TransactionForm open={transactionFormOpen} onOpenChange={setTransactionFormOpen} />

      {/* Budget Form (create/edit) */}
      <BudgetForm
        open={budgetFormOpen}
        onOpenChange={setBudgetFormOpen}
        suggestedValues={suggestedValues}
        availableTags={availableTags}
        budget={editingBudget as any}
      />
    </div>
  )
}

