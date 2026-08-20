import React, { useState, useEffect } from "react";
import { Info, Loader2 } from "lucide-react";
import { parseSlots } from "../../utils/template";
import { sanitize } from "../../utils/helpers";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Btn } from "../../components/ui/Btn";
import { Alert } from "../../components/ui/Alert";
import { SlotTag } from "../../components/ui/SlotTag";

export function AppFormModal({ open, app, onClose, apiFetch, onSaved }) {
  const isEdit = !!app;
  const [form, setForm] = useState({ name: "", description: "", systemPromptTemplate: "", allowedOrigins: "", appId: "" });
  const [slots, setSlots] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    if (app) {
      setForm({
        name: app.name || "",
        description: app.description || "",
        systemPromptTemplate: app.systemPromptTemplate || "",
        allowedOrigins: (app.allowedOrigins || []).join(", "),
        appId: app.appId || "",
      });
    } else {
      setForm({ name: "", description: "", systemPromptTemplate: "", allowedOrigins: "", appId: "" });
    }
    setErr("");
  }, [open, app]);

  // Live-parse slots as user types template
  useEffect(() => {
    setSlots(parseSlots(form.systemPromptTemplate));
  }, [form.systemPromptTemplate]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.name.trim()) { setErr("App name is required."); return; }
    setSaving(true); setErr("");
    try {
      const origins = form.allowedOrigins.split(",").map(s => s.trim()).filter(Boolean);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        systemPromptTemplate: form.systemPromptTemplate,
        allowedOrigins: origins,
      };
      if (isEdit) {
        await apiFetch(`/admin/apps/${app.appId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        if (form.appId.trim()) payload.appId = form.appId.trim();
        await apiFetch("/admin/apps", { method: "POST", body: JSON.stringify(payload) });
      }
      onSaved();
    } catch (e) {
      setErr(sanitize(e.message, "Failed to save."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={isEdit ? `Edit App — ${app?.appId}` : "Create New App"} onClose={onClose} width="max-w-2xl">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="App Name *" id="appName" value={form.name} onChange={e => set("name", e.target.value)} placeholder="FPT IT Support Bot" />
          {!isEdit && <Input label="App ID (auto-generated if blank)" id="appIdField" value={form.appId} onChange={e => set("appId", e.target.value)} placeholder="fpt-it-support" />}
          {isEdit && <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">App ID</label><div className="mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600">{app?.appId}</div></div>}
        </div>
        <Input label="Description" id="appDesc" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description of what this app does" />
        <Input label="Allowed Origins (comma-separated, empty = all)" id="appOrigins" value={form.allowedOrigins} onChange={e => set("allowedOrigins", e.target.value)} placeholder="https://fpt.edu.vn, https://app.example.com" />

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">System Prompt Template</label>
            <span className="text-xs text-slate-400">Use <code className="bg-slate-100 px-1 rounded">{"{{slot_name}}"}</code> for dynamic slots</span>
          </div>
          <textarea
            id="appTemplate"
            value={form.systemPromptTemplate}
            onChange={e => set("systemPromptTemplate", e.target.value)}
            rows={7}
            placeholder={"You are {{role}}.\nYour primary domain is {{domain}}.\nYour target audience is {{audience}}.\nAlways respond in {{language}}."}
            className="code-area w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
          />
          {/* Live slot preview */}
          {slots.length > 0 && (
            <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 mb-2">Detected Slots — admins fill these when creating a session:</p>
              <div className="flex flex-wrap gap-1.5">{slots.map(s => <SlotTag key={s} name={s} />)}</div>
            </div>
          )}
          {form.systemPromptTemplate && slots.length === 0 && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>No <code>{"{{slots}}"}</code> found — this is a static prompt (no form inputs needed when creating sessions).</span>
            </p>
          )}
        </div>

        {err && <Alert type="error">{err}</Alert>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isEdit ? "Save Changes" : "Create App"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
