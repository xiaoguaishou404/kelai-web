"use client";

import type { ReactNode } from "react";
import { useWorkspace } from "@/components/enterprise/workspace-store";
import { StudentPortrait } from "@/components/enterprise/workspace/student-portrait";
import type {
  AbilityPointRecord,
  ClassGroup,
  CodeRule,
  Department,
  EvaluationMethodRecord,
  KnowledgePoint,
  School,
  SchoolMajor,
  StudentRecord,
  TeacherRecord,
  TeachingMaterial,
} from "@/lib/enterprise-workspace/types";
import { CatalogPanel, PanelTitle } from "./catalog-panel";

function nameOf(list: { id: string; name: string }[], id: string) {
  return list.find((item) => item.id === id)?.name ?? id;
}

export function AbilityCatalogPanel() {
  const { state } = useWorkspace();
  return (
    <CatalogPanel<AbilityPointRecord>
      entity="abilityCatalog"
      title="能力点库"
      description="岗位、场景和测评统一引用的能力点主数据。"
      items={state.abilityCatalog}
      columns={[
        { key: "code", label: "编码" },
        { key: "name", label: "名称" },
        { key: "domain", label: "能力领域" },
        { key: "level", label: "等级" },
        { key: "status", label: "状态" },
      ]}
      fields={[
        { key: "code", label: "编码" },
        { key: "name", label: "名称" },
        { key: "domain", label: "能力领域" },
        { key: "dimension", label: "六维维度（0-5）", type: "number" },
        { key: "level", label: "等级", type: "select", options: ["L1", "L2", "L3", "L4", "L5"] },
        { key: "description", label: "说明", type: "textarea", wide: true },
        { key: "status", label: "状态", type: "select", options: ["启用", "停用"] },
      ]}
      blank={() => ({
        id: crypto.randomUUID(),
        code: `KL-AB-${String(state.abilityCatalog.length + 1).padStart(3, "0")}`,
        name: "",
        domain: "",
        dimension: 0,
        level: "L3",
        description: "",
        status: "启用",
      })}
    />
  );
}

export function KnowledgeCatalogPanel() {
  const { state } = useWorkspace();
  return (
    <CatalogPanel<KnowledgePoint>
      entity="knowledgeCatalog"
      title="知识点库"
      description="岗位、场景与课程共享的知识点主数据。"
      items={state.knowledgeCatalog}
      columns={[
        { key: "code", label: "编码" },
        { key: "name", label: "名称" },
        { key: "domain", label: "知识领域" },
        { key: "tags", label: "标签", render: (item) => item.tags.join("、") },
        { key: "status", label: "状态" },
      ]}
      fields={[
        { key: "code", label: "编码" },
        { key: "name", label: "名称" },
        { key: "domain", label: "知识领域" },
        { key: "tags", label: "标签（逗号分隔）", type: "tags" },
        { key: "description", label: "说明", type: "textarea", wide: true },
        { key: "status", label: "状态", type: "select", options: ["启用", "停用"] },
      ]}
      blank={() => ({
        id: crypto.randomUUID(),
        code: `KL-KP-${String(state.knowledgeCatalog.length + 1).padStart(3, "0")}`,
        name: "",
        domain: "",
        description: "",
        tags: [],
        status: "启用",
        updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      })}
    />
  );
}

export function MaterialCatalogPanel({ type }: { type: TeachingMaterial["type"] }) {
  const { state } = useWorkspace();
  const items = state.teachingMaterials.filter((item) => item.type === type);
  const heading = type === "文档" ? "文档资源" : type === "图片" ? "图片资源" : "视频资源";
  return (
    <CatalogPanel<TeachingMaterial>
      entity="teachingMaterials"
      title={heading}
      description="场景任务和课程章节统一引用的教学素材。"
      items={items}
      columns={[
        { key: "code", label: "编码" },
        { key: "title", label: "名称" },
        { key: "owner", label: "维护人" },
        { key: "status", label: "状态" },
        { key: "updatedAt", label: "更新时间" },
      ]}
      fields={[
        { key: "code", label: "编码" },
        { key: "title", label: "名称" },
        { key: "fileName", label: "文件名" },
        { key: "owner", label: "维护人" },
        { key: "description", label: "说明", type: "textarea", wide: true },
        { key: "status", label: "状态", type: "select", options: ["启用", "停用"] },
      ]}
      blank={() => ({
        id: crypto.randomUUID(),
        code: `KL-MT-${String(state.teachingMaterials.length + 1).padStart(3, "0")}`,
        type,
        title: "",
        description: "",
        fileName: "",
        owner: "科来教学资源部",
        status: "启用",
        updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      })}
    />
  );
}

