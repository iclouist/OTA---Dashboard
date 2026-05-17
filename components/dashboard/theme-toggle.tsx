'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-7 w-14 items-center rounded-full border border-border bg-muted/50 p-0.5">
        <div className="h-5 w-5 rounded-full bg-muted" />
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'group relative flex h-7 w-14 items-center rounded-full border p-0.5 transition-all duration-200',
        isDark 
          ? 'border-border bg-muted/50 hover:border-muted-foreground/30' 
          : 'border-border bg-muted/80 hover:border-muted-foreground/40'
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Track icons */}
      <div className="absolute inset-x-1.5 flex items-center justify-between">
        <Sun className={cn(
          'h-3 w-3 transition-opacity duration-200',
          isDark ? 'opacity-30' : 'opacity-0'
        )} />
        <Moon className={cn(
          'h-3 w-3 transition-opacity duration-200',
          isDark ? 'opacity-0' : 'opacity-30'
        )} />
      </div>
      
      {/* Thumb */}
      <div
        className={cn(
          'relative z-10 flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-all duration-200',
          isDark 
            ? 'translate-x-[26px] bg-foreground' 
            : 'translate-x-0 bg-foreground'
        )}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-background" />
        ) : (
          <Sun className="h-3 w-3 text-background" />
        )}
      </div>
    </button>
  )
}
