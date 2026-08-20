import React from "react";
import { Save, Trash2, Upload } from "lucide-react";
import { Section } from "../../components/ui/Section";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Btn } from "../../components/ui/Btn";
import { Alert } from "../../components/ui/Alert";

export function GroupsPanel({
  groups,
  selectedGroup,
  setSelectedGroup,
  groupName,
  setGroupName,
  handleCreateNewGroup,
  handleDeleteGroup,
  importText,
  setImportText,
  importMsg,
  handleImport,
  handleFileImport
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Create Group */}
      <Section title="Create New Group" subtitle="Save selected or empty group">
        <div className="flex flex-col gap-3">
          <Input label="Group Name" id="groupName" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Class B — Web Dev" />
          <Btn onClick={handleCreateNewGroup} disabled={!groupName.trim()}>
            <Save className="w-4 h-4" /> Create Group
          </Btn>
        </div>
      </Section>

      {/* Groups List */}
      <Section title="All Groups" subtitle={`${groups.length} group${groups.length !== 1 ? "s" : ""}`}>
        {groups.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">No groups yet</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {groups.map(g => {
              const isSelected = selectedGroup === g.name;
              return (
                <div
                  key={g.name}
                  onClick={() => setSelectedGroup(g.name)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    isSelected ? "border-brand-500 bg-brand-50/60 shadow-sm" : "border-slate-200 bg-white hover:border-brand-200"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className={`font-semibold text-sm truncate ${isSelected ? "text-brand-700" : "text-slate-800"}`}>{g.name}</p>
                    <p className="text-xs text-slate-500">{g.userIds?.length || 0} members</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <Btn size="sm" variant="ghost" onClick={() => handleDeleteGroup(g.name)}>
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Import Users */}
      <Section title="Import Users" subtitle="Format: userId,password">
        <div className="flex flex-col gap-3">
          <label className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-xl p-3 text-center cursor-pointer transition flex flex-col items-center gap-1">
            <Upload className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-500">Drop CSV / XLSX or browse</p>
            <input type="file" accept=".csv,.txt,.xlsx,.xls" onChange={handleFileImport} className="hidden" />
          </label>
          <Textarea id="importText" value={importText} onChange={e => setImportText(e.target.value)} rows={3} placeholder={"SV001,pass1\nSV002,pass2"} />
          {importMsg && <Alert type={importMsg.type}>{importMsg.text}</Alert>}
          <Btn onClick={handleImport} disabled={!importText.trim()} size="sm">
            <Upload className="w-3.5 h-3.5" /> Import
          </Btn>
        </div>
      </Section>
    </div>
  );
}
