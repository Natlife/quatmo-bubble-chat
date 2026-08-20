import React from "react";

export function Section({ title, subtitle, children, action }) {
  return (
    <div className="glass rounded-2xl p-5 fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-semibold text-slate-800 text-base">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function SlotTag({ name }) {
  return <span className="slot-tag">{"{{" + name + "}}"}</span>;
}
