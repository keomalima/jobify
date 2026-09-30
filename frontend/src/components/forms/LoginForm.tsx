import { AuthLayout } from "../AuthLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { userSchemas, type LoginFormValues } from "../../schemas/userSchemas";
import { Field } from "../InputFormField";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(userSchemas.login),
  });

  // TODO(practice-6): Create a login mutation; display incorrect-credential errors.
  // On success, store the token and navigate to /dashboard.
  function onSubmit() {
    // Accept the validated values from handleSubmit when implementing the mutation.
    setError("root", { message: "Submission is not connected yet." });
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to keep tracking your applications."
      footer={<>Don't have an account? <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">Create account</Link></>}
    >
      {errors.root && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
        >
          {errors.root.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-5 space-y-4"
        noValidate
      >
        <Field label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className="form-input"
            aria-invalid={!!errors.email}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            className="form-input"
            aria-invalid={!!errors.password}
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="button-primary w-full"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

    </AuthLayout>
  );
}
