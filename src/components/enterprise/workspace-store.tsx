"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  WORKSPACE_STORAGE_KEY,
  createAudit,
  generatedCertificateNumber,
  jobById,
  nowLabel,
  projectEligibility,
  seedWorkspace,
  type Application,
  type ApplicationStatus,
  type EnterpriseWorkspaceState,
  type JobPosting,
  type OrderStatus,
  type ProjectPosting,
  type Resource,
  type Resume,
  type Review,
  type Role,
  type Work,
} from "@/lib/enterprise-workspace";

type Action =
  | { type: "hydrate"; state: EnterpriseWorkspaceState }
  | { type: "reset" }
  | { type: "role"; role: Role }
  | { type: "guide" }
  | { type: "resume"; resume: Resume }
  | { type: "favorite"; jobId: string }
  | { type: "assign-training"; trainingId: string }
  | { type: "complete-day"; day: number; trainingId: string }
  | { type: "submit-work"; work: Work }
  | { type: "review-work"; workId: string; review: Review }
  | { type: "exam"; score: number; answers: number[]; jobId: string; assessmentId: string }
  | { type: "certificate" }
  | { type: "new-resource"; resource: Resource }
  | { type: "update-resource"; id: string; patch: Partial<Resource>; actor: string }
  | { type: "resource-action"; id: string; action: "submit" | "publish" | "reject" | "offline" | "revise" | "authorize"; note?: string }
  | { type: "standard"; weights: number[] }
  | { type: "publish-project"; project: ProjectPosting }
  | { type: "toggle-project"; id: string }
  | { type: "publish-job"; posting: JobPosting }
  | { type: "toggle-job"; id: string }
  | { type: "apply"; application: Application }
  | { type: "process-application"; id: string; status: ApplicationStatus; feedback?: string }
  | { type: "deliver"; id: string; text: string }
  | { type: "order"; id: string; status: OrderStatus; note: string };

function audit(state: EnterpriseWorkspaceState, event: ReturnType<typeof createAudit>) {
  return { ...state, auditEvents: [event, ...state.auditEvents].slice(0, 120) };
}

