"use client";

import {
  createAudit,
  generatedCertificateNumber,
  nowLabel,
  resourceRightsBlockedReason,
  sceneProgressFor,
  taskReviewBlockers,
  type Application,
  type ApplicationStatus,
  type CatalogEntityMap,
  type EnterpriseWorkspaceState,
  type JobLearningPath,
  type JobProfile,
  type JobPosting,
  type MajorGroup,
  type OfflineSession,
  type ProjectPosting,
  type Resource,
  type ResourceContent,
  type Resume,
  type Review,
  type Role,
  type TaskAssessmentResult,
  type TaskReview,
  type TaskSubmission,
  type TeachingMaterial,
  type TeachingResourceItem,
  type Work,
} from "@/lib/enterprise-workspace";
import {
  type ApprovalIdentity,
  type CertificateEnrollment,
  type PlatformAdminState,
  type PlatformRecord,
} from "@/lib/platform-admin";

export type Action =
  | { type: "hydrate"; state: EnterpriseWorkspaceState }
  | { type: "role"; role: Role }
  | { type: "guide" }
  | { type: "resume"; resume: Resume }
  | { type: "favorite"; jobId: string }
  | { type: "submit-work"; work: Work }
  | { type: "review-work"; workId: string; review: Review }
  | { type: "task-save"; submission: TaskSubmission }
  | { type: "task-submit"; submission: TaskSubmission }
  | { type: "task-review"; submissionId: string; review: TaskReview }
  | { type: "assessment-result"; sceneId: string; taskId: string; result: TaskAssessmentResult; studentId?: string }
  | { type: "offline-checkin"; sessionId: string }
  | { type: "offline-session-status"; id: string; status: "待开始" | "进行中" | "已结束" }
  | { type: "attendance-mark"; sessionId: string; studentId: string; status: "已签到" | "迟到" | "缺席" }
  | { type: "offline-session-create"; session: OfflineSession }
  | {
      type: "exam";
      score: number;
      answers: number[];
      jobId: string;
      assessmentId: string;
      assessmentName: string;
      assessmentKind: "题库" | "试卷";
      passScore: number;
    }
  | { type: "certificate" }
  | { type: "issue-certificate-for"; studentId: string; jobId: string; definitionId: string; number: string }
  | { type: "new-resource"; resource: Resource }
  | { type: "update-resource"; id: string; patch: Partial<Resource>; actor: string }
  | { type: "resource-action"; id: string; action: "submit" | "publish" | "reject" | "offline" | "revise" | "confirm-rights" | "reject-rights" | "revoke-rights"; note?: string }
  | { type: "update-major-group"; id: string; patch: Pick<MajorGroup, "majors" | "jobIds"> }
  | { type: "save-major-group"; group: MajorGroup }
  | { type: "standard"; weights: number[] }
  | { type: "publish-project"; project: ProjectPosting }
  | { type: "toggle-project"; id: string }
  | { type: "publish-job"; posting: JobPosting }
  | { type: "toggle-job"; id: string }
  | { type: "apply"; application: Application }
  | { type: "process-application"; id: string; status: ApplicationStatus; feedback?: string }
  | { type: "deliver"; id: string; text: string }
  | { type: "course-progress"; courseId: string; chapterIndex: number }
  | { type: "save-learning-path"; path: JobLearningPath }
  | { type: "platform-admin"; state: PlatformAdminState }
  | { type: "approval-identity"; identity: ApprovalIdentity }
  | { type: "platform-record"; record: PlatformRecord }
  | { type: "certificate-enroll"; enrollment: CertificateEnrollment }
  | { type: "catalog-item"; entity: keyof CatalogEntityMap; item: CatalogEntityMap[keyof CatalogEntityMap] };

function audit(state: EnterpriseWorkspaceState, event: ReturnType<typeof createAudit>) {
  return { ...state, auditEvents: [event, ...state.auditEvents].slice(0, 120) };
}

function syncMajorGroupsForJob(groups: MajorGroup[], job: JobProfile) {
  return groups.map((group) => {
    const selected = (job.majorGroupIds ?? []).includes(group.id);
    const jobIds = selected
      ? Array.from(new Set([...group.jobIds, job.id]))
      : group.jobIds.filter((id) => id !== job.id);
    return { ...group, jobIds };
  });
}

