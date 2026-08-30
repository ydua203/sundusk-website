"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Field, inputClass } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterValues } from "@/lib/validation/auth";

type FieldErrors = Partial<Record<keyof RegisterValues, string>>;

const EMPTY_VALUES: Record<keyof RegisterValues, string> = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "check-email">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(field: keyof RegisterValues) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus("submitting");

    const supabase = createClient();
    // name/phone go into signup metadata — the on_auth_user_created
    // trigger (drizzle/0002_handle_new_user_trigger.sql) copies them into
    // public.customers the moment this succeeds.
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { name: parsed.data.name, phone: parsed.data.phone } },
    });

    if (error) {
      setServerError(error.message);
      setStatus("error");
      return;
    }

    if (data.session) {
      // Email confirmation is off for this Supabase project — signed in
      // immediately.
      router.push("/account");
      router.refresh();
      return;
    }

    // Email confirmation is on — Supabase already sent the link.
    setStatus("check-email");
  }

  if (status === "check-email") {
    return (
      <div className="border border-line p-6">
        <p className="font-body text-xs font-medium tracking-[0.14em] text-terra uppercase">
          Almost there
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-espresso">
          Check your email
        </h2>
        <p className="mt-3 font-body text-sm text-espresso/80">
          We&rsquo;ve sent a confirmation link to {values.email}. Click it to activate your
          account, then come back and sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Field id="name" label="Full name" error={errors.name}>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={handleChange("name")}
          className={inputClass}
        />
      </Field>
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
      <Field id="phone" label="Phone" error={errors.phone}>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={10}
          value={values.phone}
          onChange={handleChange("phone")}
          className={inputClass}
        />
      </Field>
      <Field id="password" label="Password" error={errors.password}>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
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
        {status === "submitting" ? "Creating account…" : "Create account"}
      </button>

      <p className="font-body text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/account/login"
          className="text-espresso underline underline-offset-4 hover:text-terra"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
