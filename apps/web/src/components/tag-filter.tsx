'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'
import { useTags } from '@/hooks/use-tags'
import { getTagColor } from '@/lib/tag-colors'

interface TagFilterProps {
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearAll: () => void
}

export function TagFilter({ selectedTags, onTagToggle, onClearAll }: TagFilterProps) {
  const { data: allTags = [] } = useTags()
  const [showAllTags, setShowAllTags] = useState(false)

  // Get tags that are actually used in transactions (we'll get this from the API later)
  const usedTags = allTags.filter(tag => tag.name) // For now, show all tags

  const toggleTag = (tagName: string) => {
    onTagToggle(tagName)
  }

  const isTagSelected = (tagName: string) => {
    return selectedTags.includes(tagName)
  }

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by tags</span>
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedTags.length} selected
            </Badge>
          )}
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => {
            const tagColor = getTagColor(tag)
            return (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 cursor-pointer hover:opacity-80"
                style={{ 
                  backgroundColor: `${tagColor}20`, 
                  color: tagColor,
                  borderColor: `${tagColor}40`
                }}
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <X className="h-3 w-3" />
              </Badge>
            )
          })}
        </div>
      )}

      {/* Available Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Available tags</span>
          {usedTags.length > 8 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTags(!showAllTags)}
              className="text-xs"
            >
              {showAllTags ? 'Show less' : `Show all (${usedTags.length})`}
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(showAllTags ? usedTags : usedTags.slice(0, 8)).map((tag) => {
            const tagColor = getTagColor(tag.name)
            const isSelected = isTagSelected(tag.name)
            
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                style={isSelected ? {
                  backgroundColor: tagColor,
                  color: 'white',
                  borderColor: tagColor
                } : {
                  borderColor: `${tagColor}40`,
                  color: tagColor
                }}
                onClick={() => toggleTag(tag.name)}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: isSelected ? 'white' : tagColor }}
                />
                {tag.name}
              </Badge>
            )
          })}
        </div>
      </div>
    </div>
  )
} 