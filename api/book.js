import { sb, notify, whenText, WORK, daysAgo } from "../lib/shared.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { day, slot, name, phone } = req.body || {};
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isInteger(slot) && slot >= 0 && slot < 3 &&
    typeof name === "string" && name.trim().length >= 3 && name.length <= 80 &&
    typeof phone === "string" && /^09\d{9}$/.test(phone);
  if (!valid) return res.status(400).json({ error: "invalid" });

  const diff = (new Date(day + "T12:00:00") - Date.now()) / 864e5;
  if (!WORK.includes(new Date(day + "T12:00:00").getDay()) || diff < -1 || diff > 22)
    return res.status(400).json({ error: "day" });

  // At most 2 upcoming bookings per phone number (basic spam guard)
  const c = await sb(`bookings?select=id&phone=eq.${phone}&day=gte.${daysAgo(1)}`);
  if (c.ok && (await c.json()).length >= 2) return res.status(429).json({ error: "limit" });

  const r = await sb("bookings", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ day, slot, name: name.trim(), phone }),
  });
  if (r.status === 409) return res.status(409).json({ error: "taken" });
  if (!r.ok) return res.status(502).json({ error: "db" });

  await notify("نوبت جدید: " + name.trim(), `✅ نوبت جدید\n\nنام: ${name.trim()}\nموبایل: ${phone}\nزمان: ${whenText(day, slot)}`);
  res.json({ ok: true });
}
