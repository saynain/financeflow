'use client'

import { useState, useEffect } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useChartData } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import { formatCurrency } from '@/lib/currencies'

export function CashFlowChart() {
  const { data, isLoading } = useChartData()
  const { theme } = useTheme()
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
    return <Skeleton className="h-[300px] w-full" />
  }

  const chartData = data?.cashFlow || []
  const isDark = theme === 'dark'
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f0f0f0"} />
        <XAxis 
          dataKey="month" 
          stroke={isDark ? "#9ca3af" : "#888888"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={isDark ? "#9ca3af" : "#888888"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCurrency(value, userCurrency)}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: isDark ? '#f9fafb' : '#111827'
          }}
          formatter={(value: number) => [formatCurrency(value, userCurrency), '']}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorIncome)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke="#ef4444"
          fillOpacity={1}
          fill="url(#colorExpenses)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