function reducer(state: EnterpriseWorkspaceState, action: Action): EnterpriseWorkspaceState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return { ...seedWorkspace(), role: state.role };
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
    case "assign-training": {
      const assigned = Array.from(new Set([...state.classroom.assignedTrainingIds, action.trainingId]));
      return audit(
        { ...state, classroom: { ...state.classroom, assignedTrainingIds: assigned } },
        createAudit("周启明", "分配短训", state.classroom.name, `开放短训 ${action.trainingId}`),
      );
    }
    case "complete-day": {
      const current = state.trainingProgress?.[action.trainingId] ?? (action.trainingId === "network" ? state.completedDays : []);
      if (current.includes(action.day)) return state;
      return audit(
        {
          ...state,
          completedDays: action.trainingId === "network" ? [...current, action.day].sort((a, b) => a - b) : state.completedDays,
          trainingProgress: {
            ...state.trainingProgress,
            [action.trainingId]: [...current, action.day].sort((a, b) => a - b),
          },
        },
        createAudit(state.resume.name, "完成学习节点", `${action.trainingId} · DAY ${String(action.day).padStart(2, "0")}`, "学习记录已写入班级进度"),
      );
    }
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
    case "exam": {
      const attempt = {
        id: crypto.randomUUID(),
        studentId: state.activeStudentId,
        jobId: action.jobId,
        answers: action.answers,
        score: action.score,
        passed: action.score >= 80,
        submittedAt: nowLabel(),
      };
      return audit(
        { ...state, examAttempts: [attempt, ...state.examAttempts] },
        createAudit(state.resume.name, "提交测评", action.assessmentId, `成绩 ${action.score} 分`),
      );
    }
    case "certificate": {
      if (state.certificates.some((item) => item.studentId === state.activeStudentId)) return state;
      const certificate = {
        id: crypto.randomUUID(),
        number: generatedCertificateNumber(state),
        studentId: state.activeStudentId,
        jobId: "service",
        issuedAt: nowLabel(),
      };
      return audit(
        { ...state, certificates: [certificate, ...state.certificates] },
        createAudit(state.resume.name, "领取结业凭证", certificate.number, "岗位能力条件已满足"),
      );
    }
    case "new-resource":
      return audit(
        { ...state, resources: [action.resource, ...state.resources] },
        createAudit("科来运营", "新建资源", action.resource.name, `${action.resource.type}草稿`),
      );
    case "update-resource":
      return audit(
        {
          ...state,
          resources: state.resources.map((item) =>
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
                      action: item.status === "已发布" ? "新版本" : "提交审核",
                      actor: action.actor,
                      note: item.status === "已发布" ? "基于已发布版本创建新草稿" : "更新资源草稿",
                      at: nowLabel(),
                    },
                    ...item.reviewHistory,
                  ],
                }
              : item,
          ),
        },
        createAudit(action.actor, "更新资源", action.id, "资源编排已保存为新草稿"),
      );
    case "resource-action":
      return audit(
        {
          ...state,
          resources: state.resources.map((item) => {
            if (item.id !== action.id) return item;
            const event = {
              id: crypto.randomUUID(),
              actor: "科来运营",
              note: action.note || action.action,
              at: nowLabel(),
            };
            if (action.action === "submit") return { ...item, status: "待审核", updatedAt: nowLabel(), reviewNote: undefined, reviewHistory: [{ ...event, action: "提交审核" as const }, ...item.reviewHistory] };
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
            if (action.action === "revise") return { ...item, status: "草稿", version: bumpVersion(item.version), updatedAt: nowLabel(), reviewHistory: [{ ...event, action: "新版本" as const }, ...item.reviewHistory] };
            return {
              ...item,
              authorizedTo: item.authorizedTo.includes(state.activeSchoolId)
                ? item.authorizedTo.filter((id) => id !== state.activeSchoolId)
                : [...item.authorizedTo, state.activeSchoolId],
              updatedAt: nowLabel(),
            };
          }),
          authorizations:
            action.action === "authorize"
              ? (() => {
                  const exists = state.authorizations.some(
                    (item) => item.resourceId === action.id && item.schoolId === state.activeSchoolId && item.status === "有效",
                  );
                  if (exists) {
                    return state.authorizations.map((item) =>
                      item.resourceId === action.id && item.schoolId === state.activeSchoolId
                        ? { ...item, status: "已撤回" as const }
                        : item,
                    );
                  }
                  const resource = state.resources.find((item) => item.id === action.id);
                  return resource
                    ? [
                        {
                          id: crypto.randomUUID(),
                          resourceId: resource.id,
                          resourceVersion: resource.version,
                          schoolId: state.activeSchoolId,
                          scope: "网络工程专业",
                          expiresAt: "2027-12-31",
                          authorizedBy: "科来运营",
                          authorizedAt: nowLabel(),
                          status: "有效" as const,
                        },
                        ...state.authorizations,
                      ]
                    : state.authorizations;
                })()
              : state.authorizations,
        },
        createAudit("科来运营", "资源流转", action.id, action.action),
      );
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
    case "order": {
      const target = state.orders.find((item) => item.id === action.id);
      if (!target) return state;
      const event = createAudit("科来运营", `订单 · ${action.status}`, target.name, action.note);
      const packageResourceIds = Array.from(
        new Set([
          ...target.resourceIds,
          ...state.resources.filter((item) => item.packageId === target.packageId).map((item) => item.id),
        ]),
      );
      const resources =
        action.status === "已授权"
          ? state.resources.map((item) =>
              packageResourceIds.includes(item.id) && !item.authorizedTo.includes(state.activeSchoolId)
                ? { ...item, authorizedTo: [...item.authorizedTo, state.activeSchoolId] }
                : item,
            )
          : state.resources;
      return audit(
        {
          ...state,
          resources,
          authorizations:
            action.status === "已授权"
              ? [
                  ...packageResourceIds
                    .map((resourceId) => state.resources.find((item) => item.id === resourceId))
                    .filter((item): item is Resource => Boolean(item))
                    .map((resource) => ({
                      id: crypto.randomUUID(),
                      resourceId: resource.id,
                      resourceVersion: resource.version,
                      schoolId: target.schoolId,
                      scope: "网络工程专业",
                      expiresAt: "2027-12-31",
                      authorizedBy: "科来运营",
                      authorizedAt: event.at,
                      status: "有效" as const,
                    })),
                  ...state.authorizations.filter(
                    (item) => !packageResourceIds.includes(item.resourceId) || item.schoolId !== target.schoolId,
                  ),
                ]
              : state.authorizations,
          orders: state.orders.map((item) =>
            item.id === action.id ? { ...item, status: action.status, updatedAt: event.at, history: [...item.history, event] } : item,
          ),
        },
        event,
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

interface StoreValue {
  state: EnterpriseWorkspaceState;
  hydrated: boolean;
  setRole: (role: Role) => void;
  markGuideSeen: () => void;
  saveResume: (resume: Resume) => void;
  toggleFavorite: (jobId: string) => void;
  assignTraining: (trainingId: string) => void;
  completeDay: (day: number, trainingId?: string) => void;
  submitWork: (work: Work) => void;
  reviewWork: (workId: string, review: Review) => void;
  submitExam: (score: number, answers: number[], jobId?: string, assessmentId?: string) => void;
  issueCertificate: () => void;
  createResource: (resource: Resource) => void;
  updateResource: (id: string, patch: Partial<Resource>, actor: string) => void;
  resourceAction: (
    id: string,
    action: "submit" | "publish" | "reject" | "offline" | "revise" | "authorize",
    note?: string,
  ) => void;
  saveStandard: (weights: number[]) => void;
  publishProject: (project: ProjectPosting) => void;
  toggleProject: (id: string) => void;
  publishJob: (posting: JobPosting) => void;
  toggleJob: (id: string) => void;
  apply: (application: Application) => void;
  processApplication: (id: string, status: ApplicationStatus, feedback?: string) => void;
  submitDelivery: (id: string, text: string) => void;
  advanceOrder: (id: string, status: OrderStatus, note: string) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, seedWorkspace);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as EnterpriseWorkspaceState;
        if (parsed.schemaVersion === 3) dispatch({ type: "hydrate", state: { ...seedWorkspace(), ...parsed } });
      } else {
        const legacy = window.localStorage.getItem("colasoft-enterprise-v2");
        if (legacy) dispatch({ type: "hydrate", state: migrateV2(JSON.parse(legacy)) });
      }
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The UI remains usable when storage is unavailable.
    }
  }, [state, hydrated]);

  const value: StoreValue = {
    state,
    hydrated,
    setRole: (role) => dispatch({ type: "role", role }),
    markGuideSeen: () => dispatch({ type: "guide" }),
    saveResume: (resume) => dispatch({ type: "resume", resume }),
    toggleFavorite: (jobId) => dispatch({ type: "favorite", jobId }),
    assignTraining: (trainingId) => dispatch({ type: "assign-training", trainingId }),
    completeDay: (day, trainingId = "network") => dispatch({ type: "complete-day", day, trainingId }),
    submitWork: (work) => dispatch({ type: "submit-work", work }),
    reviewWork: (workId, review) => dispatch({ type: "review-work", workId, review }),
    submitExam: (score, answers, jobId = "service", assessmentId = "assessment-service") => dispatch({ type: "exam", score, answers, jobId, assessmentId }),
    issueCertificate: () => dispatch({ type: "certificate" }),
    createResource: (resource) => dispatch({ type: "new-resource", resource }),
    updateResource: (id, patch, actor) => dispatch({ type: "update-resource", id, patch, actor }),
    resourceAction: (id, resourceAction, note) => dispatch({ type: "resource-action", id, action: resourceAction, note }),
    saveStandard: (weights) => dispatch({ type: "standard", weights }),
    publishProject: (project) => dispatch({ type: "publish-project", project }),
    toggleProject: (id) => dispatch({ type: "toggle-project", id }),
    publishJob: (posting) => dispatch({ type: "publish-job", posting }),
    toggleJob: (id) => dispatch({ type: "toggle-job", id }),
    apply: (application) => dispatch({ type: "apply", application }),
    processApplication: (id, status, feedback) => dispatch({ type: "process-application", id, status, feedback }),
    submitDelivery: (id, text) => dispatch({ type: "deliver", id, text }),
    advanceOrder: (id, status, note) => dispatch({ type: "order", id, status, note }),
    reset: () => {
      window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      dispatch({ type: "reset" });
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function migrateV2(legacy: Partial<EnterpriseWorkspaceState> & { resources?: Array<Record<string, unknown>> }): EnterpriseWorkspaceState {
  const seed = seedWorkspace();
  const legacyResources: Resource[] = (legacy.resources ?? [])
    .filter((item) => !seed.resources.some((resource) => resource.id === item.id))
    .flatMap((item) => {
      const id = String(item.id ?? crypto.randomUUID());
      const type = String(item.type ?? "岗位") as Resource["type"];
      const name = String(item.name ?? "待完善资源");
      const description = String(item.description ?? "");
      const relatedIds = Array.isArray(item.relatedIds) ? item.relatedIds.map(String) : [];
      const content = (() => {
        if (type === "场景") {
          return {
            kind: "scene" as const,
            data: {
              id,
              name,
              industry: "待完善",
              jobId: "",
              difficulty: "进阶",
              description,
              required: false,
              tasks: [],
              evidence: [],
              answer: "",
              abilityWeights: [0, 0, 0, 0, 0, 0],
              courseIds: [],
              trainingIds: [],
            },
          };
        }
        if (type === "课程") {
          return { kind: "course" as const, data: { id, name, jobId: "", sceneId: "", chapters: [] } };
        }
        if (type === "测评") {
          return { kind: "assessment" as const, data: { id, name, jobId: "", durationMinutes: 30, passScore: 60, questions: [] } };
        }
        if (type === "评价标准") {
          return {
            kind: "standard" as const,
            data: { id, name, jobId: "", abilityPointWeights: [], levelBands: [], recognitionRule: "" },
          };
        }
        return {
          kind: "job" as const,
          data: {
            id,
            name,
            category: "待完善",
            stage: "技术服务",
            industry: "待完善",
            description,
            skills: [],
            target: [0, 0, 0, 0, 0, 0],
            requiredDimensions: [],
          },
        };
      })();
      return [{
        id,
        name,
        type,
        status: "草稿" as const,
        description,
        version: String(item.version ?? "V1.0"),
        packageId: String(item.packageId ?? "renewal"),
        authorizedTo: [],
        relatedIds,
        updatedAt: String(item.updatedAt ?? nowLabel()),
        draftContent: content,
        reviewHistory: [],
      }];
    });
  return {
    ...seed,
    role: legacy.role ?? null,
    teacherGuideSeen: legacy.teacherGuideSeen ?? false,
    works: legacy.works ?? seed.works,
    completedDays: legacy.completedDays ?? seed.completedDays,
    trainingProgress: {
      ...seed.trainingProgress,
      network: legacy.completedDays ?? seed.completedDays,
    },
    examAttempts: legacy.examAttempts ?? seed.examAttempts,
    certificates: legacy.certificates ?? seed.certificates,
    applications: legacy.applications ?? seed.applications,
    resume: legacy.resume ?? seed.resume,
    favorites: legacy.favorites ?? seed.favorites,
    auditEvents: legacy.auditEvents ?? seed.auditEvents,
    resources: [...seed.resources, ...legacyResources],
    orders: legacy.orders ?? seed.orders,
  } as EnterpriseWorkspaceState;
}

export function useWorkspace() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return value;
}

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
