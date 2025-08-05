'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { TransactionForm } from '@/components/transaction-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Icons } from '@/components/ui/icons'
import { Transaction } from '@/types/transaction'

interface TransactionItemProps {
  transaction: Transaction
  showTags?: boolean
}

export function TransactionItem({ transaction, showTags = true }: TransactionItemProps) {
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
            {transaction.type === 'INCOME' ? '💰' : '💸'}
          </div>
          <div>
            <p className="font-medium">{transaction.description || 'Transaction'}</p>
            <div className="flex items-center gap-2 mt-1">
              {showTags && transaction.tags && transaction.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {transaction.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {transaction.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{transaction.tags.length - 3} more
                    </Badge>
                  )}
                </div>
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
            {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(transaction.amount), transaction.currency)}
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
                {transaction.type === 'INCOME' ? '💰' : '💸'}
              </div>
              <div className="flex-1">
                <p className="font-medium">{transaction.description || 'Transaction'}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(transaction.date), 'MMMM d, yyyy')}
                </p>
                {transaction.tags && transaction.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {transaction.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className={cn(
                "text-lg font-semibold",
                transaction.type === 'INCOME' ? "text-green-600" : "text-red-600"
              )}>
                {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(transaction.amount), transaction.currency)}
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