const catalogEntityLabels: Record<string, string> = {
  abilityCatalog: "能力点",
  knowledgeCatalog: "知识点",
  teachingMaterials: "教学素材",
  evaluationMethodCatalog: "测评方式",
  codeRules: "资源编码",
  departments: "院系",
  schoolMajors: "专业",
  classGroups: "班级",
  studentRecords: "学生",
  teacherRecords: "教职工",
  schools: "院校",
  majorGroups: "专业群",
  trainingPrograms: "培养方案",
  teachingPlans: "教学计划",
  scheduleEntries: "排课",
  lessonResults: "课程节点评价",
};

function syncMaterialItem(items: TeachingResourceItem[] | undefined, material: TeachingMaterial) {
  return items?.map((item) =>
    item.id === material.id
      ? { ...item, type: material.type, title: material.title, description: material.description }
      : item,
  );
}

function syncMaterialContent(content: ResourceContent, material: TeachingMaterial): ResourceContent {
  if (content.kind === "scene") {
    return {
      kind: "scene",
      data: {
        ...content.data,
        resourceItems: syncMaterialItem(content.data.resourceItems, material),
        taskDetails: content.data.taskDetails?.map((task) => ({
          ...task,
          resources: syncMaterialItem(task.resources, material) ?? [],
        })),
      },
    };
  }
  if (content.kind === "course") {
    return {
      kind: "course",
      data: {
        ...content.data,
        chapters: content.data.chapters.map((chapter) => ({
          ...chapter,
          resources: syncMaterialItem(chapter.resources, material),
        })),
      },
    };
  }
  if (content.kind === "textbook") {
    return {
      kind: "textbook",
      data: {
        ...content.data,
        chapters: content.data.chapters.map((chapter) => ({
          ...chapter,
          resources: syncMaterialItem(chapter.resources, material),
        })),
      },
    };
  }
  return content;
}

function syncSceneCompletion(state: EnterpriseWorkspaceState, sceneId: string, studentId: string) {
  const progress = sceneProgressFor(state, sceneId, studentId);
  const existing = state.sceneCompletions.find(
    (item) => item.studentId === studentId && item.sceneId === sceneId,
  );
  const record = {
    id: existing?.id ?? crypto.randomUUID(),
    studentId,
    sceneId,
    status: progress.status,
    completedTaskIds: progress.completedTaskIds,
    requiredTaskIds: progress.requiredTaskIds,
    score: progress.score,
    completedAt: progress.status === "已完成"
      ? existing?.completedAt ?? nowLabel()
      : undefined,
    updatedAt: nowLabel(),
  };
  return existing
    ? state.sceneCompletions.map((item) => item.id === existing.id ? record : item)
    : [record, ...state.sceneCompletions];
}

