import { ABILITIES, CAREERS, CHALLENGES, CLASSROOM, CLASSROOMS, PEOPLE } from "@/lib/mock-data";
import type {
  AbilityKey,
  Challenge,
  ClassRoom,
  ContentDraft,
  DemoState,
  Submission,
  SubmissionStatus,
} from "@/lib/types";
import { average } from "@/lib/utils";

function resolveClassroom(classroom?: ClassRoom | string) {
  if (!classroom) return CLASSROOM;
  if (typeof classroom !== "string") return classroom;
  return CLASSROOMS.find((item) => item.id === classroom) ?? CLASSROOM;
}

export function classroomById(id: string) {
  return CLASSROOMS.find((item) => item.id === id);
}

export function classroomOfStudent(studentId: string) {
  return CLASSROOMS.find((item) => item.studentIds.includes(studentId));
}

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  not_started: "未开始",
  in_progress: "进行中",
  submitted: "待验收",
  returned: "已退回",
  passed: "已通过",
};

export function personById(id: string) {
  return PEOPLE.find((person) => person.id === id);
}

export function challengeById(id: string) {
  return CHALLENGES.find((challenge) => challenge.id === id);
}

export function draftChallenge(draft: ContentDraft, base?: Challenge): Challenge {
  const definition = draft.definition ?? base;
  return {
    ...(definition ?? { id: draft.challengeId, code: draft.challengeId.toUpperCase(), required: false, difficulty: "进阶", minutes: 45, stages: [], pitfalls: [], teacherGuide: "依据验收指标与专家范本核验交付物。", tools: ["科来云端实训环境"], sample: "院校脱敏教学样本", evidence: [] }),
    title: draft.title, version: draft.version, abilities: draft.abilities,
    scene: draft.scene, summary: draft.targetProblem,
    criteria: draft.acceptanceMetrics.split(/[；\n]/).map(item => item.trim()).filter(Boolean),
    expertAnswer: draft.expertTemplate,
  };
}

export function contentCatalog(state: DemoState) {
  const ids = [...new Set([...CHALLENGES.map(item => item.id), ...Object.keys(state.contentDrafts)])];
  return ids.map(id => {
    const base = CHALLENGES.find(item => item.id === id);
    const draft = state.contentDrafts[id];
    return state.releasedContent?.[id] ?? (draft && (!base || draft.stage === "published") ? draftChallenge(draft, base) : base!);
  });
}

export function challengeForState(state: DemoState, id: string) {
  return contentCatalog(state).find((challenge) => challenge.id === id);
}

export function recordedChallenges(state: DemoState, studentId?: string) {
  return contentCatalog(state).filter(challenge => state.publishedChallengeIds.includes(challenge.id) || state.submissions.some(item => item.challengeId === challenge.id && (!studentId || item.studentId === studentId) && item.status !== "not_started"));
}

export function visibleChallenges(state: DemoState) {
  return contentCatalog(state).filter((challenge) => state.publishedChallengeIds.includes(challenge.id));
}

function compareVersion(left: string, right: string) {
  const normalize = (value: string) => value.split(".").map((item) => Number(item.replace(/\D.*$/, "")) || 0);
  const a = normalize(left);
  const b = normalize(right);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] ?? 0) !== (b[index] ?? 0)) return (a[index] ?? 0) - (b[index] ?? 0);
  }
  return 0;
}

export interface ContentReleaseCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  actionHref?: string;
}

