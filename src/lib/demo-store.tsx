"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { contentReleaseChecks, draftChallenge, challengeForState, sessionLimit } from "@/lib/metrics";
import { CHALLENGES, PEOPLE, STORAGE_KEY, createSeedState } from "@/lib/mock-data";
import type { ContentDraft, DemoState, Review, Role, Submission, SubmissionStatus } from "@/lib/types";

interface DemoContextValue {
  state: DemoState;
  hydrated: boolean;
  setRole: (role: Role) => void;
  toggleStage: (submissionId: string, stageId: string) => void;
  toggleEvidence: (submissionId: string, evidenceId: string) => void;
  markPractice: (submissionId: string, change: { stageId?: string; evidenceId?: string }) => void;
  addDesktopMinutes: (submissionId: string, minutes: number) => void;
  resetDesktop: (submissionId: string) => void;
  saveDraft: (submissionId: string, deliverable: string, explanation: string) => void;
  submitWork: (submissionId: string, deliverable: string, explanation: string) => void;
  reviewWork: (submissionId: string, review: Review) => void;
  createContent: () => string;
  updateContentDraft: (challengeId: string, changes: Partial<ContentDraft>) => void;
  submitContentValidation: (challengeId: string) => void;
  publishContent: (challengeId: string) => void;
  withdrawContent: (challengeId: string) => void;
  iterateContent: (challengeId: string) => void;
  adjustQuota: (deltaHours: number) => void;
  setMaintenance: (maintenance: boolean) => void;
  setTimeoutMinutes: (minutes: number) => void;
  setContentRuntimeVersion: (version: string) => void;
  grantExtension: (submissionId: string) => void;
  confirmRoster: (classId: string) => void;
  setPreparation: (key: "teacherTrained" | "environmentChecked" | "challengePackConfirmed", value: boolean) => void;
  cycleSamplePack: () => void;
  requestSeats: (extra: number) => void;
  confirmSeats: () => void;
  requestUpdatePack: () => void;
  confirmUpdatePack: () => void;
  requestLocalCase: () => void;
  quoteLocalCase: () => void;
  acceptLocalCase: () => void;
  resetDemo: (role?: Role) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);
const SAMPLE_PACKS = ["2026 春季金融脱敏包", "2026 能源专网脱敏包", "2026 政务外联脱敏包"];

function nowLabel() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function canEdit(status: SubmissionStatus) {
  return status === "not_started" || status === "in_progress" || status === "returned";
}

function isReclaimed(state: DemoState, item: Submission) {
  return canEdit(item.status) && item.desktopMinutes >= sessionLimit(state.environment.timeoutMinutes, item.grantedMinutes);
}

