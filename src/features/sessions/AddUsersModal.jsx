import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { sanitize } from "../../utils/helpers";
import { Modal } from "../../components/ui/Modal";
import { Textarea } from "../../components/ui/Textarea";
import { Btn } from "../../components/ui/Btn";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";

export function AddUsersModal({ open, data, groups, apiFetch, onClose, onSaved }) {
  const [rawText, setRawText] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { if (open) { setRawText(""); setSelectedGroups([]); setMsg(null); } }, [open]);

  async function handleAdd() {
    const userIds = new Set();
    // from text
    rawText.split(/[\n,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean).forEach(id => userIds.add(id));
    // from groups
    (data?.groups || groups).filter(g => selectedGroups.includes(g.name)).forEach(g => g.userIds?.forEach(id => userIds.add(String(id).toUpperCase())));

    if (userIds.size === 0) { setMsg({ type: "error", text: "Enter at least one user ID." }); return; }
    setSaving(true); setMsg({ type: "loading", text: "Adding users..." });
    try {
      const res = await apiFetch(`/admin/sessions/${data.sessionCode}/users`, { method: "POST", body: JSON.stringify({ userIds: Array.from(userIds) }) });
      setMsg({ type: "success", text: `Added ${userIds.size} user(s).` });
      setTimeout(onSaved, 800);
    } catch (e) { setMsg({ type: "error", text: sanitize(e.message) }); } finally { setSaving(false); }
  }

  return (
    <Modal open={open} title={`Add Users to ${data?.sessionCode || ""}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Textarea label="User IDs (one per line or comma-separated)" id="addUids" value={rawText} onChange={e => setRawText(e.target.value)} rows={4} placeholder={"SV001\nSV002\nSV003"} />
        {groups.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Or add from groups</label>
            <div className="flex flex-wrap gap-2">
              {groups.map(g => (
                <label key={g.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-brand-300 text-sm">
                  <input type="checkbox" checked={selectedGroups.includes(g.name)} onChange={() => setSelectedGroups(p => p.includes(g.name) ? p.filter(x => x !== g.name) : [...p, g.name])} className="rounded" />
                  <span>{g.name}</span>
                  <Badge color="slate">{g.userIds?.length || 0}</Badge>
                </label>
              ))}
            </div>
          </div>
        )}
        {msg && <Alert type={msg.type}>{msg.text}</Alert>}
        <div className="flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleAdd} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : "Add Users"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
