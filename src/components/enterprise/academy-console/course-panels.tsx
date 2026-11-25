import { Link } from "@/components/router/link";
import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { ResourceBuilder } from "@/components/enterprise/resource-builders";
import { useWorkspace } from "@/components/enterprise/workspace-store";
import { useConsoleAccess } from "@/components/enterprise/console-access";
import { Tag } from "@/components/enterprise/workspace/ui";
import { PanelTitle } from "./catalog-panel";
import { effectiveRightsStatus, type CourseProfile, type Resource } from "@/lib/enterprise-workspace";

type CourseType = NonNullable<CourseProfile["courseType"]>;

export function CourseCatalogPanel({ courseType, notify }: { courseType: CourseType; notify: (message: string) => void }) {
  const { state, resourceAction } = useWorkspace();
  const { readOnly } = useConsoleAccess();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const items = state.resources.filter(
    (item) => item.type === "课程"
      && item.draftContent.kind === "course"
      && item.draftContent.data.courseType === courseType,
  );

  const submit = (resource: Resource) => {
    resourceAction(resource.id, "submit", "");
    notify(`${courseType}已提交审核，请到审批中心处理`);
  };

  return (
    <>
      <div className="ep-catalog-head">
        <PanelTitle
          title={courseType === "混合课" ? "混合课模板" : courseType === "文化思政课" ? "文化思政课" : `${courseType}管理`}
          description="课程信息、章节结构、配套素材与审核状态。"
        />
        <div className="ep-catalog-head-actions">
          <span>{items.length} 条</span>
          {!readOnly && (
            <button className="ep-button" onClick={() => setCreating(true)}>
              <Plus size={15} />新建{courseType}
            </button>
          )}
        </div>
      </div>
      {!readOnly && (creating || editing) && (
        <ResourceBuilder
          kind="课程"
          courseType={courseType}
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
              <th>章节</th>
              <th>状态</th>
              <th>权属</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((resource) => {
              const content = resource.draftContent;
              const code = content.kind === "course" ? content.data.code : undefined;
              const chapters = content.kind === "course" ? content.data.chapters.length : 0;
              const rightsStatus = effectiveRightsStatus(resource.rights);
              return (
                <tr key={resource.id}>
                  <td>
                    <button className="ep-link" onClick={() => setEditing(resource)}>{resource.name}</button>
                    <small>{code ?? resource.id}</small>
                  </td>
                  <td>{chapters}</td>
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
                        <button onClick={() => { resourceAction(resource.id, "offline", ""); notify("课程已下线"); }}>下线</button>
                      )}
                      <Link href={`/platform/resource/${resource.id}`}>详情</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && <div className="ep-empty">暂无{courseType}。</div>}
      </div>
    </>
  );
}

export function TextbookPanel({ notify }: { notify: (message: string) => void }) {
  const { state, resourceAction } = useWorkspace();
  const { readOnly } = useConsoleAccess();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const items = state.resources.filter((item) => item.type === "教材");

  const submit = (resource: Resource) => {
    resourceAction(resource.id, "submit", "");
    notify("教材已提交审核，请到审批中心处理");
  };

  return (
    <>
      <div className="ep-catalog-head">
        <PanelTitle title="数字教材" description="教材目录、章节正文、配套素材与审核状态。" />
        <div className="ep-catalog-head-actions">
          <span>{items.length} 条</span>
          {!readOnly && (
            <button className="ep-button" onClick={() => setCreating(true)}>
              <Plus size={15} />新建教材
            </button>
          )}
        </div>
      </div>
      {!readOnly && (creating || editing) && (
        <ResourceBuilder
          kind="教材"
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
              <th>主编</th>
              <th>章节</th>
              <th>状态</th>
              <th>权属</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((resource) => {
              const content = resource.draftContent;
              const book = content.kind === "textbook" ? content.data : undefined;
              const rightsStatus = effectiveRightsStatus(resource.rights);
              return (
                <tr key={resource.id}>
                  <td>
                    <button className="ep-link" onClick={() => setEditing(resource)}>{resource.name}</button>
                    <small>{book?.code ?? resource.id}</small>
                  </td>
                  <td>{book?.creator ?? "-"}</td>
                  <td>{book?.chapters.length ?? 0}</td>
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
                        <button onClick={() => { resourceAction(resource.id, "offline", ""); notify("教材已下线"); }}>下线</button>
                      )}
                      <Link href={`/platform/resource/${resource.id}`}>详情</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && <div className="ep-empty">暂无教材。</div>}
      </div>
    </>
  );
}

export function renderCoursePage(
  platformId: string,
  pageId: string,
  notify: (message: string) => void,
): ReactNode | null {
  if (platformId !== "course") return null;
  if (pageId === "system") return <CourseCatalogPanel courseType="体系课" notify={notify} />;
  if (pageId === "granular") return <CourseCatalogPanel courseType="颗粒课" notify={notify} />;
  if (pageId === "hybrid") return <CourseCatalogPanel courseType="混合课" notify={notify} />;
  if (pageId === "culture") return <CourseCatalogPanel courseType="文化思政课" notify={notify} />;
  if (pageId === "textbooks") return <TextbookPanel notify={notify} />;
  return null;
}
