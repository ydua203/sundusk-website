// Spec section 6's state machine:
//   pending -> paid -> shipped -> delivered
//      |         |
//      |         -> refunded
//      -> cancelled
//
// Not "server-only" — a plain data map + a pure predicate, safe to import
// from a client component too (the admin status dropdown needs the same
// transition rules the API route enforces, so there's exactly one source
// of truth, not two hand-kept-in-sync copies).

// The full status column, every value the `orders.status` check
// constraint allows (db/schema.ts) — used to validate the admin order
// list's ?status= filter against something real rather than trusting an
// arbitrary query string.
export const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
//
// Keys are the FROM status; values are the TOs an admin may manually set
// via POST /api/admin/orders/[id]/status. Two statuses are deliberately
// unreachable through this map:
// - "paid" — only the webhook or /api/verify-payment ever sets this
//   (spec section 7: never mark an order paid outside the payment flow).
// - "shipped" — only POST /api/admin/orders/[id]/ship sets this; it
//   requires a courier name + tracking number and sends the shipped
//   email, none of which the generic status endpoint has a way to supply.
export const ADMIN_SETTABLE_TRANSITIONS: Record<string, readonly string[]> = {
  pending: ["cancelled"],
  paid: ["refunded"],
  shipped: ["delivered"],
};

export function isValidAdminStatusTransition(from: string, to: string): boolean {
  return ADMIN_SETTABLE_TRANSITIONS[from]?.includes(to) ?? false;
}

// The paid -> shipped edge, kept as its own named predicate rather than a
// third key in ADMIN_SETTABLE_TRANSITIONS above (admin panel v2 audit,
// docs/DAY-10-NOTES.md's "what's broken or fragile" section): the ship
// route needs courier name + tracking number that the generic status
// endpoint has no way to accept, so it can never really be "just another
// entry" in that map — but the rule itself ("must be paid first") still
// belongs in this file, not hardcoded inline in the route handler, so
// there's exactly one file that knows the whole section 6 state machine,
// even though two different route handlers each enforce one slice of it.
export function canShipOrder(status: string): boolean {
  return status === "paid";
}

// paid -> refunded is the one admin-settable transition that also moves
// stock (admin panel v2): a refund means the order isn't happening, so
// whatever it reserved goes back. Exported so both the status route (the
// only place this transition can be reached) and anything else that
// needs to know "does this transition restock" share one answer.
export function transitionRestocksVariants(from: string, to: string): boolean {
  return from === "paid" && to === "refunded";
}
