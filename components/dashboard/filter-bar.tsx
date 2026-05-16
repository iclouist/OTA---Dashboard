'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'search' | 'date';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onClear: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  className,
  children,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(values).some((v) => v && v !== 'all');

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 border-b border-border bg-background px-1 py-1.5',
        className
      )}
    >
      <SlidersHorizontal className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
      
      {filters.map((filter) => {
        if (filter.type === 'search') {
          return (
            <div key={filter.id} className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={filter.placeholder || 'Search...'}
                value={values[filter.id] || ''}
                onChange={(e) => onChange(filter.id, e.target.value)}
                className="h-7 w-44 border-0 bg-muted/50 pl-7 text-[12px] placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          );
        }

        if (filter.type === 'select' && filter.options) {
          return (
            <Select
              key={filter.id}
              value={values[filter.id] || 'all'}
              onValueChange={(value) => onChange(filter.id, value)}
            >
              <SelectTrigger className="h-7 w-auto min-w-[100px] gap-1 border-0 bg-transparent px-2 text-[12px] hover:bg-muted/50 focus:ring-1 focus:ring-ring [&>span]:text-muted-foreground">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all" className="text-[12px]">
                  All {filter.label}
                </SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-[12px]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }

        if (filter.type === 'date') {
          return (
            <Input
              key={filter.id}
              type="date"
              value={values[filter.id] || ''}
              onChange={(e) => onChange(filter.id, e.target.value)}
              className="h-7 w-32 border-0 bg-muted/50 text-[12px] focus-visible:ring-1 focus-visible:ring-ring"
            />
          );
        }

        return null;
      })}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}

      {children && (
        <>
          <div className="mx-1 h-4 w-px bg-border" />
          {children}
        </>
      )}
    </div>
  );
}

// Compact toolbar variant
interface ToolbarProps {
  className?: string;
  children: React.ReactNode;
}

export function Toolbar({ className, children }: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 border-b border-border bg-background px-2 py-1.5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function ToolbarSeparator() {
  return <div className="mx-1 h-4 w-px bg-border" />;
}
