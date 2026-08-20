import React from "react";

export function Btn({ onClick, children, variant = "primary", size = "md", disabled = false, className = "", type = "button" }) {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  const variants = {
    primary:  "bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-400 shadow-sm",
    danger:   "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-400 shadow-sm",
    ghost:    "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-brand-300",
    outline:  "bg-transparent border border-brand-300 text-brand-700 hover:bg-brand-50 focus:ring-brand-300",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}>
      {children}
    </button>
  );
}
