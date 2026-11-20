"use client";

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from "react";
import {
  WORKSPACE_STORAGE_KEY,
  LEGACY_WORKSPACE_STORAGE_KEY,
  seedWorkspace,
  type Application,
  type ApplicationStatus,
  type EnterpriseWorkspaceState,
  type JobLearningPath,
  type JobPosting,
  type MajorGroup,
  type OrderStatus,
  type OfflineSession,
  type ProjectPosting,
  type Resource,
  type Resume,
  type Review,
  type Role,
  type TaskAssessmentResult,
  type TaskReview,
  type TaskSubmission,
  type Work,
} from "@/lib/enterprise-workspace";
import {
  type ApprovalIdentity,
  type CertificateEnrollment,
  type PlatformAdminState,
  type PlatformRecord,
} from "@/lib/platform-admin";
import { reducer } from "./reducer";
import { migrateV2, migrateV3 } from "./migrations";

export { buildApplication, buildWork, canApplyProject, applicationJobScore, jobStatusOptions, projectStatusOptions } from "./factories";

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
  saveTask: (submission: TaskSubmission) => void;
  submitTask: (submission: TaskSubmission) => void;
  reviewTask: (submissionId: string, review: TaskReview) => void;
  recordAssessment: (sceneId: string, taskId: string, result: TaskAssessmentResult, studentId?: string) => void;
  checkInSession: (sessionId: string) => void;
  updateOfflineSession: (id: string, status: "待开始" | "进行中" | "已结束") => void;
  markAttendance: (sessionId: string, studentId: string, status: "已签到" | "迟到" | "缺席") => void;
  createOfflineSession: (session: OfflineSession) => void;
  submitExam: (
    score: number,
    answers: number[],
    jobId: string,
    assessmentId: string,
    assessmentName: string,
    assessmentKind: "题库" | "试卷",
    passScore: number,
  ) => void;
  issueCertificate: () => void;
  createResource: (resource: Resource) => void;
  updateResource: (id: string, patch: Partial<Resource>, actor: string) => void;
  resourceAction: (
    id: string,
    action: "submit" | "publish" | "reject" | "offline" | "revise" | "authorize" | "confirm-rights" | "reject-rights" | "revoke-rights",
    note?: string,
  ) => void;
  updateMajorGroup: (id: string, patch: Pick<MajorGroup, "majors" | "jobIds">) => void;
  saveStandard: (weights: number[]) => void;
  publishProject: (project: ProjectPosting) => void;
  toggleProject: (id: string) => void;
  publishJob: (posting: JobPosting) => void;
  toggleJob: (id: string) => void;
  apply: (application: Application) => void;
  processApplication: (id: string, status: ApplicationStatus, feedback?: string) => void;
  submitDelivery: (id: string, text: string) => void;
  advanceOrder: (id: string, status: OrderStatus, note: string) => void;
  completeChapter: (courseId: string, chapterIndex: number) => void;
  saveLearningPath: (path: JobLearningPath) => void;
  replacePlatformAdmin: (state: PlatformAdminState) => void;
  setApprovalIdentity: (identity: ApprovalIdentity) => void;
  savePlatformRecord: (record: PlatformRecord) => void;
  enrollCertificate: (enrollment: CertificateEnrollment) => void;
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
        const savedVersion = Number((parsed as { schemaVersion?: number }).schemaVersion);
        if (savedVersion >= 5 && savedVersion <= 10) {
          const base = seedWorkspace();
          const mergingExpandedCatalog = savedVersion < 9;
          const savedResourceIds = new Set((parsed.resources ?? []).map((item) => item.id));
          const savedPostingIds = new Set((parsed.jobPostings ?? []).map((item) => item.id));
          const savedProjectIds = new Set((parsed.projects ?? []).map((item) => item.id));
          const savedSchoolIds = new Set((parsed.schools ?? []).map((item) => item.id));
          const savedSchedules = parsed.platformAdmin?.examSchedules ?? [];
          const savedScheduleIds = new Set(savedSchedules.map((item) => item.id));
          const savedCertificateIds = new Set((parsed.platformAdmin?.certificates ?? []).map((item) => item.id));
          dispatch({
            type: "hydrate",
            state: {
              ...base,
              ...parsed,
              schemaVersion: 10,
              resources: mergingExpandedCatalog
                ? [
                    ...base.resources.filter((item) => !savedResourceIds.has(item.id)),
                    ...(parsed.resources ?? []),
                  ]
                : parsed.resources ?? base.resources,
              jobPostings: mergingExpandedCatalog
                ? [
                    ...base.jobPostings
                      .filter((item) => !savedPostingIds.has(item.id))
                      .map((item) => item),
                    ...(parsed.jobPostings ?? []).map((item) => ({
                      ...base.jobPostings.find((seed) => seed.id === item.id),
                      ...item,
                    })),
                  ]
                : (parsed.jobPostings ?? base.jobPostings).map((item) => ({
                    ...base.jobPostings.find((seed) => seed.id === item.id),
                    ...item,
                  })),
              examAttempts: (parsed.examAttempts ?? []).map((item) => ({
                ...item,
                assessmentId: item.assessmentId ?? "assessment-service",
                assessmentName: item.assessmentName ?? "岗位综合测评",
                assessmentKind: item.assessmentKind ?? "试卷",
                passScore: item.passScore ?? 80,
              })),
              taskSubmissions: (parsed.taskSubmissions ?? []).map((item) => ({
                ...item,
                assessmentResults: item.assessmentResults ?? [],
              })),
              sceneCompletions: parsed.sceneCompletions ?? [],
              learningPaths: mergingExpandedCatalog
                ? base.learningPaths
                : parsed.learningPaths ?? base.learningPaths,
              projects: mergingExpandedCatalog
                ? [
                    ...base.projects.filter((item) => !savedProjectIds.has(item.id)),
                    ...(parsed.projects ?? []).map((item) => ({
                      ...base.projects.find((seed) => seed.id === item.id),
                      ...item,
                    })),
                  ]
                : (parsed.projects ?? base.projects).map((item) => ({
                    ...base.projects.find((seed) => seed.id === item.id),
                    ...item,
                  })),
              schools: mergingExpandedCatalog
                ? [
                    ...base.schools.filter((item) => !savedSchoolIds.has(item.id)),
                    ...(parsed.schools ?? []),
                  ]
                : parsed.schools ?? base.schools,
              offlineSessions: parsed.offlineSessions ?? base.offlineSessions,
              attendanceRecords: parsed.attendanceRecords ?? [],
              platformAdmin: parsed.platformAdmin
                ? {
                    ...base.platformAdmin,
                    ...parsed.platformAdmin,
                    examSchedules: [
                      ...base.platformAdmin.examSchedules.filter(
                        (item) => !savedScheduleIds.has(item.id),
                      ),
                      ...savedSchedules,
                    ],
                    certificates: mergingExpandedCatalog
                      ? [
                          ...base.platformAdmin.certificates.filter((item) => !savedCertificateIds.has(item.id)),
                          ...(parsed.platformAdmin?.certificates ?? []),
                        ]
                      : parsed.platformAdmin.certificates ?? base.platformAdmin.certificates,
                  }
                : base.platformAdmin,
            },
          });
        }
      } else {
        const legacyV3 = window.localStorage.getItem(LEGACY_WORKSPACE_STORAGE_KEY);
        if (legacyV3) {
          dispatch({ type: "hydrate", state: migrateV3(JSON.parse(legacyV3)) });
        } else {
          const legacy = window.localStorage.getItem("colasoft-enterprise-v2");
          if (legacy) dispatch({ type: "hydrate", state: migrateV2(JSON.parse(legacy)) });
        }
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
    saveTask: (submission) => dispatch({ type: "task-save", submission }),
    submitTask: (submission) => dispatch({ type: "task-submit", submission }),
    reviewTask: (submissionId, review) => dispatch({ type: "task-review", submissionId, review }),
    recordAssessment: (sceneId, taskId, result, studentId) => dispatch({ type: "assessment-result", sceneId, taskId, result, studentId }),
    checkInSession: (sessionId) => dispatch({ type: "offline-checkin", sessionId }),
    updateOfflineSession: (id, status) => dispatch({ type: "offline-session-status", id, status }),
    markAttendance: (sessionId, studentId, status) => dispatch({ type: "attendance-mark", sessionId, studentId, status }),
    createOfflineSession: (session) => dispatch({ type: "offline-session-create", session }),
    submitExam: (score, answers, jobId, assessmentId, assessmentName, assessmentKind, passScore) =>
      dispatch({
        type: "exam",
        score,
        answers,
        jobId,
        assessmentId,
        assessmentName,
        assessmentKind,
        passScore,
      }),
    issueCertificate: () => dispatch({ type: "certificate" }),
    createResource: (resource) => dispatch({ type: "new-resource", resource }),
    updateResource: (id, patch, actor) => dispatch({ type: "update-resource", id, patch, actor }),
    resourceAction: (id, resourceAction, note) => dispatch({ type: "resource-action", id, action: resourceAction, note }),
    updateMajorGroup: (id, patch) => dispatch({ type: "update-major-group", id, patch }),
    saveStandard: (weights) => dispatch({ type: "standard", weights }),
    publishProject: (project) => dispatch({ type: "publish-project", project }),
    toggleProject: (id) => dispatch({ type: "toggle-project", id }),
    publishJob: (posting) => dispatch({ type: "publish-job", posting }),
    toggleJob: (id) => dispatch({ type: "toggle-job", id }),
    apply: (application) => dispatch({ type: "apply", application }),
    processApplication: (id, status, feedback) => dispatch({ type: "process-application", id, status, feedback }),
    submitDelivery: (id, text) => dispatch({ type: "deliver", id, text }),
    advanceOrder: (id, status, note) => dispatch({ type: "order", id, status, note }),
    completeChapter: (courseId, chapterIndex) => dispatch({ type: "course-progress", courseId, chapterIndex }),
    saveLearningPath: (path) => dispatch({ type: "save-learning-path", path }),
    replacePlatformAdmin: (platformAdmin) => dispatch({ type: "platform-admin", state: platformAdmin }),
    setApprovalIdentity: (identity) => dispatch({ type: "approval-identity", identity }),
    savePlatformRecord: (record) => dispatch({ type: "platform-record", record }),
    enrollCertificate: (enrollment) => dispatch({ type: "certificate-enroll", enrollment }),
    reset: () => {
      window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_WORKSPACE_STORAGE_KEY);
      window.localStorage.removeItem("colasoft-enterprise-v2");
      dispatch({ type: "reset" });
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return value;
}
