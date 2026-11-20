"use client";

import {
  createAudit,
  jobById,
  nowLabel,
  projectEligibility,
  type Application,
  type ApplicationStatus,
  type EnterpriseWorkspaceState,
  type ProjectPosting,
} from "@/lib/enterprise-workspace";

export function buildWork(input: {
  state: EnterpriseWorkspaceState;
  sceneId: string;
  analysis: string;
  nextStep: string;
  evidenceIds: string[];
  boundaryAcknowledged: boolean;
}) {
  const old = input.state.works.find((item) => item.studentId === input.state.activeStudentId && item.sceneId === input.sceneId);
  const at = nowLabel();
  return {
    id: old?.id ?? crypto.randomUUID(),
    studentId: input.state.activeStudentId,
    studentName: input.state.resume.name,
    sceneId: input.sceneId,
    status: "待评价" as const,
    analysis: input.analysis,
    nextStep: input.nextStep,
    evidenceIds: input.evidenceIds,
    boundaryAcknowledged: input.boundaryAcknowledged,
    submittedAt: at,
    updatedAt: at,
    reviews: old?.reviews ?? [],
    history: old?.history ?? [],
  };
}

export function buildApplication(input: {
  state: EnterpriseWorkspaceState;
  kind: "project" | "job";
  targetId: string;
  name: string;
  company: string;
}): Application {
  const at = nowLabel();
  const event = createAudit(input.state.resume.name, input.kind === "project" ? "申请项目" : "投递岗位", input.name, input.company);
  return {
    id: crypto.randomUUID(),
    kind: input.kind,
    targetId: input.targetId,
    name: input.name,
    company: input.company,
    studentId: input.state.activeStudentId,
    studentName: input.state.resume.name,
    status: "待审核",
    resumeSnapshot: { ...input.state.resume },
    createdAt: at,
    updatedAt: at,
    history: [event],
  };
}

export function projectStatusOptions(application: Application) {
  if (application.kind !== "project") return [];
  if (application.status === "待审核") return ["已接单", "已驳回"] as ApplicationStatus[];
  if (application.status === "待验收") return ["已验收", "已退回"] as ApplicationStatus[];
  return [];
}

export function jobStatusOptions(application: Application) {
  if (application.kind !== "job") return [];
  if (application.status === "待审核") return ["待面试", "未通过"] as ApplicationStatus[];
  if (application.status === "待面试") return ["已录用", "未通过"] as ApplicationStatus[];
  return [];
}

export function applicationJobScore(state: EnterpriseWorkspaceState, application: Application) {
  const job =
    application.kind === "project"
      ? jobById(state.projects.find((item) => item.id === application.targetId)?.jobId ?? "")
      : jobById(state.jobPostings.find((item) => item.id === application.targetId)?.jobId ?? "");
  return job?.name ?? "岗位能力";
}

export function canApplyProject(state: EnterpriseWorkspaceState, project: ProjectPosting) {
  return projectEligibility(state, project);
}
