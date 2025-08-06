// Predefined color palette for tags
const tagColors = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#84cc16', // Lime
  '#f97316', // Orange
  '#06b6d4', // Sky
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#a855f7', // Purple
  '#22c55e', // Green
  '#eab308', // Yellow
  '#3b82f6', // Blue
]

// Store custom colors in localStorage
const CUSTOM_COLORS_KEY = 'tag-custom-colors'

export function generateTagColor(): string {
  return tagColors[Math.floor(Math.random() * tagColors.length)]
}

export function getTagColor(tagName: string): string {
  // Check for custom color first
  const customColors = getCustomColors()
  if (customColors[tagName]) {
    return customColors[tagName]
  }

  // Generate a consistent color based on the tag name
  const hash = tagName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return tagColors[Math.abs(hash) % tagColors.length]
}

export function getTagColorFromDatabase(color: string | null): string {
  return color || '#6366f1' // Default color if none is set
}

// Custom color management
export function getCustomColors(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(CUSTOM_COLORS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function setCustomColor(tagName: string, color: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const customColors = getCustomColors()
    customColors[tagName] = color
    localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(customColors))
  } catch (error) {
    console.error('Failed to save custom color:', error)
  }
}

export function removeCustomColor(tagName: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const customColors = getCustomColors()
    delete customColors[tagName]
    localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(customColors))
  } catch (error) {
    console.error('Failed to remove custom color:', error)
  }
}

export function getAvailableColors(): string[] {
  return tagColors
} 