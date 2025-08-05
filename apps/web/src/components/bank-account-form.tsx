'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useCreateBankAccount, useUpdateBankAccount } from '@/hooks/use-portfolios'
import { usePortfolios } from '@/hooks/use-portfolios'
import { toast } from 'sonner'

interface BankAccountFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolio?: any
  bankAccount?: any
}

export function BankAccountForm({ open, onOpenChange, portfolio, bankAccount }: BankAccountFormProps) {
  const { data: portfolios } = usePortfolios()
  const [formData, setFormData] = useState({
    name: bankAccount?.name || '',
    accountType: bankAccount?.accountType || 'CHECKING',
    accountNumber: bankAccount?.accountNumber || '',
    routingNumber: bankAccount?.routingNumber || '',
    institution: bankAccount?.institution || '',
    balance: bankAccount?.balance || 0,
    currency: bankAccount?.currency || 'USD',
    isConnected: bankAccount?.isConnected || false,
    portfolioId: bankAccount?.portfolioId || portfolio?.id || '',
  })

  const createBankAccount = useCreateBankAccount()
  const updateBankAccount = useUpdateBankAccount()

  // Reset form when portfolio changes
  useEffect(() => {
    if (portfolio && !bankAccount) {
      setFormData(prev => ({
        ...prev,
        portfolioId: portfolio.id,
      }))
    }
  }, [portfolio, bankAccount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (bankAccount) {
        await updateBankAccount.mutateAsync({
          id: bankAccount.id,
          data: formData,
        })
        toast.success('Bank account updated successfully')
      } else {
        await createBankAccount.mutateAsync(formData)
        toast.success('Bank account created successfully')
      }
      onOpenChange(false)
      setFormData({
        name: '',
        accountType: 'CHECKING',
        accountNumber: '',
        routingNumber: '',
        institution: '',
        balance: 0,
        currency: 'USD',
        isConnected: false,
        portfolioId: portfolio?.id || '',
      })
    } catch (error) {
      toast.error('Failed to save bank account')
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {bankAccount ? 'Edit Bank Account' : 'Add Bank Account'}
          </DialogTitle>
          <DialogDescription>
            {bankAccount 
              ? 'Update your bank account details below.'
              : 'Add a new bank account to your portfolio.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Chase Checking, Wells Fargo Savings"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select
              value={formData.accountType}
              onValueChange={(value) => handleInputChange('accountType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECKING">Checking</SelectItem>
                <SelectItem value="SAVINGS">Savings</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="INVESTMENT">Investment</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number (Optional)</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                placeholder="****1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number (Optional)</Label>
              <Input
                id="routingNumber"
                value={formData.routingNumber}
                onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                placeholder="123456789"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Institution (Optional)</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => handleInputChange('institution', e.target.value)}
              placeholder="e.g., Chase Bank, Wells Fargo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!portfolio && (
            <div className="space-y-2">
              <Label htmlFor="portfolioId">Portfolio</Label>
              <Select
                value={formData.portfolioId}
                onValueChange={(value) => handleInputChange('portfolioId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select portfolio" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isConnected"
              checked={formData.isConnected}
              onCheckedChange={(checked) => handleInputChange('isConnected', checked)}
            />
            <Label htmlFor="isConnected">Connected to real bank account</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBankAccount.isPending || updateBankAccount.isPending}
            >
              {createBankAccount.isPending || updateBankAccount.isPending ? 'Saving...' : 'Save Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 