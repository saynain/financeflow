'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Tag, 
  Search,
  Edit3,
  X
} from 'lucide-react'
import { useTags, useCreateTag } from '@/hooks/use-tags'
import { getTagColor, getCustomColors, setCustomColor, removeCustomColor, getAvailableColors } from '@/lib/tag-colors'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Tag {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export function TagManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
  const [colorPickerTag, setColorPickerTag] = useState<Tag | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()
  const { data: tags = [], isLoading } = useTags()
  const createTagMutation = useCreateTag()



  // Filter tags based on search query
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    setIsCreating(true)
    try {
      await createTagMutation.mutateAsync(newTagName.trim())
      setNewTagName('')
      setShowCreateForm(false)
      toast.success('Tag created successfully')
    } catch (error) {
      console.error('Failed to create tag:', error)
      toast.error('Failed to create tag')
    } finally {
      setIsCreating(false)
    }
  }

  const updateTagMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error('Failed to update tag')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      setEditingTag(null)
      toast.success('Tag updated successfully')
    },
    onError: () => {
      toast.error('Failed to update tag')
    },
  })

  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete tag')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setDeletingTag(null)
      const message = data.updatedTransactions > 0 
        ? `Tag deleted successfully. Removed from ${data.updatedTransactions} transaction${data.updatedTransactions !== 1 ? 's' : ''}.`
        : 'Tag deleted successfully.'
      toast.success(message)
    },
    onError: () => {
      toast.error('Failed to delete tag')
    },
  })

  const handleUpdateTag = async () => {
    if (!editingTag || !newTagName.trim()) return

    setIsEditing(true)
    try {
      await updateTagMutation.mutateAsync({
        id: editingTag.id,
        name: newTagName.trim(),
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteTag = async () => {
    if (!deletingTag) return

    setIsDeleting(true)
    try {
      await deleteTagMutation.mutateAsync(deletingTag.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
  }

  const openColorPicker = (tag: Tag) => {
    setColorPickerTag(tag)
  }

  const handleColorChange = (color: string) => {
    if (colorPickerTag) {
      setCustomColor(colorPickerTag.name, color)
      setColorPickerTag(null)
      toast.success(`Color updated for "${colorPickerTag.name}"`)
      // Force re-render by updating a state
      setSearchQuery(searchQuery)
    }
  }

  const handleResetColor = () => {
    if (colorPickerTag) {
      removeCustomColor(colorPickerTag.name)
      setColorPickerTag(null)
      toast.success(`Color reset for "${colorPickerTag.name}"`)
      // Force re-render by updating a state
      setSearchQuery(searchQuery)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tag Management</h2>
          <p className="text-muted-foreground mt-1">
            Create, edit, and delete tags to organize your transactions.
          </p>
        </div>
        <Button 
          onClick={() => {
            setShowCreateForm(true)
            setNewTagName('')
          }} 
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Create New Tag */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create New Tag</CardTitle>
            <CardDescription>
              Enter a name for your new tag. It will be automatically assigned a color.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateTag()
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-muted"
                  style={{ backgroundColor: getTagColor(newTagName) }}
                />
                <Button 
                  onClick={handleCreateTag} 
                  disabled={!newTagName.trim() || isCreating}
                  size="sm"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewTagName('')
                  }}
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Tags List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tags</CardTitle>
          <CardDescription>
            {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-muted rounded-full animate-pulse" />
                    <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                    <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No tags found' : 'No tags yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search or create a new tag.'
                  : 'Create your first tag to start organizing transactions.'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setNewTagName('')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Tag
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className="text-sm font-medium"
                      style={{ 
                        backgroundColor: `${getTagColor(tag.name)}20`, 
                        color: getTagColor(tag.name),
                        borderColor: `${getTagColor(tag.name)}40`
                      }}
                    >
                      {tag.name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openColorPicker(tag)}
                      className="p-1"
                      title="Change color"
                    >
                      <div 
                        className="w-4 h-4 rounded-full border border-muted hover:scale-110 transition-transform"
                        style={{ backgroundColor: getTagColor(tag.name) }}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(tag)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingTag(tag)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Tag Dialog */}
      <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the name of your tag. The color will remain the same.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter new tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateTag()
                    }
                  }}
                />
              </div>
              <div 
                className="w-8 h-8 rounded-full border-2 border-muted"
                style={{ backgroundColor: getTagColor(editingTag?.name || '') }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTag(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTag} 
              disabled={!newTagName.trim() || isEditing}
            >
              {isEditing ? 'Updating...' : 'Update Tag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Color Picker Dialog */}
      <Dialog open={!!colorPickerTag} onOpenChange={() => setColorPickerTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Color for "{colorPickerTag?.name}"</DialogTitle>
            <DialogDescription>
              Choose a custom color for this tag. The color will be consistent across all pages.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-8 gap-2">
              {getAvailableColors().map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-8 h-8 rounded-full border-2 border-muted hover:border-foreground transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleResetColor}>
                Reset to Default
              </Button>
              <Button variant="outline" onClick={() => setColorPickerTag(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTag} onOpenChange={() => setDeletingTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTag?.name}"? This action cannot be undone.
              <br />
              <br />
              <strong>Note:</strong> This will remove the tag from all transactions that use it. The transactions will remain but without this tag.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Tag'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 