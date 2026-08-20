import React from "react";

export function Input({ label, id, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      <input id={id}
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 ring-brand focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition ${className}`}
        {...props}
      />
    </div>
  );
}

export function Textarea({ label, id, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      <textarea id={id}
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition resize-y ${className}`}
        {...props}
      />
    </div>
  );
}
