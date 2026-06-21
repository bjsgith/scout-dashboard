"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => string | number;
  className?: string;
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

export default function DataTable<T>({
  rows,
  columns,
  rowHref,
  rowLabel,
  keyOf,
  emptyMessage = "Nothing here yet.",
}: {
  rows: T[];
  columns: Column<T>[];
  rowHref?: (row: T) => string;
  /** Accessible label for a clickable row (e.g. its name). Used for keyboard nav. */
  rowLabel?: (row: T) => string;
  /** Stable key per row; defaults to array index. Provide for sortable tables. */
  keyOf?: (row: T) => string | number;
  emptyMessage?: string;
}) {
  const router = useRouter();
  const [sort, setSort] = useState<SortState>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const get = col.sortValue;
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, columns, sort]);

  function toggleSort(key: string) {
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-sage text-sm">
        <thead className="bg-paper-sunk">
          <tr>
            {columns.map((col) => {
              const active = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-left font-display text-xs font-medium uppercase tracking-[0.1em] text-moss ${
                    col.className ?? ""
                  }`}
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 transition-colors hover:text-pine"
                    >
                      {col.header}
                      <span className={active ? "text-rust" : "text-sage-deep"}>
                        {active ? (sort?.dir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-sage/70">
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-moss-light"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => {
              const href = rowHref?.(row);
              return (
                <tr
                  key={keyOf ? keyOf(row) : i}
                  onClick={href ? () => router.push(href) : undefined}
                  role={href ? "link" : undefined}
                  tabIndex={href ? 0 : undefined}
                  aria-label={href ? rowLabel?.(row) : undefined}
                  onKeyDown={
                    href
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push(href);
                          }
                        }
                      : undefined
                  }
                  className={
                    href
                      ? "cursor-pointer transition-colors hover:bg-paper-sunk/60 focus:outline-none focus-visible:bg-paper-sunk/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rust"
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-moss ${
                        col.className ?? ""
                      }`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
