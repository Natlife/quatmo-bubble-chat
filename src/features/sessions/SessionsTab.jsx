import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, Calendar } from "lucide-react";
import { relTime, isSessionActive, sanitize } from "../../utils/helpers";
import { Section } from "../../components/ui/Section";
import { Btn } from "../../components/ui/Btn";
import { Badge } from "../../components/ui/Badge";
import { Alert } from "../../components/ui/Alert";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { SessionDetail } from "./SessionDetail";
import { CreateSessionModal } from "./CreateSessionModal";
import { AddUsersModal } from "./AddUsersModal";

export function SessionsTab({ sessions, setSessions, apps, users, groups, apiFetch, loadAll, openModal, closeModal, modal, modalData, setStatus, activeUrl, apiKey }) {
  const [selectedCode, setSelectedCode] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active"); // "active" | "ended" | "all"
  const [appFilter, setAppFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [err, setErr] = useState("");
  const [resetForm, setResetForm] = useState({ sessionCode: "", userId: "" });
  const [resetMsg, setResetMsg] = useState(null);
  const [deletingCode, setDeletingCode] = useState(null);
  const [bulkSelected, setBulkSelected] = useState([]);

  const selectedSession = useMemo(() => sessions.find(s => s.sessionCode === selectedCode) || null, [sessions, selectedCode]);

  async function handleDelete(code) {
    if (!confirm(`Delete session ${code}?`)) return;
    setDeletingCode(code);
    try {
      await apiFetch(`/admin/sessions/${code}`, { method: "DELETE" });
      if (selectedCode === code) setSelectedCode("");
      setStatus({ type: "success", text: `Session ${code} deleted.` });
      await loadAll();
    } catch (e) { setErr(sanitize(e.message)); } finally { setDeletingCode(null); }
  }

  async function handleReassign() {
    const code = resetForm.sessionCode.trim().toUpperCase();
    const uid  = resetForm.userId.trim().toUpperCase();
    if (!code || !uid) { setResetMsg({ type: "error", text: "Enter session code and user ID." }); return; }
    setResetMsg({ type: "loading", text: "Reassigning..." });
    try {
      const data = await apiFetch(`/admin/sessions/${code}/users/${uid}/reassign`, { method: "POST" });
      setResetMsg({ type: "success", text: sanitize(data?.message, "Reassigned.") });
      setResetForm(f => ({ ...f, userId: "" }));
      await loadAll();
    } catch (e) { setResetMsg({ type: "error", text: sanitize(e.message) }); }
  }

  async function handleBulkReassign() {
    if (!selectedSession || bulkSelected.length === 0) return;
    setResetMsg({ type: "loading", text: "Reassigning selected users..." });
    try {
      await Promise.all(bulkSelected.map(uid =>
        apiFetch(`/admin/sessions/${selectedSession.sessionCode}/users/${uid}/reassign`, { method: "POST" })
      ));
      setBulkSelected([]);
      setResetMsg({ type: "success", text: `${bulkSelected.length} users reassigned.` });
      await loadAll();
    } catch (e) { setResetMsg({ type: "error", text: sanitize(e.message) }); }
  }

  const sessionsByNewest = useMemo(() => [...sessions].sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)), [sessions]);
  const appMap = useMemo(() => Object.fromEntries(apps.map(a => [a.appId, a])), [apps]);

  // Counts for badge summary
  const counts = useMemo(() => {
    let active = 0, ended = 0;
    sessions.forEach(s => {
      if (isSessionActive(s)) active++;
      else ended++;
    });
    return { active, ended, total: sessions.length };
  }, [sessions]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessionsByNewest.filter(s => {
      const active = isSessionActive(s);
      if (statusFilter === "active" && !active) return false;
      if (statusFilter === "ended" && active) return false;

      if (appFilter !== "all" && s.appId !== appFilter) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const app = appMap[s.appId];
        const matchCode = String(s.sessionCode || "").toLowerCase().includes(q);
        const matchApp = String(app?.name || "").toLowerCase().includes(q);
        if (!matchCode && !matchApp) return false;
      }

      return true;
    });
  }, [sessionsByNewest, statusFilter, appFilter, search, appMap]);

  // Reset page to 1 when filters change
  useEffect(() => { setPage(1); }, [statusFilter, appFilter, search]);

  const paginatedSessions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSessions.slice(start, start + pageSize);
  }, [filteredSessions, page, pageSize]);

  return (
    <div className="grid grid-cols-[340px_1fr] gap-5 items-start">
      {/* Left: session list */}
      <div className="flex flex-col gap-3">
        <Section
          title="Sessions"
          subtitle={`${counts.active} active · ${counts.ended} ended`}
          action={<Btn size="sm" onClick={() => openModal("createSession")} disabled={apps.length === 0}><Plus className="w-4 h-4" /> New</Btn>}
        >
          {err && <Alert type="error" className="mb-3">{err}</Alert>}

          {/* Search & Filter Controls */}
          <div className="flex flex-col gap-2 mb-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search session code or app..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-brand-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-brand-400"
              >
                <option value="active">Active ({counts.active})</option>
                <option value="ended">Ended ({counts.ended})</option>
                <option value="all">All ({counts.total})</option>
              </select>

              <select
                value={appFilter}
                onChange={e => setAppFilter(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-brand-400 truncate"
              >
                <option value="all">All Apps</option>
                {apps.map(a => <option key={a.appId} value={a.appId}>{a.name}</option>)}
              </select>
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">
              {sessions.length === 0 ? "No sessions yet" : "No sessions match filter"}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1.5 min-h-[220px]">
                {paginatedSessions.map(s => {
                  const endTime = s.startTime + (s.durationMinutes === -1 ? 86400 : s.durationMinutes * 60);
                  const isActive = isSessionActive(s);
                  const app = appMap[s.appId];
                  return (
                    <button key={s.sessionCode} onClick={() => { setSelectedCode(s.sessionCode); setBulkSelected([]); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${selectedCode === s.sessionCode ? "border-brand-400 bg-brand-50 shadow-sm" : "border-slate-200 bg-white hover:border-brand-200"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="mono font-semibold text-sm">{s.sessionCode}</span>
                        <Badge color={isActive ? "green" : "slate"}>{isActive ? relTime(endTime) : "Ended"}</Badge>
                      </div>
                      {app && <p className="text-xs text-slate-400 mt-0.5 truncate">{app.name}</p>}
                      <p className="text-xs text-slate-400 mt-0.5">{(s.users || []).length} users</p>
                    </button>
                  );
                })}
              </div>

              {/* Session List Pagination */}
              <Pagination totalItems={filteredSessions.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </div>
          )}
        </Section>

        {/* Reassign panel */}
        <Section title="Reassign User">
          <div className="flex flex-col gap-3">
            <Input label="Session Code" id="rsCode" value={resetForm.sessionCode} onChange={e => setResetForm(f => ({ ...f, sessionCode: e.target.value }))} placeholder="BC-XXXX" />
            <Input label="User ID" id="rsUid"  value={resetForm.userId}       onChange={e => setResetForm(f => ({ ...f, userId: e.target.value }))}       placeholder="SV001" />
            {resetMsg && <Alert type={resetMsg.type}>{resetMsg.text}</Alert>}
            <div className="flex gap-2">
              <Btn size="sm" onClick={handleReassign} className="flex-1 justify-center">Reassign</Btn>
              {selectedSession && bulkSelected.length > 0 && (
                <Btn size="sm" variant="outline" onClick={handleBulkReassign}>{bulkSelected.length} selected</Btn>
              )}
            </div>
          </div>
        </Section>
      </div>

      {/* Right: session detail */}
      <div className="flex flex-col gap-4">
        {!selectedSession ? (
          <div className="glass rounded-2xl p-12 text-center text-slate-400 fade-in flex flex-col items-center">
            <Calendar className="w-12 h-12 text-slate-300 mb-3 stroke-[1.5]" />
            <p className="font-medium">Select a session to view details</p>
          </div>
        ) : (
          <SessionDetail
            session={selectedSession}
            app={appMap[selectedSession.appId]}
            bulkSelected={bulkSelected} setBulkSelected={setBulkSelected}
            onDelete={() => handleDelete(selectedSession.sessionCode)}
            deleting={deletingCode === selectedSession.sessionCode}
            onAddUsers={(code) => openModal("addUsersToSession", { sessionCode: code, groups })}
          />
        )}
      </div>

      {/* Create Session Modal */}
      <CreateSessionModal
        open={modal === "createSession"}
        apps={apps}
        groups={groups}
        onClose={closeModal}
        apiFetch={apiFetch}
        onSaved={async (code) => { closeModal(); await loadAll(); setSelectedCode(code); setStatus({ type: "success", text: `Session ${code} created.` }); }}
      />

      {/* Add Users Modal */}
      <AddUsersModal
        open={modal === "addUsersToSession"}
        data={modalData}
        groups={groups}
        apiFetch={apiFetch}
        onClose={closeModal}
        onSaved={async () => { closeModal(); await loadAll(); }}
      />
    </div>
  );
}
