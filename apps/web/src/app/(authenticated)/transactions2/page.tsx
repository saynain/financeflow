'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, DollarSign, Upload, Edit, Trash2, Check, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTransactions, useDashboardStats, type TransactionsFilters } from '@/hooks/use-dashboard'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionItem } from '@/components/transaction-item'
import { TagDropdown } from '@/components/tag-dropdown'
import { CSVImport } from '@/components/csv-import'
import { formatCurrency } from '@/lib/currencies'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Transaction } from '@/types/transaction'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { getTagColor } from '@/lib/tag-colors'

function InlineDeleteButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onSuccess: () => {
      onDeleted()
      toast.success('Transaction deleted')
    },
    onError: () => toast.error('Failed to delete transaction'),
  })
  return (
    <Button variant="destructive" size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
      <Trash2 className="h-4 w-4 mr-1" /> Delete
    </Button>
  )
}

export default function TransactionsV2Page() {
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)
  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [bulkMode, setBulkMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(100)
  const [typeFilter, setTypeFilter] = useState<TransactionsFilters['type']>()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<TransactionsFilters['sortBy']>('date')
  const [sortOrder, setSortOrder] = useState<TransactionsFilters['sortOrder']>('desc')
  const [startDate, setStartDate] = useState<string | undefined>(undefined)
  const [endDate, setEndDate] = useState<string | undefined>(undefined)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [detailsTransaction, setDetailsTransaction] = useState<Transaction | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Pull initial filters from URL once
  useEffect(() => {
    const type = searchParams.get('type') as TransactionsFilters['type'] | null
    const q = searchParams.get('q') || ''
    const tags = (searchParams.get('tags') || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const sortByParam = (searchParams.get('sortBy') as TransactionsFilters['sortBy']) || 'date'
    const sortOrderParam = (searchParams.get('sortOrder') as TransactionsFilters['sortOrder']) || 'desc'
    const start = searchParams.get('startDate') || undefined
    const end = searchParams.get('endDate') || undefined
    const page = Number(searchParams.get('page') || '0')
    if (type) setTypeFilter(type)
    if (q) setSearchQuery(q)
    if (tags.length) setSelectedTags(tags)
    setSortBy(sortByParam)
    setSortOrder(sortOrderParam)
    if (start) setStartDate(start)
    if (end) setEndDate(end)
    if (!Number.isNaN(page)) setCurrentPage(Math.max(0, page))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  // Sync URL on filter change
  useEffect(() => {
    const params = new URLSearchParams()
    if (typeFilter) params.set('type', typeFilter)
    if (searchQuery) params.set('q', searchQuery)
    if (selectedTags.length) params.set('tags', selectedTags.join(','))
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('page', String(currentPage))
    router.replace(`${pathname}?${params.toString()}`)
  }, [typeFilter, searchQuery, selectedTags, startDate, endDate, sortBy, sortOrder, currentPage, router, pathname])
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(
    pageSize,
    currentPage * pageSize,
    {
      type: typeFilter,
      q: debouncedSearch || undefined,
      tags: selectedTags,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    }
  )

  // All transactions come server-filtered now
  const allTransactions = transactionsData?.transactions || []
  const filteredTransactions = allTransactions

  const totals = useMemo(() => {
    let income = 0
    let expenses = 0
    for (const t of filteredTransactions) {
      const amt = Number(t.amount)
      if (t.type === 'INCOME') income += amt
      else expenses += amt
    }
    const net = income - expenses
    return { income, expenses, net }
  }, [filteredTransactions])

  const exportCSV = () => {
    const header = ['Date', 'Type', 'Description', 'Amount', 'Currency', 'Tags']
    const rows = filteredTransactions.map((t) => [
      new Date(t.date).toISOString(),
      t.type,
      t.description || '',
      String(t.amount),
      t.currency,
      (t.tags || []).join('|'),
    ])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearAllTags = () => {
    setSelectedTags([])
  }

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const selectAllTransactions = () => {
    setSelectedTransactions(filteredTransactions.map(t => t.id))
  }

  const clearAllTransactions = () => {
    setSelectedTransactions([])
  }

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode)
    if (bulkMode) {
      setSelectedTransactions([])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) return
    
    if (confirm(`Are you sure you want to delete ${selectedTransactions.length} transaction${selectedTransactions.length > 1 ? 's' : ''}?`)) {
      try {
        const response = await fetch('/api/transactions/bulk', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionIds: selectedTransactions }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete transactions')
        }
        
        const result = await response.json()
        toast.success(`Successfully deleted ${result.deleted} transaction${result.deleted > 1 ? 's' : ''}`)
        
        // Clear selection and refresh
        setSelectedTransactions([])
        setBulkMode(false)
        window.location.reload()
      } catch (error) {
        console.error('Error deleting transactions:', error)
        toast.error('Failed to delete transactions')
      }
    }
  }

  const handleBulkEdit = () => {
    toast.info('Bulk edit feature coming soon!')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            All Transactions (v2)
          </h1>
          <p className="text-muted-foreground mt-2">
            {filteredTransactions.length} of {transactionsData?.total || allTransactions.length} transactions
            {selectedTags.length > 0 && ` • Filtered by ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCsvImportOpen(true)} 
            size="lg"
          >
            <Upload className="mr-2 h-5 w-5" />
            Import CSV
          </Button>
          <Button 
            variant="outline"
            onClick={exportCSV}
            size="lg"
          >
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={toggleBulkMode} 
            size="lg"
            className={bulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
          >
            {bulkMode ? <Check className="mr-2 h-5 w-5" /> : <Edit className="mr-2 h-5 w-5" />}
            {bulkMode ? 'Bulk Mode' : 'Bulk Actions'}
          </Button>
          <Button onClick={() => setTransactionFormOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <TagDropdown
              selectedTags={selectedTags}
              onTagToggle={toggleTag}
              onClearAll={clearAllTags}
            />
            {/* Type filter */}
            <select
              value={typeFilter || ''}
              onChange={(e) => setTypeFilter(e.target.value ? (e.target.value as any) : undefined)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All Transactions</option>
              <option value="EXPENSE">Expenses</option>
              <option value="INCOME">Income</option>
            </select>
            {/* Date range */}
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => setStartDate(e.target.value || undefined)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => setEndDate(e.target.value || undefined)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            />
            {/* Search */}
            <input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-56 rounded-md border bg-background px-3 text-sm"
            />
            {/* Sort */}
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split(':')
                setSortBy(by as any)
                setSortOrder(order as any)
              }}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="date:desc">Date (newest)</option>
              <option value="date:asc">Date (oldest)</option>
              <option value="amount:desc">Amount (high → low)</option>
              <option value="amount:asc">Amount (low → high)</option>
              <option value="description:asc">Description (A→Z)</option>
              <option value="description:desc">Description (Z→A)</option>
            </select>
          </div>
        </div>
        
        {transactionsLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {selectedTags.length > 0 ? 'No matching transactions' : 'No transactions yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {selectedTags.length > 0 
                ? 'Try adjusting your filters or add transactions with these tags.'
                : 'Add your first transaction to get started'
              }
            </p>
            <Button onClick={() => setTransactionFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        ) : (
          <>
            {!bulkMode ? (
              <div className="overflow-x-auto">
                {/* Totals row */}
                <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="text-green-600 font-medium">Income: {formatCurrency(totals.income, allTransactions[0]?.currency || 'USD')}</div>
                  <div className="text-red-600 font-medium">Expenses: {formatCurrency(totals.expenses, allTransactions[0]?.currency || 'USD')}</div>
                  <div className={cn('font-semibold', totals.net >= 0 ? 'text-green-700' : 'text-red-700')}>
                    Net: {formatCurrency(Math.abs(totals.net), allTransactions[0]?.currency || 'USD')}
                    {totals.net < 0 ? ' (negative)' : ''}
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 text-left">Date</th>
                      <th className="py-2 text-left">Description</th>
                      <th className="py-2 text-left">Tags</th>
                      <th className="py-2 text-right">Amount</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="py-3 align-top whitespace-nowrap">{format(new Date(t.date), 'MMM d, yyyy')}</td>
                        <td className="py-3 align-top">{t.description || 'Transaction'}</td>
                        <td className="py-3 align-top">
                          <div className="flex flex-wrap gap-1">
                            {(t.tags || []).map((tag) => {
                              const color = getTagColor(tag)
                              return (
                                <Badge key={tag} variant="secondary" className="text-xs" style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}>
                                  {tag}
                                </Badge>
                              )
                            })}
                          </div>
                        </td>
                        <td className={cn('py-3 align-top text-right font-medium', t.type === 'INCOME' ? 'text-green-600' : 'text-red-600')}>
                          {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(t.amount), t.currency)}
                        </td>
                        <td className="py-3 align-top text-right">
                          <div className="inline-flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setDetailsTransaction(t)}>
                              <Eye className="h-4 w-4 mr-1" /> Details
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingTransaction(t)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <InlineDeleteButton id={t.id} onDeleted={() => {
                              queryClient.invalidateQueries({ queryKey: ['transactions'] })
                              queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
                              queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] })
                            }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-start gap-3">
                    {bulkMode && (
                      <div className="pt-4">
                        <Checkbox
                          checked={selectedTransactions.includes(transaction.id)}
                          onCheckedChange={() => toggleTransactionSelection(transaction.id)}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <TransactionItem 
                        transaction={transaction}
                        showTags={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {transactionsData && transactionsData.total > pageSize && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, transactionsData.total)} of {transactionsData.total} transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {Math.ceil(transactionsData.total / pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={(currentPage + 1) * pageSize >= transactionsData.total}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Form Modal - Create */}
      <TransactionForm 
        open={transactionFormOpen} 
        onOpenChange={setTransactionFormOpen} 
      />
      {/* Transaction Form Modal - Edit */}
      <TransactionForm
        open={!!editingTransaction}
        onOpenChange={(o) => !o && setEditingTransaction(null)}
        transaction={editingTransaction || undefined}
      />

      {/* CSV Import Modal */}
      <CSVImport 
        open={csvImportOpen} 
        onOpenChange={setCsvImportOpen} 
      />

      {/* Details Drawer */}
      <Sheet open={!!detailsTransaction} onOpenChange={(o) => !o && setDetailsTransaction(null)}>
        <SheetContent side="right" className="w-[420px] sm:w-[480px]">
          <SheetHeader>
            <SheetTitle>Transaction Details</SheetTitle>
          </SheetHeader>
          {detailsTransaction && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Date</div>
                <div className="text-sm">{format(new Date(detailsTransaction.date), 'PPP')}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Type</div>
                <div className={cn('text-sm font-medium', detailsTransaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600')}>
                  {detailsTransaction.type}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Amount</div>
                <div className={cn('text-sm font-semibold', detailsTransaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600')}>
                  {detailsTransaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(detailsTransaction.amount), detailsTransaction.currency)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Description</div>
                <div className="text-sm">{detailsTransaction.description || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {(detailsTransaction.tags || []).map((tag) => {
                    const color = getTagColor(tag)
                    return (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs"
                        style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}
                      >
                        {tag}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

 

