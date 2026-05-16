'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string;
  emptyMessage?: string;
  className?: string;
  compact?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  getRowClassName,
  emptyMessage = 'No data found',
  className,
  compact = false,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const handleSort = (columnId: string) => {
    setSortConfig((prev) => ({
      key: columnId,
      direction: prev.key === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    const column = columns.find((c) => c.id === sortConfig.key);
    if (!column?.accessorKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[column.accessorKey as keyof T];
      const bVal = b[column.accessorKey as keyof T];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig, columns]);

  return (
    <div className={cn('overflow-hidden rounded-md border border-border bg-card', className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                style={column.width ? { width: column.width } : undefined}
                className={cn(
                  'h-8 bg-muted/30 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground',
                  column.sortable && 'cursor-pointer select-none hover:text-foreground',
                  column.className
                )}
                onClick={() => column.sortable && handleSort(column.id)}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && (
                    <span className="ml-0.5">
                      {sortConfig.key === column.id ? (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-16 text-center text-[12px] text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  'border-b border-border/50 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-muted/30',
                  getRowClassName?.(row)
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(
                      'px-3 text-[12px]',
                      compact ? 'py-1.5' : 'py-2',
                      column.className
                    )}
                  >
                    {column.cell
                      ? column.cell(row)
                      : column.accessorKey
                      ? String(row[column.accessorKey] ?? '')
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
