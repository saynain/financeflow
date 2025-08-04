'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useChartData } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export function CashFlowChart() {
  const { data, isLoading } = useChartData()

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  const chartData = data?.cashFlow || []
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
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
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
