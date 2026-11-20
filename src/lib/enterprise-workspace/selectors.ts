import { enrichJob, enrichScene } from "@/lib/resource-content";
import { assessment, courses, jobs, scenes } from "./catalog";
import {
  Application,
  AssessmentProfile,
  CourseProfile,
  EnterpriseWorkspaceState,
  JobPosting,
  JobProfile,
  ProjectPosting,
  ResourceRights,
  ResourceRightsStatus,
  ResourceUseScope,
  Resume,
  SceneAssessmentMethod,
  SceneAssessmentStatus,
  SceneProfile,
  SceneProgressStatus,
  StandardProfile,
  TaskSubmission,
  Work,
} from "./types";
import { dimensions } from "./types";

export function jobById(id: string) {
  return jobs.find((item) => item.id === id);
}

export function sceneById(id: string) {
  return scenes.find((item) => item.id === id);
}

export function courseById(id: string) {
  return courses.find((item) => item.id === id);
}

export function resourceById(state: EnterpriseWorkspaceState, id: string) {
  return state.resources.find((item) => item.id === id);
}

export function publishedContent(state: EnterpriseWorkspaceState, id: string) {
  const resource = resourceById(state, id);
  return resource?.publishedContent?.data;
}

export function publishedJobs(state: EnterpriseWorkspaceState) {
  return state.resources
    .map((resource) => resource.publishedContent?.kind === "job" ? resource.publishedContent.data : undefined)
    .filter((item): item is JobProfile => Boolean(item))
    .map(enrichJob);
}

export function publishedScenes(state: EnterpriseWorkspaceState) {
  return state.resources
    .map((resource) => resource.publishedContent?.kind === "scene" ? resource.publishedContent.data : undefined)
    .filter((item): item is SceneProfile => Boolean(item))
    .map(enrichScene);
}

export function publishedCourses(state: EnterpriseWorkspaceState) {
  return state.resources
    .map((resource) => resource.publishedContent?.kind === "course" ? resource.publishedContent.data : undefined)
    .filter((item): item is CourseProfile => Boolean(item));
}

export function publishedAssessments(state: EnterpriseWorkspaceState) {
  return state.resources
    .map((resource) => resource.publishedContent?.kind === "assessment" ? resource.publishedContent.data : undefined)
    .filter((item): item is AssessmentProfile => Boolean(item))
    .map((item) => ({
      ...item,
      kind: item.kind ?? "试卷",
      difficulty: item.difficulty ?? "中级",
      publisher: item.publisher ?? "科来网络",
      abilityPointCount: item.abilityPointCount ?? jobById(item.jobId)?.abilityPoints?.length ?? 6,
      averageScore: item.averageScore,
      usageCount: item.usageCount,
    }));
}

export function publishedStandards(state: EnterpriseWorkspaceState) {
  return state.resources
    .map((resource) => resource.publishedContent?.kind === "standard" ? resource.publishedContent.data : undefined)
    .filter((item): item is StandardProfile => Boolean(item));
}

export function effectiveRightsStatus(rights?: ResourceRights, now = new Date()): ResourceRightsStatus {
  if (!rights) return "待确权";
  if (rights.status === "已确权" && new Date(`${rights.validUntil}T23:59:59`).getTime() < now.getTime()) return "已过期";
  return rights.status;
}

export function resourceRightsReady(
  state: EnterpriseWorkspaceState,
  id: string,
  scope: ResourceUseScope = "教学使用",
) {
  const resource = resourceById(state, id);
  const rights = resource?.rights;
  const now = Date.now();
  return Boolean(
    rights &&
      effectiveRightsStatus(rights) === "已确权" &&
      rights.useScopes.includes(scope) &&
      new Date(`${rights.validFrom}T00:00:00`).getTime() <= now,
  );
}

