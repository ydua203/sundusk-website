import { z } from "zod";

// Shared between the client (field-level feedback before submit) and the
// server (POST /api/checkout, spec section 7) so the two never validate
// differently — the server re-checks everything regardless, but there's no
// reason to let the rules drift.

export const shippingAddressSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(200),
  line1: z.string().trim().min(1, "Enter an address").max(300),
  line2: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  city: z.string().trim().min(1, "Enter a city").max(100),
  state: z.string().trim().min(1, "Enter a state").max(100),
  pincode: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^\d{6}$/.test(v), "Enter a valid 6-digit pincode"),
});

export const contactSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number"),
});

export const checkoutFormSchema = contactSchema.extend(shippingAddressSchema.shape);

export const checkoutItemSchema = z.object({
  variantId: z.string().uuid(),
  // Sanity bound, matching the cart's own per-line cap (context/cart-context.tsx)
  // — the actual authority on availability is the stock check against the
  // database in the API route, not this number.
  quantity: z.number().int().min(1).max(10),
});

export const checkoutRequestSchema = checkoutFormSchema.extend({
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
  // Not in the original spec — see lib/promo.ts. An unrecognized or absent
  // code is not an error; it just means no discount applies (spec-adjacent
  // philosophy: don't block a purchase over a typo'd coupon).
  promoCode: z.string().trim().max(50).optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
