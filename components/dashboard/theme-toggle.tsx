'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "relative h-7 w-14 rounded-full p-0.5 transition-colors",
        isDark 
          ? "bg-muted hover:bg-muted/80" 
          : "bg-muted hover:bg-muted/80"
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span
        className={cn(
          "absolute flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-sm transition-transform duration-200",
          isDark ? "translate-x-[26px]" : "translate-x-0"
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-foreground" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-foreground" />
        )}
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
