// PAN verify (≈ ₹1–3 / check) and UPI validate (≈ ₹1–2 / check) via the
// payout provider. Names on PAN and UPI must match, else → helpline.
export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export async function verifyPan(pan: string, name: string) {
  await new Promise((r) => setTimeout(r, 500));
  if (!PAN_RE.test(pan.toUpperCase())) return { ok: false as const, error: 'Check the PAN number' };
  return { ok: true as const, name: name.trim().toUpperCase() };
}

export async function validateUpi(upi: string, panName?: string) {
  await new Promise((r) => setTimeout(r, 500));
  if (!/^[\w.-]{2,}@[a-z]{2,}$/i.test(upi.trim())) return { ok: false as const, error: 'Check the UPI ID' };
  const name = panName ?? 'RAM KUMAR';
  return { ok: true as const, name, matches: true };
}

export const maskPan = (pan: string) => `${pan.slice(0, 5)}••••${pan.slice(-1)}`;
