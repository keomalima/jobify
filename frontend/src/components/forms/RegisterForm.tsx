import { AuthLayout } from "../AuthLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userSchemas,
  type RegisterFormValues,
} from "../../schemas/userSchemas";
import { Field } from "../InputFormField";
import { Link } from "react-router";

export function RegisterForm() {

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(userSchemas.register),
  });

  // TODO(practice-5): Create a registration mutation; map 409 to email and omit confirmPassword.
  // On success, store the token and navigate to /dashboard.
  function onSubmit() {
    // Accept the validated values from handleSubmit when implementing the mutation.
    setError("root", { message: "Submission is not connected yet." });
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your applications in one place."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">Log in</Link></>}
    >
      {errors.root && (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {errors.root.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-5 space-y-4"
        noValidate
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name" error={errors.name?.message}>
            <input
              {...register("name")}
              type="text"
              autoComplete="given-name"
              className="form-input"
              aria-invalid={!!errors.name}
            />
          </Field>
          <Field label="Last name" error={errors.surname?.message}>
            <input
              {...register("surname")}
              type="text"
              autoComplete="family-name"
              className="form-input"
              aria-invalid={!!errors.surname}
            />
          </Field>
        </div>

        <Field label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className="form-input"
            aria-invalid={!!errors.email}
          />
        </Field>

        <Field
          label="Password"
          error={errors.password?.message}
          hint={
            !errors.password
              ? "8+ characters, 1 uppercase, 1 special character"
              : undefined
          }
        >
          <input
            {...register("password")}
            type="password"
            autoComplete="new-password"
            className="form-input"
            aria-invalid={!!errors.password}
          />
        </Field>

        <Field
          label="Confirm password"
          error={errors.confirmPassword?.message}
        >
          <input
            {...register("confirmPassword")}
            type="password"
            autoComplete="new-password"
            className="form-input"
            aria-invalid={!!errors.confirmPassword}
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="button-primary w-full"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

    </AuthLayout>
  );
}
