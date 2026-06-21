"use client";

type Props = {
  action: () => void | Promise<void>;
  label?: string;
  confirmMessage: string;
};

export default function DeleteButton({
  action,
  label = "Delete",
  confirmMessage,
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button type="submit" className="btn-danger btn-sm">
        {label}
      </button>
    </form>
  );
}
