"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TextField,
  TextAreaField,
  inputCls,
} from "@/components/FormFields";
import { createCompanyInline } from "@/app/companies/actions";

type Option = { id: string; name: string };

type ContactDefaults = {
  name?: string;
  title?: string | null;
  companyId?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  notes?: string | null;
};

export default function ContactForm({
  action,
  companies: initialCompanies,
  defaults,
  defaultCompanyId,
  submitLabel,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  companies: Option[];
  defaults?: ContactDefaults;
  defaultCompanyId?: string;
  submitLabel: string;
  cancelHref: string;
}) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [companyId, setCompanyId] = useState(
    defaults?.companyId ?? defaultCompanyId ?? ""
  );
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);

  async function handleAddCompany() {
    const name = newName.trim();
    if (!name) return;
    setSavingCompany(true);
    try {
      const created = await createCompanyInline(name);
      setCompanies((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setCompanyId(created.id);
      setNewName("");
      setAdding(false);
    } finally {
      setSavingCompany(false);
    }
  }

  return (
    <form action={action} className="max-w-xl space-y-5">
      <TextField
        label="Name"
        name="name"
        required
        defaultValue={defaults?.name ?? ""}
        placeholder="Jordan Rivera"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Title"
          name="title"
          defaultValue={defaults?.title ?? ""}
          placeholder="Engineering Manager"
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-medium uppercase tracking-[0.12em] text-moss">
              Company
            </span>
            <button
              type="button"
              onClick={() => setAdding((v) => !v)}
              className="font-display text-xs font-medium uppercase tracking-[0.08em] text-rust transition-colors hover:text-rust-deep"
            >
              {adding ? "Cancel" : "+ Add company"}
            </button>
          </div>
          <select
            id="companyId"
            name="companyId"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className={inputCls}
          >
            <option value="">— No company —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {adding && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleAddCompany();
                  }
                }}
                placeholder="New company name"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => void handleAddCompany()}
                disabled={savingCompany || newName.trim() === ""}
                className="btn-primary btn-sm shrink-0 disabled:opacity-50"
              >
                {savingCompany ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>
        <TextField
          label="Email"
          name="email"
          type="email"
          defaultValue={defaults?.email ?? ""}
        />
        <TextField
          label="Phone"
          name="phone"
          defaultValue={defaults?.phone ?? ""}
        />
      </div>
      <TextField
        label="LinkedIn URL"
        name="linkedinUrl"
        type="url"
        defaultValue={defaults?.linkedinUrl ?? ""}
        placeholder="https://linkedin.com/in/…"
      />
      <TextAreaField
        label="Notes"
        name="notes"
        defaultValue={defaults?.notes ?? ""}
      />
      <div className="flex items-center gap-4 pt-1">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
        <Link href={cancelHref} className="link-quiet text-sm">
          Cancel
        </Link>
      </div>
    </form>
  );
}
