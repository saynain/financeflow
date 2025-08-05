'use client'

import { useState, useEffect } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useChartData } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import { formatCurrency } from '@/lib/currencies'

const CustomTooltip = ({ active, payload, userCurrency }: any) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  if (active && payload && payload.length) {
    return (
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-2 rounded-lg shadow-lg border`}>
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-sm">{formatCurrency(payload[0].value, userCurrency)}</p>
      </div>
    )
  }
  return null
}

export function ExpensePieChart() {
  const { data, isLoading } = useChartData()
  const [userCurrency, setUserCurrency] = useState<string | null>(null)

  // Fetch user currency
  useEffect(() => {
    fetch('/api/user/currency')
      .then(res => res.json())
      .then(data => {
        setUserCurrency(data.currency || 'USD')
      })
      .catch(error => {
        console.error('Error fetching currency:', error)
        setUserCurrency('USD')
      })
  }, [])

  if (isLoading || userCurrency === null) {
    return <Skeleton className="h-[200px] w-full" />
  }

  const chartData = data?.expenseBreakdown || []
  const total = chartData.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={(props) => <CustomTooltip {...props} userCurrency={userCurrency} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold">{formatCurrency(total, userCurrency)}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-6 space-y-3">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium">
              {formatCurrency(item.value, userCurrency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
