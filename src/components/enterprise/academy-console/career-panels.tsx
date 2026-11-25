"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { ResourceBuilder } from "@/components/enterprise/resource-builders";
import { useWorkspace } from "@/components/enterprise/workspace-store";
import { useConsoleAccess } from "@/components/enterprise/console-access";
import { Tag } from "@/components/enterprise/workspace/ui";
import { CatalogPanel, PanelTitle } from "./catalog-panel";
import {
  effectiveRightsStatus,
  jobLearningReadiness,
  type MajorGroup,
  type Resource,
} from "@/lib/enterprise-workspace";

export function CareerPositionsPanel({ notify }: { notify: (message: string) => void }) {
  const { state, resourceAction } = useWorkspace();
  const { readOnly } = useConsoleAccess();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const positions = state.resources.filter((item) => item.type === "岗位");

  const submit = (resource: Resource) => {
    resourceAction(resource.id, "submit", "");
    notify("岗位已提交审核，请到审批中心处理");
  };

  return (
    <>
      <div className="ep-catalog-head">
        <PanelTitle title="岗位管理" description="岗位标准、能力模型、关联资源与审批状态。" />
        <div className="ep-catalog-head-actions">
          <span>{positions.length} 条</span>
          {!readOnly && (
            <button className="ep-button" onClick={() => setCreating(true)}>
              <Plus size={15} />新建岗位
            </button>
          )}
        </div>
      </div>
      {!readOnly && (creating || editing) && (
        <ResourceBuilder
          kind="岗位"
          resource={editing ?? undefined}
          notify={notify}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
      <div className="ep-tablewrap ep-academy-table">
        <table>
          <thead>
            <tr>
              <th>编码 / 名称</th>
              <th>版本</th>
              <th>状态</th>
              <th>完整性</th>
              <th>权属</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((resource) => {
              const content = resource.draftContent.data;
              const code = "code" in content ? content.code : undefined;
              const readiness = resource.draftContent.kind === "job"
                ? jobLearningReadiness(state, resource.id)
                : { ready: false, reason: "" };
              const rightsStatus = effectiveRightsStatus(resource.rights);
              return (
                <tr key={resource.id}>
                  <td>
                    <button className="ep-link" onClick={() => setEditing(resource)}>{resource.name}</button>
                    <small>{code ?? resource.id}</small>
                  </td>
                  <td>{resource.version}</td>
                  <td>
                    <Tag tone={resource.status === "已发布" ? "success" : resource.status === "已驳回" ? "danger" : "warning"}>
                      {resource.status}
                    </Tag>
                  </td>
                  <td>
                    <Tag tone={readiness.ready ? "success" : "muted"}>{readiness.ready ? "可培养" : "待完善"}</Tag>
                    {!readiness.ready && <small>{readiness.reason}</small>}
                  </td>
                  <td>
                    <Tag tone={rightsStatus === "已确权" ? "success" : rightsStatus === "已驳回" ? "danger" : "warning"}>
                      {rightsStatus}
                    </Tag>
                  </td>
                  <td>
                    <div className="ep-actions">
                      {!readOnly && <button onClick={() => setEditing(resource)}>编辑</button>}
                      {!readOnly && resource.status === "草稿" && <button onClick={() => submit(resource)}>提交审核</button>}
                      {!readOnly && resource.status === "已驳回" && <button onClick={() => submit(resource)}>重新提交</button>}
                      {!readOnly && resource.status === "已发布" && (
                        <button onClick={() => { resourceAction(resource.id, "offline", ""); notify("岗位已下线"); }}>下线</button>
                      )}
                      <Link href={`/platform/resource/${resource.id}`}>详情</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {positions.length === 0 && <div className="ep-empty">暂无岗位。</div>}
      </div>
    </>
  );
}

export function MajorGroupsPanel({ notify }: { notify: (message: string) => void }) {
  const { state, saveMajorGroup } = useWorkspace();
  return (
    <CatalogPanel<MajorGroup>
      entity="majorGroups"
      title="专业群适配"
      description="维护专业群与专业、岗位的对应关系。"
      items={state.majorGroups}
      columns={[
        { key: "code", label: "编码" },
        { key: "name", label: "名称" },
        { key: "majors", label: "专业", render: (item) => item.majors.join("、") },
        { key: "jobIds", label: "岗位数", render: (item) => `${item.jobIds.length} 个` },
      ]}
      fields={[
        { key: "code", label: "编码" },
        { key: "name", label: "名称" },
        { key: "majors", label: "覆盖专业（逗号分隔）", type: "tags", wide: true },
        { key: "jobIds", label: "关联岗位 ID（逗号分隔）", type: "tags", wide: true },
        { key: "description", label: "说明", type: "textarea", wide: true },
      ]}
      blank={() => ({
        id: crypto.randomUUID(),
        code: `MG-${String(state.majorGroups.length + 1).padStart(2, "0")}`,
        name: "",
        schoolIds: [state.activeSchoolId],
        majors: [],
        jobIds: [],
        description: "",
        updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      })}
      onSave={(item) => {
        saveMajorGroup(item);
        notify("专业群已保存");
      }}
    />
  );
}

export function renderCareerPage(
  platformId: string,
  pageId: string,
  notify: (message: string) => void,
): ReactNode | null {
  if (platformId === "career" && pageId === "positions") return <CareerPositionsPanel notify={notify} />;
  if (platformId === "career" && pageId === "major-groups") return <MajorGroupsPanel notify={notify} />;
  return null;
}
