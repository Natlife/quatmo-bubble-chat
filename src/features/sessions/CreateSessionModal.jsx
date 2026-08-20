import React, { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { parseSlots, toLabel } from "../../utils/template";
import { sanitize } from "../../utils/helpers";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Btn } from "../../components/ui/Btn";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { SlotTag } from "../../components/ui/SlotTag";

export function CreateSessionModal({ open, apps, groups, onClose, apiFetch, onSaved }) {
  const [selectedAppId, setSelectedAppId] = useState("");
  const [duration, setDuration]       = useState("60");
  const [budget, setBudget]           = useState("100000");
  const [sessionPrompt, setSessionPrompt] = useState("");
  const [slotValues, setSlotValues]   = useState({});
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const selectedApp = useMemo(() => apps.find(a => a.appId === selectedAppId), [apps, selectedAppId]);
  const slots = useMemo(() => selectedApp ? parseSlots(selectedApp.systemPromptTemplate) : [], [selectedApp]);
  const requiredSlots = useMemo(() => selectedApp ? (selectedApp.slots || []).filter(s => s.required).map(s => s.name) : [], [selectedApp]);

  useEffect(() => {
    if (!open) { setErr(""); setSlotValues({}); setSelectedGroups([]); setSessionPrompt(""); return; }
    if (apps.length > 0 && !selectedAppId) setSelectedAppId(apps[0].appId);
  }, [open, apps]);

  useEffect(() => { setSlotValues({}); }, [selectedAppId]);

  const setSlot = (k, v) => setSlotValues(prev => ({ ...prev, [k]: v }));

  async function handleCreate() {
    if (!selectedAppId) { setErr("Select an app."); return; }
    const dur = parseInt(duration, 10);
    const bgt = parseInt(budget, 10);
    if (isNaN(dur) || dur < 1) { setErr("Duration must be a positive number."); return; }
    if (isNaN(bgt) || bgt < 1) { setErr("Token budget must be a positive number."); return; }

    // Validate required slots
    const missing = requiredSlots.filter(name => !slotValues[name]?.trim());
    if (missing.length > 0) { setErr(`Fill required slots: ${missing.join(", ")}`); return; }

    setSaving(true); setErr("");
    try {
      const data = await apiFetch("/admin/sessions", {
        method: "POST",
        body: JSON.stringify({ appId: selectedAppId, durationMinutes: dur, defaultTokenBudget: bgt, sessionPrompt, slotValues }),
      });
      const code = data?.session?.sessionCode;
      if (!code) throw new Error("Session code not returned.");

      // Add users from selected groups
      const allUserIds = new Set();
      selectedGroups.forEach(gName => {
        const g = groups.find(g => g.name === gName);
        g?.userIds?.forEach(id => allUserIds.add(String(id).toUpperCase()));
      });
      if (allUserIds.size > 0) {
        await apiFetch(`/admin/sessions/${code}/users`, { method: "POST", body: JSON.stringify({ userIds: Array.from(allUserIds) }) });
      }

      onSaved(code);
    } catch (e) {
      setErr(sanitize(e.message, "Failed to create session."));
    } finally {
      setSaving(false);
    }
  }

  const getSlotDef = (name) => selectedApp?.slots?.find(s => s.name === name) || { name, label: toLabel(name), type: "text", required: false };

  return (
    <Modal open={open} title="Create New Session" onClose={onClose} width="max-w-2xl">
      <div className="flex flex-col gap-4">
        {/* App selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">App *</label>
          <select value={selectedAppId} onChange={e => setSelectedAppId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
            {apps.map(a => <option key={a.appId} value={a.appId}>{a.name} ({a.appId})</option>)}
          </select>
        </div>

        {selectedApp && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs font-semibold text-blue-700 mb-1">Template preview</p>
            <p className="text-xs text-blue-600 mono line-clamp-3">{selectedApp.systemPromptTemplate || "(no template)"}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="Duration (minutes)" id="ssDuration" type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} />
          <Input label="Token Budget" id="ssBudget" type="number" min="100" value={budget} onChange={e => setBudget(e.target.value)} />
        </div>

        {/* Dynamic slot fields */}
        {slots.length > 0 && (
          <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Slot Values</p>
            {slots.map(name => {
              const def = getSlotDef(name);
              const isRequired = requiredSlots.includes(name);
              return (
                <div key={name} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">
                    <SlotTag name={name} />
                    {" "}{def.label}{isRequired && <span className="text-rose-500 ml-1">*</span>}
                  </label>
                  {def.type === "textarea" ? (
                    <textarea value={slotValues[name] || ""} onChange={e => setSlot(name, e.target.value)} rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-y"
                      placeholder={def.defaultValue || `Enter ${def.label}...`} />
                  ) : def.type === "select" ? (
                    <select value={slotValues[name] || def.defaultValue || ""} onChange={e => setSlot(name, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                      <option value="">Select...</option>
                      {(def.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={slotValues[name] || ""} onChange={e => setSlot(name, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
                      placeholder={def.defaultValue || `Enter ${def.label}...`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Session prompt */}
        <Textarea
          label="Session Prompt (optional — prepended before template)"
          id="ssPrompt"
          value={sessionPrompt}
          onChange={e => setSessionPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. Today's class covers OSI model layers 3-4. Focus on IP routing and subnetting."
        />

        {/* Group selection */}
        {groups.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Add Users from Groups</label>
            <div className="flex flex-wrap gap-2">
              {groups.map(g => (
                <label key={g.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-brand-300 text-sm">
                  <input type="checkbox" checked={selectedGroups.includes(g.name)} onChange={() => setSelectedGroups(prev => prev.includes(g.name) ? prev.filter(x => x !== g.name) : [...prev, g.name])} className="rounded" />
                  <span>{g.name}</span>
                  <Badge color="slate">{g.userIds?.length || 0}</Badge>
                </label>
              ))}
            </div>
          </div>
        )}

        {err && <Alert type="error">{err}</Alert>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleCreate} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Session"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