export function contentReleaseChecks(state: DemoState, draft: ContentDraft): ContentReleaseCheck[] {
  const definition = draft.definition ?? CHALLENGES.find(item => item.id === draft.challengeId);
  const structureReady = Boolean(definition && definition.stages.length && definition.evidence.length && definition.stages.every(item => item.title.trim() && item.prompt.trim()) && definition.evidence.every(item => item.title.trim() && item.detail.trim()) && definition.teacherGuide.trim() && definition.sample.trim());
  const requiredFields = [
    draft.title,
    draft.version,
    draft.targetJobs,
    draft.industries,
    draft.scene,
    draft.targetProblem,
    draft.stageSummary,
    draft.acceptanceMetrics,
    draft.expertTemplate,
    draft.requiredEnvironmentVersion,
  ];
  const releasedVersion = state.releasedContent?.[draft.challengeId]?.version;
  const validVersion = /^\d+\.\d+(\.\d+)?$/.test(draft.version) && /^\d+\.\d+(\.\d+)?$/.test(draft.requiredEnvironmentVersion) && (!releasedVersion || draft.stage === "published" || draft.stage === "offline" || compareVersion(draft.version, releasedVersion) > 0);
  const complete = requiredFields.every((item) => item.trim()) && draft.abilities.length > 0 && draft.tenantIds.length > 0;
  const tenantAuthorized = draft.tenantIds.length > 0 && draft.tenantIds.every(id => id === "tenant-jiangcheng") && (draft.requiredEnvironmentVersion !== "2026.2" || state.updatePackConfirmed);
  return [
    { id: "version", label: "版本有效性", passed: validVersion, detail: validVersion ? "版本格式有效，新迭代高于当前发布版。" : "请使用数字版本（例如 2026.1.1），迭代版本须高于当前发布版。" },
    { id: "structure", label: "教学结构与资源", passed: structureReady, detail: structureReady ? "学习阶段、取证线索、教师导引与样本已配置。" : "至少配置一个完整阶段、一条完整证据，以及教师导引和样本名称。" },
    {
      id: "required",
      label: "必选字段与能力块",
      passed: complete,
      detail: complete ? "标题、版本、场景、指标、范本及租户范围均已填写。" : "仍有必选字段、能力块或租户范围为空。",
    },
    {
      id: "authorization",
      label: "租户更新包授权",
      passed: tenantAuthorized,
      detail: tenantAuthorized ? "目标租户已具备年度更新包权限。" : "当前仅接通江城理工租户；2026.2 更新内容需先确认年度更新包。",
      actionHref: "/operator/tenants?from=content",
    },
  ];
}

export function submissionOf(state: DemoState, studentId: string, challengeId: string) {
  return state.submissions.find(
    (item) => item.studentId === studentId && item.challengeId === challengeId,
  );
}

export function sessionLimit(timeoutMinutes: number | undefined, grantedMinutes?: number) {
  return (timeoutMinutes ?? 40) + (grantedMinutes ?? 0);
}

export function desktopClock(timeoutMinutes: number | undefined, submission?: Submission) {
  const used = submission?.desktopMinutes ?? 0;
  const granted = submission?.grantedMinutes ?? 0;
  const limit = sessionLimit(timeoutMinutes, granted);
  const remaining = Math.max(0, limit - used);
  const editable = submission?.status === "in_progress" || submission?.status === "returned";
  return {
    used,
    granted,
    limit,
    remaining,
    reclaimed: Boolean(editable && used >= limit),
    locked: submission?.status === "submitted" || submission?.status === "passed",
  };
}

export function openChallengeForAbility(state: DemoState, studentId: string, key: AbilityKey) {
  const related = visibleChallenges(state).filter((item) => item.abilities.includes(key));
  return related.find((item) => submissionOf(state, studentId, item.id)?.status !== "passed") ?? related[0];
}

export function nextPractice(state: DemoState, studentId: string) {
  const scores = abilityScores(state, studentId);
  const ranked = [...ABILITIES].sort((a, b) => {
    const delta = scores[a.key] - scores[b.key];
    if (delta !== 0) return delta;
    return Number(b.required) - Number(a.required);
  });
  for (const ability of ranked) {
    const challenge = visibleChallenges(state).find(
      (item) =>
        item.abilities.includes(ability.key) &&
        submissionOf(state, studentId, item.id)?.status !== "passed",
    );
    if (!challenge) continue;
    return { ability, score: scores[ability.key], challenge };
  }
  return null;
}

export function isModuleHeld(state: DemoState, studentId: string, challengeId: string) {
  const challenge = challengeById(challengeId);
  if (!challenge?.required || !challenge.abilities.includes("report")) return false;
  return !visibleChallenges(state).some(
    (item) =>
      item.required &&
      item.abilities.includes("locate") &&
      submissionOf(state, studentId, item.id)?.status === "passed",
  );
}

