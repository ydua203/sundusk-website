import "server-only";

import { Resend } from "resend";

// Resend's constructor throws synchronously if the API key is missing —
// so this is built lazily, on first actual send, rather than at module
// load. Otherwise any route that merely imports an email-sending function
// (the webhook, admin actions later) would crash at startup whenever
// RESEND_API_KEY isn't set yet, which is exactly the situation this repo
// is in right now (spec section 4's env checklist — day 8 doesn't require
// a real key to be present, just correct code).
let client: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}
