// Visual status at a glance — admin panel v2 audit finding: the old list
// showed status as plain capitalised text, indistinguishable from any
// other word on the page. Uses only existing design tokens (spec section
// 3: three colours on screen at a time) — terra is documented for
// exactly this ("accent — badges, hover states only"), so a badge is the
// spec's own intended use for it, not a new colour being introduced.
//
// Grouping, not six different looks: "needs your attention" (paid —
// waiting to ship) gets the one accent colour; "in progress" gets a
// solid espresso fill; everything else (pending, cancelled, refunded) is
// a plain outline — deliberately unremarkable, since none of those need
// to catch your eye on a scan of the list.
const STYLES: Record<string, string> = {
  paid: "bg-terra text-cream",
  shipped: "bg-espresso text-cream",
  delivered: "bg-espresso text-cream",
  pending: "border border-line text-muted",
  cancelled: "border border-line text-muted",
  refunded: "border border-line text-muted",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "border border-line text-muted";
  return (
    <span
      className={`inline-block shrink-0 px-2 py-0.5 font-body text-xs font-medium tracking-[0.06em] uppercase ${style}`}
    >
      {status}
    </span>
  );
}
