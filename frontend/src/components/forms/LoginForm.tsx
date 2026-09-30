import { AuthLayout } from "../AuthLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { userSchemas, type LoginFormValues } from "../../schemas/userSchemas";
import { Field } from "../InputFormField";
import { useMutation } from "@tanstack/react-query";
import httpCall from "../../lib/api";
import axios from "axios";

type LoginResponse = {
  id: string;
  token: string;
};

export function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(userSchemas.login),
  });

  async function loginUser(user: LoginFormValues) {
    const response = await httpCall.post<LoginResponse>("/login", user);

    return response.data;
  }

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      localStorage.setItem("token", res.token);
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("root", {
            message: "Couldn't reach the server. Please try again",
          });
          return;
        }
        if (err.response.status === 400) {
          setError("root", {
            message: "Invalid email or password.",
          });
          return;
        }
        setError("root", {
          message: "Login failed. Please try again later.",
        });
        return;
      }
      setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    },
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to keep tracking your applications."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Create account
          </Link>
        </>
      }
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
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
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
          disabled={mutation.isPending}
          className="button-primary w-full"
        >
          {mutation.isPending ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
