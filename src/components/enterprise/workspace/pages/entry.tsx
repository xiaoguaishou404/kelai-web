"use client";

import { useEffect, type ReactNode } from "react";
import { Activity, ArrowUpRight, BookOpen, Building2, GraduationCap, Network, ShieldCheck } from "lucide-react";
import { type Role } from "@/lib/enterprise-workspace";
import { useWorkspacePage } from "@/components/enterprise/workspace/page-runtime";
import { Btn, Card, Empty, Tag } from "@/components/enterprise/workspace/ui";

export function TeacherGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="ep-modal-backdrop" role="dialog" aria-modal="true" aria-label="教师产业导览">
      <Card>
        <Tag>教师首次导览</Tag>
        <h1>以岗位标准组织场景教学</h1>
        <h2>岗位 → 学习路径 → 场景 → 任务考核 → 画像</h2>
        <p>学生在真实业务问题中完成任务，教师依据证据、推理和交付维度完成验收。</p>
        <Btn onClick={onClose}>进入教学服务台</Btn>
      </Card>
    </div>
  );
}

export function LegacyLearningPathRedirect({ jobId }: { jobId?: string }) {
  const { router } = useWorkspacePage();
  useEffect(() => {
    if (jobId) router.replace(`/platform/job/${jobId}/learning-path`);
  }, [jobId, router]);
  return <Card><Empty>正在进入岗位学习路径…</Empty></Card>;
}

export function LoginView() {
  const { switchRole } = useWorkspacePage();
  const roles: { role: Role; name: string; desc: string; icon: ReactNode }[] = [
    { role: "student", name: "学生", desc: "学习、实训与求职", icon: <GraduationCap /> },
    { role: "teacher", name: "院校教职工", desc: "教学、评价与成效", icon: <BookOpen /> },
    { role: "schoolAdmin", name: "院校管理", desc: "资源、教务与合作", icon: <ShieldCheck /> },
    { role: "manage", name: "科来管理", desc: "资源、合作与人才", icon: <Building2 /> },
  ];
  return (
    <div className="ep-login">
      <div>
        <Tag>场景化产教融合平台</Tag>
        <h1>让真实业务现场<br />成为人才成长的起点</h1>
        <p>从岗位标准、场景实战，到能力评价与产业交付。</p>
        <div className="ep-login-art"><Network size={160} strokeWidth={0.7} /><Activity size={100} strokeWidth={0.8} /></div>
      </div>
      <Card>
        <h2>登录场景化产教融合平台</h2>
        <p>选择演示身份进入工作空间</p>
        {roles.map((item) => (
          <button
            key={item.role}
            className="ep-role"
            onClick={() => switchRole(item.role, item.role === "student" ? "learning" : item.role === "teacher" ? "teacher" : item.role === "schoolAdmin" ? "admin/system/tenant" : "manage")}
          >
            <span className="ep-icon">{item.icon}</span>
            <span className="ep-grow"><b>{item.name}</b><small>{item.desc}</small></span>
            <ArrowUpRight />
          </button>
        ))}
        <small>浏览器本地演示 · 侧栏可恢复全部数据</small>
      </Card>
    </div>
  );
}
