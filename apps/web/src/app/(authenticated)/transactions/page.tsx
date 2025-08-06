'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, DollarSign, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTransactions, useDashboardStats } from '@/hooks/use-dashboard'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionItem } from '@/components/transaction-item'
import { TagDropdown } from '@/components/tag-dropdown'
import { formatCurrency } from '@/lib/currencies'

export default function ExpensesPage() {
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(50)

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            All Transactions
          </h1>
          <p className="text-muted-foreground mt-2">
            {filteredTransactions.length} of {allTransactions.length} transactions
            {selectedTags.length > 0 && ` • Filtered by ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <Button onClick={() => setTransactionFormOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Transaction
        </Button>
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
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction}
                showTags={true}
              />
            ))}
          </div>
        )}
      </div>



      {/* Transaction Form Modal */}
      <TransactionForm 
        open={transactionFormOpen} 
        onOpenChange={setTransactionFormOpen} 
      />
    </div>
  )
}