export function modulePace(state: DemoState, studentId: string) {
  const steps = visibleChallenges(state).map((challenge) => {
    const submission = submissionOf(state, studentId, challenge.id);
    const held = challenge.required && challenge.abilities.includes("report") && !visibleChallenges(state).some(
      (item) =>
        item.required &&
        item.abilities.includes("locate") &&
        submissionOf(state, studentId, item.id)?.status === "passed",
    );
    return { challenge, submission, held };
  });
  const current = steps.find((step) => !step.held && step.submission?.status !== "passed") ?? null;
  const passed = steps.filter((step) => step.submission?.status === "passed").length;
  return { steps, current, passed };
}

export function scoreOf(submission?: Submission) {
  if (!submission || submission.status === "not_started") return 0;
  if (submission.status === "in_progress") return 40;
  if (submission.status === "submitted") return 62;
  return submission.review?.score ?? 0;
}

export function abilityScores(state: DemoState, studentId: string) {
  const challenges = recordedChallenges(state, studentId);
  return Object.fromEntries(
    ABILITIES.map((ability) => {
      const related = challenges.filter((item) => item.abilities.includes(ability.key));
      const started = related
        .map((item) => submissionOf(state, studentId, item.id))
        .filter((item): item is Submission => Boolean(item && item.status !== "not_started"));
      return [ability.key, started.length ? Math.round(average(started.map((item) => scoreOf(item)))) : 0];
    }),
  ) as Record<AbilityKey, number>;
}

export function classAbilityScores(state: DemoState, classroom?: ClassRoom | string) {
  const currentClassroom = resolveClassroom(classroom);
  return Object.fromEntries(
    ABILITIES.map((ability) => {
      const scores = currentClassroom.studentIds.map((studentId) => abilityScores(state, studentId)[ability.key]);
      return [ability.key, Math.round(average(scores))];
    }),
  ) as Record<AbilityKey, number>;
}

export function challengeRate(state: DemoState, challengeId: string, classroom?: ClassRoom | string) {
  const currentClassroom = resolveClassroom(classroom);
  const rows = currentClassroom.studentIds.map((studentId) => submissionOf(state, studentId, challengeId));
  const passed = rows.filter((item) => item?.status === "passed").length;
  return { passed, total: currentClassroom.studentIds.length, rate: currentClassroom.studentIds.length ? passed / currentClassroom.studentIds.length : 0 };
}

export function classEvidenceSummary(state: DemoState, classroom?: ClassRoom | string) {
  const currentClassroom = resolveClassroom(classroom);
  const started = state.submissions.filter(
    (item) =>
      currentClassroom.studentIds.includes(item.studentId) &&
      state.publishedChallengeIds.includes(item.challengeId) &&
      item.status !== "not_started",
  );
  const withEvidence = started.filter((item) => item.evidenceIds.length > 0);
  const requiredPassed = currentClassroom.studentIds.filter((studentId) =>
    visibleChallenges(state)
      .filter((challenge) => challenge.required)
      .every((challenge) => submissionOf(state, studentId, challenge.id)?.status === "passed"),
  ).length;
  return {
    started: started.length,
    withEvidence: withEvidence.length,
    evidenceRate: started.length ? Math.round((withEvidence.length / started.length) * 100) : 0,
    requiredPassed,
    returnedForEvidence: started.filter((item) =>
      item.status === "returned" && item.review?.tags.some((tag) => tag === "未说明依据" || tag === "建议补充盲区"),
    ).length,
  };
}

export function studentSummary(state: DemoState, studentId: string) {
  const challenges = recordedChallenges(state, studentId);
  const rows = challenges.map((challenge) => submissionOf(state, studentId, challenge.id));
  const minutes = rows.reduce((sum, item) => sum + (item?.desktopMinutes ?? 0), 0);
  return {
    total: challenges.length,
    passed: rows.filter((item) => item?.status === "passed").length,
    pending: rows.filter((item) => item?.status === "submitted").length,
    returned: rows.filter((item) => item?.status === "returned").length,
    started: rows.filter((item) => item && item.status !== "not_started").length,
    minutes,
    average: Math.round(average(Object.values(abilityScores(state, studentId)))),
  };
}

