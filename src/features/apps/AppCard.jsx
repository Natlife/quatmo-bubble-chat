import React, { useMemo } from "react";
import { Key, Pencil, Trash2 } from "lucide-react";
import { parseSlots } from "../../utils/template";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Btn";
import { SlotTag } from "../../components/ui/SlotTag";

export function AppCard({ app, onEdit, onDelete, onShowSecret, deleting }) {
  const slots = useMemo(() => parseSlots(app.systemPromptTemplate), [app.systemPromptTemplate]);
  return (
    <div className="border border-slate-200 bg-white rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-800 text-sm">{app.name}</h3>
            <Badge color="blue">{app.appId}</Badge>
          </div>
          {app.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{app.description}</p>}
          {slots.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {slots.map(s => <SlotTag key={s} name={s} />)}
            </div>
          )}
          {app.systemPromptTemplate && (
            <p className="text-xs text-slate-400 mt-2 font-mono line-clamp-2">{app.systemPromptTemplate.slice(0, 120)}{app.systemPromptTemplate.length > 120 ? "…" : ""}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Btn variant="ghost" size="sm" onClick={onShowSecret}><Key className="w-3.5 h-3.5" /> Credentials</Btn>
          <Btn variant="ghost" size="sm" onClick={onEdit}><Pencil className="w-3.5 h-3.5" /> Edit</Btn>
          <Btn variant="danger" size="sm" onClick={onDelete} disabled={deleting}><Trash2 className="w-3.5 h-3.5" /></Btn>
        </div>
      </div>
      {app.allowedOrigins?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {app.allowedOrigins.map(o => <Badge key={o} color="slate">{o}</Badge>)}
        </div>
      )}
    </div>
  );
}
