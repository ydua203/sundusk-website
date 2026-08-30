import { z } from "zod";

// Not in the original spec — see docs/PROMO-AND-CUSTOM-FIT-NOTES.md.
// Measurements are optional (a customer might only have notes, not exact
// numbers yet); `notes` is the one required field, since it's the minimum
// staff need to start a conversation.
export const customizationRequestSchema = z.object({
  productId: z.string().uuid("Choose a product"),
  name: z.string().trim().min(1, "Enter a name").max(200),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number"),
  bustIn: z.number().int().min(20, "That looks too small").max(70, "That looks too large").optional(),
  waistIn: z.number().int().min(20, "That looks too small").max(70, "That looks too large").optional(),
  hipsIn: z.number().int().min(20, "That looks too small").max(70, "That looks too large").optional(),
  notes: z.string().trim().min(1, "Tell us a little about the fit you need").max(2000),
});

export type CustomizationRequestValues = z.infer<typeof customizationRequestSchema>;
