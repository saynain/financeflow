'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, Target, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currencies'

// Demo investment data
const portfolioHoldings = [
  {
    id: '1',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    shares: 25,
    avgPrice: 150.00,
    currentPrice: 175.50,
    value: 4387.50,
    change: 25.50,
    changePercent: 17.0,
  },
  {
    id: '2',
    name: 'Microsoft Corp.',
    symbol: 'MSFT',
    shares: 15,
    avgPrice: 280.00,
    currentPrice: 320.75,
    value: 4811.25,
    change: 40.75,
    changePercent: 14.6,
  },
  {
    id: '3',
    name: 'Tesla Inc.',
    symbol: 'TSLA',
    shares: 10,
    avgPrice: 200.00,
    currentPrice: 185.25,
    value: 1852.50,
    change: -14.75,
    changePercent: -7.4,
  },
  {
    id: '4',
    name: 'S&P 500 ETF',
    symbol: 'SPY',
    shares: 50,
    avgPrice: 400.00,
    currentPrice: 425.80,
    value: 21290.00,
    change: 25.80,
    changePercent: 6.5,
  },
]

const investmentOpportunities = [
  {
    id: '1',
    name: 'Tech Growth Fund',
    type: 'Mutual Fund',
    risk: 'Medium',
    expectedReturn: 12.5,
    minInvestment: 1000,
    description: 'Diversified technology growth fund',
  },
  {
    id: '2',
    name: 'Real Estate ETF',
    type: 'ETF',
    risk: 'Low',
    expectedReturn: 8.2,
    minInvestment: 500,
    description: 'Real estate investment trust ETF',
  },
  {
    id: '3',
    name: 'Emerging Markets',
    type: 'ETF',
    risk: 'High',
    expectedReturn: 15.8,
    minInvestment: 2000,
    description: 'Emerging markets growth opportunities',
  },
]

export default function InvestmentsPage() {
  const [addInvestmentOpen, setAddInvestmentOpen] = useState(false)

  const totalValue = portfolioHoldings.reduce((sum, holding) => sum + holding.value, 0)
  const totalCost = portfolioHoldings.reduce((sum, holding) => sum + (holding.avgPrice * holding.shares), 0)
  const totalGain = totalValue - totalCost
  const totalGainPercent = (totalGain / totalCost) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Portfolio</h1>
          <p className="text-muted-foreground">Track your investments and discover opportunities</p>
        </div>
        <Button onClick={() => setAddInvestmentOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Investment
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue, 'USD')}</div>
            <p className="text-xs text-muted-foreground">
              Across {portfolioHoldings.length} holdings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            <div className={cn(
              "h-4 w-4",
              totalGain >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {totalGain >= 0 ? <TrendingUp /> : <TrendingDown />}
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              totalGain >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(totalGain, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalGainPercent.toFixed(1)}% return
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AAPL</div>
            <p className="text-xs text-green-600">+17.0%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Worst Performer</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TSLA</div>
            <p className="text-xs text-red-600">-7.4%</p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Holdings</CardTitle>
          <CardDescription>Your current investment positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioHoldings.map((holding) => (
              <div key={holding.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{holding.name}</div>
                    <div className="text-sm text-muted-foreground">{holding.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(holding.value, 'USD')}</div>
                  <div className={cn(
                    "text-sm",
                    holding.change >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {holding.change >= 0 ? '+' : ''}{formatCurrency(holding.change, 'USD')} ({holding.changePercent.toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Opportunities</CardTitle>
          <CardDescription>Discover new investment options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {investmentOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{opportunity.name}</h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {opportunity.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Risk Level:</span>
                    <span className={cn(
                      "font-medium",
                      opportunity.risk === 'Low' ? "text-green-600" :
                      opportunity.risk === 'Medium' ? "text-yellow-600" : "text-red-600"
                    )}>
                      {opportunity.risk}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Expected Return:</span>
                    <span className="font-medium text-green-600">{opportunity.expectedReturn}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Min Investment:</span>
                    <span className="font-medium">{formatCurrency(opportunity.minInvestment, 'USD')}</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Investment Modal Placeholder */}
      {addInvestmentOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Investment</h3>
            <p className="text-muted-foreground mb-4">
              This feature is coming soon! You'll be able to add new investments and track your portfolio.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAddInvestmentOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