export function EvaluationMethodPanel() {
  const { state } = useWorkspace();
  return (
    <CatalogPanel<EvaluationMethodRecord>
      entity="evaluationMethodCatalog"
      title="测评方式"
      description="笔试、实操、答辩等测评方式的统一配置。"
      items={state.evaluationMethodCatalog}
      columns={[
        { key: "code", label: "编码" },
        { key: "name", label: "名称" },
        { key: "form", label: "形式" },
        { key: "duration", label: "时长" },
        { key: "status", label: "状态" },
      ]}
      fields={[
        { key: "code", label: "编码" },
        { key: "name", label: "名称" },
        { key: "form", label: "形式" },
        { key: "duration", label: "时长" },
        { key: "use", label: "适用场景", wide: true },
        { key: "description", label: "说明", type: "textarea", wide: true },
        { key: "passScore", label: "合格线", type: "number" },
        { key: "status", label: "状态", type: "select", options: ["启用", "停用"] },
      ]}
      blank={() => ({
        id: crypto.randomUUID(),
        code: `KL-EM-${String(state.evaluationMethodCatalog.length + 1).padStart(3, "0")}`,
        name: "",
        form: "",
        duration: "",
        use: "",
        description: "",
        passScore: 60,
        status: "启用",
      })}
    />
  );
}

export function CodeRulePanel() {
  const { state } = useWorkspace();
  return (
    <CatalogPanel<CodeRule>
      entity="codeRules"
      title="资源编码"
      description="岗位、场景、课程、能力点等资源的统一编码规则。"
      items={state.codeRules}
      columns={[
        { key: "resourceType", label: "资源类型" },
        { key: "prefix", label: "前缀" },
        { key: "pattern", label: "规则" },
        { key: "nextNumber", label: "下一个序号" },
        { key: "status", label: "状态" },
      ]}
      fields={[
        { key: "resourceType", label: "资源类型" },
        { key: "prefix", label: "前缀" },
        { key: "pattern", label: "编码规则" },
        { key: "nextNumber", label: "下一个序号", type: "number" },
        { key: "status", label: "状态", type: "select", options: ["启用", "停用"] },
      ]}
      blank={() => ({
        id: crypto.randomUUID(),
        resourceType: "岗位",
        prefix: "KL-NEW",
        pattern: "KL-NEW-{0000}",
        nextNumber: 1,
        status: "启用",
      })}
    />
  );
}

export function TenantPanel({
  heading = "租户信息",
  subtitle = "服务院校的基础资料、套餐与有效期。",
}: {
  heading?: string;
  subtitle?: string;
} = {}) {
  const { state } = useWorkspace();
  return (
    <CatalogPanel<School>
      entity="schools"
      title={heading}
      description={subtitle}
      items={state.schools}
      columns={[
        { key: "name", label: "院校" },
        { key: "college", label: "院系" },
        { key: "plan", label: "套餐" },
        { key: "contact", label: "联系人" },
        { key: "status", label: "状态" },
      ]}
      fields={[
        { key: "name", label: "院校名称" },
        { key: "college", label: "院系" },
        { key: "plan", label: "套餐" },
        { key: "contact", label: "联系人" },
        { key: "contactPhone", label: "联系电话" },
        { key: "address", label: "地址", wide: true },
        { key: "validFrom", label: "生效日期", type: "date" },
        { key: "validUntil", label: "有效期至", type: "date" },
        { key: "status", label: "状态", type: "select", options: ["服务中", "试用", "合作洽谈", "方案确认", "已停用"] },
      ]}
      blank={() => ({
        id: `school-${crypto.randomUUID().slice(0, 8)}`,
        name: "",
        college: "",
        plan: "岗位培养专业版",
        contact: "",
        contactPhone: "",
        address: "",
        validFrom: "2026-01-01",
        validUntil: "2027-12-31",
        status: "服务中",
      })}
    />
  );
}

