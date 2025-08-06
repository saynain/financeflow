'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Briefcase, CreditCard, PiggyBank, TrendingUp, Coins, MoreHorizontal, Edit, Trash2, Link, Unlink, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currencies'
import { usePortfolios, useCreatePortfolio, useDeletePortfolio } from '@/hooks/use-portfolios'
import { Skeleton } from '@/components/ui/skeleton'
import { PortfolioForm } from '@/components/portfolio-form'
import { BankAccountForm } from '@/components/bank-account-form'

const portfolioTypeIcons = {
  CHECKING: Building2,
  SAVINGS: PiggyBank,
  INVESTMENT: TrendingUp,
  CRYPTO: Coins,
  OTHER: Briefcase,
}

const portfolioTypeColors = {
  CHECKING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  SAVINGS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  INVESTMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  CRYPTO: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

export default function PortfoliosPage() {
  const { data: portfolios, isLoading } = usePortfolios()
  const [portfolioFormOpen, setPortfolioFormOpen] = useState(false)
  const [bankAccountFormOpen, setBankAccountFormOpen] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null)

  const totalBalance = portfolios?.reduce((sum, portfolio) => {
    const portfolioBalance = portfolio.bankAccounts?.reduce((acc, account) => acc + Number(account.balance), 0) || 0
    return sum + portfolioBalance
  }, 0) || 0

  const handleCreateBankAccount = (portfolio: any) => {
    setSelectedPortfolio(portfolio)
    setBankAccountFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Demo Notice */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Demo Mode:</strong> This page is currently using sample data. Real portfolio management features are under development.
          </p>
        </div>
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Portfolios
          </h1>
          <p className="text-muted-foreground mt-2">Manage your financial portfolios and connected bank accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            DEMO
          </Badge>
          <Button onClick={() => setPortfolioFormOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Portfolio
          </Button>
        </div>
      </div>

      {/* Total Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Total Portfolio Balance
          </CardTitle>
          <CardDescription>Combined balance across all your portfolios</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <div className="text-3xl font-bold">
              {formatCurrency(totalBalance, 'USD')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolios Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-24" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : portfolios?.length === 0 ? (
          // Empty state
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No portfolios yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first portfolio to start organizing your finances
              </p>
              <Button onClick={() => setPortfolioFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Portfolio
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Portfolio cards
          portfolios?.map((portfolio) => {
            const Icon = portfolioTypeIcons[portfolio.type as keyof typeof portfolioTypeIcons]
            const portfolioBalance = portfolio.bankAccounts?.reduce((acc, account) => acc + Number(account.balance), 0) || 0
            const connectedAccounts = portfolio.bankAccounts?.filter(account => account.isConnected).length || 0

            return (
              <Card key={portfolio.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                    </div>
                    <Badge className={cn(portfolioTypeColors[portfolio.type as keyof typeof portfolioTypeColors])}>
                      {portfolio.type}
                    </Badge>
                  </div>
                  {portfolio.description && (
                    <CardDescription>{portfolio.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(portfolioBalance, portfolio.currency)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {connectedAccounts} connected account{connectedAccounts !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Bank Accounts List */}
                  {portfolio.bankAccounts && portfolio.bankAccounts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Connected Accounts</h4>
                      {portfolio.bankAccounts.map((account) => (
                        <div key={account.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              account.isConnected ? "bg-green-500" : "bg-gray-400"
                            )} />
                            <span className="text-sm font-medium">{account.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(account.balance, account.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateBankAccount(portfolio)}
                      className="flex-1"
                    >
                      <Link className="mr-2 h-4 w-4" />
                      Add Account
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Portfolio Form Modal */}
      <PortfolioForm 
        open={portfolioFormOpen} 
        onOpenChange={setPortfolioFormOpen} 
      />

      {/* Bank Account Form Modal */}
      <BankAccountForm 
        open={bankAccountFormOpen} 
        onOpenChange={setBankAccountFormOpen}
        portfolio={selectedPortfolio}
      />
    </div>
  )
} 