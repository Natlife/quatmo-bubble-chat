export function normalizeUrl(raw) {
  const s = String(raw || "").trim().replace(/\/+$/, "");
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `http://${s}`;
}

export function sanitize(raw, fallback = "") {
  const text = String(raw || fallback)
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 280 ? `${text.slice(0, 277)}...` : text || fallback;
}

export function fmt(unix) {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleString("en-GB", {
    hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export function relTime(unix) {
  if (!unix) return "—";
  const diff = unix - Math.floor(Date.now() / 1000);
  if (diff <= 0) return "Ended";
  if (diff < 60) return `${diff}s left`;
  if (diff < 3600) return `${Math.ceil(diff / 60)}m left`;
  return `${Math.ceil(diff / 3600)}h left`;
}

export function isSessionActive(s) {
  const endTime = s.startTime + (s.durationMinutes === -1 ? 86400 : s.durationMinutes * 60);
  return Math.floor(Date.now() / 1000) < endTime;
}