export function OrganizationPanel() {
  const { state } = useWorkspace();
  return (
    <>
      <CatalogPanel<Department>
        entity="departments"
        title="院系"
        description="校内教学组织。"
        items={state.departments}
        columns={[
          { key: "code", label: "编码" },
          { key: "name", label: "名称" },
          { key: "schoolId", label: "院校", render: (item) => nameOf(state.schools, item.schoolId) },
          { key: "status", label: "状态" },
        ]}
        fields={[
          { key: "code", label: "编码" },
          { key: "name", label: "名称" },
          { key: "status", label: "状态", type: "select", options: ["启用", "停用"] },
        ]}
        blank={() => ({
          id: crypto.randomUUID(),
          code: `DEPT-${String(state.departments.length + 1).padStart(2, "0")}`,
          name: "",
          schoolId: state.activeSchoolId,
          status: "启用",
        })}
      />
      <CatalogPanel<SchoolMajor>
        entity="schoolMajors"
        title="专业"
        description="院系下的专业与培养方向。"
        items={state.schoolMajors}
        columns={[
          { key: "code", label: "编码" },
          { key: "name", label: "名称" },
          { key: "departmentId", label: "院系", render: (item) => nameOf(state.departments, item.departmentId) },
          { key: "status", label: "状态" },
        ]}
        fields={[
          { key: "code", label: "编码" },
          { key: "name", label: "名称" },
          { key: "departmentId", label: "所属院系", type: "select", options: state.departments.map((item) => ({ value: item.id, label: item.name })) },
          { key: "description", label: "说明", type: "textarea", wide: true },
          { key: "status", label: "状态", type: "select", options: ["启用", "停用"] },
        ]}
        blank={() => ({
          id: crypto.randomUUID(),
          code: `MAJ-${String(state.schoolMajors.length + 1).padStart(2, "0")}`,
          name: "",
          departmentId: state.departments[0]?.id ?? "",
          schoolId: state.activeSchoolId,
          description: "",
          status: "启用",
        })}
      />
      <CatalogPanel<ClassGroup>
        entity="classGroups"
        title="班级"
        description="专业下的教学班级与班主任。"
        items={state.classGroups}
        columns={[
          { key: "code", label: "编码" },
          { key: "name", label: "名称" },
          { key: "majorId", label: "专业", render: (item) => nameOf(state.schoolMajors, item.majorId) },
          { key: "teacherId", label: "班主任", render: (item) => nameOf(state.teacherRecords, item.teacherId) },
          { key: "studentIds", label: "学生数", render: (item) => `${item.studentIds.length} 人` },
          { key: "status", label: "状态" },
        ]}
        fields={[
          { key: "code", label: "编码" },
          { key: "name", label: "名称" },
          { key: "majorId", label: "所属专业", type: "select", options: state.schoolMajors.map((item) => ({ value: item.id, label: item.name })) },
          { key: "teacherId", label: "班主任", type: "select", options: state.teacherRecords.map((item) => ({ value: item.id, label: item.name })) },
          { key: "status", label: "状态", type: "select", options: ["在读", "已毕业"] },
        ]}
        blank={() => ({
          id: crypto.randomUUID(),
          code: `CLS-${String(state.classGroups.length + 1).padStart(4, "0")}`,
          name: "",
          majorId: state.schoolMajors[0]?.id ?? "",
          schoolId: state.activeSchoolId,
          teacherId: state.teacherRecords[0]?.id ?? "",
          studentIds: [],
          status: "在读",
        })}
      />
    </>
  );
}

