import * as React from "react";

export function Table({ className = "", ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={`w-full caption-bottom text-sm ${className}`} {...props} />
    </div>
  );
}

export function TableHeader({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`[&_tr]:border-b ${className}`} {...props} />;
}

export function TableBody({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />;
}

export function TableRow({ className = "", ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b border-[var(--border)] transition-colors hover:bg-[rgba(255,255,255,0.04)] data-[state=selected]:bg-[var(--card)] ${className}`}
      {...props}
    />
  );
}

export function TableHead({ className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`text-[var(--foreground)] h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-sm ${className}`}
      style={{ color: "#9ca3af" }}
      {...props}
    />
  );
}

export function TableCell({ className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`p-2 align-middle whitespace-nowrap ${className}`}
      {...props}
    />
  );
}
