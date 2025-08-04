'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { TransactionForm } from '@/components/transaction-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Icons } from '@/components/ui/icons'

interface Transaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string | null
  date: string
  category: {
    id: string
    name: string
    icon: string | null
  }
}

interface TransactionItemProps {
  transaction: Transaction
  showCategory?: boolean
}

const categoryColors: Record<string, string> = {
  'Food & Dining': 'bg-green-100 text-green-800',
  'Housing': 'bg-blue-100 text-blue-800',
  'Utilities': 'bg-yellow-100 text-yellow-800',
  'Transportation': 'bg-purple-100 text-purple-800',
  'Entertainment': 'bg-pink-100 text-pink-800',
  'Shopping': 'bg-orange-100 text-orange-800',
  'Healthcare': 'bg-red-100 text-red-800',
  'Salary': 'bg-emerald-100 text-emerald-800',
  'Freelance': 'bg-teal-100 text-teal-800',
  'Other': 'bg-gray-100 text-gray-800',
}

export function TransactionItem({ transaction, showCategory = true }: TransactionItemProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete transaction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] })
      setDeleteOpen(false)
    },
  })

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync()
    } catch (error) {
      console.error('Error deleting transaction:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
            {transaction.category.icon || (transaction.type === 'INCOME' ? '💰' : '💸')}
          </div>
          <div>
            <p className="font-medium">{transaction.description || transaction.category.name}</p>
            <div className="flex items-center gap-2 mt-1">
              {showCategory && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  categoryColors[transaction.category.name] || 'bg-gray-100 text-gray-800'
                )}>
                  {transaction.category.name}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {format(new Date(transaction.date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "text-lg font-semibold",
            transaction.type === 'INCOME' ? "text-green-600" : "text-red-600"
          )}>
            {transaction.type === 'INCOME' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Transaction options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit Dialog */}
      <TransactionForm
        open={editOpen}
        onOpenChange={setEditOpen}
        transaction={transaction}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center text-2xl">
                {transaction.category.icon || '💸'}
              </div>
              <div className="flex-1">
                <p className="font-medium">{transaction.description || transaction.category.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(transaction.date), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className={cn(
                "text-lg font-semibold",
                transaction.type === 'INCOME' ? "text-green-600" : "text-red-600"
              )}>
                {transaction.type === 'INCOME' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
