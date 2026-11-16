import { sb, notify, whenText, daysAgo } from "../lib/shared.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { password, action, id } = req.body || {};
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({});

  if (action === "list") {
    const r = await sb(`bookings?select=*&day=gte.${daysAgo(1)}&order=day.asc,slot.asc`);
    return res.json({ items: r.ok ? await r.json() : [] });
  }
  if (action === "cancel" && /^\d+$/.test(String(id))) {
    const g = await sb(`bookings?select=*&id=eq.${id}`);
    const [row] = g.ok ? await g.json() : [];
    if (!row) return res.status(404).json({});
    await sb(`bookings?id=eq.${id}`, { method: "DELETE" });
    await notify("لغو نوبت: " + row.name, `❌ لغو نوبت\n\nنام: ${row.name}\nموبایل: ${row.phone}\nزمان: ${whenText(row.day, row.slot)}`);
    return res.json({ ok: true });
  }
  res.status(400).json({});
}
