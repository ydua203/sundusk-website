// Confirmed by the user 2026-08-30: the sole proprietorship trades and is
// registered simply as "Sundusk" (holds GSTIN 07AWDPS0826R1ZY below).
// Single source of truth — the footer and every policy page added on day
// 11 all import this instead of redefining their own copy of the string,
// so there's exactly one place this ever needs to change again (e.g. if
// the in-progress Private Limited registration completes later).
export const LEGAL_ENTITY_NAME = "Sundusk";

export const GSTIN = "07AWDPS0826R1ZY";

export const REGISTERED_ADDRESS = {
  line1: "D-43 Mahendru Enclave",
  line2: "near Model Town 3",
  city: "Delhi",
  pincode: "110033",
} as const;

export const SUPPORT_EMAIL = "hellosundusk.in@gmail.com";
// Updated 2026-08-30 (was +91 93101 13431).
export const SUPPORT_PHONE_DISPLAY = "+91 87961 02233";
export const SUPPORT_PHONE_TEL = "+918796102233";
export const SUPPORT_WHATSAPP_URL = "https://wa.me/918796102233";
export const INSTAGRAM_HANDLE = "@sundusk.official";
export const INSTAGRAM_URL = "https://instagram.com/sundusk.official";

// TODO: name the actual grievance officer (spec section 10A's /privacy
// copy) before launch.
export const GRIEVANCE_OFFICER_NAME = "[GRIEVANCE OFFICER NAME]";

// TODO: set the real "last updated" date when /terms and /privacy copy is
// actually reviewed and finalised (spec section 10A).
export const POLICY_LAST_UPDATED = "[DATE]";
