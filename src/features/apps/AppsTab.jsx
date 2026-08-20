import React, { useState, useMemo, useEffect } from "react";
import { Plus, Boxes, Search } from "lucide-react";
import { sanitize } from "../../utils/helpers";
import { Section } from "../../components/ui/Section";
import { Btn } from "../../components/ui/Btn";
import { Alert } from "../../components/ui/Alert";
import { Pagination } from "../../components/ui/Pagination";
import { AppCard } from "./AppCard";
import { AppFormModal } from "./AppFormModal";
import { AppSecretModal } from "./AppSecretModal";

export function AppsTab({ apps, setApps, apiFetch, loadAll, openModal, closeModal, modal, modalData, setStatus }) {
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  async function handleDelete(appId) {
    if (!confirm(`Delete app "${appId}"? This cannot be undone.`)) return;
    setDeletingId(appId);
    try {
      await apiFetch(`/admin/apps/${appId}`, { method: "DELETE" });
      setStatus({ type: "success", text: `App '${appId}' deleted.` });
      await loadAll();
    } catch (e) {
      setErr(sanitize(e.message, "Delete failed."));
    } finally {
      setDeletingId(null);
    }
  }

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(a =>
      String(a.name || "").toLowerCase().includes(q) ||
      String(a.appId || "").toLowerCase().includes(q) ||
      String(a.description || "").toLowerCase().includes(q)
    );
  }, [apps, search]);

  useEffect(() => { setPage(1); }, [search]);

  const paginatedApps = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredApps.slice(start, start + pageSize);
  }, [filteredApps, page, pageSize]);

  return (
    <div className="flex flex-col gap-5">
      {err && <Alert type="error">{err}</Alert>}

      <Section
        title="Registered Apps"
        subtitle={`${apps.length} app${apps.length !== 1 ? "s" : ""} — each app has its own system prompt template`}
        action={
          <div className="flex items-center gap-3">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search apps..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-brand-400"
              />
            </div>
            <Btn size="sm" onClick={() => openModal("createApp")}><Plus className="w-4 h-4" /> New App</Btn>
          </div>
        }
      >
        {filteredApps.length === 0 ? (
          <div className="text-center py-10 text-slate-400 flex flex-col items-center">
            <Boxes className="w-12 h-12 text-slate-300 mb-3 stroke-[1.5]" />
            <p className="font-medium">{apps.length === 0 ? "No apps yet" : "No apps match your search"}</p>
            <p className="text-sm mt-1">{apps.length === 0 ? "Create an app to define a system prompt template with slots." : "Try adjusting your search criteria."}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3">
              {paginatedApps.map(app => (
                <AppCard
                  key={app.appId}
                  app={app}
                  onEdit={() => openModal("editApp", app)}
                  onDelete={() => handleDelete(app.appId)}
                  onShowSecret={() => openModal("appSecret", app)}
                  deleting={deletingId === app.appId}
                />
              ))}
            </div>
            <Pagination totalItems={filteredApps.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
          </div>
        )}
      </Section>

      {/* Create App Modal */}
      <AppFormModal
        open={modal === "createApp"}
        onClose={closeModal}
        apiFetch={apiFetch}
        onSaved={async () => { closeModal(); await loadAll(); setStatus({ type: "success", text: "App created." }); }}
      />

      {/* Edit App Modal */}
      <AppFormModal
        open={modal === "editApp"}
        app={modalData}
        onClose={closeModal}
        apiFetch={apiFetch}
        onSaved={async () => { closeModal(); await loadAll(); setStatus({ type: "success", text: "App updated." }); }}
      />

      {/* App Secret Modal */}
      <AppSecretModal
        open={modal === "appSecret"}
        app={modalData}
        onClose={closeModal}
      />
    </div>
  );
}
