import React, { useState, useEffect, useMemo } from "react";
import { DEFAULT_PROXY_URL, STORAGE_KEYS } from "./constants/config";
import { normalizeUrl, sanitize } from "./utils/helpers";
import { Header } from "./components/layout/Header";
import { LoginForm } from "./components/auth/LoginForm";
import { AppsTab } from "./features/apps/AppsTab";
import { SessionsTab } from "./features/sessions/SessionsTab";
import { UsersTab } from "./features/users/UsersTab";

export default function App() {
  // ── Connection ──────────────────────────────────────────────────────────────
  const [proxyUrl, setProxyUrl]   = useState(DEFAULT_PROXY_URL);
  const [apiKey,   setApiKey]     = useState("");
  const [isAuthed, setIsAuthed]   = useState(false);
  const [authErr,  setAuthErr]    = useState("");
  const [loading,  setLoading]    = useState(false);

  // ── Active tab ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("apps");

  // ── Data ────────────────────────────────────────────────────────────────────
  const [apps,     setApps]     = useState([]);
  const [sessions, setSessions] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [groups,   setGroups]   = useState([]);

  // ── Status bar ──────────────────────────────────────────────────────────────
  const [status, setStatus] = useState({ type: "info", text: "" });

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [modal, setModal] = useState(null); // null | "createApp" | "editApp" | "createSession" | "addUsersToSession" | "appSecret"
  const [modalData, setModalData] = useState(null);

  // ─── Persist connection ──────────────────────────────────────────────────────
  useEffect(() => {
    const u = sessionStorage.getItem(STORAGE_KEYS.baseUrl);
    const k = sessionStorage.getItem(STORAGE_KEYS.apiKey);
    const t = sessionStorage.getItem(STORAGE_KEYS.tab);
    if (u) setProxyUrl(u);
    if (k) setApiKey(k);
    if (t) setActiveTab(t);
  }, []);

  // ─── API helpers ─────────────────────────────────────────────────────────────
  const activeUrl = useMemo(() => normalizeUrl(proxyUrl), [proxyUrl]);

  async function apiFetch(path, options = {}, rawResp = false) {
    const resp = await fetch(`${activeUrl}${path}`, {
      cache: "no-store",
      credentials: "omit",
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(options.headers || {}),
      },
    });

    if (rawResp) return resp;

    let data = null;
    try { data = await resp.json(); } catch { /* ignore */ }

    if (!resp.ok) {
      throw new Error(sanitize(data?.error || data?.message || `HTTP ${resp.status}`, "Request failed"));
    }
    return data;
  }

  // ─── Load all data ───────────────────────────────────────────────────────────
  async function loadAll(keyOverride) {
    const useKey = keyOverride ?? apiKey;
    if (!useKey || !activeUrl) return;

    setLoading(true);
    try {
      const [appData, sessionData, userData, groupData] = await Promise.all([
        fetch(`${activeUrl}/admin/apps`,     { headers: { Authorization: `Bearer ${useKey}`, "Content-Type": "application/json" } }).then(r => r.json()),
        fetch(`${activeUrl}/admin/sessions`, { headers: { Authorization: `Bearer ${useKey}`, "Content-Type": "application/json" } }).then(r => r.json()),
        fetch(`${activeUrl}/admin/users`,    { headers: { Authorization: `Bearer ${useKey}`, "Content-Type": "application/json" } }).then(r => r.json()),
        fetch(`${activeUrl}/admin/groups`,   { headers: { Authorization: `Bearer ${useKey}`, "Content-Type": "application/json" } }).then(r => r.json()),
      ]);

      if (appData?.error?.toLowerCase().includes("unauthor") || appData?.error?.toLowerCase().includes("invalid")) {
        throw new Error(appData.error);
      }

      setApps(Array.isArray(appData?.apps) ? appData.apps : []);
      setSessions(Array.isArray(sessionData?.sessions)
        ? [...sessionData.sessions].sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
        : []);
      setUsers(Array.isArray(userData?.users) ? userData.users : []);
      setGroups(Array.isArray(groupData?.groups) ? groupData.groups : []);
      setIsAuthed(true);
      setStatus({ type: "success", text: "Connected and data loaded." });

      sessionStorage.setItem(STORAGE_KEYS.baseUrl, activeUrl);
      sessionStorage.setItem(STORAGE_KEYS.apiKey, useKey);
    } catch (err) {
      setAuthErr(sanitize(err.message, "Failed to connect."));
      setIsAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(e) {
    e.preventDefault();
    setAuthErr("");
    if (!apiKey.trim() || !activeUrl) { setAuthErr("Enter the proxy URL and API key."); return; }
    await loadAll(apiKey.trim());
  }

  function handleDisconnect() {
    setIsAuthed(false);
    setApiKey("");
    setApps([]); setSessions([]); setUsers([]); setGroups([]);
    sessionStorage.removeItem(STORAGE_KEYS.baseUrl);
    sessionStorage.removeItem(STORAGE_KEYS.apiKey);
  }

  function openModal(id, data = null) { setModal(id); setModalData(data); }
  function closeModal() { setModal(null); setModalData(null); }

  // ─── Login screen ─────────────────────────────────────────────────────────────
  if (!isAuthed) {
    return (
      <LoginForm
        proxyUrl={proxyUrl} setProxyUrl={setProxyUrl}
        apiKey={apiKey} setApiKey={setApiKey}
        authErr={authErr} loading={loading}
        handleConnect={handleConnect}
      />
    );
  }

  // ─── Main layout ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <Header
        activeUrl={activeUrl}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={status}
        loadAll={loadAll}
        handleDisconnect={handleDisconnect}
      />

      <main className="max-w-[90rem] mx-auto px-6 py-6">
        {activeTab === "apps"     && <AppsTab     apps={apps} setApps={setApps} apiFetch={apiFetch} loadAll={loadAll} openModal={openModal} closeModal={closeModal} modal={modal} modalData={modalData} setStatus={setStatus} />}
        {activeTab === "sessions" && <SessionsTab sessions={sessions} setSessions={setSessions} apps={apps} users={users} groups={groups} apiFetch={apiFetch} loadAll={loadAll} openModal={openModal} closeModal={closeModal} modal={modal} modalData={modalData} setStatus={setStatus} activeUrl={activeUrl} apiKey={apiKey} />}
        {activeTab === "users"    && <UsersTab    users={users} setUsers={setUsers} groups={groups} setGroups={setGroups} sessions={sessions} apiFetch={apiFetch} loadAll={loadAll} openModal={openModal} closeModal={closeModal} modal={modal} modalData={modalData} setStatus={setStatus} />}
      </main>
    </div>
  );
}
