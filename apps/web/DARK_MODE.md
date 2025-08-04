# Dark Mode Implementation

This document describes the dark mode implementation for the FinanceFlow application.

## Overview

The application now supports a complete dark mode experience with the following features:

- **System preference detection**: Automatically detects and follows the user's system theme preference
- **Manual theme switching**: Users can manually switch between light, dark, and system themes
- **Persistent theme selection**: Theme choice is saved and persists across sessions
- **Smooth transitions**: Theme changes are applied with smooth transitions

## Implementation Details

### 1. Theme Provider Setup

The dark mode is implemented using the `next-themes` library:

- **ThemeProvider**: Wraps the entire application in `apps/web/src/app/layout.tsx`
- **Configuration**: Uses `class` attribute for theme switching with system preference detection
- **Hydration**: Includes `suppressHydrationWarning` to prevent hydration mismatches

### 2. Theme Toggle Component

Located at `apps/web/src/components/theme-toggle.tsx`:

- **Dropdown Menu**: Provides options for Light, Dark, and System themes
- **Animated Icons**: Sun and moon icons that animate during theme transitions
- **Accessibility**: Includes proper ARIA labels and keyboard navigation

### 3. Sidebar Integration

The theme toggle is integrated into the sidebar:

- **Position**: Located in the top-right corner of the sidebar header
- **Styling**: Uses the design system's button and dropdown components
- **Responsive**: Works on both desktop and mobile layouts

### 4. CSS Variables

The application uses CSS custom properties for theming:

- **Light Theme**: Defined in `apps/web/src/styles/globals.css` under `:root`
- **Dark Theme**: Defined under `.dark` class
- **Design System**: All components use these variables for consistent theming

### 5. Component Updates

All components have been updated to support dark mode:

- **Layout Components**: Updated background colors and borders
- **Form Components**: Updated input fields and validation messages
- **Chart Components**: Updated grid lines, tooltips, and text colors
- **Category Colors**: Updated category badges for both light and dark themes

## Usage

### For Users

1. **System Theme**: The app automatically follows your system theme preference
2. **Manual Switching**: Click the theme toggle in the sidebar to change themes
3. **Theme Options**:
   - **Light**: Always use light theme
   - **Dark**: Always use dark theme
   - **System**: Follow system preference

### For Developers

1. **Adding New Components**: Use the design system's CSS variables for colors
2. **Custom Styling**: Use `dark:` prefixes for dark mode specific styles
3. **Theme Detection**: Use `useTheme()` hook from `next-themes` for theme-aware logic

## Files Modified

- `apps/web/src/app/layout.tsx` - Added ThemeProvider
- `apps/web/src/components/providers/theme-provider.tsx` - Created theme provider
- `apps/web/src/components/theme-toggle.tsx` - Created theme toggle component
- `apps/web/src/components/sidebar.tsx` - Added theme toggle and updated styling
- `apps/web/src/app/(authenticated)/layout.tsx` - Updated background colors
- `apps/web/src/app/auth/signin/page.tsx` - Updated styling for dark mode
- `apps/web/src/app/auth/signup/page.tsx` - Updated styling for dark mode
- `apps/web/src/components/charts/cash-flow-chart.tsx` - Added dark mode support
- `apps/web/src/components/charts/expense-pie-chart.tsx` - Added dark mode support
- `apps/web/src/components/transaction-item.tsx` - Updated category colors
- `apps/web/src/app/(authenticated)/expenses/page.tsx` - Updated category colors

## Dependencies Added

- `next-themes` - Theme management library

## Testing

To test the dark mode implementation:

1. Start the development server: `pnpm dev`
2. Navigate to the application
3. Test theme switching using the toggle in the sidebar
4. Verify that all components adapt correctly to both light and dark themes
5. Test system theme detection by changing your system theme preference 