export function resourceRightsBlockedReason(
  state: EnterpriseWorkspaceState,
  id: string,
  scope: ResourceUseScope = "教学使用",
) {
  const resource = resourceById(state, id);
  if (!resource) return "资源不存在";
  const rights = resource.rights;
  if (!rights) return "资源尚未补录权属信息";
  const status = effectiveRightsStatus(rights);
  if (status === "待确权") return rights.reviewNote || "资源尚未完成权属确认";
  if (status === "审核中") return "资源权属正在审核";
  if (status === "已驳回") return rights.reviewNote || "资源权属审核被驳回";
  if (status === "已过期") return `资源权属已于 ${rights.validUntil} 到期`;
  if (!rights.useScopes.includes(scope)) return `权属范围不包含${scope}`;
  if (new Date(`${rights.validFrom}T00:00:00`).getTime() > Date.now()) return `资源权属自 ${rights.validFrom} 起生效`;
  return "";
}

export function resourceVisible(
  state: EnterpriseWorkspaceState,
  id: string,
  scope: ResourceUseScope = "教学使用",
) {
  const resource = resourceById(state, id);
  return Boolean(
    resource &&
      resource.status === "已发布" &&
      resource.publishedContent &&
      resourceRightsReady(state, id, scope),
  );
}

export function assessmentAvailability(
  state: EnterpriseWorkspaceState,
  item: AssessmentProfile,
) {
  if (!resourceVisible(state, item.id)) {
    return {
      available: false,
      reason: "当前无权限",
      action: "none" as const,
      schedule: undefined,
    };
  }
  if (item.kind === "题库") {
    return {
      available: true,
      reason: "",
      action: "practice" as const,
      schedule: undefined,
    };
  }
  const schedule = state.platformAdmin.examSchedules.find(
    (candidate) => candidate.assessmentId === item.id,
  );
  if (!schedule || (state.role === "student" && schedule.classId !== state.classroom.id)) {
    return {
      available: false,
      reason: "你不在考试范围",
      action: "none" as const,
      schedule,
    };
  }
  if (schedule.status === "待开始") {
    return {
      available: false,
      reason: "考试尚未开始",
      action: "none" as const,
      schedule,
    };
  }
  if (schedule.status === "已结束") {
    return {
      available: false,
      reason: "考试已结束",
      action: "result" as const,
      schedule,
    };
  }
  return {
    available: true,
    reason: "",
    action: "exam" as const,
    schedule,
  };
}

export function resourceName(state: EnterpriseWorkspaceState, id: string, fallback: string) {
  const resource = resourceById(state, id);
  return resource?.publishedContent?.data.name ?? resource?.name ?? fallback;
}

export function majorGroupAdaptation(state: EnterpriseWorkspaceState, groupId: string) {
  const group = state.majorGroups.find((item) => item.id === groupId);
  if (!group) return { group, status: "待补齐" as const, jobs: [], completedJobs: [], scenes: [], courses: [] };
  const relatedJobs = publishedJobs(state).filter((job) => group.jobIds.includes(job.id));
  const readyJobs = relatedJobs.filter((job) => jobLearningReadiness(state, job.id).ready);
  const relatedScenes = publishedScenes(state).filter(
    (scene) =>
      relatedJobs.some((job) => job.id === scene.jobId) &&
      resourceVisible(state, scene.id),
  );
  const relatedCourses = publishedCourses(state).filter(
    (course) =>
      relatedJobs.some((job) => job.id === course.jobId) &&
      resourceVisible(state, course.id),
  );
  return {
    group,
    status: readyJobs.length >= 2 ? "强适配" as const : readyJobs.length === 1 ? "可适配" as const : "待补齐" as const,
    jobs: relatedJobs,
    completedJobs: readyJobs,
    scenes: relatedScenes,
    courses: relatedCourses,
  };
}

export function rightsSummary(state: EnterpriseWorkspaceState) {
  const statuses = state.resources.map((resource) => effectiveRightsStatus(resource.rights));
  return {
    confirmed: statuses.filter((status) => status === "已确权").length,
    reviewing: statuses.filter((status) => status === "审核中").length,
    pending: statuses.filter((status) => status === "待确权").length,
    rejected: statuses.filter((status) => status === "已驳回").length,
    expired: statuses.filter((status) => status === "已过期").length,
  };
}

