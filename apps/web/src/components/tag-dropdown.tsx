'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronsUpDown, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTags } from '@/hooks/use-tags'
import { getTagColor } from '@/lib/tag-colors'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface TagDropdownProps {
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearAll: () => void
}

export function TagDropdown({ selectedTags, onTagToggle, onClearAll }: TagDropdownProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: tags = [] } = useTags()

  // Filter tags based on search query
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedTags.length === 0 ? (
              "Filter by tags"
            ) : (
              <div className="flex items-center gap-1">
                <span>Tags</span>
                <Badge variant="secondary" className="ml-1">
                  {selectedTags.length}
                </Badge>
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <div className="p-2">
            <div className="mb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border rounded-md"
                />
              </div>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {filteredTags.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {searchQuery ? 'No tags found matching your search.' : 'No tags found.'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        onTagToggle(tag.name)
                      }}
                      className={cn(
                        "w-full flex items-center px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                        selectedTags.includes(tag.name) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedTags.includes(tag.name) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getTagColor(tag.name) }}
                      />
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {selectedTags.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-8 px-2"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
} 