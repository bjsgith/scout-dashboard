import type { ReactNode } from "react";

type BaseProps = {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
};

function FieldShell({
  label,
  name,
  required,
  hint,
  children,
}: BaseProps & { children: ReactNode }) {
  return (
    <label className="block space-y-1.5" htmlFor={name}>
      <span className="font-display text-xs font-medium uppercase tracking-[0.12em] text-moss">
        {label}
        {required && <span className="ml-1 text-rust">*</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-moss-light">{hint}</span>}
    </label>
  );
}

const inputCls = "field-input";

export function TextField({
  type = "text",
  defaultValue,
  placeholder,
  ...base
}: BaseProps & {
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <FieldShell {...base}>
      <input
        id={base.name}
        name={base.name}
        type={type}
        required={base.required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputCls}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  defaultValue,
  rows = 3,
  placeholder,
  ...base
}: BaseProps & { defaultValue?: string; rows?: number; placeholder?: string }) {
  return (
    <FieldShell {...base}>
      <textarea
        id={base.name}
        name={base.name}
        rows={rows}
        required={base.required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputCls}
      />
    </FieldShell>
  );
}

export function SelectField({
  options,
  defaultValue,
  placeholder,
  ...base
}: BaseProps & {
  options: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <FieldShell {...base}>
      <select
        id={base.name}
        name={base.name}
        required={base.required}
        defaultValue={defaultValue ?? ""}
        className={inputCls}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export { inputCls };