export function ranking(state: DemoState, classroom?: ClassRoom | string) {
  const currentClassroom = resolveClassroom(classroom);
  return currentClassroom.studentIds
    .map((studentId) => ({
      studentId,
      name: personById(studentId)?.name ?? studentId,
      score: studentSummary(state, studentId).average,
      passed: studentSummary(state, studentId).passed,
    }))
    .sort((a, b) => b.score - a.score || b.passed - a.passed);
}

export function pendingReviews(state: DemoState, classroom?: ClassRoom | string) {
  const currentClassroom = resolveClassroom(classroom);
  return state.submissions
    .filter(
      (item) =>
        item.status === "submitted" &&
        currentClassroom.studentIds.includes(item.studentId),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function returnedSubmissions(state: DemoState, classroom?: ClassRoom | string) {
  const currentClassroom = resolveClassroom(classroom);
  return state.submissions.filter(
    (item) => item.status === "returned" && currentClassroom.studentIds.includes(item.studentId),
  );
}

export function liveMinutes(state: DemoState, classroom?: ClassRoom | string) {
  const currentClassroom = resolveClassroom(classroom);
  return state.submissions
    .filter((item) => currentClassroom.studentIds.includes(item.studentId))
    .reduce((sum, item) => sum + item.desktopMinutes, 0);
}

export function usedMinutes(state: DemoState) {
  return state.historicalMinutes + state.submissions.reduce((sum, item) => sum + item.desktopMinutes, 0);
}

export function jobFit(state: DemoState, studentId: string) {
  const scores = abilityScores(state, studentId);
  return CAREERS.map((career) => {
    const fit = Math.round(average(career.abilities.map((key) => scores[key])));
    const level = fit >= 80 ? "高度契合" : fit >= 65 ? "可以继续准备" : "仍需补齐";
    return { ...career, fit, level };
  }).sort((a, b) => b.fit - a.fit);
}

export function medals(state: DemoState, studentId: string) {
  const rows = recordedChallenges(state, studentId).map((challenge) => ({
    challenge,
    submission: submissionOf(state, studentId, challenge.id),
  }));
  const passed = (key: AbilityKey) =>
    rows.some(
      (item) => item.challenge.abilities.includes(key) && item.submission?.status === "passed",
    );
  const minutes = rows.reduce((sum, item) => sum + (item.submission?.desktopMinutes ?? 0), 0);
  const list = [
    passed("deploy") ? "环境就绪" : null,
    passed("listen") ? "问题收敛" : null,
    passed("path") ? "边界清楚" : null,
    passed("locate") ? "证据定位" : null,
    passed("alert") ? "取舍得当" : null,
    passed("report") ? "复盘通过" : null,
    minutes >= 60 ? "机时足迹" : null,
  ].filter((item): item is string => Boolean(item));
  return list;
}

export function weakAbilities(state: DemoState, classroom?: ClassRoom | string) {
  const scores = classAbilityScores(state, classroom);
  return ABILITIES.map((ability) => ({ ...ability, score: scores[ability.key] })).sort(
    (a, b) => a.score - b.score,
  );
}

export function isChallengeOpen(state: DemoState, challenge: Challenge) {
  return state.publishedChallengeIds.includes(challenge.id) || state.submissions.some(item => item.challengeId === challenge.id && item.status !== "not_started");
}

export function practiceBlockers(challenge: Challenge, submission: Submission, locatePassed: boolean) {
  const blockers: string[] = [];
  const missingStages = challenge.stages.filter((stage) => !submission.completedStageIds.includes(stage.id));
  if (missingStages.length > 0) {
    blockers.push(`阶段未完成：${missingStages.map((stage) => stage.title).join("、")}`);
  }
  if (challenge.id === "c4") {
    const required = [
      { id: "ev-app", label: "核心响应等待" },
      { id: "ev-loss", label: "重传占比" },
    ].filter((item) => !submission.evidenceIds.includes(item.id));
    if (required.length > 0) blockers.push(`还要收录：${required.map((item) => item.label).join("、")}`);
  } else if (!(challenge.id === "c6" && locatePassed) && challenge.evidence.length > 0 && submission.evidenceIds.length === 0) {
    blockers.push("至少收录一条证据，避免只提交结论");
  }
  return blockers;
}
