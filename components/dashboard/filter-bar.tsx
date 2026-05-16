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
import { Search, X } from 'lucide-react';

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
}

export function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  className,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(values).some((v) => v && v !== 'all');

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2',
        className
      )}
    >
      {filters.map((filter) => {
        if (filter.type === 'search') {
          return (
            <div key={filter.id} className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={filter.placeholder || 'Search...'}
                value={values[filter.id] || ''}
                onChange={(e) => onChange(filter.id, e.target.value)}
                className="h-8 w-48 bg-background pl-8 text-xs"
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
              <SelectTrigger className="h-8 w-36 bg-background text-xs">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
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
              className="h-8 w-36 bg-background text-xs"
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
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