function mapSubmission(
  state: DemoState,
  submissionId: string,
  updater: (current: Submission) => Submission,
) {
  return {
    ...state,
    submissions: state.submissions.map((item) => (item.id === submissionId ? updater(item) : item)),
  };
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(createSeedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as DemoState;
        if (saved.submissions?.length && saved.environment) {
          const seed = createSeedState();
          const legacyRosterImported = (saved as DemoState & { rosterImported?: boolean }).rosterImported;
          const savedSubmissions = new Map(saved.submissions.map((item) => [item.id, item]));
          setState({
            ...saved,
            demoDataRevision: 3,
            tenantQuotaHours: saved.demoDataRevision === 3 ? saved.tenantQuotaHours : Math.max(saved.tenantQuotaHours, seed.tenantQuotaHours),
            submissions: [...seed.submissions.map((item) => savedSubmissions.get(item.id) ?? item), ...saved.submissions.filter(item => !seed.submissions.some(seedItem => seedItem.id === item.id))],
            releasedContent: saved.releasedContent ?? {},
            contentEvents: saved.contentEvents ?? [],
            environment: {
              ...seed.environment,
              ...saved.environment,
              timeoutMinutes: saved.environment.timeoutMinutes ?? seed.environment.timeoutMinutes,
            },
            contentDrafts: {
              ...seed.contentDrafts,
              ...(saved.contentDrafts ?? {}),
            },
            seatRequest: typeof saved.seatRequest === "number" ? saved.seatRequest : 0,
            seatsConfirmed: saved.seatsConfirmed ?? false,
            rosterImportedByClass: {
              ...seed.rosterImportedByClass,
              ...(saved.rosterImportedByClass ?? {}),
              ...(legacyRosterImported === undefined ? {} : { "class-1": legacyRosterImported }),
            },
            teacherTrained: saved.teacherTrained ?? false,
            environmentChecked: saved.environmentChecked ?? false,
            challengePackConfirmed: saved.challengePackConfirmed ?? false,
            publishedChallengeIds: Array.isArray(saved.publishedChallengeIds)
              ? saved.demoDataRevision === 3 ? saved.publishedChallengeIds : [...new Set([...saved.publishedChallengeIds, "c8", "c9", "c10"])]
              : seed.publishedChallengeIds,
            selectedChallengeIds: Array.isArray(saved.publishedChallengeIds)
              ? [...saved.publishedChallengeIds]
              : [...seed.publishedChallengeIds],
            updatePackRequested: saved.updatePackRequested ?? false,
            updatePackConfirmed: saved.updatePackConfirmed ?? false,
            localCaseRequested: saved.localCaseRequested ?? false,
            localCaseQuoted: saved.localCaseQuoted ?? false,
            localCaseAccepted: saved.localCaseAccepted ?? false,
          });
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const setRole = useCallback((role: Role) => setState((current) => ({ ...current, role })), []);

  const toggleStage = useCallback((submissionId: string, stageId: string) => {
    setState((current) =>
      mapSubmission(current, submissionId, (item) => {
        if (!canEdit(item.status) || isReclaimed(current, item)) return item;
        const exists = item.completedStageIds.includes(stageId);
        return {
          ...item,
          status: item.status === "not_started" ? "in_progress" : item.status,
          completedStageIds: exists
            ? item.completedStageIds.filter((id) => id !== stageId)
            : [...item.completedStageIds, stageId],
          updatedAt: nowLabel(),
        };
      }),
    );
  }, []);

  const toggleEvidence = useCallback((submissionId: string, evidenceId: string) => {
    setState((current) =>
      mapSubmission(current, submissionId, (item) => {
        if (!canEdit(item.status) || isReclaimed(current, item)) return item;
        const exists = item.evidenceIds.includes(evidenceId);
        return {
          ...item,
          status: item.status === "not_started" ? "in_progress" : item.status,
          evidenceIds: exists
            ? item.evidenceIds.filter((id) => id !== evidenceId)
            : [...item.evidenceIds, evidenceId],
          updatedAt: nowLabel(),
        };
      }),
    );
  }, []);

  const markPractice = useCallback((submissionId: string, change: { stageId?: string; evidenceId?: string }) => {
    setState((current) =>
      mapSubmission(current, submissionId, (item) => {
        if (!canEdit(item.status) || isReclaimed(current, item)) return item;
        const stageAdded = Boolean(change.stageId && !item.completedStageIds.includes(change.stageId));
        const evidenceAdded = Boolean(change.evidenceId && !item.evidenceIds.includes(change.evidenceId));
        if (!stageAdded && !evidenceAdded) return item;
        return {
          ...item,
          status: item.status === "not_started" ? "in_progress" : item.status,
          completedStageIds: stageAdded && change.stageId ? [...item.completedStageIds, change.stageId] : item.completedStageIds,
          evidenceIds: evidenceAdded && change.evidenceId ? [...item.evidenceIds, change.evidenceId] : item.evidenceIds,
          updatedAt: nowLabel(),
        };
      }),
    );
  }, []);

  const addDesktopMinutes = useCallback((submissionId: string, minutes: number) => {
    setState((current) =>
      mapSubmission(current, submissionId, (item) => {
        const limit = sessionLimit(current.environment.timeoutMinutes, item.grantedMinutes);
        if (!canEdit(item.status) || item.desktopMinutes >= limit) return item;
        return {
          ...item,
          status: item.status === "not_started" ? "in_progress" : item.status,
          desktopMinutes: Math.min(limit, item.desktopMinutes + minutes),
          updatedAt: nowLabel(),
        };
      }),
    );
  }, []);

  const resetDesktop = useCallback((submissionId: string) => {
    setState((current) =>
      mapSubmission(current, submissionId, (item) => {
        if (!canEdit(item.status) || isReclaimed(current, item)) return item;
        return { ...item, evidenceIds: [], resets: item.resets + 1, updatedAt: nowLabel() };
      }),
    );
  }, []);

  const saveDraft = useCallback((submissionId: string, deliverable: string, explanation: string) => {
    setState((current) =>
      mapSubmission(current, submissionId, (item) => {
        if (!canEdit(item.status)) return item;
        return {
          ...item,
          deliverable,
          explanation,
          status: item.status === "not_started" || item.status === "returned" ? "in_progress" : item.status,
          updatedAt: nowLabel(),
        };
      }),
    );
  }, []);

  const submitWork = useCallback((submissionId: string, deliverable: string, explanation: string) => {
    setState((current) =>
      mapSubmission(current, submissionId, (item) => {
        if (!canEdit(item.status)) return item;
        return { ...item, deliverable, explanation, challengeSnapshot: challengeForState(current, item.challengeId), status: "submitted", updatedAt: nowLabel() };
      }),
    );
  }, []);

  const reviewWork = useCallback((submissionId: string, review: Review) => {
    setState((current) =>
      mapSubmission(current, submissionId, (item) => ({
        ...item,
        status: review.decision === "passed" ? "passed" : "returned",
        review,
        updatedAt: review.reviewedAt,
      })),
    );
  }, []);

  const createContent = useCallback(() => {
    const id = `custom-${crypto.randomUUID().slice(0, 8)}`;
    setState(current => ({ ...current, contentDrafts: { ...current.contentDrafts, [id]: {
      challengeId: id, stage: "draft", title: "未命名实战挑战", version: "2026.1.1", abilities: [], targetJobs: "", industries: "", scene: "", targetProblem: "", stageSummary: "", acceptanceMetrics: "", expertTemplate: "", requiredEnvironmentVersion: "2026.1", tenantIds: ["tenant-jiangcheng"], updatedAt: nowLabel(),
    } } }));
    return id;
  }, []);

  const updateContentDraft = useCallback((challengeId: string, changes: Partial<ContentDraft>) => {
    setState(current => {
      const draft = current.contentDrafts[challengeId];
      if (!draft || draft.stage === "published" || draft.stage === "offline") return current;
      return { ...current, contentDrafts: { ...current.contentDrafts, [challengeId]: { ...draft, ...changes, stage: "draft", updatedAt: nowLabel() } } };
    });
  }, []);

  const submitContentValidation = useCallback((challengeId: string) => {
    setState(current => {
      const draft = current.contentDrafts[challengeId];
      if (!draft || draft.stage !== "draft") return current;
      return { ...current, contentDrafts: { ...current.contentDrafts, [challengeId]: { ...draft, stage: "pending", updatedAt: nowLabel() } } };
    });
  }, []);

  const publishContent = useCallback((challengeId: string) => {
    setState(current => {
      const draft = current.contentDrafts[challengeId];
      if (!draft || draft.stage !== "pending" || contentReleaseChecks(current, draft).some(item => !item.passed)) return current;
      const definition = draftChallenge(draft, CHALLENGES.find(item => item.id === challengeId));
      const at = nowLabel();
      return {
        ...current, publishedChallengeIds: [...new Set([...current.publishedChallengeIds, challengeId])], selectedChallengeIds: [...new Set([...current.selectedChallengeIds, challengeId])],
        releasedContent: { ...current.releasedContent, [challengeId]: definition },
        contentEvents: [{ id: `${challengeId}-${Date.now()}`, challengeId, action: "发布", version: draft.version, at }, ...(current.contentEvents ?? [])],
        submissions: [...current.submissions.map(item => item.challengeId === challengeId && item.status !== "not_started" && !item.challengeSnapshot ? { ...item, challengeSnapshot: challengeForState(current, challengeId) } : item), ...PEOPLE.filter(person => person.role === "student" && !current.submissions.some(item => item.studentId === person.id && item.challengeId === challengeId)).map(person => ({ id: `${person.id}-${challengeId}`, challengeId, studentId: person.id, status: "not_started" as const, completedStageIds: [], deliverable: "", explanation: "", evidenceIds: [], desktopMinutes: 0, resets: 0, updatedAt: at }))],
        contentDrafts: { ...current.contentDrafts, [challengeId]: { ...draft, definition, stage: "published", publishedAt: at, updatedAt: at } },
      };
    });
  }, []);

  const withdrawContent = useCallback((challengeId: string) => {
    setState(current => {
      const draft = current.contentDrafts[challengeId];
      if (!draft || !current.publishedChallengeIds.includes(challengeId)) return current;
      const at = nowLabel();
      return { ...current, publishedChallengeIds: current.publishedChallengeIds.filter(id => id !== challengeId), selectedChallengeIds: current.selectedChallengeIds.filter(id => id !== challengeId),
        contentEvents: [{ id: `${challengeId}-${Date.now()}`, challengeId, action: "下线", version: current.releasedContent?.[challengeId]?.version ?? draft.version, at }, ...(current.contentEvents ?? [])],
        contentDrafts: { ...current.contentDrafts, [challengeId]: { ...draft, stage: "offline", updatedAt: at } } };
    });
  }, []);

  const iterateContent = useCallback((challengeId: string) => {
    setState(current => {
      const original = current.contentDrafts[challengeId];
      const base = challengeForState(current, challengeId);
      if (!base || (original && original.stage !== "published" && original.stage !== "offline")) return current;
      const version = `${base.version.split(".").slice(0, 2).join(".")}.${Number(base.version.split(".")[2] ?? 0) + 1}`;
      const at = nowLabel();
      const draft: ContentDraft = { challengeId, definition: base, title: base.title, version, abilities: base.abilities, targetJobs: original?.targetJobs ?? "网络分析、技术服务、可观测性工程", industries: original?.industries ?? "院校行业实训", scene: base.scene, targetProblem: base.summary, stageSummary: base.stages.map(item => item.title).join(" → "), acceptanceMetrics: base.criteria.join("；"), expertTemplate: base.expertAnswer, requiredEnvironmentVersion: original?.requiredEnvironmentVersion ?? "2026.1", tenantIds: original?.tenantIds ?? ["tenant-jiangcheng"], stage: "draft", updatedAt: at };
      return { ...current, releasedContent: { ...current.releasedContent, [challengeId]: base }, contentDrafts: { ...current.contentDrafts, [challengeId]: draft }, contentEvents: [{ id: `${challengeId}-${Date.now()}`, challengeId, action: "创建迭代草稿", version, at }, ...(current.contentEvents ?? [])] };
    });
  }, []);

  const adjustQuota = useCallback((deltaHours: number) => {
    setState((current) => {
      const consumed = Math.ceil(
        (current.historicalMinutes + current.submissions.reduce((sum, item) => sum + item.desktopMinutes, 0)) / 60,
      );
      return { ...current, tenantQuotaHours: Math.max(consumed, current.tenantQuotaHours + deltaHours) };
    });
  }, []);

  const setMaintenance = useCallback((maintenance: boolean) => {
    setState((current) => ({ ...current, environment: { ...current.environment, maintenance } }));
  }, []);

  const grantExtension = useCallback((submissionId: string) => {
    setState((current) =>
      mapSubmission(current, submissionId, (item) => {
        if (!isReclaimed(current, item)) return item;
        return { ...item, grantedMinutes: Math.min(60, (item.grantedMinutes ?? 0) + 15), updatedAt: nowLabel() };
      }),
    );
  }, []);

  const confirmRoster = useCallback((classId: string) => {
    setState((current) => ({
      ...current,
      rosterImportedByClass: {
        ...current.rosterImportedByClass,
        [classId]: true,
      },
    }));
  }, []);

  const setPreparation = useCallback((key: "teacherTrained" | "environmentChecked" | "challengePackConfirmed", value: boolean) => {
    setState((current) => ({ ...current, [key]: value }));
  }, []);

  const setTimeoutMinutes = useCallback((minutes: number) => {
    setState((current) => ({
      ...current,
      environment: {
        ...current.environment,
        timeoutMinutes: Math.min(180, Math.max(15, minutes)),
      },
    }));
  }, []);

  const setContentRuntimeVersion = useCallback((version: string) => {
    setState((current) => ({
      ...current,
      environment: {
        ...current.environment,
        contentRuntimeVersion: version,
        health: "healthy",
      },
    }));
  }, []);

  const cycleSamplePack = useCallback(() => {
    setState((current) => {
      const index = SAMPLE_PACKS.indexOf(current.environment.samplePack);
      return {
        ...current,
        environment: { ...current.environment, samplePack: SAMPLE_PACKS[(index + 1) % SAMPLE_PACKS.length] },
      };
    });
  }, []);

  const requestSeats = useCallback((extra: number) => {
    setState((current) => ({ ...current, seatRequest: Math.min(40, (current.seatRequest ?? 0) + extra), seatsConfirmed: false }));
  }, []);

  const confirmSeats = useCallback(() => {
    setState((current) => (current.seatRequest > 0 ? { ...current, seatsConfirmed: true } : current));
  }, []);

  const requestUpdatePack = useCallback(() => {
    setState((current) => ({ ...current, updatePackRequested: true }));
  }, []);

  const confirmUpdatePack = useCallback(() => {
    setState((current) => {
      if (!current.updatePackRequested) return current;
      return {
        ...current,
        updatePackConfirmed: true,
      };
    });
  }, []);

  const requestLocalCase = useCallback(() => {
    setState((current) => ({ ...current, localCaseRequested: true }));
  }, []);

  const quoteLocalCase = useCallback(() => {
    setState((current) => (current.localCaseRequested ? { ...current, localCaseQuoted: true } : current));
  }, []);

  const acceptLocalCase = useCallback(() => {
    setState((current) => (current.localCaseQuoted ? { ...current, localCaseAccepted: true } : current));
  }, []);

  const resetDemo = useCallback((role?: Role) => {
    window.localStorage.removeItem(STORAGE_KEY);
    const next = createSeedState();
    setState(role ? { ...next, role } : next);
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      state,
      hydrated,
      setRole,
      toggleStage,
      toggleEvidence,
      markPractice,
      addDesktopMinutes,
      resetDesktop,
      saveDraft,
      submitWork,
      reviewWork,
      createContent,
      updateContentDraft,
      submitContentValidation,
      publishContent,
      withdrawContent,
      iterateContent,
      adjustQuota,
      setMaintenance,
      setTimeoutMinutes,
      setContentRuntimeVersion,
      grantExtension,
      confirmRoster,
      setPreparation,
      cycleSamplePack,
      requestSeats,
      confirmSeats,
      requestUpdatePack,
      confirmUpdatePack,
      requestLocalCase,
      quoteLocalCase,
      acceptLocalCase,
      resetDemo,
    }),
    [
      state,
      hydrated,
      setRole,
      toggleStage,
      toggleEvidence,
      markPractice,
      addDesktopMinutes,
      resetDesktop,
      saveDraft,
      submitWork,
      reviewWork,
      createContent,
      updateContentDraft,
      submitContentValidation,
      publishContent,
      withdrawContent,
      iterateContent,
      adjustQuota,
      setMaintenance,
      setTimeoutMinutes,
      setContentRuntimeVersion,
      grantExtension,
      confirmRoster,
      setPreparation,
      cycleSamplePack,
      requestSeats,
      confirmSeats,
      requestUpdatePack,
      confirmUpdatePack,
      requestLocalCase,
      quoteLocalCase,
      acceptLocalCase,
      resetDemo,
    ],
  );

  return <DemoContext.Provider value={value}>{hydrated ? children : <div className="demo-loading" role="status">正在载入实训工作空间…</div>}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo 必须在 DemoProvider 内使用");
  return context;
}
