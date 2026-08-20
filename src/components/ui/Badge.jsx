import React from "react";

export function Badge({ children, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-50 text-blue-700 border border-blue-200",
    green:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber:  "bg-amber-50 text-amber-700 border border-amber-200",
    red:    "bg-rose-50 text-rose-700 border border-rose-200",
    slate:  "bg-slate-100 text-slate-600 border border-slate-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
}
