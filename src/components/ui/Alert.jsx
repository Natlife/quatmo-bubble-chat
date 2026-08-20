import React from "react";
import { Info, CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";

export function Alert({ type = "info", children, className = "" }) {
  if (!children) return null;
  const styles = {
    info:    "bg-blue-50 text-blue-800 border border-blue-200",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    error:   "bg-rose-50 text-rose-800 border border-rose-200",
    loading: "bg-slate-50 text-slate-700 border border-slate-200",
    warn:    "bg-amber-50 text-amber-800 border border-amber-200",
  };
  const icons = { info: Info, success: CheckCircle2, error: XCircle, loading: Loader2, warn: AlertTriangle };
  const iconColors = {
    info: "text-blue-600",
    success: "text-emerald-600",
    error: "text-rose-600",
    loading: "text-slate-600 animate-spin",
    warn: "text-amber-600",
  };
  const IconComp = icons[type] || icons.info;
  return (
    <div className={`flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm ${styles[type] || styles.info} ${className}`}>
      <IconComp className={`mt-0.5 shrink-0 w-4 h-4 ${iconColors[type] || ""}`} />
      <div>{children}</div>
    </div>
  );
}