export function reducer(state: EnterpriseWorkspaceState, action: Action): EnterpriseWorkspaceState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "role":
      return { ...state, role: action.role };
    case "guide":
      return { ...state, teacherGuideSeen: true };
    case "resume":
      return audit({ ...state, resume: action.resume }, createAudit(state.resume.name || "学生", "保存简历", "个人简历", "更新联系方式与个人介绍"));
    case "favorite":
      return {
        ...state,
        favorites: state.favorites.includes(action.jobId)
          ? state.favorites.filter((id) => id !== action.jobId)
          : [...state.favorites, action.jobId],
      };
    case "submit-work": {
      const previous = state.works.find((item) => item.id === action.work.id);
      return audit(
        {
          ...state,
          works: previous ? state.works.map((item) => (item.id === action.work.id ? action.work : item)) : [action.work, ...state.works],
        },
        createAudit(
          action.work.studentName,
          previous?.status === "已退回" ? "重新提交成果" : "提交成果",
          action.work.sceneId,
          "证据、分析结论与采集边界已提交教师评价",
        ),
      );
    }
    case "review-work": {
      const target = state.works.find((item) => item.id === action.workId);
      if (!target) return state;
      return audit(
        {
          ...state,
          works: state.works.map((item) =>
            item.id === action.workId
              ? {
                  ...item,
                  status: action.review.decision === "passed" ? "已通过" : "已退回",
                  reviews: [...item.reviews, action.review],
                  updatedAt: action.review.reviewedAt,
                }
              : item,
          ),
        },
        createAudit(
          "周启明",
          action.review.decision === "passed" ? "通过成果" : "退回成果",
          target.sceneId,
          action.review.comment,
        ),
      );
    }
    case "task-save":
    case "task-submit": {
      const existing = state.taskSubmissions.find(
        (item) =>
          item.studentId === action.submission.studentId &&
          item.sceneId === action.submission.sceneId &&
          item.taskId === action.submission.taskId,
      );
      const at = nowLabel();
      const submission: TaskSubmission = {
        ...action.submission,
        id: existing?.id ?? action.submission.id,
        status: action.type === "task-submit" ? "待评价" : "草稿",
        submittedAt: action.type === "task-submit" ? at : existing?.submittedAt,
        updatedAt: at,
        reviews: existing?.reviews ?? action.submission.reviews,
        history: [
          createAudit(
            action.submission.studentName,
            action.type === "task-submit"
              ? existing?.status === "已退回" ? "重新提交任务成果" : "提交任务成果"
              : "保存任务草稿",
            action.submission.taskId,
            action.type === "task-submit" ? "任务成果进入教师评价" : "任务过程记录已保存",
          ),
          ...(existing?.history ?? action.submission.history),
        ],
      };
      const nextState = {
        ...state,
        taskSubmissions: existing
          ? state.taskSubmissions.map((item) => item.id === existing.id ? submission : item)
          : [submission, ...state.taskSubmissions],
      };
      return audit(
        {
          ...nextState,
          sceneCompletions: syncSceneCompletion(
            nextState,
            submission.sceneId,
            submission.studentId,
          ),
        },
        submission.history[0],
      );
    }
    case "task-review": {
      const target = state.taskSubmissions.find((item) => item.id === action.submissionId);
      if (!target) return state;
      if (
        action.review.decision === "passed" &&
        taskReviewBlockers(state, target.sceneId, target.taskId, target.studentId).length > 0
      ) {
        return state;
      }
      const reviewed: TaskSubmission = {
        ...target,
        status: action.review.decision === "passed" ? "已通过" : "已退回",
        reviews: [...target.reviews, action.review],
        updatedAt: action.review.reviewedAt,
        history: [
          createAudit(
            action.review.reviewer,
            action.review.decision === "passed" ? "通过任务成果" : "退回任务成果",
            target.taskId,
            action.review.comment,
          ),
          ...target.history,
        ],
      };
      const nextState = {
        ...state,
        taskSubmissions: state.taskSubmissions.map((item) =>
          item.id === target.id ? reviewed : item,
        ),
      };
      const before = sceneProgressFor(state, target.sceneId, target.studentId).status;
      const completions = syncSceneCompletion(nextState, target.sceneId, target.studentId);
      const after = sceneProgressFor(nextState, target.sceneId, target.studentId).status;
      return audit(
        { ...nextState, sceneCompletions: completions },
        createAudit(
          action.review.reviewer,
          before !== "已完成" && after === "已完成" ? "完成场景学习" : "处理任务评价",
          target.sceneId,
          after === "已完成" ? "全部必做任务已通过" : action.review.comment,
        ),
      );
    }
    case "assessment-result": {
      const studentId = action.studentId ?? state.activeStudentId;
      const studentName =
        studentId === state.activeStudentId
          ? state.resume.name
          : state.classmates.find((item) => item.id === studentId)?.name ?? studentId;
      const existing = state.taskSubmissions.find(
        (item) =>
          item.studentId === studentId &&
          item.sceneId === action.sceneId &&
          item.taskId === action.taskId,
      );
      const at = nowLabel();
      const submission: TaskSubmission = existing
        ? {
            ...existing,
            assessmentResults: [
              ...existing.assessmentResults.filter((item) => item.methodId !== action.result.methodId),
              action.result,
            ],
            status: existing.status,
            updatedAt: at,
            history: [
              createAudit(
                studentName,
                `完成考核 · ${action.result.type}`,
                action.taskId,
                action.result.comment,
              ),
              ...existing.history,
            ],
          }
        : {
            id: crypto.randomUUID(),
            studentId,
            studentName,
            sceneId: action.sceneId,
            taskId: action.taskId,
            status: "草稿",
            evidenceIds: [],
            worksheet: "",
            answer: "",
            analysis: "",
            nextStep: "",
            boundaryAcknowledged: false,
            updatedAt: at,
            reviews: [],
            assessmentResults: [action.result],
            history: [
              createAudit(
                studentName,
                `完成考核 · ${action.result.type}`,
                action.taskId,
                action.result.comment,
              ),
            ],
          };
      const nextState = {
        ...state,
        taskSubmissions: existing
          ? state.taskSubmissions.map((item) => item.id === existing.id ? submission : item)
          : [submission, ...state.taskSubmissions],
      };
      return audit(
        {
          ...nextState,
          sceneCompletions: syncSceneCompletion(nextState, action.sceneId, studentId),
        },
        submission.history[0],
      );
    }
    case "offline-checkin": {
      const session = state.offlineSessions.find((item) => item.id === action.sessionId);
      if (!session) return state;
      if (
        state.attendanceRecords.some(
          (item) => item.sessionId === session.id && item.studentId === state.activeStudentId,
        )
      ) {
        return state;
      }
      const event = createAudit(
        state.resume.name,
        "课堂签到",
        session.title,
        `${session.location} · ${nowLabel()}`,
      );
      const nextState = {
        ...state,
        attendanceRecords: [
          {
            id: crypto.randomUUID(),
            sessionId: session.id,
            studentId: state.activeStudentId,
            status: "已签到" as const,
            checkedAt: nowLabel(),
          },
          ...state.attendanceRecords,
        ],
      };
      return audit(
        {
          ...nextState,
          sceneCompletions: session.taskId
            ? syncSceneCompletion(nextState, session.sceneId, state.activeStudentId)
            : state.sceneCompletions,
        },
        event,
      );
    }
    case "offline-session-status":
      return audit(
        {
          ...state,
          offlineSessions: state.offlineSessions.map((item) =>
            item.id === action.id ? { ...item, status: action.status } : item,
          ),
        },
        createAudit("周启明", `课堂状态 · ${action.status}`, action.id, "线下课堂状态已更新"),
      );
    case "attendance-mark": {
      const exists = state.attendanceRecords.find(
        (item) => item.sessionId === action.sessionId && item.studentId === action.studentId,
      );
      const record = {
        id: exists?.id ?? crypto.randomUUID(),
        sessionId: action.sessionId,
        studentId: action.studentId,
        status: action.status,
        checkedAt: nowLabel(),
      };
      const session = state.offlineSessions.find((item) => item.id === action.sessionId);
      const nextState = {
        ...state,
        attendanceRecords: exists
          ? state.attendanceRecords.map((item) => item.id === exists.id ? record : item)
          : [record, ...state.attendanceRecords],
      };
      return audit(
        {
          ...nextState,
          sceneCompletions:
            session?.taskId && session.sceneId
              ? syncSceneCompletion(nextState, session.sceneId, action.studentId)
              : state.sceneCompletions,
        },
        createAudit("周启明", "记录课堂考勤", action.sessionId, `${action.studentId} · ${action.status}`),
      );
    }
    case "offline-session-create":
      return audit(
        {
          ...state,
          offlineSessions: [action.session, ...state.offlineSessions],
        },
        createAudit("周启明", "新建场景课堂", action.session.title, `${action.session.startAt} · ${action.session.location}`),
      );
    case "exam": {
      const attempt = {
        id: crypto.randomUUID(),
        studentId: state.activeStudentId,
        jobId: action.jobId,
        assessmentId: action.assessmentId,
        assessmentName: action.assessmentName,
        assessmentKind: action.assessmentKind,
        answers: action.answers,
        score: action.score,
        passScore: action.passScore,
        passed: action.score >= action.passScore,
        submittedAt: nowLabel(),
      };
      return audit(
        { ...state, examAttempts: [attempt, ...state.examAttempts] },
        createAudit(state.resume.name, "提交测评", action.assessmentId, `成绩 ${action.score} 分`),
      );
    }
    case "certificate": {
      if (state.certificates.some((item) => item.studentId === state.activeStudentId)) return state;
      const latestExam = [...state.examAttempts]
        .filter(
          (item) =>
            item.studentId === state.activeStudentId &&
            (item.assessmentKind ?? "试卷") !== "题库",
        )
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
      const requiredScene = state.resources
        .flatMap((resource) => resource.publishedContent?.kind === "scene" ? [resource.publishedContent.data] : [])
        .find(
          (scene) =>
            scene.required &&
            sceneProgressFor(state, scene.id, state.activeStudentId).status === "已完成",
        );
      const jobId = latestExam?.jobId ?? requiredScene?.jobId ?? "service";
      const definition = state.platformAdmin.certificates.find(
        (item) => item.category === "平台认证" && item.jobIds.includes(jobId),
      ) ?? state.platformAdmin.certificates.find((item) => item.category === "平台认证");
      const certificate = {
        id: crypto.randomUUID(),
        number: generatedCertificateNumber(state),
        studentId: state.activeStudentId,
        jobId,
        issuedAt: nowLabel(),
        definitionId: definition?.id,
      };
      return audit(
        { ...state, certificates: [certificate, ...state.certificates] },
        createAudit(state.resume.name, "领取结业凭证", certificate.number, "岗位能力条件已满足"),
      );
    }
    case "issue-certificate-for": {
      if (state.certificates.some((item) => item.studentId === action.studentId && item.definitionId === action.definitionId)) return state;
      const certificate = {
        id: crypto.randomUUID(),
        number: action.number,
        studentId: action.studentId,
        jobId: action.jobId,
        issuedAt: nowLabel(),
        definitionId: action.definitionId,
      };
      return audit(
        { ...state, certificates: [certificate, ...state.certificates] },
        createAudit("科来运营", "发放证书", certificate.number, action.definitionId),
      );
    }
    case "new-resource": {
      const majorGroups = action.resource.draftContent.kind === "job"
        ? syncMajorGroupsForJob(state.majorGroups, action.resource.draftContent.data)
        : state.majorGroups;
      return audit(
        { ...state, resources: [action.resource, ...state.resources], majorGroups },
        createAudit("科来运营", "新建资源", action.resource.name, `${action.resource.type}草稿`),
      );
    }
    case "update-resource": {
      const updatedResources = state.resources.map((item) =>
        item.id === action.id
          ? {
              ...item,
              ...action.patch,
              status: action.patch.status ?? (item.status === "已发布" ? "草稿" : item.status),
              updatedAt: nowLabel(),
              reviewNote: undefined,
              reviewHistory: [
                {
                  id: crypto.randomUUID(),
                  action: item.status === "已发布" ? "新版本" as const : "提交审核" as const,
                  actor: action.actor,
                  note: item.status === "已发布" ? "基于已发布版本创建新草稿" : "更新资源草稿",
                  at: nowLabel(),
                },
                ...item.reviewHistory,
              ],
            }
          : item,
      );
      const updated = updatedResources.find((item) => item.id === action.id);
      const majorGroups = updated?.draftContent.kind === "job"
        ? syncMajorGroupsForJob(state.majorGroups, updated.draftContent.data)
        : state.majorGroups;
      return audit(
        {
          ...state,
          resources: updatedResources,
          majorGroups,
        },
        createAudit(action.actor, "更新资源", action.id, "资源编排已保存为新草稿"),
      );
    }
    case "resource-action": {
      const target = state.resources.find((item) => item.id === action.id);
      if (!target) return state;
      if (
        action.action === "publish" &&
        resourceRightsBlockedReason(state, action.id, "教学使用")
      ) {
        return state;
      }
      const event = {
        id: crypto.randomUUID(),
        actor: "科来运营",
        note: action.note || action.action,
        at: nowLabel(),
      };
      if (action.action === "confirm-rights" || action.action === "reject-rights" || action.action === "revoke-rights") {
        const rights = target.rights;
        if (!rights) return state;
        const confirmed = action.action === "confirm-rights";
        const revoked = action.action === "revoke-rights";
        return audit(
          {
            ...state,
            resources: state.resources.map((item) =>
              item.id === action.id
                ? {
                    ...item,
                    rights: {
                      ...rights,
                      status: confirmed ? "已确权" as const : revoked ? "待确权" as const : "已驳回" as const,
                      reviewNote: confirmed ? "" : revoked ? "权属已撤回，需重新确认" : action.note || "请补充权属证明材料",
                      history: [
                        createAudit(
                          "科来运营",
                          confirmed ? "确认资源权属" : revoked ? "撤回资源权属" : "驳回资源权属",
                          item.name,
                          confirmed ? `${rights.ownership} · ${rights.agreementNo}` : revoked ? "权属状态撤回，前台停止使用" : action.note || "权属材料不完整",
                        ),
                        ...rights.history,
                      ],
                    },
                    updatedAt: nowLabel(),
                  }
                : item,
            ),
          },
          createAudit("科来运营", confirmed ? "确认资源权属" : revoked ? "撤回资源权属" : "驳回资源权属", target.name, action.note || target.rights.agreementNo),
        );
      }
      const approvalPlatform =
        target.type === "岗位" ? "career" :
          target.type === "场景" ? "scene" :
            target.type === "课程" || target.type === "教材" ? "course" :
              "ability";
      const approvalFlow = state.platformAdmin.workflows.find((item) => item.platformId === approvalPlatform);
      const approvalBatch = state.platformAdmin.batches.find((item) => item.platformId === approvalPlatform);
      const shouldCreateApproval =
        action.action === "submit" &&
        Boolean(approvalFlow) &&
        !state.platformAdmin.approvals.some(
          (item) => item.resourceId === target.id && item.status === "审批中",
        );
      const pendingApproval = shouldCreateApproval && approvalFlow
        ? {
            id: crypto.randomUUID(),
            resourceId: target.id,
            platformId: approvalPlatform,
            title: target.name,
            code: target.code ?? target.id,
            batchId: approvalBatch?.id,
            flowId: approvalFlow.id,
            submittedBy: "科来运营",
            submittedAt: event.at,
            status: "审批中" as const,
            currentStep: 0,
            steps: approvalFlow.steps.map((step, index) => ({
              id: `${target.id}-step-${index}`,
              ...step,
              state: "pending" as const,
            })),
          }
        : null;
      return audit(
        {
          ...state,
          resources: state.resources.map((item) => {
            if (item.id !== action.id) return item;
            if (action.action === "submit") {
              const rights = item.rights
                ? {
                    ...item.rights,
                    status: item.rights.status === "已确权" ? "已确权" as const : "审核中" as const,
                    reviewNote: "",
                    history: [createAudit("科来运营", "提交资源审核", item.name, "资源内容与权属材料进入审核"), ...item.rights.history],
                  }
                : item.rights;
              return {
                ...item,
                status: "待审核",
                rights,
                updatedAt: nowLabel(),
                reviewNote: undefined,
                reviewHistory: [{ ...event, action: "提交审核" as const }, ...item.reviewHistory],
              };
            }
            if (action.action === "publish") return {
              ...item,
              status: "已发布",
              publishedContent: JSON.parse(JSON.stringify(item.draftContent)),
              updatedAt: nowLabel(),
              reviewNote: undefined,
              reviewHistory: [{ ...event, action: "发布" as const }, ...item.reviewHistory],
            };
            if (action.action === "reject") return { ...item, status: "已驳回", updatedAt: nowLabel(), reviewNote: action.note || "请补充验收要求后重新提交", reviewHistory: [{ ...event, action: "驳回" as const }, ...item.reviewHistory] };
            if (action.action === "offline") return { ...item, status: "已下线", updatedAt: nowLabel(), reviewHistory: [{ ...event, action: "下线" as const }, ...item.reviewHistory] };
            if (action.action === "revise") return {
              ...item,
              status: "草稿",
              version: bumpVersion(item.version),
              rights: item.rights ? { ...item.rights, status: "待确权" as const, reviewNote: "新版本需重新确认权属" } : item.rights,
              updatedAt: nowLabel(),
              reviewHistory: [{ ...event, action: "新版本" as const }, ...item.reviewHistory],
            };
            return item;
          }),
          platformAdmin: pendingApproval
            ? {
                ...state.platformAdmin,
                approvals: [pendingApproval, ...state.platformAdmin.approvals],
              }
            : state.platformAdmin,
        },
        createAudit("科来运营", "资源流转", action.id, action.action),
      );
    }
    case "save-major-group": {
      const exists = state.majorGroups.some((item) => item.id === action.group.id);
      const majorGroups = exists
        ? state.majorGroups.map((item) => item.id === action.group.id ? action.group : item)
        : [action.group, ...state.majorGroups];
      const resources = state.resources.map((resource) => {
        if (resource.draftContent.kind !== "job") return resource;
        const updateJob = (job: JobProfile) => ({
          ...job,
          majorGroupIds: majorGroups.filter((group) => group.jobIds.includes(job.id)).map((group) => group.id),
        });
        return {
          ...resource,
          draftContent: { kind: "job" as const, data: updateJob(resource.draftContent.data) },
          publishedContent: resource.publishedContent?.kind === "job"
            ? { kind: "job" as const, data: updateJob(resource.publishedContent.data) }
            : resource.publishedContent,
        };
      });
      return audit(
        { ...state, majorGroups, resources },
        createAudit("业务管理员", exists ? "更新专业群" : "新建专业群", action.group.name, `${action.group.majors.length} 专业 · ${action.group.jobIds.length} 岗位`),
      );
    }
    case "update-major-group": {
      const updatedGroups = state.majorGroups.map((group) =>
        group.id === action.id ? { ...group, ...action.patch, updatedAt: nowLabel() } : group,
      );
      const resources = state.resources.map((resource) => {
        const content = resource.draftContent;
        const published = resource.publishedContent;
        const updateJob = (job: JobProfile) => ({
          ...job,
          majorGroupIds: updatedGroups.filter((group) => group.jobIds.includes(job.id)).map((group) => group.id),
        });
        return {
          ...resource,
          draftContent: content.kind === "job" ? { kind: "job" as const, data: updateJob(content.data) } : content,
          publishedContent: published?.kind === "job" ? { kind: "job" as const, data: updateJob(published.data) } : published,
        };
      });
      return audit(
        { ...state, majorGroups: updatedGroups, resources },
        createAudit("科来运营", "维护专业群适配", updatedGroups.find((group) => group.id === action.id)?.name ?? action.id, `专业 ${action.patch.majors.length} 个 · 岗位 ${action.patch.jobIds.length} 个`),
      );
    }
    case "standard":
      return audit(
        { ...state, standardWeights: action.weights },
        createAudit("科来运营", "更新评价标准", "技术服务工程师能力评价标准", `权重 ${action.weights.join(" / ")}`),
      );
    case "publish-project":
      return audit(
        { ...state, projects: [action.project, ...state.projects] },
        createAudit("科来运营", "发布产业项目", action.project.name, action.project.company),
      );
    case "toggle-project":
      return {
        ...state,
        projects: state.projects.map((item) =>
          item.id === action.id ? { ...item, status: item.status === "已发布" ? "已下线" : "已发布" } : item,
        ),
      };
    case "publish-job":
      return audit(
        { ...state, jobPostings: [action.posting, ...state.jobPostings] },
        createAudit("科来运营", "发布招聘岗位", action.posting.name, action.posting.company),
      );
    case "toggle-job":
      return {
        ...state,
        jobPostings: state.jobPostings.map((item) =>
          item.id === action.id ? { ...item, status: item.status === "已发布" ? "已下线" : "已发布" } : item,
        ),
      };
    case "apply":
      return audit(
        { ...state, applications: [action.application, ...state.applications] },
        createAudit(state.resume.name, action.application.kind === "project" ? "申请项目" : "投递岗位", action.application.name, action.application.company),
      );
    case "process-application": {
      const target = state.applications.find((item) => item.id === action.id);
      if (!target) return state;
      const event = createAudit("科来运营", `处理申请 · ${action.status}`, target.name, action.feedback || "状态已更新");
      const projectWorkStatus = target.kind === "project"
        ? action.status === "已接单"
          ? "进行中" as const
          : action.status === "已验收"
            ? "已完成" as const
            : undefined
        : undefined;
      return audit(
        {
          ...state,
          applications: state.applications.map((item) =>
            item.id === action.id
              ? {
                  ...item,
                  status: action.status,
                  feedback: action.feedback || item.feedback,
                  updatedAt: event.at,
                  history: [...item.history, event],
                }
              : item,
          ),
          projects: projectWorkStatus
            ? state.projects.map((project) =>
                project.id === target.targetId ? { ...project, workStatus: projectWorkStatus } : project,
              )
            : state.projects,
        },
        event,
      );
    }
    case "deliver": {
      const target = state.applications.find((item) => item.id === action.id);
      if (!target) return state;
      const event = createAudit(state.resume.name, "提交项目交付", target.name, "交付内容已提交验收");
      return audit(
        {
          ...state,
          applications: state.applications.map((item) =>
            item.id === action.id
              ? { ...item, status: "待验收", deliveryText: action.text, feedback: "", updatedAt: event.at, history: [...item.history, event] }
              : item,
          ),
        },
        event,
      );
    }
    case "course-progress": {
      const studentId = state.activeStudentId;
      const studentProgress = state.studentCourseProgress[studentId] ?? {};
      const current = studentProgress[action.courseId] ?? [];
      if (current.includes(action.chapterIndex)) return state;
      return audit(
        {
          ...state,
          studentCourseProgress: {
            ...state.studentCourseProgress,
            [studentId]: {
              ...studentProgress,
              [action.courseId]: [...current, action.chapterIndex].sort((a, b) => a - b),
            },
          },
        },
        createAudit(
          state.resume.name,
          "完成课程章节",
          action.courseId,
          `第 ${action.chapterIndex + 1} 章已记录`,
        ),
      );
    }
    case "save-learning-path": {
      const exists = state.learningPaths.some((item) => item.id === action.path.id);
      return audit(
        {
          ...state,
          learningPaths: exists
            ? state.learningPaths.map((item) => item.id === action.path.id ? action.path : item)
            : [action.path, ...state.learningPaths],
        },
        createAudit(
          "院校管理员",
          exists ? "更新岗位学习路径" : "新建岗位学习路径",
          action.path.name,
          `${action.path.sceneNodes.length} 个场景节点`,
        ),
      );
    }
    case "platform-admin":
      return { ...state, platformAdmin: action.state };
    case "approval-identity":
      return {
        ...state,
        platformAdmin: {
          ...state.platformAdmin,
          reviewerIdentity: action.identity,
        },
      };
    case "catalog-item": {
      const list = state[action.entity] as { id: string }[];
      if (!Array.isArray(list)) return state;
      const item = action.item as { id: string };
      const exists = list.some((entry) => entry.id === item.id);
      const next = exists
        ? list.map((entry) => (entry.id === item.id ? item : entry))
        : [item, ...list];
      const material = action.entity === "teachingMaterials" ? action.item as TeachingMaterial : undefined;
      const resources = material
        ? state.resources.map((resource) => ({
            ...resource,
            draftContent: syncMaterialContent(resource.draftContent, material),
            publishedContent: resource.publishedContent
              ? syncMaterialContent(resource.publishedContent, material)
              : undefined,
          }))
        : state.resources;
      const entityLabel = catalogEntityLabels[action.entity] ?? action.entity;
      const namedItem = item as { name?: string; title?: string };
      const itemLabel = namedItem.name || namedItem.title || item.id;
      return audit(
        { ...state, [action.entity]: next, resources } as EnterpriseWorkspaceState,
        createAudit(
          state.role === "schoolAdmin" ? "院校管理员" : "科来运营",
          exists ? `更新${entityLabel}` : `新建${entityLabel}`,
          itemLabel,
          action.entity,
        ),
      );
    }
    case "platform-record": {
      const exists = state.platformAdmin.records.some((item) => item.id === action.record.id);
      return audit(
        {
          ...state,
          platformAdmin: {
            ...state.platformAdmin,
            records: exists
              ? state.platformAdmin.records.map((item) => item.id === action.record.id ? action.record : item)
              : [action.record, ...state.platformAdmin.records],
          },
        },
        createAudit(
          "院校管理员",
          exists ? "更新业务记录" : "新建业务记录",
          action.record.name,
          `${action.record.platformId}/${action.record.pageId}`,
        ),
      );
    }
    case "certificate-enroll": {
      if (
        state.platformAdmin.enrollments.some(
          (item) =>
            item.certificateId === action.enrollment.certificateId &&
            item.studentId === action.enrollment.studentId,
        )
      ) {
        return state;
      }
      return audit(
        {
          ...state,
          platformAdmin: {
            ...state.platformAdmin,
            enrollments: [action.enrollment, ...state.platformAdmin.enrollments],
          },
        },
        createAudit(
          state.resume.name,
          "提交证书报名",
          action.enrollment.certificateId,
          action.enrollment.note,
        ),
      );
    }
    default:
      return state;
  }
}

function bumpVersion(version: string) {
  const value = Number(version.replace(/[^\d.]/g, "")) || 1;
  return `V${(value + 0.1).toFixed(1)}`;
}
