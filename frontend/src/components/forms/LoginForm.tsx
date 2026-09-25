import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Link, useNavigate } from "react-router";
import { userSchemas, type LoginFormValues } from "../../schemas/userSchemas";
import { Field } from "../InputFormField";
import httpCall from "../../lib/api";

type AuthResponse = {
  token: string;
};

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground",
    "placeholder:text-subtle-foreground focus:outline-none focus:ring-2",
    hasError
      ? "border-red-400 focus:ring-red-300"
      : "border-border focus:border-brand-500 focus:ring-brand-200",
  ].join(" ");
}

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(userSchemas.login),
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      const { data } = await httpCall.post<AuthResponse>("/login", values);
      localStorage.setItem("token", data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 400 || err.response?.status === 401)
      ) {
        setFormError("Incorrect email or password.");
        return;
      }
      setFormError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-foreground">
            JobTracker
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Log in to keep tracking your applications.
            </p>
          </div>

          {formError && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
            >
              {formError}
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
                aria-invalid={!!errors.email}
                className={inputClass(!!errors.email)}
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <input
                {...register("password")}
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className={inputClass(!!errors.password)}
              />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              {isSubmitting ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
