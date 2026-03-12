"use client";

import React, { useMemo, useState } from "react";

type Column<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
};

export function Table<T extends Record<string, any>>({ columns, data }: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortKey as keyof T];
      const bValue = b[sortKey as keyof T];
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      if (typeof aValue === "number" && typeof bValue === "number") {
        return aValue - bValue;
      }
      return String(aValue).localeCompare(String(bValue));
    });
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [data, sortDir, sortKey]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <table className="w-full border-collapse font-body text-sm sm:text-base">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={String(column.key)}
              onClick={() => handleSort(String(column.key), column.sortable)}
              className={`border-b-2 border-ink px-3 py-3 text-left font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-muted ${
                column.sortable ? "cursor-pointer hover:text-accent" : "cursor-default"
              }`}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, index) => (
          <tr key={index} className="transition-colors hover:bg-card-hover border-b border-dashed border-border-soft">
            {columns.map((column) => (
              <td key={String(column.key)} className="px-3 py-3">
                {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "-")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
