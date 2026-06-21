"use client";

import DataTable, { type Column } from "@/components/DataTable";

export type CompanyRow = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  applications: number;
  contacts: number;
};

const columns: Column<CompanyRow>[] = [
  {
    key: "name",
    header: "Company",
    render: (r) => <span className="font-medium text-pine">{r.name}</span>,
    sortValue: (r) => r.name.toLowerCase(),
  },
  {
    key: "industry",
    header: "Industry",
    render: (r) => r.industry ?? "—",
    sortValue: (r) => (r.industry ?? "").toLowerCase(),
  },
  {
    key: "location",
    header: "Location",
    render: (r) => r.location ?? "—",
    sortValue: (r) => (r.location ?? "").toLowerCase(),
  },
  {
    key: "applications",
    header: "Applications",
    render: (r) => r.applications,
    sortValue: (r) => r.applications,
  },
  {
    key: "contacts",
    header: "Contacts",
    render: (r) => r.contacts,
    sortValue: (r) => r.contacts,
  },
];

export default function CompaniesTable({ rows }: { rows: CompanyRow[] }) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowHref={(r) => `/companies/${r.id}`}
      rowLabel={(r) => r.name}
      keyOf={(r) => r.id}
      emptyMessage="No companies yet. Add your first one."
    />
  );
}
