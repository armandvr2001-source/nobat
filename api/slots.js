import { sb, daysAgo } from "../lib/shared.js";
export default async function handler(req, res) {
  const r = await sb(`bookings?select=day,slot&day=gte.${daysAgo(1)}`);
  if (!r.ok) return res.status(502).json({});
  const rows = await r.json();
  res.json({ taken: rows.map(x => ({ d: x.day, s: x.slot })) });
}
