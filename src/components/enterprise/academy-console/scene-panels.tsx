"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { ResourceBuilder } from "@/components/enterprise/resource-builders";
import { useWorkspace } from "@/components/enterprise/workspace-store";
import { useConsoleAccess } from "@/components/enterprise/console-access";
import { Tag } from "@/components/enterprise/workspace/ui";
import { PanelTitle } from "./catalog-panel";
import { effectiveRightsStatus, type Resource } from "@/lib/enterprise-workspace";

export function SceneScenariosPanel({ notify }: { notify: (message: string) => void }) {
  const { state, resourceAction } = useWorkspace();
  const { readOnly } = useConsoleAccess();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const scenes = state.resources.filter((item) => item.type === "场景");
  const jobName = (id: string) => {
    const job = state.resources.find((item) => item.id === id && item.draftContent.kind === "job");
    return job?.draftContent.kind === "job" ? job.draftContent.data.name : id;
  };

  const submit = (resource: Resource) => {
    resourceAction(resource.id, "submit", "");
    notify("场景已提交审核，请到审批中心处理");
  };

  return (
    <>
      <div className="ep-catalog-head">
        <PanelTitle title="场景管理" description="场景版本、任务链、证据、量规与关联资源。" />
        <div className="ep-catalog-head-actions">
          <span>{scenes.length} 条</span>
          {!readOnly && (
            <button className="ep-button" onClick={() => setCreating(true)}>
              <Plus size={15} />新建场景
            </button>
          )}
        </div>
      </div>
      {!readOnly && (creating || editing) && (
        <ResourceBuilder
          kind="场景"
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
              <th>所属岗位</th>
              <th>任务数</th>
              <th>状态</th>
              <th>权属</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {scenes.map((resource) => {
              const content = resource.draftContent;
              const code = content.kind === "scene" ? content.data.code : undefined;
              const jobId = content.kind === "scene" ? content.data.jobId : "";
              const taskCount = content.kind === "scene"
                ? content.data.taskDetails?.length ?? content.data.tasks.length
                : 0;
              const rightsStatus = effectiveRightsStatus(resource.rights);
              return (
                <tr key={resource.id}>
                  <td>
                    <button className="ep-link" onClick={() => setEditing(resource)}>{resource.name}</button>
                    <small>{code ?? resource.id}</small>
                  </td>
                  <td>{jobName(jobId)}</td>
                  <td>{taskCount}</td>
                  <td>
                    <Tag tone={resource.status === "已发布" ? "success" : resource.status === "已驳回" ? "danger" : "warning"}>
                      {resource.status}
                    </Tag>
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
                        <button onClick={() => { resourceAction(resource.id, "offline", ""); notify("场景已下线"); }}>下线</button>
                      )}
                      <Link href={`/platform/resource/${resource.id}`}>详情</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {scenes.length === 0 && <div className="ep-empty">暂无场景。</div>}
      </div>
    </>
  );
}

export function renderScenePage(
  platformId: string,
  pageId: string,
  notify: (message: string) => void,
): ReactNode | null {
  if (platformId === "scene" && pageId === "scenarios") return <SceneScenariosPanel notify={notify} />;
  return null;
}
