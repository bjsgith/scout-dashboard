"use client";

import DataTable, { type Column } from "@/components/DataTable";
import { formatDate } from "@/lib/format";

export type ContactRow = {
  id: string;
  name: string;
  title: string | null;
  companyName: string | null;
  /** ISO string of the most recent interaction, or null if never. */
  lastSpoken: string | null;
  /** Precomputed against Settings.contactStaleDays. */
  stale: boolean;
};

const columns: Column<ContactRow>[] = [
  {
    key: "name",
    header: "Name",
    render: (r) => <span className="font-medium text-pine">{r.name}</span>,
    sortValue: (r) => r.name.toLowerCase(),
  },
  {
    key: "title",
    header: "Title",
    render: (r) => r.title ?? "—",
    sortValue: (r) => (r.title ?? "").toLowerCase(),
  },
  {
    key: "companyName",
    header: "Company",
    render: (r) => r.companyName ?? "—",
    sortValue: (r) => (r.companyName ?? "").toLowerCase(),
  },
  {
    key: "lastSpoken",
    header: "Last spoken",
    render: (r) => (
      <span
        className={
          r.stale
            ? "inline-flex items-center gap-2 font-medium text-rust"
            : "text-moss"
        }
      >
        {r.stale && <span className="blaze !h-3 !w-1.5" aria-hidden />}
        {r.lastSpoken ? formatDate(r.lastSpoken) : "Never"}
      </span>
    ),
    // Sort: never-spoken (null) sorts oldest so it surfaces with stale items.
    sortValue: (r) => (r.lastSpoken ? Date.parse(r.lastSpoken) : 0),
  },
];

export default function ContactsTable({ rows }: { rows: ContactRow[] }) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowHref={(r) => `/contacts/${r.id}`}
      keyOf={(r) => r.id}
      emptyMessage="No contacts yet. Add your first one."
    />
  );
}
