'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTransactions, useDashboardStats } from '@/hooks/use-dashboard'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionItem } from '@/components/transaction-item'
import { formatCurrency } from '@/lib/currencies'

export default function ExpensesPage() {
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(20)

  // Use real transaction data
  const transactions = transactionsData?.transactions || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">All Transactions</h2>
        
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
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-500 mb-6">Add your first transaction to get started</p>
            <Button onClick={() => setTransactionFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction}
                showTags={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setTransactionFormOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg"
        size="icon"
      >
        <Plus className="h-8 w-8" />
      </Button>

      {/* Transaction Form Modal */}
      <TransactionForm 
        open={transactionFormOpen} 
        onOpenChange={setTransactionFormOpen} 
      />
    </div>
  )
}
