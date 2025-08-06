'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  GripVertical,
  Edit,
  Trash2,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currencies'
import { getTagColor } from '@/lib/tag-colors'

interface Budget {
  id: string
  name: string
  items: Array<{
    id: string
    tag: string
    amount: number
  }>
  createdAt: string
}

interface SortableBudgetListProps {
  budgets: Budget[]
  onEdit: (budget: Budget) => void
  onDelete: (budget: Budget) => void
  onReorder: (budgets: Budget[]) => void
  data?: any
  userCurrency?: string | null
}

function SortableBudgetItem({ 
  budget, 
  onEdit, 
  onDelete, 
  data, 
  userCurrency 
}: { 
  budget: Budget
  onEdit: (budget: Budget) => void
  onDelete: (budget: Budget) => void
  data?: any
  userCurrency?: string | null
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: budget.id })

  const totalBudget = budget.items.reduce((sum, item) => sum + Number(item.amount), 0)
  const totalSpent = budget.items.reduce((sum, item) => {
    const currentSpending = data?.tagGroups.find(tg => tg.tag === item.tag)?.totalSpent || 0
    return sum + Math.abs(currentSpending)
  }, 0)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "p-4 cursor-move",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{budget.name}</h3>
            <p className="text-sm text-muted-foreground">
              Created {new Date(budget.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(budget)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(budget)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {budget.items.map((item) => {
          // Get current spending for this tag from the expenses overview
          const tagGroup = data?.tagGroups.find(tg => tg.tag === item.tag)
          const currentSpending = tagGroup?.totalSpent || 0
          const currentIncome = tagGroup?.totalIncome || 0
          
          // For reimbursement categories, track outstanding expenses (spent - reimbursed)
          const outstandingAmount = Math.abs(currentSpending) - Math.abs(currentIncome)
          const spendingAmount = Math.max(0, outstandingAmount) // Don't show negative
          const budgetAmount = Number(item.amount)
          
          // Fix percentage calculation
          let percentage = 0
          if (budgetAmount > 0) {
            percentage = Math.min((spendingAmount / budgetAmount) * 100, 100)
          } else if (spendingAmount > 0) {
            // If budget is 0 but there's outstanding spending, show 100%
            percentage = 100
          }
          // If both are 0, percentage stays 0
          
          // Determine color based on percentage
          let progressColor = 'bg-green-500'
          if (percentage >= 90) {
            progressColor = 'bg-red-500'
          } else if (percentage >= 75) {
            progressColor = 'bg-orange-500'
          } else if (percentage >= 60) {
            progressColor = 'bg-blue-500'
          }

          return (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: `${getTagColor(item.tag)}20`,
                      border: `1px solid ${getTagColor(item.tag)}40`
                    }}
                  >
                    <Tag className="h-4 w-4" style={{ color: getTagColor(item.tag) }} />
                  </div>
                  <div>
                    <span className="font-medium">{item.tag}</span>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(spendingAmount, userCurrency)} / {formatCurrency(budgetAmount, userCurrency)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {percentage.toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className={cn("h-full transition-all", progressColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t mt-4">
        <div>
          <span className="font-medium">Total Budget:</span>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(totalSpent, userCurrency)} spent
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold">
            {formatCurrency(totalBudget, userCurrency)}
          </span>
          <p className="text-sm text-muted-foreground">
            {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% used` : '0% used'}
          </p>
        </div>
      </div>
    </Card>
  )
}

export function SortableBudgetList({ 
  budgets, 
  onEdit, 
  onDelete, 
  onReorder, 
  data, 
  userCurrency 
}: SortableBudgetListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = budgets.findIndex(budget => budget.id === active.id)
      const newIndex = budgets.findIndex(budget => budget.id === over?.id)
      
      const newBudgets = arrayMove(budgets, oldIndex, newIndex)
      onReorder(newBudgets)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={budgets.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">
          {budgets.map((budget) => (
            <SortableBudgetItem
              key={budget.id}
              budget={budget}
              onEdit={onEdit}
              onDelete={onDelete}
              data={data}
              userCurrency={userCurrency}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
} 