import crypto from "node:crypto";

/** Server-only Razorpay helpers. Secrets never reach the browser. */
export function razorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

export function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function razorpayFetch<T>(path: string, cfg: { keyId: string; keySecret: string }, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString("base64")}`,
      ...init?.headers,
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Razorpay ${path} responded ${res.status}`);
  return (await res.json()) as T;
}
