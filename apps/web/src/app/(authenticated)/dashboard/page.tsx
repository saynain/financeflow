'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, PiggyBank, TrendingUp, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CashFlowChart } from '@/components/charts/cash-flow-chart'
import { ExpensePieChart } from '@/components/charts/expense-pie-chart'
import { useDashboardStats, useTransactions } from '@/hooks/use-dashboard'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionItem } from '@/components/transaction-item'
import { formatCurrency } from '@/lib/currencies'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(5)
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)

  const statsConfig = [
    {
      title: 'Total Balance',
      value: stats?.totalBalance || 0,
      change: 0, // We can calculate this if we track balance history
      changeType: 'neutral' as const,
      icon: DollarSign,
      description: 'All time'
    },
    {
      title: 'Monthly Income',
      value: stats?.monthlyIncome || 0,
      change: stats?.changes.income || 0,
      changeType: (stats?.changes.income || 0) >= 0 ? 'positive' as const : 'negative' as const,
      icon: TrendingUp,
      description: 'from last month'
    },
    {
      title: 'Monthly Expenses',
      value: stats?.monthlyExpenses || 0,
      change: stats?.changes.expenses || 0,
      changeType: (stats?.changes.expenses || 0) <= 0 ? 'positive' as const : 'negative' as const,
      icon: CreditCard,
      description: 'from last month'
    },
    {
      title: 'Savings Rate',
      value: stats?.savingsRate || 0,
      change: stats?.changes.savingsRate || 0,
      changeType: (stats?.changes.savingsRate || 0) >= 0 ? 'positive' as const : 'negative' as const,
      icon: PiggyBank,
      description: 'from last month',
      isPercentage: true
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current date</p>
            <p className="text-2xl font-semibold">{format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
          <Button onClick={() => setTransactionFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stat.isPercentage 
                      ? `${stat.value.toFixed(1)}%`
                      : formatCurrency(stat.value, stats?.currency || 'USD')
                    }
                  </div>
                  <div className="flex items-center text-xs">
                    {stat.changeType !== 'neutral' && (
                      <span className={cn(
                        "flex items-center",
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {stat.changeType === 'positive' ? (
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-3 w-3" />
                        )}
                        {Math.abs(stat.change).toFixed(1)}%
                      </span>
                    )}
                    <span className="ml-1 text-muted-foreground">{stat.description}</span>
                  </div>
                </>
              )}
            </CardContent>
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 transform rounded-full bg-gradient-to-br from-primary/10 to-primary/5" />
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Cash Flow Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow Trend</CardTitle>
            <CardDescription>Your income and expenses over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <CashFlowChart />
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensePieChart />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-20 ml-auto" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {transactionsData?.transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form Modal */}
      <TransactionForm 
        open={transactionFormOpen} 
        onOpenChange={setTransactionFormOpen} 
      />
    </div>
  )
}
