import { z } from "zod";

// Order numbers are sequential ("SD1001") and easily guessable — the email
// is what actually gates access here, so it's required and checked
// server-side against the order's own email (lib/orders.ts + the route),
// not just validated for shape.
export const trackOrderSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Enter your order number")
    .max(20),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export type TrackOrderValues = z.infer<typeof trackOrderSchema>;