export function jobLearningReadiness(state: EnterpriseWorkspaceState, jobId: string) {
  const resource = resourceById(state, jobId);
  const job = resource?.publishedContent?.kind === "job" ? resource.publishedContent.data : undefined;
  if (!resource || resource.status !== "已发布" || !job) return { ready: false, reason: "岗位标准尚未发布" };
  const rightsReason = resourceRightsBlockedReason(state, jobId, "教学使用");
  if (rightsReason) return { ready: false, reason: rightsReason };
  if (!resourceVisible(state, jobId)) return { ready: false, reason: "岗位当前不可用于教学" };
  const sceneReady = (job.sceneIds ?? []).some((id) => resourceVisible(state, id));
  const courseReady = (job.courseIds ?? []).some((id) => resourceVisible(state, id));
  if (!sceneReady) return { ready: false, reason: "缺少可用于教学的场景" };
  if (!courseReady) return { ready: false, reason: "缺少可用于教学的课程" };
  return { ready: true, reason: "" };
}

export function latestWork(state: EnterpriseWorkspaceState, sceneId: string) {
  return state.works.find((item) => item.studentId === state.activeStudentId && item.sceneId === sceneId);
}

export function sceneTaskDetails(sceneId: string) {
  const scene = sceneById(sceneId);
  return scene ? enrichScene(scene).taskDetails ?? [] : [];
}

export function taskDetailById(sceneId: string, taskId: string) {
  return sceneTaskDetails(sceneId).find((item) => item.id === taskId);
}

export function taskSubmissionFor(
  state: EnterpriseWorkspaceState,
  sceneId: string,
  taskId: string,
  studentId = state.activeStudentId,
) {
  return state.taskSubmissions.find(
    (item) => item.studentId === studentId && item.sceneId === sceneId && item.taskId === taskId,
  );
}

export interface TaskAssessmentProgress {
  method: SceneAssessmentMethod;
  status: SceneAssessmentStatus;
  completed: boolean;
  waived: boolean;
  score?: number;
  comment?: string;
}

export function taskAssessmentProgress(
  state: EnterpriseWorkspaceState,
  sceneId: string,
  taskId: string,
  submission?: TaskSubmission,
  studentId = state.activeStudentId,
): TaskAssessmentProgress[] {
  const task = taskDetailById(sceneId, taskId);
  if (!task) return [];
  const review = submission?.reviews[submission.reviews.length - 1];
  const session = state.offlineSessions.find(
    (item) => item.sceneId === sceneId && item.taskId === taskId,
  );
  const attendance = session
    ? state.attendanceRecords.find(
        (item) => item.sessionId === session.id && item.studentId === studentId,
      )
    : undefined;
  return task.assessmentMethods.map((method) => {
    const result = submission?.assessmentResults.find((item) => item.methodId === method.id);
    if (method.type === "随堂测" || method.type === "题库") {
      return {
        method,
        status: result?.status ?? "未开始",
        completed: result?.status === "已通过",
        waived: false,
        score: result?.score,
        comment: result?.comment,
      };
    }
    if (method.type === "线下课堂") {
      const attended = attendance?.status === "已签到" || attendance?.status === "迟到";
      const completed = result?.status === "已通过" || attended;
      return {
        method,
        status: completed ? "已通过" : result?.status ?? "未开始",
        completed,
        waived: !session,
        score: result?.score ?? (attended ? (attendance?.status === "迟到" ? 85 : 100) : undefined),
        comment: result?.comment ?? attendance?.status,
      };
    }
    if (method.type === "现场答辩") {
      return {
        method,
        status: result?.status ?? "未开始",
        completed: result?.status === "已通过",
        waived: !session,
        score: result?.score,
        comment: result?.comment,
      };
    }
    const reviewed =
      result?.status === "已通过" ||
      submission?.status === "已通过";
    return {
      method,
      status: result?.status ?? (submission?.status === "已通过" ? "已通过" : submission?.status === "已退回" ? "已退回" : submission?.status === "待评价" ? "待评价" : "未开始"),
      completed: reviewed,
      waived: false,
      score: result?.score ?? review?.total,
      comment: result?.comment ?? review?.comment,
    };
  });
}