export function StudentPanel() {
  const { state } = useWorkspace();
  return (
    <CatalogPanel<StudentRecord>
      entity="studentRecords"
      title="学生管理"
      description="学生信息、班级与专业归属。"
      items={state.studentRecords}
      columns={[
        { key: "studentNo", label: "学号" },
        { key: "name", label: "姓名" },
        { key: "classId", label: "班级", render: (item) => nameOf(state.classGroups, item.classId) },
        { key: "majorId", label: "专业", render: (item) => nameOf(state.schoolMajors, item.majorId) },
        { key: "status", label: "状态" },
      ]}
      fields={[
        { key: "studentNo", label: "学号" },
        { key: "name", label: "姓名" },
        { key: "classId", label: "班级", type: "select", options: state.classGroups.map((item) => ({ value: item.id, label: item.name })) },
        { key: "majorId", label: "专业", type: "select", options: state.schoolMajors.map((item) => ({ value: item.id, label: item.name })) },
        { key: "phone", label: "联系电话" },
        { key: "email", label: "邮箱" },
        { key: "status", label: "状态", type: "select", options: ["在读", "休学", "已毕业"] },
      ]}
      blank={() => ({
        id: crypto.randomUUID(),
        studentNo: "",
        name: "",
        classId: state.classGroups[0]?.id ?? "",
        schoolId: state.activeSchoolId,
        majorId: state.schoolMajors[0]?.id ?? "",
        phone: "",
        email: "",
        status: "在读",
      })}
    />
  );
}

export function TeacherPanel() {
  const { state } = useWorkspace();
  return (
    <CatalogPanel<TeacherRecord>
      entity="teacherRecords"
      title="教职工管理"
      description="教师、审核人与教务人员。"
      items={state.teacherRecords}
      columns={[
        { key: "teacherNo", label: "工号" },
        { key: "name", label: "姓名" },
        { key: "departmentId", label: "院系", render: (item) => nameOf(state.departments, item.departmentId) },
        { key: "title", label: "职称" },
        { key: "status", label: "状态" },
      ]}
      fields={[
        { key: "teacherNo", label: "工号" },
        { key: "name", label: "姓名" },
        { key: "departmentId", label: "院系", type: "select", options: state.departments.map((item) => ({ value: item.id, label: item.name })) },
        { key: "title", label: "职称" },
        { key: "phone", label: "联系电话" },
        { key: "email", label: "邮箱" },
        { key: "status", label: "状态", type: "select", options: ["在职", "离职"] },
      ]}
      blank={() => ({
        id: crypto.randomUUID(),
        teacherNo: "",
        name: "",
        departmentId: state.departments[0]?.id ?? "",
        schoolId: state.activeSchoolId,
        title: "",
        phone: "",
        email: "",
        status: "在职",
      })}
    />
  );
}

export function AuditLogPanel() {
  const { state } = useWorkspace();
  const events = state.auditEvents;
  return (
    <section className="ep-catalog-panel">
      <div className="ep-catalog-head">
        <PanelTitle title="操作日志" description="资源、审批、证书与教学操作记录。" />
        <div className="ep-catalog-head-actions"><span>{events.length} 条</span></div>
      </div>
      <div className="ep-tablewrap ep-academy-table">
        <table>
          <thead><tr><th>时间</th><th>操作人</th><th>动作</th><th>对象</th><th>说明</th></tr></thead>
          <tbody>
            {events.slice(0, 100).map((event) => (
              <tr key={event.id}>
                <td>{event.at}</td>
                <td>{event.actor}</td>
                <td>{event.action}</td>
                <td>{event.target}</td>
                <td>{event.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && <div className="ep-empty">暂无操作记录。</div>}
      </div>
    </section>
  );
}

export function renderCatalogPage(platformId: string, pageId: string): ReactNode | null {
  if (platformId === "resource" && pageId === "ability") return <AbilityCatalogPanel />;
  if (platformId === "resource" && pageId === "knowledge") return <KnowledgeCatalogPanel />;
  if (platformId === "resource" && pageId === "doc") return <MaterialCatalogPanel type="文档" />;
  if (platformId === "resource" && pageId === "image") return <MaterialCatalogPanel type="图片" />;
  if (platformId === "resource" && pageId === "video") return <MaterialCatalogPanel type="视频" />;
  if (platformId === "ability" && pageId === "methods") return <EvaluationMethodPanel />;
  if (platformId === "system" && pageId === "codes") return <CodeRulePanel />;
  if (platformId === "system" && pageId === "tenant") return <TenantPanel />;
  if (platformId === "system" && pageId === "logoperation") return <AuditLogPanel />;
  if (platformId === "affairs" && pageId === "org") return <OrganizationPanel />;
  if (platformId === "affairs" && pageId === "students") return <StudentPanel />;
  if (platformId === "affairs" && pageId === "teachers") return <TeacherPanel />;
  if (platformId === "affairs" && pageId === "portraits") return <StudentPortrait admin />;
  return null;
}
