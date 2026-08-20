import React from "react";
import { RefreshCw, LogOut, Loader2, Check, X } from "lucide-react";
import { TABS, STORAGE_KEYS } from "../../constants/config";
import { Btn } from "../ui/Btn";
import { QuatmoLogo } from "../ui/QuatmoLogo";

export function Header({ activeUrl, activeTab, setActiveTab, status, loadAll, handleDisconnect }) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200/80 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/20 border border-orange-200 flex items-center justify-center shadow-xs p-1">
            <QuatmoLogo className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-none text-sm">Quạt Mo Bubble Chat Admin</h1>
            <p className="text-xs text-slate-400 mono">{activeUrl}</p>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {TABS.map(tab => (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id); sessionStorage.setItem(STORAGE_KEYS.tab, tab.id); }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === tab.id ? "tab-active" : "text-slate-600 hover:text-slate-800 hover:bg-white"}`}>
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {status.text && activeTab && (
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
              status.type === "success" ? "bg-emerald-50 text-emerald-700" :
              status.type === "error"   ? "bg-rose-50 text-rose-700" :
              "bg-slate-100 text-slate-600"}`}>
              {status.type === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : status.type === "success" ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>{status.text}</span>
            </span>
          )}
          <Btn variant="ghost" size="sm" onClick={() => loadAll()}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Btn>
          <Btn variant="ghost" size="sm" onClick={handleDisconnect}>
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </Btn>
        </div>
      </div>
    </header>
  );
}
