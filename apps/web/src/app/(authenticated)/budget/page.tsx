'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  BarChart3,
  Tag
} from 'lucide-react'
import { useBudgetTags } from '@/hooks/use-budget-tags'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionForm } from '@/components/transaction-form'
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
  const { data, isLoading } = useBudgetTags()
  const queryClient = useQueryClient()
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
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

  const totalIncome = monthlyIncome
  const totalExpenses = data?.totalSpent || 0
  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

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
          <p className="text-muted-foreground mt-2">Track your income, expenses, and savings goals by tags</p>
        </div>
        <Button onClick={() => setTransactionFormOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Transaction
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
              {data?.tagGroups.length || 0} active tags
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tag Groups */}
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
          {data?.tagGroups.map((tagGroup) => {
            const isExpanded = expandedSections[tagGroup.tag] !== false // Default to expanded
            const percentageOfIncome = totalIncome > 0 ? (tagGroup.totalSpent / totalIncome) * 100 : 0
            const isHighSpending = percentageOfIncome > 20 // More than 20% of income

            return (
              <Card key={tagGroup.tag} className={cn(
                "overflow-hidden transition-all hover:shadow-lg",
                isHighSpending && "border-orange-300 bg-orange-50/30"
              )}>
                <CardHeader 
                  className={cn(
                    "cursor-pointer transition-colors",
                    isHighSpending && "bg-orange-50/50"
                  )}
                  onClick={() => toggleSection(tagGroup.tag)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSection(tagGroup.tag)
                        }}
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-3 rounded-full",
                          isHighSpending && "bg-orange-100",
                          !isHighSpending && "bg-blue-100"
                        )}>
                          <Tag className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {tagGroup.tag}
                            {isHighSpending && (
                              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                                High Spending
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {formatCurrency(tagGroup.totalSpent, userCurrency)} spent • {tagGroup.transactionCount} transactions
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn(
                          "text-2xl font-bold",
                          isHighSpending && "text-orange-600",
                          !isHighSpending && "text-blue-600"
                        )}>
                          {percentageOfIncome.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">of income</p>
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(percentageOfIncome, 100)} 
                    className={cn(
                      "h-3 mt-4",
                      isHighSpending && "[&>div]:bg-orange-500",
                      !isHighSpending && "[&>div]:bg-blue-500"
                    )}
                  />
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {tagGroup.transactions.map((transaction) => (
                        <div 
                          key={transaction.id} 
                          className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-full",
                              transaction.type === 'INCOME' ? "bg-green-100" : "bg-red-100"
                            )}>
                              {transaction.type === 'INCOME' ? '💰' : '💸'}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className={cn(
                            "text-lg font-semibold",
                            transaction.type === 'INCOME' ? "text-green-600" : "text-red-600"
                          )}>
                            {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount, userCurrency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Transaction Form Modal */}
      <TransactionForm
        open={transactionFormOpen}
        onOpenChange={setTransactionFormOpen}
      />
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
