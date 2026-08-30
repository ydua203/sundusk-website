import { NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { formatPaise } from "@/lib/money";
import { getAdminUser } from "@/lib/require-admin";

// Spec section 9: "order number, date, name, phone, address lines, city,
// state, pincode, items with sizes, total, status. That is what you hand
// your courier partner." One row per order (one shipment = one row,
// regardless of how many line items it contains) — a courier ships a
// package, not an item.
//
// Every field going into this CSV is customer-supplied free text from
// checkout (shipping name/address — see lib/validation/checkout.ts, which
// only bounds length, not leading characters). Excel, Sheets, and
// LibreOffice all treat a cell starting with =, +, -, or @ as a formula —
// a customer named `=HYPERLINK("http://evil","x")` or
// `=cmd|'/c calc'!A0` would execute the moment an admin opened this file
// (CSV/formula injection, CWE-1236). Prefixing such a value with a
// leading `'` neutralises the formula in every spreadsheet app while
// leaving the visible text unchanged for a human reading the file.
function csvEscape(value: string): string {
  const neutralised = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n]/.test(neutralised) ? `"${neutralised.replace(/"/g, '""')}"` : neutralised;
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allOrders = await db.select().from(orders).orderBy(orders.createdAt);
  const allItems = await db.select().from(orderItems);

  const itemsByOrderId = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const list = itemsByOrderId.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrderId.set(item.orderId, list);
  }

  const header = [
    "Order Number",
    "Date",
    "Name",
    "Phone",
    "Address Line 1",
    "Address Line 2",
    "City",
    "State",
    "Pincode",
    "Items",
    "Total",
    "Status",
  ];

  const rows = allOrders.map((order) => {
    const items = itemsByOrderId.get(order.id) ?? [];
    const itemsStr = items.map((i) => `${i.productName} (${i.size}) x${i.quantity}`).join("; ");
    return [
      order.orderNumber,
      new Date(order.createdAt).toLocaleDateString("en-IN"),
      order.shippingName,
      order.phone,
      order.shippingLine1,
      order.shippingLine2 ?? "",
      order.shippingCity,
      order.shippingState,
      order.shippingPincode,
      itemsStr,
      formatPaise(order.totalPaise),
      order.status,
    ]
      .map((v) => csvEscape(String(v)))
      .join(",");
  });

  const csv = [header.map(csvEscape).join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sundusk-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
