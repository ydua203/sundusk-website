import type { ReactNode } from "react";

// Shared label+input+error wrapper — first written for the checkout form,
// extracted here once the customization request form needed it too.
export const inputClass =
  "mt-1 w-full border border-line bg-sand px-3 py-2 font-body text-sm text-espresso placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra";

export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-body text-xs font-medium tracking-[0.08em] text-espresso uppercase"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 font-body text-xs text-terra">{error}</p>}
    </div>
  );
}
