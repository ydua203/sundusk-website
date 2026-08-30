// Minimal types for the Razorpay Checkout.js script loaded client-side on
// /checkout — Razorpay doesn't publish its own types for the browser SDK
// (only for the server-side `razorpay` npm package, already covered by
// that package's own .d.ts files).

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayCheckoutInstance {
  open: () => void;
}

interface RazorpayCheckoutConstructor {
  new (options: RazorpayCheckoutOptions): RazorpayCheckoutInstance;
}

interface Window {
  Razorpay?: RazorpayCheckoutConstructor;
}