export function taskCompletionFor(
  state: EnterpriseWorkspaceState,
  sceneId: string,
  taskId: string,
  studentId = state.activeStudentId,
) {
  const task = taskDetailById(sceneId, taskId);
  const submission = taskSubmissionFor(state, sceneId, taskId, studentId);
  if (!task) {
    return {
      task,
      submission,
      status: "未开始" as const,
      completed: false,
      score: undefined as number | undefined,
      blockers: [] as string[],
      assessments: [] as TaskAssessmentProgress[],
    };
  }
  const assessments = taskAssessmentProgress(state, sceneId, taskId, submission, studentId);
  const blockers = assessments
    .filter((item) => item.method.required && !item.completed && !item.waived)
    .map((item) => `尚未完成${item.method.type}`);
  const completed = submission?.status === "已通过" && blockers.length === 0;
  const weighted = assessments.filter(
    (item) => item.method.required && item.completed && item.score !== undefined,
  );
  const totalWeight = weighted.reduce((sum, item) => sum + item.method.weight, 0);
  const score = completed
    ? totalWeight > 0
      ? Math.round(weighted.reduce((sum, item) => sum + (item.score ?? 0) * item.method.weight, 0) / totalWeight)
      : submission?.reviews[submission.reviews.length - 1]?.total
    : undefined;
  const status =
    completed
      ? "已通过"
      : submission?.status === "已退回"
        ? "已退回"
        : submission?.status === "待评价"
          ? "待评价"
          : submission
            ? "学习中"
            : "未开始";
  return { task, submission, status, completed, score, blockers, assessments };
}

export function taskReviewBlockers(
  state: EnterpriseWorkspaceState,
  sceneId: string,
  taskId: string,
  studentId: string,
) {
  return taskCompletionFor(state, sceneId, taskId, studentId)
    .assessments
    .filter(
      (item) =>
        item.method.required &&
        !item.completed &&
        !item.waived &&
        !["作品评审", "实操考核"].includes(item.method.type),
    )
    .map((item) => `尚未完成${item.method.type}`);
}

export function sceneProgressFor(
  state: EnterpriseWorkspaceState,
  sceneId: string,
  studentId = state.activeStudentId,
) {
  const tasks = sceneTaskDetails(sceneId);
  const submissions = state.taskSubmissions.filter(
    (item) => item.studentId === studentId && item.sceneId === sceneId,
  );
  const legacyWork = submissions.length === 0
    ? state.works.find((item) => item.studentId === studentId && item.sceneId === sceneId)
    : undefined;
  const requiredTaskIds = tasks.filter((item) => item.required).map((item) => item.id);
  const taskProgress = tasks.map((task) => ({
    task,
    progress: taskCompletionFor(state, sceneId, task.id, studentId),
  }));
  const passedTaskIds = legacyWork?.status === "已通过"
    ? requiredTaskIds
    : taskProgress.filter((item) => item.progress.completed).map((item) => item.task.id);
  const pendingTaskIds = legacyWork?.status === "待评价"
    ? requiredTaskIds
    : taskProgress
        .filter((item) => !item.progress.completed && item.progress.status === "待评价")
        .map((item) => item.task.id);
  const inProgress =
    legacyWork?.status === "已退回" ||
    taskProgress.some(
      (item) =>
        item.progress.status === "学习中" ||
        item.progress.status === "已退回" ||
        item.progress.assessments.some((assessment) => assessment.completed),
    );
  const completed = (legacyWork?.status === "已通过") || (requiredTaskIds.length > 0 && requiredTaskIds.every((id) => passedTaskIds.includes(id)));
  const weightedScores = taskProgress
    .filter((item) => item.progress.completed && item.progress.score !== undefined)
    .map((item) => ({ score: item.progress.score ?? 0, weight: item.task.weight }));
  const totalWeight = weightedScores.reduce((sum, item) => sum + item.weight, 0);
  const score = legacyWork?.status === "已通过"
    ? workReview(legacyWork)?.total ?? 0
    : totalWeight
    ? Math.round(weightedScores.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight)
    : undefined;
  const stored = state.sceneCompletions.find(
    (item) => item.studentId === studentId && item.sceneId === sceneId,
  );
  const status: SceneProgressStatus = completed
    ? "已完成"
    : pendingTaskIds.length > 0
      ? "待评价"
      : inProgress || submissions.length > 0
        ? "学习中"
        : "未开始";
  return {
    status,
    score,
    requiredTaskIds,
    completedTaskIds: passedTaskIds,
    pendingTaskIds,
    completedAt: completed ? stored?.completedAt : undefined,
    taskCount: tasks.length,
    completedCount: passedTaskIds.length,
  };
}

