import type { Metadata } from "next";
import { RegisterForm } from "@/components/account/register-form";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Create an account | Sundusk",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <Section tone="sand">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Create an account
        </h1>
        <div className="mt-10">
          <RegisterForm />
        </div>
      </div>
    </Section>
  );
}
