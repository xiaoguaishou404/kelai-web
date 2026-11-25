import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { useWorkspace } from "@/components/enterprise/workspace-store";
import { useConsoleAccess } from "@/components/enterprise/console-access";
import { Tag } from "@/components/enterprise/workspace/ui";
import { PanelTitle } from "./catalog-panel";
import type { CertificateDefinition } from "@/lib/platform-admin";

const categories: CertificateDefinition["category"][] = ["平台认证", "行业认证", "企业认证", "职业技能等级"];
const statuses: CertificateDefinition["status"][] = ["报名中", "即将开放", "未开放"];

function blankCertificate(): CertificateDefinition {
  return {
    id: crypto.randomUUID(),
    name: "",
    category: "平台认证",
    issuer: "科来网络场景化产教融合平台",
    level: "初级",
    jobIds: [],
    abilityCount: 6,
    condition: "",
    format: "",
    examDate: "2027-01-01",
    status: "即将开放",
    sample: true,
  };
}

export function CertificateLibraryPanel({ notify }: { notify: (message: string) => void }) {
  const { state, replacePlatformAdmin, issueCertificateFor } = useWorkspace();
  const { readOnly } = useConsoleAccess();
  const [draft, setDraft] = useState<CertificateDefinition | null>(null);
  const certificates = state.platformAdmin.certificates;
  const approved = state.platformAdmin.enrollments.filter((item) => item.status === "已通过");
  const jobs = state.resources.flatMap((item) => item.draftContent.kind === "job" ? [item.draftContent.data] : []);

  const save = () => {
    if (!draft) return;
    const exists = certificates.some((item) => item.id === draft.id);
    replacePlatformAdmin({
      ...state.platformAdmin,
      certificates: exists
        ? certificates.map((item) => item.id === draft.id ? draft : item)
        : [draft, ...certificates],
    });
    notify(exists ? "证书已更新" : "证书已创建");
    setDraft(null);
  };

  return (
    <>
      <div className="ep-catalog-head">
        <PanelTitle title="证书库" description="平台、行业、企业与职业技能证书定义。" />
        <div className="ep-catalog-head-actions">
          <span>{certificates.length} 条</span>
          {!readOnly && <button className="ep-button" onClick={() => setDraft(blankCertificate())}><Plus size={15} />新建证书</button>}
        </div>
      </div>
      <div className="ep-tablewrap ep-academy-table">
        <table>
          <thead><tr><th>证书</th><th>类别</th><th>发证机构</th><th>等级</th><th>状态</th><th>报名</th><th>操作</th></tr></thead>
          <tbody>
            {certificates.map((certificate) => {
              const enrollments = state.platformAdmin.enrollments.filter((item) => item.certificateId === certificate.id);
              return (
                <tr key={certificate.id}>
                  <td>{readOnly ? <b>{certificate.name}</b> : <button className="ep-link" onClick={() => setDraft({ ...certificate })}>{certificate.name}</button>}<small>{certificate.condition}</small></td>
                  <td>{certificate.category}</td>
                  <td>{certificate.issuer}</td>
                  <td>{certificate.level}</td>
                  <td><Tag tone={certificate.status === "报名中" ? "success" : certificate.status === "未开放" ? "muted" : "warning"}>{certificate.status}</Tag></td>
                  <td>{enrollments.length} 人</td>
                  <td>{!readOnly && <button onClick={() => setDraft({ ...certificate })}>编辑</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {certificates.length === 0 && <div className="ep-empty">暂无证书。</div>}
      </div>
      {approved.length > 0 && (
        <div className="ep-catalog-panel" style={{ marginTop: 16 }}>
          <div className="ep-catalog-head">
            <div><h3>待发证</h3><p>院校已审核通过的报名。</p></div>
            <div className="ep-catalog-head-actions"><span>{approved.length} 人</span></div>
          </div>
          <div className="ep-tablewrap ep-academy-table">
            <table>
              <thead><tr><th>学生</th><th>证书</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                {approved.map((enrollment) => {
                  const student = state.studentRecords.find((item) => item.id === enrollment.studentId);
                  const certificate = state.platformAdmin.certificates.find((item) => item.id === enrollment.certificateId);
                  const issued = state.certificates.some((item) => item.studentId === enrollment.studentId && item.definitionId === enrollment.certificateId);
                  return (
                    <tr key={enrollment.id}>
                      <td>{student?.name ?? enrollment.studentId}</td>
                      <td>{certificate?.name ?? enrollment.certificateId}</td>
                      <td><Tag tone={issued ? "success" : "warning"}>{issued ? "已发证" : "待发证"}</Tag></td>
                      <td>
                        {!readOnly && !issued && (
                          <button onClick={() => {
                            issueCertificateFor(
                              enrollment.studentId,
                              certificate?.jobIds[0] ?? "service",
                              enrollment.certificateId,
                              `KL-ZS-${new Date().getFullYear()}-${String(state.certificates.length + 1).padStart(4, "0")}`,
                            );
                            notify("证书已发放");
                          }}>发证</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!readOnly && draft && (
        <div className="ep-catalog-form">
          <div className="ep-catalog-form-head"><h3>{certificates.some((item) => item.id === draft.id) ? "编辑证书" : "新建证书"}</h3><button onClick={() => setDraft(null)}>关闭</button></div>
          <div className="ep-form-grid">
            <label className="ep-form">证书名称<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label className="ep-form">类别<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as CertificateDefinition["category"] })}>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
            <label className="ep-form">发证机构<input value={draft.issuer} onChange={(event) => setDraft({ ...draft, issuer: event.target.value })} /></label>
            <label className="ep-form">等级<input value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value })} /></label>
            <label className="ep-form">关联岗位
              <select multiple value={draft.jobIds} onChange={(event) => setDraft({ ...draft, jobIds: Array.from(event.target.selectedOptions, (option) => option.value) })}>
                {jobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}
              </select>
            </label>
            <label className="ep-form">能力点数<input type="number" value={draft.abilityCount} onChange={(event) => setDraft({ ...draft, abilityCount: Number(event.target.value) })} /></label>
            <label className="ep-form">状态<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as CertificateDefinition["status"] })}>{statuses.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
            <label className="ep-form">考试日期<input value={draft.examDate} onChange={(event) => setDraft({ ...draft, examDate: event.target.value })} /></label>
            <label className="ep-form wide">报考条件<textarea value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: event.target.value })} /></label>
            <label className="ep-form wide">考核形式<textarea value={draft.format} onChange={(event) => setDraft({ ...draft, format: event.target.value })} /></label>
            <label className="ep-check"><input type="checkbox" checked={draft.sample} onChange={(event) => setDraft({ ...draft, sample: event.target.checked })} />演示认证</label>
          </div>
          <div className="ep-actions"><button className="ep-button" onClick={save}>保存</button><button className="ep-button secondary" onClick={() => setDraft(null)}>取消</button></div>
        </div>
      )}
    </>
  );
}

export function EnrollmentReviewPanel({ notify }: { notify: (message: string) => void }) {
  const { state, replacePlatformAdmin } = useWorkspace();
  const { readOnly } = useConsoleAccess();
  const enrollments = state.platformAdmin.enrollments;

  const setStatus = (id: string, status: "已通过" | "已驳回") => {
    replacePlatformAdmin({
      ...state.platformAdmin,
      enrollments: state.platformAdmin.enrollments.map((item) => item.id === id ? { ...item, status, note: status === "已通过" ? "院校审核通过" : "材料需补充后重新提交" } : item),
    });
    notify(`报名已${status === "已通过" ? "通过" : "驳回"}`);
  };

  return (
    <>
      <div className="ep-catalog-head">
        <PanelTitle title="证书报名审核" description="审核本校学生报名，平台方负责发证。" />
        <div className="ep-catalog-head-actions"><span>{enrollments.length} 条</span></div>
      </div>
      <div className="ep-tablewrap ep-academy-table">
        <table>
          <thead><tr><th>学生</th><th>证书</th><th>状态</th><th>提交时间</th><th>备注</th><th>操作</th></tr></thead>
          <tbody>
            {enrollments.map((enrollment) => {
              const student = state.studentRecords.find((item) => item.id === enrollment.studentId);
              const certificate = state.platformAdmin.certificates.find((item) => item.id === enrollment.certificateId);
              return (
                <tr key={enrollment.id}>
                  <td>{student?.name ?? enrollment.studentId}<small>{student?.studentNo ?? ""}</small></td>
                  <td>{certificate?.name ?? enrollment.certificateId}</td>
                  <td><Tag tone={enrollment.status === "已通过" ? "success" : enrollment.status === "已驳回" ? "danger" : "warning"}>{enrollment.status}</Tag></td>
                  <td>{enrollment.submittedAt}</td>
                  <td>{enrollment.note}</td>
                  <td>
                    {!readOnly && enrollment.status === "待审核" && (
                      <div className="ep-actions">
                        <button onClick={() => setStatus(enrollment.id, "已通过")}>通过</button>
                        <button onClick={() => setStatus(enrollment.id, "已驳回")}>驳回</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {enrollments.length === 0 && <div className="ep-empty">暂无证书报名。</div>}
      </div>
    </>
  );
}

export function renderCertificatePage(
  platformId: string,
  pageId: string,
  notify: (message: string) => void,
): ReactNode | null {
  if (platformId === "resource" && pageId === "certificates") return <CertificateLibraryPanel notify={notify} />;
  if (platformId === "affairs" && pageId === "certificate-enrollments") return <EnrollmentReviewPanel notify={notify} />;
  return null;
}
