'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePortfolio, useUpdatePortfolio } from '@/hooks/use-portfolios'
import { toast } from 'sonner'

interface PortfolioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolio?: any
}

export function PortfolioForm({ open, onOpenChange, portfolio }: PortfolioFormProps) {
  const [formData, setFormData] = useState({
    name: portfolio?.name || '',
    description: portfolio?.description || '',
    type: portfolio?.type || 'CHECKING',
    currency: portfolio?.currency || 'USD',
  })

  const createPortfolio = useCreatePortfolio()
  const updatePortfolio = useUpdatePortfolio()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (portfolio) {
        await updatePortfolio.mutateAsync({
          id: portfolio.id,
          data: formData,
        })
        toast.success('Portfolio updated successfully')
      } else {
        await createPortfolio.mutateAsync(formData)
        toast.success('Portfolio created successfully')
      }
      onOpenChange(false)
      setFormData({
        name: '',
        description: '',
        type: 'CHECKING',
        currency: 'USD',
      })
    } catch (error) {
      toast.error('Failed to save portfolio')
    }
  }

  const handleInputChange = (field: string, value: string) => {
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
            {portfolio ? 'Edit Portfolio' : 'Create Portfolio'}
          </DialogTitle>
          <DialogDescription>
            {portfolio 
              ? 'Update your portfolio details below.'
              : 'Create a new portfolio to organize your finances.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Portfolio Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Main Checking, Investment Portfolio"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this portfolio is for..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Portfolio Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select portfolio type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECKING">Checking</SelectItem>
                <SelectItem value="SAVINGS">Savings</SelectItem>
                <SelectItem value="INVESTMENT">Investment</SelectItem>
                <SelectItem value="CRYPTO">Crypto</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={createPortfolio.isPending || updatePortfolio.isPending}
            >
              {createPortfolio.isPending || updatePortfolio.isPending ? 'Saving...' : 'Save Portfolio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 