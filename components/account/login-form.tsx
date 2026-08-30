"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Field, inputClass } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

type FieldErrors = Partial<Record<keyof LoginValues, string>>;

const EMPTY_VALUES: Record<keyof LoginValues, string> = { email: "", password: "" };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(field: keyof LoginValues) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof LoginValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus("submitting");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message,
      );
      setStatus("error");
      return;
    }

    // middleware.ts redirected here with ?next=<original path> if this
    // login was triggered by visiting a protected route directly.
    const next = searchParams.get("next") || "/account";
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Field id="email" label="Email" error={errors.email}>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange("email")}
          className={inputClass}
        />
      </Field>
      <Field id="password" label="Password" error={errors.password}>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange("password")}
          className={inputClass}
        />
      </Field>

      {serverError && (
        <p className="border border-terra bg-cream p-3 font-body text-sm text-espresso">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra disabled:cursor-not-allowed disabled:bg-line disabled:text-muted sm:w-auto sm:min-w-64"
      >
        {status === "submitting" ? "Signing in…" : "Sign in"}
      </button>

      <p className="font-body text-sm text-muted">
        New here?{" "}
        <Link
          href="/account/register"
          className="text-espresso underline underline-offset-4 hover:text-terra"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
