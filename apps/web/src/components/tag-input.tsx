'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useTags, useCreateTag } from '@/hooks/use-tags'
import { getTagColor } from '@/lib/tag-colors'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function TagInput({ value, onChange, placeholder = "Add tags...", disabled = false }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { data: tags = [], isLoading } = useTags(inputValue)
  const createTagMutation = useCreateTag()

  // Filter out tags that are already selected
  const availableTags = tags.filter(tag => !value.includes(tag.name))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setShowSuggestions(newValue.length > 0)
    setSelectedSuggestionIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0 && availableTags[selectedSuggestionIndex]) {
        addTag(availableTags[selectedSuggestionIndex].name)
      } else if (inputValue.trim()) {
        addTag(inputValue.trim())
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => 
        prev < availableTags.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  const addTag = async (tagName: string) => {
    if (!tagName.trim() || value.includes(tagName.trim())) return

    const trimmedName = tagName.trim()
    
    // Check if tag exists in suggestions, if not create it
    const existingTag = availableTags.find(tag => tag.name.toLowerCase() === trimmedName.toLowerCase())
    
    if (!existingTag) {
      try {
        await createTagMutation.mutateAsync(trimmedName)
      } catch (error) {
        console.error('Failed to create tag:', error)
        return
      }
    }

    onChange([...value, trimmedName])
    setInputValue('')
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleSuggestionClick = (tagName: string) => {
    addTag(tagName)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md bg-background">
        {value.map((tag, index) => {
          const tagColor = getTagColor(tag)
          return (
            <Badge 
              key={index} 
              variant="secondary" 
              className="gap-1"
              style={{ 
                backgroundColor: `${tagColor}20`, 
                color: tagColor,
                borderColor: `${tagColor}40`
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )
        })}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : "Add more tags..."}
          className="border-0 p-0 flex-1 min-w-[120px] focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled}
        />
      </div>

      {showSuggestions && availableTags.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {availableTags.map((tag, index) => (
            <button
              key={tag.id}
              type="button"
              className={`w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                index === selectedSuggestionIndex ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => handleSuggestionClick(tag.name)}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getTagColor(tag.name) }}
                />
                <Plus className="h-4 w-4" />
                {tag.name}
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && inputValue.trim() && availableTags.length === 0 && !isLoading && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg"
        >
          <button
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => addTag(inputValue.trim())}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTagColor(inputValue.trim()) }}
              />
              <Plus className="h-4 w-4" />
              Create "{inputValue.trim()}"
            </div>
          </button>
        </div>
      )}
    </div>
  )
} 