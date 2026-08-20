import React from "react";
import { Modal } from "../../components/ui/Modal";
import { Alert } from "../../components/ui/Alert";

export function AppSecretModal({ open, app, onClose }) {
  if (!open || !app) return null;

  return (
    <Modal open={open} title="App Credentials" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">App ID</label>
          <div className="mt-1 mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 select-all">{app.appId}</div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">App Secret</label>
          <div className="mt-1 mono bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800 select-all">{app.appSecret}</div>
        </div>
        <Alert type="warn">Keep the secret private. Use it as <code>x-app-secret</code> in your widget script.</Alert>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Embed Script</label>
          <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs overflow-x-auto select-all">
{`<script
  src="${window.location.origin}/widget.js"
  data-app-id="${app.appId}"
  data-app-secret="${app.appSecret}"
></script>`}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
