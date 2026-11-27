import { useState } from "react";
import { RotateCw, X } from "lucide-react";
import { PlatformRecord } from "@/lib/platform-admin";

export function RecordEditor({
  record,
  platformId,
  pageId,
  entity,
  group,
  onSave,
  onClose,
}: {
  record: PlatformRecord | null;
  platformId: string;
  pageId: string;
  entity: string;
  group: string;
  onSave: (record: PlatformRecord) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(record?.name ?? "");
  const [code, setCode] = useState(() => record?.code ?? `ZJKG-${Date.now().toString().slice(-6)}`);
  const [status, setStatus] = useState(record?.status ?? "草稿");
  const [owner, setOwner] = useState(record?.owner ?? "院校管理员");
  const [note, setNote] = useState(String(record?.data["说明"] ?? ""));
  return (
    <div className="ep-modal-backdrop" role="dialog" aria-modal="true" aria-label={`${record ? "编辑" : "新建"}${entity}`}>
      <section className="ep-record-editor">
        <header>
          <div><span>{group}</span><h2>{record ? "编辑" : "新建"}{entity}</h2></div>
          <button onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </header>
        <div className="ep-form-grid">
          <label className="ep-form">名称<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="ep-form">编码<input value={code} onChange={(event) => setCode(event.target.value)} /></label>
          <label className="ep-form">状态<select value={status} onChange={(event) => setStatus(event.target.value)}><option>草稿</option><option>待审批</option><option>已发布</option><option>已归档</option></select></label>
          <label className="ep-form">负责人<input value={owner} onChange={(event) => setOwner(event.target.value)} /></label>
          <label className="ep-form wide">说明<textarea value={note} onChange={(event) => setNote(event.target.value)} /></label>
        </div>
        <footer>
          <button className="ep-button secondary" onClick={onClose}>取消</button>
          <button
            className="ep-button"
            disabled={!name.trim() || !code.trim()}
            onClick={() =>
              onSave({
                id: record?.id ?? crypto.randomUUID(),
                platformId,
                pageId,
                name: name.trim(),
                code: code.trim(),
                status,
                owner: owner.trim(),
                updatedAt: record?.updatedAt ?? new Date().toLocaleString("zh-CN", { hour12: false }),
                data: { ...(record?.data ?? {}), 说明: note },
              })
            }
          >
            <RotateCw size={14} />保存
          </button>
        </footer>
      </section>
    </div>
  );
}
