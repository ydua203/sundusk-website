import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/account/login-form";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Sign in | Sundusk",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Section tone="sand">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Sign in
        </h1>
        <div className="mt-10">
          {/* useSearchParams (reading ?next=) requires a Suspense boundary */}
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </Section>
  );
}
