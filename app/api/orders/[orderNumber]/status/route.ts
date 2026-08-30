import { NextResponse } from "next/server";
import { getOrderStatusByNumber } from "@/lib/orders";

// Backs the "confirming payment" poll on /order/[orderNumber]. Returns
// only the status string — no PII, safe to poll every couple of seconds
// without an auth check.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const status = await getOrderStatusByNumber(orderNumber);
  if (!status) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ status });
}
