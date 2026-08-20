import React, { useState, useMemo, useEffect } from "react";
import { Clock, Coins, Calendar, Hourglass, UserPlus, Trash2, Pin, Settings, Search, ArrowUp, ArrowDown } from "lucide-react";
import { fmt, relTime, isSessionActive } from "../../utils/helpers";
import { parseSlots, fillTemplate } from "../../utils/template";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Btn";
import { SlotTag } from "../../components/ui/SlotTag";
import { Pagination } from "../../components/ui/Pagination";

export function SessionDetail({ session, app, bulkSelected, setBulkSelected, onDelete, deleting, onAddUsers }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "awaiting" | "not_signed_in"
  const [sortDir, setSortDir] = useState("asc");
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 10;

  const endTime = session.startTime + (session.durationMinutes === -1 ? 86400 : session.durationMinutes * 60);
  const isActive = isSessionActive(session);
  const totalConsumed = (session.users || []).reduce((s, u) => s + Number(u.tokensConsumed || 0), 0);
  const activeCount = (session.users || []).filter(u => u.hasLoggedIn).length;

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = (session?.users || []).filter(u => {
      if (q && !String(u.userId || "").toLowerCase().includes(q)) return false;

      if (statusFilter === "active" && !u.hasLoggedIn) return false;
      if (statusFilter === "awaiting" && (!u.reassigned || u.hasLoggedIn)) return false;
      if (statusFilter === "not_signed_in" && u.hasLoggedIn) return false;

      return true;
    });

    list = [...list].sort((a, b) => {
      const cmp = String(a.userId).localeCompare(String(b.userId), "en", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [session, search, statusFilter, sortDir]);

  useEffect(() => { setUserPage(1); }, [search, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * userPageSize;
    return visibleUsers.slice(start, start + userPageSize);
  }, [visibleUsers, userPage, userPageSize]);

  const toggleUser = (uid) => setBulkSelected(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);
  const toggleAll = () => setBulkSelected(bulkSelected.length === visibleUsers.length ? [] : visibleUsers.map(u => u.userId));

  return (
    <div className="flex flex-col gap-4 fade-in">
      {/* Session header */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="mono font-bold text-lg text-slate-800">{session.sessionCode}</h2>
              <Badge color={isActive ? "green" : "slate"}>{isActive ? "Active" : "Ended"}</Badge>
              {app && <Badge color="blue">{app.name}</Badge>}
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {session.durationMinutes === -1 ? "Unlimited" : `${session.durationMinutes}m`}</span>
              <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-slate-400" /> {(session.defaultTokenBudget || 0).toLocaleString()} token budget</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {fmt(session.startTime)}</span>
              <span className="flex items-center gap-1"><Hourglass className="w-3.5 h-3.5 text-slate-400" /> {relTime(endTime)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Btn size="sm" variant="ghost" onClick={() => onAddUsers(session.sessionCode)}><UserPlus className="w-3.5 h-3.5" /> Add Users</Btn>
            <Btn size="sm" variant="danger" onClick={onDelete} disabled={deleting}><Trash2 className="w-3.5 h-3.5" /> Delete</Btn>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Total Users", value: (session.users || []).length },
            { label: "Active", value: activeCount },
            { label: "Tokens Used", value: totalConsumed.toLocaleString() },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Prompts & Slot Details */}
        <div className="mt-4 flex flex-col gap-3">
          {session.sessionPrompt && (
            <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  <Pin className="w-3.5 h-3.5 text-indigo-600" /> Session Prompt
                </span>
                <Badge color="indigo">Per-Session Context</Badge>
              </div>
              <p className="text-xs text-indigo-950 font-mono whitespace-pre-wrap leading-relaxed bg-white/60 p-2.5 rounded-lg border border-indigo-100">{session.sessionPrompt}</p>
            </div>
          )}

          {app?.systemPromptTemplate && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                  <Settings className="w-3.5 h-3.5 text-slate-500" /> System Prompt Template ({app.name})
                </span>
                <Badge color="slate">App Template</Badge>
              </div>
              <pre className="text-xs text-slate-800 font-mono whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed max-h-40 overflow-y-auto">
                {app.systemPromptTemplate}
              </pre>

              {/* Slots filled preview */}
              {Object.keys(session.slotValues || {}).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Filled Prompt Preview</span>
                  <div className="text-xs text-slate-900 font-mono whitespace-pre-wrap bg-emerald-50/80 border border-emerald-200/80 p-2.5 rounded-lg leading-relaxed">
                    {fillTemplate(app.systemPromptTemplate, session.slotValues || {})}
                  </div>
                </div>
              )}
            </div>
          )}

          {Object.keys(session.slotValues || {}).length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Slot Values</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(session.slotValues || {}).map(([k, v]) => (
                  <div key={k} className="bg-blue-50/70 border border-blue-200/70 rounded-lg px-3 py-2">
                    <SlotTag name={k} />
                    <p className="text-xs text-slate-800 font-medium mt-1 font-mono">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User list */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="font-semibold text-slate-800">Users ({(session.users || []).length})</h3>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search user ID…"
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-brand-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-brand-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="awaiting">Awaiting</option>
              <option value="not_signed_in">Not signed in</option>
            </select>
            <Btn size="sm" variant="ghost" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
              {sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
              <span>{sortDir === "asc" ? "A-Z" : "Z-A"}</span>
            </Btn>
          </div>
        </div>

        {visibleUsers.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-6">No users match your filter</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-2 pr-4 text-left">
                      <input type="checkbox" checked={bulkSelected.length === visibleUsers.length && visibleUsers.length > 0}
                        onChange={toggleAll} className="rounded" />
                    </th>
                    <th className="pb-2 pr-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">User ID</th>
                    <th className="pb-2 pr-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="pb-2 pr-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Login Time</th>
                    <th className="pb-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedUsers.map(u => (
                    <tr key={u.userId} className={`hover:bg-slate-50/70 ${bulkSelected.includes(u.userId) ? "bg-blue-50/50" : ""}`}>
                      <td className="py-2 pr-4">
                        <input type="checkbox" checked={bulkSelected.includes(u.userId)} onChange={() => toggleUser(u.userId)} className="rounded" />
                      </td>
                      <td className="py-2 pr-4 mono font-medium text-slate-700">{u.userId}</td>
                      <td className="py-2 pr-4">
                        <Badge color={u.hasLoggedIn ? "green" : u.reassigned ? "amber" : "slate"}>
                          {u.hasLoggedIn ? "Active" : u.reassigned ? "Awaiting" : "Not signed in"}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-slate-500 text-xs">{u.loginTimestamp ? fmt(u.loginTimestamp) : "—"}</td>
                      <td className="py-2 text-right mono text-slate-600">{Number(u.tokensConsumed || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination totalItems={visibleUsers.length} pageSize={userPageSize} currentPage={userPage} onPageChange={setUserPage} />
          </div>
        )}
      </div>
    </div>
  );
}
