import React, { useState, useMemo, useEffect } from "react";
import { isSessionActive, sanitize } from "../../utils/helpers";
import { parseUsersFromText } from "../../utils/template";
import { AllUsersTable } from "./AllUsersTable";
import { GroupMembersTable } from "./GroupMembersTable";
import { GroupsPanel } from "./GroupsPanel";

export function UsersTab({ users, setUsers, groups, setGroups, sessions, apiFetch, loadAll, openModal, closeModal, modal, modalData, setStatus }) {
  const [search, setSearch]         = useState("");
  const [sortDir, setSortDir]       = useState("asc");
  const [selected, setSelected]     = useState([]);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg]   = useState(null);

  // Group Management Action State
  const [selectedGroup, setSelectedGroup]           = useState("");
  const [groupMemberSearch, setGroupMemberSearch] = useState("");
  const [groupMemberPage, setGroupMemberPage]     = useState(1);
  const [groupName, setGroupName]                 = useState("");
  const [groupMsg, setGroupMsg]                   = useState(null);
  const [deleteMsg, setDeleteMsg]                 = useState(null);
  const [userPage, setUserPage]                   = useState(1);
  const userPageSize = 10;

  useEffect(() => {
    if (groups.length > 0 && (!selectedGroup || !groups.some(g => g.name === selectedGroup))) {
      setSelectedGroup(groups[0].name);
    }
  }, [groups, selectedGroup]);

  const currentGroupObj = useMemo(() => groups.find(g => g.name === selectedGroup), [groups, selectedGroup]);

  const visibleGroupMembers = useMemo(() => {
    if (!currentGroupObj) return [];
    const q = groupMemberSearch.trim().toLowerCase();
    const list = (currentGroupObj.userIds || []).filter(uid => String(uid).toLowerCase().includes(q));
    return list.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  }, [currentGroupObj, groupMemberSearch]);

  useEffect(() => { setGroupMemberPage(1); }, [selectedGroup, groupMemberSearch]);

  const paginatedGroupMembers = useMemo(() => {
    const start = (groupMemberPage - 1) * 10;
    return visibleGroupMembers.slice(start, start + 10);
  }, [visibleGroupMembers, groupMemberPage]);

  // All users filtering
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = users.filter(u => String(u.userId || "").toLowerCase().includes(q));
    return [...list].sort((a, b) => {
      const cmp = String(a.userId).localeCompare(String(b.userId), "en", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [users, search, sortDir]);

  useEffect(() => { setUserPage(1); }, [search]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * userPageSize;
    return visible.slice(start, start + userPageSize);
  }, [visible, userPage, userPageSize]);

  const toggleUser = (uid) => setSelected(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);
  const toggleAll  = () => setSelected(selected.length === visible.length ? [] : visible.map(u => u.userId));

  async function handleImport() {
    const parsed = parseUsersFromText(importText);
    if (parsed.length === 0) { setImportMsg({ type: "error", text: "No valid entries. Format: userId,password (one per line)" }); return; }
    setImportMsg({ type: "loading", text: `Importing ${parsed.length} users...` });
    try {
      const data = await apiFetch("/admin/users", { method: "POST", body: JSON.stringify({ users: parsed }) });
      setImportText("");
      setImportMsg({ type: "success", text: sanitize(data?.message, `${parsed.length} users imported.`) });
      await loadAll();
    } catch (e) { setImportMsg({ type: "error", text: sanitize(e.message) }); }
  }

  async function handleFileImport(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const parsed = await parseUsersFile(file);
      setImportText(parsed.map(u => `${u.userId},${u.password}`).join("\n"));
      setImportMsg({ type: "success", text: `Read ${parsed.length} users from file.` });
    } catch (err) { setImportMsg({ type: "error", text: sanitize(err.message, "Failed to read file.") }); }
    finally { e.target.value = ""; }
  }

  async function parseUsersFile(file) {
    const name = (file.name || "").toLowerCase();
    if (name.endsWith(".csv") || name.endsWith(".txt")) return parseUsersFromText(await file.text());
    if (window.XLSX) {
      const data = new Uint8Array(await file.arrayBuffer());
      const wb = window.XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
      return rows.map(r => ({ userId: String(r?.[0] ?? "").trim(), password: String(r?.[1] ?? "").trim() }))
        .filter(u => u.userId && u.password && u.userId.toLowerCase() !== "userid");
    }
    throw new Error("Unsupported file format. Use CSV, TXT, or XLSX.");
  }

  async function handleDeleteUser(uid) {
    if (!confirm(`Delete user ${uid}?`)) return;
    try {
      await apiFetch(`/admin/users/${uid}`, { method: "DELETE" });
      setStatus({ type: "success", text: `User ${uid} deleted.` });
      await loadAll();
    } catch (e) { setDeleteMsg({ type: "error", text: sanitize(e.message) }); }
  }

  async function handleRemoveUserFromGroup(groupNameTarget, userIdToRemove) {
    const group = groups.find(g => g.name === groupNameTarget);
    if (!group) return;
    const updatedUserIds = (group.userIds || []).filter(id => id !== userIdToRemove);
    try {
      await apiFetch("/admin/groups", {
        method: "POST",
        body: JSON.stringify({ name: groupNameTarget, userIds: updatedUserIds }),
      });
      await loadAll();
    } catch (e) {
      setGroupMsg({ type: "error", text: sanitize(e.message) });
    }
  }

  async function handleAddUsersToGroup(targetNameOverride = null) {
    const targetName = targetNameOverride || selectedGroup;
    if (!targetName) {
      setGroupMsg({ type: "error", text: "Select or enter a group." });
      return;
    }
    if (selected.length === 0) {
      setGroupMsg({ type: "error", text: "Select users from the 'All Users' table first." });
      return;
    }

    setGroupMsg({ type: "loading", text: `Adding ${selected.length} user(s) to "${targetName}"...` });

    try {
      const existingGroup = groups.find(g => g.name === targetName);
      const currentMembers = existingGroup ? (existingGroup.userIds || []) : [];
      const mergedMembers = Array.from(new Set([...currentMembers, ...selected]));

      // 1. Save updated group to proxy
      await apiFetch("/admin/groups", {
        method: "POST",
        body: JSON.stringify({ name: targetName, userIds: mergedMembers }),
      });

      // 2. Automatically sync to all active running sessions
      let syncedCount = 0;
      if (sessions && sessions.length > 0) {
        const activeSessions = sessions.filter(s => isSessionActive(s));
        if (activeSessions.length > 0) {
          await Promise.all(
            activeSessions.map(s =>
              apiFetch(`/admin/sessions/${s.sessionCode}/users`, {
                method: "POST",
                body: JSON.stringify({ userIds: selected }),
              }).catch(() => {})
            )
          );
          syncedCount = activeSessions.length;
        }
      }

      setSelected([]);
      setGroupMsg({
        type: "success",
        text: `Added ${selected.length} user(s) to group "${targetName}"` +
          (syncedCount > 0 ? ` and synced live to ${syncedCount} active session(s)!` : "."),
      });

      await loadAll();
    } catch (e) {
      setGroupMsg({ type: "error", text: sanitize(e.message) });
    }
  }

  async function handleCreateNewGroup() {
    const name = groupName.trim();
    if (!name) { setGroupMsg({ type: "error", text: "Enter a group name." }); return; }
    setGroupMsg({ type: "loading", text: "Creating group..." });
    try {
      const initialMembers = selected;
      await apiFetch("/admin/groups", { method: "POST", body: JSON.stringify({ name, userIds: initialMembers }) });

      // Sync if users were selected
      if (initialMembers.length > 0 && sessions && sessions.length > 0) {
        const activeSessions = sessions.filter(s => isSessionActive(s));
        if (activeSessions.length > 0) {
          await Promise.all(
            activeSessions.map(s =>
              apiFetch(`/admin/sessions/${s.sessionCode}/users`, {
                method: "POST",
                body: JSON.stringify({ userIds: initialMembers }),
              }).catch(() => {})
            )
          );
        }
      }

      setGroupName("");
      setSelectedGroup(name);
      setSelected([]);
      setGroupMsg({ type: "success", text: `Group "${name}" created.` });
      await loadAll();
    } catch (e) { setGroupMsg({ type: "error", text: sanitize(e.message) }); }
  }

  async function handleDeleteGroup(name) {
    if (!confirm(`Delete group "${name}"?`)) return;
    try {
      await apiFetch(`/admin/groups/${encodeURIComponent(name)}`, { method: "DELETE" });
      await loadAll();
    } catch (e) { setGroupMsg({ type: "error", text: sanitize(e.message) }); }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_300px] gap-5 items-start">
      {/* Column 1: All Users Table Component */}
      <AllUsersTable
        users={users}
        selected={selected}
        search={search}
        setSearch={setSearch}
        sortDir={sortDir}
        setSortDir={setSortDir}
        visible={visible}
        paginatedUsers={paginatedUsers}
        userPage={userPage}
        setUserPage={setUserPage}
        userPageSize={userPageSize}
        toggleUser={toggleUser}
        toggleAll={toggleAll}
        handleDeleteUser={handleDeleteUser}
        deleteMsg={deleteMsg}
      />

      {/* Column 2: Selected Group Members Table Component */}
      <GroupMembersTable
        groups={groups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        currentGroupObj={currentGroupObj}
        selected={selected}
        groupMsg={groupMsg}
        groupMemberSearch={groupMemberSearch}
        setGroupMemberSearch={setGroupMemberSearch}
        visibleGroupMembers={visibleGroupMembers}
        paginatedGroupMembers={paginatedGroupMembers}
        groupMemberPage={groupMemberPage}
        setGroupMemberPage={setGroupMemberPage}
        handleAddUsersToGroup={handleAddUsersToGroup}
        handleRemoveUserFromGroup={handleRemoveUserFromGroup}
      />

      {/* Column 3: Groups & Import Side Panel */}
      <GroupsPanel
        groups={groups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        groupName={groupName}
        setGroupName={setGroupName}
        handleCreateNewGroup={handleCreateNewGroup}
        handleDeleteGroup={handleDeleteGroup}
        importText={importText}
        setImportText={setImportText}
        importMsg={importMsg}
        handleImport={handleImport}
        handleFileImport={handleFileImport}
      />
    </div>
  );
}
