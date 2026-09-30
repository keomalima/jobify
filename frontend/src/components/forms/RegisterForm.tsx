import { AuthLayout } from "../AuthLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userSchemas,
  type RegisterFormValues,
} from "../../schemas/userSchemas";
import { Field } from "../InputFormField";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import httpCall from "../../lib/api";
import axios from "axios";

type registerResponse = {
  id: string;
  email: string;
  name: string;
  token: string;
};

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(userSchemas.register),
  });

  async function registerUser(user: RegisterFormValues) {
    const requestBody = {
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: user.password,
    };

    const response = await httpCall.post<registerResponse>(
      "/register",
      requestBody,
    );

    return response.data;
  }

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: registerUser,
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
        if (err.response.status === 409) {
          setError("email", {
            message: "This email is already registered.",
          });
          return;
        }
        setError("root", {
          message: "Registration failed. Please try again later.",
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
      title="Create your account"
      subtitle="Start tracking your applications in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Log in
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

        <Field label="Confirm password" error={errors.confirmPassword?.message}>
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
          disabled={mutation.isPending}
          className="button-primary w-full"
        >
          {mutation.isPending ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
