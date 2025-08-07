'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, DollarSign, X, Upload, Edit, Trash2, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTransactions, useDashboardStats } from '@/hooks/use-dashboard'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionItem } from '@/components/transaction-item'
import { TagDropdown } from '@/components/tag-dropdown'
import { CSVImport } from '@/components/csv-import'
import { formatCurrency } from '@/lib/currencies'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export default function ExpensesPage() {
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)
  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [bulkMode, setBulkMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(100)
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(pageSize, currentPage * pageSize)

  // Use real transaction data
  const allTransactions = transactionsData?.transactions || []

  // Filter transactions by selected tags
  const filteredTransactions = selectedTags.length > 0
    ? allTransactions.filter(transaction => 
        transaction.tags && transaction.tags.some(tag => selectedTags.includes(tag))
      )
    : allTransactions

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
    // TODO: Implement bulk edit modal
    toast.info('Bulk edit feature coming soon!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            All Transactions
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
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <TagDropdown
              selectedTags={selectedTags}
              onTagToggle={toggleTag}
              onClearAll={clearAllTags}
            />
            
            {bulkMode && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAllTransactions()
                      } else {
                        clearAllTransactions()
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select All ({selectedTransactions.length}/{filteredTransactions.length})
                  </span>
                </div>
                
                {selectedTransactions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkEdit}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit ({selectedTransactions.length})
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete ({selectedTransactions.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {transactionsLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
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
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedTags.length > 0 ? 'No matching transactions' : 'No transactions yet'}
            </h3>
            <p className="text-gray-500 mb-6">
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



      {/* Transaction Form Modal */}
      <TransactionForm 
        open={transactionFormOpen} 
        onOpenChange={setTransactionFormOpen} 
      />

      {/* CSV Import Modal */}
      <CSVImport 
        open={csvImportOpen} 
        onOpenChange={setCsvImportOpen} 
      />
    </div>
  )
}
