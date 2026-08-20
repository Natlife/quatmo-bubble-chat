/** Parse {{slot_name}} from template — same logic as proxy promptBuilder.ts */
export function parseSlots(template) {
  const regex = /\{\{(\w+)\}\}/g;
  const seen = new Set();
  const result = [];
  let match;
  while ((match = regex.exec(String(template || ""))) !== null) {
    if (!seen.has(match[1])) { seen.add(match[1]); result.push(match[1]); }
  }
  return result;
}

export function fillTemplate(template, slotValues = {}) {
  let result = String(template || "");
  for (const [key, val] of Object.entries(slotValues)) {
    result = result.replaceAll(`{{${key}}}`, String(val || ""));
  }
  return result;
}

export function toLabel(name) {
  return name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export function parseUsersFromText(raw) {
  return String(raw || "")
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => { const [userId, password] = l.split(",").map(p => p.trim()); return { userId, password }; })
    .filter(u => u.userId && u.password && u.userId.toLowerCase() !== "userid");
}
