import { clsx } from 'clsx';

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <table className={clsx('w-full border-collapse', className)} {...props} />
);

export const TableHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={clsx(className)} {...props} />
);

export const TableBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={clsx(className)} {...props} />
);

export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={clsx(
      'hover:border-gray-30 rounded-xl border border-transparent transition-colors duration-200',
      className,
    )}
    {...props}
  />
);

export const TableHead = ({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={clsx('px-3 py-2 text-left', className)} {...props} />
);

export const TableCell = ({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={clsx('px-3 py-2 text-left', className)} {...props} />
);
