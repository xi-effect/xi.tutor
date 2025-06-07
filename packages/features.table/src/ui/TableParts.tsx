import { cn } from '@xipkg/utils';
import React from 'react';

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <table className={cn('w-full border-separate border-spacing-y-2', className)} {...props} />
);

export const TableHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={cn(className)} {...props} />;

export const TableBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={cn(className)} {...props} />;

export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('rounded-xl transition-all duration-200', className)} {...props} />
);

export const TableHead = ({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('px-3 py-2 text-left', className)} {...props} />
);

export const TableCell = ({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-3 py-2 text-left', className)} {...props} />
);
