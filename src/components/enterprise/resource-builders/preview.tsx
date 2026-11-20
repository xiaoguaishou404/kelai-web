"use client";

import { jobMatch, type EnterpriseWorkspaceState, type Resource } from "@/lib/enterprise-workspace";

export function ResourcePreview({ state, resource }: { state: EnterpriseWorkspaceState; resource: Resource }) {
  const published = resource.publishedContent;
  if (!published) return <div className="ep-empty">尚无已发布版本。</div>;
  if (published.kind === "job") {
    const job = published.data;
    const match = jobMatch(state, job);
    return <div className="ep-resource-preview"><h2>{job.name}</h2><p>{job.description}</p><div className="ep-chips">{(job.skills ?? []).map((item) => <span className="ep-tag" key={item}>{item}</span>)}</div><div className="ep-stats"><div className="ep-card"><small>工作任务</small><strong>{job.tasks?.length ?? 0}</strong></div><div className="ep-card"><small>能力点</small><strong>{job.abilityPoints?.length ?? 0}</strong></div><div className="ep-card"><small>关联场景</small><strong>{job.sceneIds?.length ?? 0}</strong></div><div className="ep-card"><small>岗位匹配</small><strong>{jobMatch(state, job).match}%</strong></div></div><h3>岗位职责</h3>{(job.responsibilities ?? []).map((item) => <p key={item}>· {item}</p>)}<h3>任职要求</h3>{(job.requirements ?? []).map((item) => <p key={item}>· {item}</p>)}<p className="ep-status">{match.missing.length ? `待补充能力：${match.missing.join("、")}` : "核心能力证据已具备"}</p></div>;
  }
  if (published.kind === "scene") return <div className="ep-resource-preview"><h2>{published.data.name}</h2><p>{published.data.description}</p><h3>任务链</h3>{published.data.tasks.map((item, index) => <p key={`${item}-${index}`}>{index + 1}. {item}</p>)}</div>;
  if (published.kind === "course") return <div className="ep-resource-preview"><h2>{published.data.name}</h2><p>{published.data.courseType} · {published.data.totalHours} 学时</p>{published.data.chapters.map((item, index) => <p key={`${item.title}-${index}`}>{index + 1}. {item.title}</p>)}</div>;
  if (published.kind === "assessment") return <div className="ep-resource-preview"><h2>{published.data.name}</h2><p>{published.data.questions.length} 题 · {published.data.durationMinutes} 分钟 · {published.data.passScore} 分合格</p></div>;
  return <div className="ep-resource-preview"><h2>{published.data.name}</h2><p>{published.data.recognitionRule}</p>{published.data.abilityPointWeights.map((item) => <p key={item.id}>{item.name} · {item.weight}% · {item.level}</p>)}</div>;
}
