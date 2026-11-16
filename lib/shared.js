const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;

export const sb = (path, opt = {}) =>
  fetch(`${URL_}/rest/v1/${path}`, {
    ...opt,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(opt.headers || {}) },
  });

export const SLOTS = [["09:00", "10:00"], ["13:30", "14:30"], ["15:30", "16:30"]];
export const WORK = [0, 1, 2, 3]; // Sun..Wed
export const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

const fa = s => String(s).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
export const whenText = (day, slot) =>
  new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" })
    .format(new Date(day + "T12:00:00")) + "، " + fa(SLOTS[slot][0]) + " تا " + fa(SLOTS[slot][1]);

// Email via Resend (resend.com). Env: RESEND_API_KEY, NOTIFY_EMAIL
export const notify = (subject, text) =>
  fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Booking <onboarding@resend.dev>", to: [process.env.NOTIFY_EMAIL], subject, text }),
  }).catch(() => {});
