'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SUPPORTED_CURRENCIES, getCurrencyByCode } from '@/lib/currencies'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { TagManagement } from '@/components/tag-management'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsPage() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    // Fetch current user currency
    fetch('/api/user/currency')
      .then(res => res.json())
      .then(data => {
        if (data.currency) {
          setSelectedCurrency(data.currency)
        }
      })
      .catch(error => {
        console.error('Error fetching currency:', error)
      })
  }, [])

  const handleCurrencyChange = async (currency: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/currency', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency }),
      })

      if (response.ok) {
        setSelectedCurrency(currency)
        // Invalidate queries to refresh data with new currency
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
        queryClient.invalidateQueries({ queryKey: ['budgets'] })
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        toast.success('Currency updated successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update currency')
      }
    } catch (error) {
      console.error('Error updating currency:', error)
      toast.error('Failed to update currency')
    } finally {
      setIsLoading(false)
    }
  }

  const currentCurrency = getCurrencyByCode(selectedCurrency)

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and settings.
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Currency Settings</CardTitle>
                <CardDescription>
                  Choose your preferred currency for displaying amounts throughout the app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Currency</label>
                  <Select
                    value={selectedCurrency}
                    onValueChange={handleCurrencyChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {currentCurrency ? (
                          <div className="flex items-center gap-2">
                            <span>{currentCurrency.symbol}</span>
                            <span>{currentCurrency.name}</span>
                            <span className="text-muted-foreground">({currentCurrency.code})</span>
                          </div>
                        ) : (
                          'Select currency'
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span>{currency.symbol}</span>
                            <span>{currency.name}</span>
                            <span className="text-muted-foreground">({currency.code})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentCurrency && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Preview:</strong> {currentCurrency.symbol}1,234.56
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is how amounts will be displayed in your selected currency.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and manage your account details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Account management features coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags">
            <TagManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
