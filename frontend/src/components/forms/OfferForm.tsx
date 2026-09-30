import {
  OFFER_STATUSES,
  OFFER_TYPES,
  offerFormSchema,
  STATUS_LABELS,
  TYPE_LABELS,
  type OfferFormValues,
} from "../../schemas/offerSchema";
import { Field } from "../InputFormField";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type Company = { id: string; name: string };

type OfferFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function OfferForm({ onCancel }: OfferFormProps) {
  // TODO(practice-2): Replace this placeholder with useQuery for GET /companies.
  // Show loading, error/retry, and empty states. See PRACTICE.md.
  const companies: Company[] = [];

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: { companyMode: "existing", companyId: "", status: "WISHLIST", type: "" },
  });

  const companyMode = useWatch({ control, name: "companyMode" });
  // TODO(practice-3): Create a mutation for company creation (if needed) and offer creation.
  // TODO(practice-4): Invalidate companies/offers, then call the onSuccess prop.
  // Preserve the new company ID if saving the offer fails so retry does not duplicate it.
  function onSubmit() {
    // Accept the validated values from handleSubmit when implementing the mutation.
    setError("root", { message: "Submission is not connected yet." });
  }

  return (
    <>
      {errors.root && (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {errors.root.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-5 space-y-6"
        noValidate
      >
        {/* Company */}
        <section>
          <h2 className="mb-3 text-sm font-semibold">Company</h2>

          <div className="mb-3 inline-flex rounded-md border border-border p-0.5">
            {(["existing", "new"] as const).map((mode) => (
              <label
                key={mode}
                className={[
                  "cursor-pointer rounded px-3 py-1 text-sm font-medium transition-colors",
                  companyMode === mode
                    ? "bg-brand-600 text-white"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <input
                  type="radio"
                  value={mode}
                  {...register("companyMode")}
                  className="mr-2 accent-brand-600"
                />
                {mode === "existing" ? "Existing company" : "New company"}
              </label>
            ))}
          </div>

          {companyMode === "existing" ? (
            <Field label="Company" error={errors.companyId?.message}>
              <select
                {...register("companyId")}
                className="form-input"
                aria-invalid={!!errors.companyId}
              >
                <option value="">Company loading is not connected yet</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" error={errors.companyName?.message}>
                  <input
                    {...register("companyName")}
                    className="form-input"
                    aria-invalid={!!errors.companyName}
                  />
                </Field>
                <Field
                  label="Location"
                  error={errors.companyLocation?.message}
                >
                  <input
                    {...register("companyLocation")}
                    className="form-input"
                    aria-invalid={!!errors.companyLocation}
                  />
                </Field>
              </div>
              <Field label="Website (optional)" error={errors.companyWebsite?.message}>
                <input {...register("companyWebsite")} type="url" placeholder="https://example.com"
                  className="form-input"
                  aria-invalid={!!errors.companyWebsite} />
              </Field>
            </div>
          )}
        </section>

        {/* Offer */}
        <section>
          <h2 className="mb-3 text-sm font-semibold">Application details</h2>

          <div className="space-y-3">
            <Field label="Title" error={errors.title?.message}>
              <input
                {...register("title")}
                placeholder="Senior Fullstack Engineer"
                className="form-input"
                aria-invalid={!!errors.title}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Type" error={errors.type?.message}>
                <select
                  {...register("type")}
                  className="form-input"
                  aria-invalid={!!errors.type}
                >
                  <option value="">Select type…</option>
                  {OFFER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status">
                <select {...register("status")} className="form-input">
                  {OFFER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Salary" error={errors.salary?.message}>
              <div className="flex items-center gap-2">
                <input
                  {...register("salary")}
                  inputMode="numeric"
                  placeholder="160000"
                  className="form-input"
                  aria-invalid={!!errors.salary}
                />
                <span className="whitespace-nowrap text-sm text-subtle-foreground">
                  / year
                </span>
              </div>
            </Field>

            <Field label="Skills" hint="Comma-separated">
              <input
                {...register("skills")}
                placeholder="TypeScript, React, Node.js"
                className="form-input"
              />
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="button-secondary">Cancel</button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="button-primary"
          >
            {isSubmitting ? "Saving…" : "Save application"}
          </button>
        </div>
      </form>
    </>
  );
}