export function learningPathForJob(state: EnterpriseWorkspaceState, jobId: string) {
  return state.learningPaths.find((item) => item.jobId === jobId);
}

export function learningPathProgress(
  state: EnterpriseWorkspaceState,
  jobId: string,
  studentId = state.activeStudentId,
) {
  const path = learningPathForJob(state, jobId);
  if (!path) {
    const fallbackScenes = scenes.filter((scene) => scene.jobId === jobId);
    return {
      path,
      nodes: fallbackScenes.map((rawScene, index) => ({
        node: {
          id: `${jobId}-fallback-${index + 1}`,
          sceneId: rawScene.id,
          phase: index === 0 ? "起点" : "实践场景",
          required: true,
        },
        scene: enrichScene(rawScene),
        progress: sceneProgressFor(state, rawScene.id, studentId),
      })),
      completed: fallbackScenes.filter((scene) => sceneProgressFor(state, scene.id, studentId).status === "已完成").length,
      total: fallbackScenes.length,
      score: undefined as number | undefined,
    };
  }
  const nodes = path.sceneNodes
    .map((node) => {
      const rawScene = scenes.find((item) => item.id === node.sceneId);
      return rawScene
        ? { node, scene: enrichScene(rawScene), progress: sceneProgressFor(state, rawScene.id, studentId) }
        : undefined;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const completedNodes = nodes.filter((item) => item.progress.status === "已完成");
  const totalWeight = completedNodes.reduce((sum, item) => {
    const sceneTasks = sceneTaskDetails(item.scene.id);
    return sum + sceneTasks.reduce((taskSum, task) => taskSum + task.weight, 0);
  }, 0);
  const score = totalWeight > 0
    ? Math.round(completedNodes.reduce((sum, item) => sum + (item.progress.score ?? 0) * sceneTaskDetails(item.scene.id).reduce((taskSum, task) => taskSum + task.weight, 0), 0) / totalWeight)
    : undefined;
  return {
    path,
    nodes,
    completed: completedNodes.length,
    total: nodes.length,
    score,
  };
}

export function taskSubmissionBlockedReason(
  state: EnterpriseWorkspaceState,
  sceneId: string,
  taskId: string,
) {
  if (state.role !== "student") return "切换到学生学习身份后可提交成果";
  if (!resourceVisible(state, sceneId)) {
    return resourceRightsBlockedReason(state, sceneId, "教学使用") || "该场景当前不可用于教学";
  }
  if (!taskDetailById(sceneId, taskId)) return "任务不存在或尚未发布";
  const existing = taskSubmissionFor(state, sceneId, taskId);
  if (existing?.status === "待评价") return "该任务正在等待教师评价";
  if (existing?.status === "已通过") return "该任务已通过";
  return "";
}

export function workReview(work?: Work) {
  return work?.reviews[work.reviews.length - 1];
}

export function workBlockedReason(state: EnterpriseWorkspaceState, sceneId: string) {
  if (state.role !== "student") return "切换到学生学习身份后可提交成果";
  const scene = sceneById(sceneId);
  if (!scene) return "场景不存在";
  if (!resourceVisible(state, scene.id)) return "该场景当前不可用于教学";
  const work = latestWork(state, sceneId);
  if (work?.status === "待评价") return "本项成果正在等待教师评价";
  if (work?.status === "已通过") return "本项成果已通过";
  return "";
}

export function abilityScores(state: EnterpriseWorkspaceState, studentId = state.activeStudentId) {
  const sums = dimensions.map(() => 0);
  const weights = dimensions.map(() => 0);
  const taskSceneIds = new Set(
    state.taskSubmissions.filter((item) => item.studentId === studentId).map((item) => item.sceneId),
  );
  state.taskSubmissions
    .filter((item) => item.studentId === studentId)
    .forEach((submission) => {
      const completion = taskCompletionFor(
        state,
        submission.sceneId,
        submission.taskId,
        studentId,
      );
      const scene = sceneById(submission.sceneId);
      const task = completion.task;
      const score = completion.score ?? 0;
      if (!scene || !task || !completion.completed) return;
      scene.abilityWeights.forEach((sceneWeight, index) => {
        if (sceneWeight <= 0) return;
        const weight = sceneWeight * (task.weight || 1);
        sums[index] += score * weight;
        weights[index] += weight;
      });
    });
  state.works
    .filter(
      (item) =>
        item.studentId === studentId &&
        item.status === "已通过" &&
        !taskSceneIds.has(item.sceneId),
    )
    .forEach((work) => {
    const scene = sceneById(work.sceneId);
    const score = workReview(work)?.total ?? 0;
    if (!scene) return;
    scene.abilityWeights.forEach((weight, index) => {
      if (weight <= 0) return;
      sums[index] += score * weight;
      weights[index] += weight;
    });
    });
  return sums.map((sum, index) => (weights[index] ? Math.round(sum / weights[index]) : 0));
}

export function jobMatch(state: EnterpriseWorkspaceState, job: JobProfile, studentId = state.activeStudentId) {
  const scores = abilityScores(state, studentId);
  const match = Math.round(
    job.target.reduce((sum, target, index) => sum + Math.min(scores[index] / target, 1), 0) /
      job.target.length *
      100,
  );
  const missing = job.requiredDimensions
    .filter((index) => scores[index] < 60)
    .map((index) => dimensions[index]);
  return { match, missing, ready: match >= 60 && missing.length === 0, scores };
}

export function passedRequiredScene(state: EnterpriseWorkspaceState) {
  return scenes.some(
    (scene) =>
      scene.required &&
      (sceneProgressFor(state, scene.id).status === "已完成" ||
        state.works.some(
          (item) =>
            item.studentId === state.activeStudentId &&
            item.sceneId === scene.id &&
            item.status === "已通过",
        )),
  );
}

export function certificateEligibility(state: EnterpriseWorkspaceState) {
  const latestExam = state.examAttempts
    .filter(
      (item) =>
        item.studentId === state.activeStudentId &&
        (item.assessmentId === assessment.id ||
          (item.jobId === assessment.jobId && item.assessmentKind === "试卷")),
    )
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
  const examReady = Boolean(
    latestExam &&
      latestExam.score >= (latestExam.passScore ?? assessment.passScore),
  );
  const sceneReady = passedRequiredScene(state);
  return {
    latestExam,
    examReady,
    sceneReady,
    eligible: examReady && sceneReady,
    certificate: state.certificates.find((item) => item.studentId === state.activeStudentId),
  };
}

export function generatedCertificateNumber(state: EnterpriseWorkspaceState) {
  return `KL-TD-2026-${String(state.certificates.length + 1).padStart(4, "0")}`;
}

export function resumeComplete(resume: Resume) {
  return Boolean(resume.name.trim() && resume.phone.trim() && resume.education.trim() && resume.summary.trim());
}

export function classMetrics(state: EnterpriseWorkspaceState) {
  const activeScores = abilityScores(state);
  const scoreArrays = [activeScores, ...state.classmates.map((item) => item.abilityScores)];
  const abilities = dimensions.map((_, index) =>
    Math.round(scoreArrays.reduce((sum, scores) => sum + scores[index], 0) / scoreArrays.length),
  );
  const activePassed =
    state.taskSubmissions.filter((item) => item.status === "已通过").length +
    (state.taskSubmissions.length ? 0 : state.works.filter((item) => item.status === "已通过").length);
  const activePending =
    state.taskSubmissions.filter((item) => item.status === "待评价").length +
    (state.taskSubmissions.length ? 0 : state.works.filter((item) => item.status === "待评价").length);
  const activeReturned =
    state.taskSubmissions.filter((item) => item.status === "已退回").length +
    (state.taskSubmissions.length ? 0 : state.works.filter((item) => item.status === "已退回").length);
  const samplePassed = state.classmates.reduce((sum, item) => sum + item.passed, 0);
  const samplePending = state.classmates.reduce((sum, item) => sum + item.pending, 0);
  const sampleReturned = state.classmates.reduce((sum, item) => sum + item.returned, 0);
  const learnersWithProgress = state.classmates.filter((item) => item.passed > 0).length + (activePassed > 0 ? 1 : 0);
  return {
    abilities,
    passed: activePassed + samplePassed,
    pending: activePending + samplePending,
    returned: activeReturned + sampleReturned,
    learnersWithProgress,
    passRate: Math.round((learnersWithProgress / state.classroom.studentIds.length) * 100),
    average: Math.round(abilities.reduce((sum, item) => sum + item, 0) / abilities.length),
    weak: dimensions.map((name, index) => ({ name, score: abilities[index] })).sort((a, b) => a.score - b.score)[0],
  };
}

export function applicationTarget(state: EnterpriseWorkspaceState, application: Application) {
  return application.kind === "project"
    ? state.projects.find((item) => item.id === application.targetId)
    : state.jobPostings.find((item) => item.id === application.targetId);
}

export function projectEligibility(state: EnterpriseWorkspaceState, project: ProjectPosting) {
  const job = jobById(project.jobId);
  const match = job ? jobMatch(state, job) : { match: 0, missing: [], ready: false };
  const rightsReason = resourceRightsBlockedReason(state, project.jobId, "项目展示");
  if (rightsReason) return { ok: false, reason: rightsReason, match };
  if (!resumeComplete(state.resume)) return { ok: false, reason: "请先补全联系方式", match };
  if (!project.schoolIds.includes(state.activeSchoolId)) return { ok: false, reason: "项目未向当前院校开放", match };
  if (match.missing.length) return { ok: false, reason: `缺少${match.missing.join("、")}证据`, match };
  if (match.match < project.minMatch) return { ok: false, reason: `能力匹配需达到 ${project.minMatch}%`, match };
  return { ok: true, reason: "", match };
}

export function jobPostingEligibility(state: EnterpriseWorkspaceState, posting: JobPosting) {
  const job = jobById(posting.jobId);
  const match = job ? jobMatch(state, job) : { match: 0, missing: [], ready: false };
  const tier = match.match >= Math.max(80, posting.minMatch) && match.missing.length === 0
    ? "apply"
    : match.match >= 60
      ? "improve"
      : "learn";
  const rightsReason = resourceRightsBlockedReason(state, posting.jobId, "招聘引用");
  if (rightsReason) return { ok: false, reason: rightsReason, match, tier };
  if (tier !== "apply") {
    return {
      ok: false,
      reason: tier === "improve" ? "建议先完成针对性场景提升" : "匹配度过低，需先系统学习",
      match,
      tier,
    };
  }
  if (!resumeComplete(state.resume)) return { ok: false, reason: "请先补全简历", match, tier };
  return { ok: true, reason: "", match, tier };
}

export function recommendedScenesForJob(
  state: EnterpriseWorkspaceState,
  job: JobProfile,
  limit = 3,
) {
  const scores = abilityScores(state);
  const gaps = job.target
    .map((target, index) => ({
      index,
      name: dimensions[index],
      gap: Math.max(0, target - scores[index]),
    }))
    .filter((item) => item.gap > 0)
    .sort((a, b) => b.gap - a.gap);
  const candidates = publishedScenes(state).filter(
    (scene) => resourceVisible(state, scene.id),
  );
  return candidates
    .map((scene) => ({
      scene,
      score: gaps.reduce(
        (sum, gap) => sum + (scene.abilityWeights[gap.index] ?? 0) * gap.gap,
        0,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.scene);
}
