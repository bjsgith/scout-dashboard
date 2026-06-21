import { TextField, TextAreaField, SelectField } from "@/components/FormFields";
import { INTERACTION_TYPES, options } from "@/lib/enums";
import { toDateInputValue } from "@/lib/format";

export default function LogInteractionForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Type"
          name="type"
          options={options(INTERACTION_TYPES)}
          defaultValue="Other"
        />
        <TextField
          label="Date"
          name="date"
          type="date"
          defaultValue={toDateInputValue(new Date())}
        />
      </div>
      <TextAreaField
        label="Notes"
        name="notes"
        placeholder="What did you talk about? Any follow-ups?"
        rows={2}
      />
      <button type="submit" className="btn-primary">
        Log interaction
      </button>
    </form>
  );
}
