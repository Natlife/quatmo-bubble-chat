import React from "react";
import { Search, UserCheck, X } from "lucide-react";
import { Section } from "../../components/ui/Section";
import { Btn } from "../../components/ui/Btn";
import { Alert } from "../../components/ui/Alert";
import { Pagination } from "../../components/ui/Pagination";

export function GroupMembersTable({
  groups,
  selectedGroup,
  setSelectedGroup,
  currentGroupObj,
  selected,
  groupMsg,
  groupMemberSearch,
  setGroupMemberSearch,
  visibleGroupMembers,
  paginatedGroupMembers,
  groupMemberPage,
  setGroupMemberPage,
  handleAddUsersToGroup,
  handleRemoveUserFromGroup
}) {
  return (
    <Section
      title={
        <div className="flex items-center gap-2">
          <span>Group Members</span>
          {groups.length > 0 && (
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-brand-600 focus:outline-none focus:border-brand-400"
            >
              {groups.map(g => (
                <option key={g.name} value={g.name}>{g.name}</option>
              ))}
            </select>
          )}
        </div>
      }
      subtitle={currentGroupObj ? `${currentGroupObj.userIds?.length || 0} users in group "${currentGroupObj.name}"` : "Select a group to view members"}
      action={
        selectedGroup && selected.length > 0 && (
          <Btn size="sm" onClick={() => handleAddUsersToGroup()} className="shadow-sm">
            <UserCheck className="w-4 h-4" /> Add ({selected.length}) Selected Users
          </Btn>
        )
      }
    >
      {groupMsg && <Alert type={groupMsg.type} className="mb-3">{groupMsg.text}</Alert>}

      {!currentGroupObj ? (
        <p className="text-center text-slate-400 text-sm py-6">No group selected</p>
      ) : visibleGroupMembers.length === 0 ? (
        <div className="text-center text-slate-400 text-sm py-8">
          <p className="font-medium">No members in this group</p>
          <p className="text-xs text-slate-400 mt-1">Select users from "All Users" on the left and click "Add Selected Users".</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center gap-2 mb-1">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={groupMemberSearch}
                onChange={e => setGroupMemberSearch(e.target.value)}
                placeholder="Search group members…"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[480px] border border-slate-100 rounded-xl">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10 shadow-2xs">
                <tr className="border-b border-slate-100">
                  <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Member User ID</th>
                  <th className="py-2.5 pr-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedGroupMembers.map(uid => (
                  <tr key={uid} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 mono text-slate-700 font-medium">{uid}</td>
                    <td className="py-2 pr-3 text-right">
                      <Btn
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveUserFromGroup(currentGroupObj.name, uid)}
                        title={`Remove ${uid} from group`}
                      >
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination totalItems={visibleGroupMembers.length} pageSize={10} currentPage={groupMemberPage} onPageChange={setGroupMemberPage} />
        </div>
      )}
    </Section>
  );
}
