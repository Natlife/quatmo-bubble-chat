import React from "react";
import { Search, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Section } from "../../components/ui/Section";
import { Btn } from "../../components/ui/Btn";
import { Alert } from "../../components/ui/Alert";
import { Pagination } from "../../components/ui/Pagination";

export function AllUsersTable({
  users,
  selected,
  search,
  setSearch,
  sortDir,
  setSortDir,
  visible,
  paginatedUsers,
  userPage,
  setUserPage,
  userPageSize,
  toggleUser,
  toggleAll,
  handleDeleteUser,
  deleteMsg
}) {
  return (
    <Section
      title="All Users"
      subtitle={`${users.length} registered user${users.length !== 1 ? "s" : ""}${selected.length > 0 ? ` · ${selected.length} selected` : ""}`}
      action={
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user ID…"
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-brand-400" />
          </div>
          <Btn size="sm" variant="ghost" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
            {sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
          </Btn>
        </div>
      }
    >
      {deleteMsg && <Alert type={deleteMsg.type} className="mb-3">{deleteMsg.text}</Alert>}
      {visible.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-6">No users found</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="overflow-x-auto overflow-y-auto max-h-[480px] border border-slate-100 rounded-xl">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10 shadow-2xs">
                <tr className="border-b border-slate-100">
                  <th className="py-2.5 px-3 text-left">
                    <input type="checkbox" checked={selected.length === visible.length && visible.length > 0} onChange={toggleAll} className="rounded" />
                  </th>
                  <th className="py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">User ID</th>
                  <th className="py-2.5 pr-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedUsers.map(u => (
                  <tr key={u.userId} className={`hover:bg-slate-50/70 ${selected.includes(u.userId) ? "bg-blue-50/50" : ""}`}>
                    <td className="py-2 px-3"><input type="checkbox" checked={selected.includes(u.userId)} onChange={() => toggleUser(u.userId)} className="rounded" /></td>
                    <td className="py-2 mono text-slate-700 font-medium">{u.userId}</td>
                    <td className="py-2 pr-3 text-right">
                      <Btn size="sm" variant="ghost" onClick={() => handleDeleteUser(u.userId)}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination totalItems={visible.length} pageSize={userPageSize} currentPage={userPage} onPageChange={setUserPage} />
        </div>
      )}
    </Section>
  );
}
