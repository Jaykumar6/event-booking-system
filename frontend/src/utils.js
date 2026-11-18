export const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export const fmtTime = (d) =>
  new Date(d).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export const fmtDateTime = (d) => `${fmtDate(d)}, ${fmtTime(d)}`;

export const day = (d) => new Date(d).getDate();
export const month = (d) => new Date(d).toLocaleDateString(undefined, { month: "short" });

// Stable string hash -> used to give every event its own cover art.
export function hash(str = "") {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function eventState(e) {
  const ended = new Date(e.date) <= new Date();
  const sold = e.totalTickets - e.ticketsAvailable;
  const pct = e.totalTickets ? Math.round((sold / e.totalTickets) * 100) : 0;
  const soldOut = e.ticketsAvailable <= 0;
  const low = !soldOut && e.ticketsAvailable <= Math.max(5, Math.ceil(e.totalTickets * 0.1));
  return { ended, sold, pct, soldOut, low, bookable: !ended && !soldOut };
}

export function timeUntil(date) {
  const ms = new Date(date) - new Date();
  if (ms <= 0) return "Ended";
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days >= 2) return `In ${days} days`;
  if (days === 1) return "Tomorrow";
  if (hrs >= 1) return `In ${hrs} hr`;
  return `In ${Math.max(mins, 1)} min`;
}

// ISO string -> value for <input type="datetime-local">
export function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
