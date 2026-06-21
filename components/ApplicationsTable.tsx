"use client";

import { useMemo, useState } from "react";
import DataTable, { type Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { APPLICATION_STATUSES, enumLabel } from "@/lib/enums";
import { formatDate } from "@/lib/format";

export type AppRow = {
  id: string;
  jobTitle: string;
  companyName: string;
  status: string;
  employmentType: string | null;
  workMode: string | null;
  location: string;
  pay: string | null;
  dateApplied: string | null;
  lastActivity: string;
};

const columns: Column<AppRow>[] = [
  {
    key: "jobTitle",
    header: "Job title",
    render: (r) => (
      <span className="font-medium text-pine">{r.jobTitle}</span>
    ),
    sortValue: (r) => r.jobTitle.toLowerCase(),
  },
  {
    key: "companyName",
    header: "Company",
    render: (r) => r.companyName,
    sortValue: (r) => r.companyName.toLowerCase(),
  },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusBadge status={r.status} />,
    sortValue: (r) => r.status,
  },
  {
    key: "type",
    header: "Type",
    render: (r) =>
      [enumLabel(r.employmentType), enumLabel(r.workMode)]
        .filter(Boolean)
        .join(" · ") || "—",
    sortValue: (r) => enumLabel(r.employmentType),
  },
  {
    key: "location",
    header: "Location",
    render: (r) => r.location || "—",
    sortValue: (r) => r.location.toLowerCase(),
  },
  {
    key: "pay",
    header: "Pay",
    render: (r) => r.pay ?? "—",
    sortValue: (r) => (r.pay ?? "").toLowerCase(),
  },
  {
    key: "dateApplied",
    header: "Applied",
    render: (r) => formatDate(r.dateApplied),
    sortValue: (r) => (r.dateApplied ? Date.parse(r.dateApplied) : 0),
  },
];

export default function ApplicationsTable({ rows }: { rows: AppRow[] }) {
  const [status, setStatus] = useState<string>("All");

  const filtered = useMemo(
    () => (status === "All" ? rows : rows.filter((r) => r.status === status)),
    [rows, status]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 text-sm">
        <label
          htmlFor="statusFilter"
          className="font-display text-xs font-medium uppercase tracking-[0.12em] text-moss"
        >
          Filter by status
        </label>
        <select
          id="statusFilter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-sage-dark bg-paper-raised px-2.5 py-1.5 text-sm text-pine focus:border-pine focus:outline-none focus:ring-1 focus:ring-pine"
        >
          <option value="All">All ({rows.length})</option>
          {APPLICATION_STATUSES.map((s) => {
            const count = rows.filter((r) => r.status === s).length;
            return (
              <option key={s} value={s}>
                {s} ({count})
              </option>
            );
          })}
        </select>
      </div>
      <DataTable
        rows={filtered}
        columns={columns}
        rowHref={(r) => `/applications/${r.id}`}
        keyOf={(r) => r.id}
        emptyMessage="No applications match this filter."
      />
    </div>
  );
}
