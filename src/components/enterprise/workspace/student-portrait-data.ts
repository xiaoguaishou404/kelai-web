import {
  abilityScores,
  dimensions,
  jobMatchForScores,
  publishedJobs,
  publishedScenes,
  sceneById,
  sceneProgressFor,
  taskCompletionFor,
  workReview,
  type EnterpriseWorkspaceState,
  type StudentRecord,
} from "@/lib/enterprise-workspace";

export function buildStudentPortrait(state: EnterpriseWorkspaceState, studentId: string, student?: StudentRecord) {
  const sampleById = new Map(state.classmates.map((item) => [item.id, item]));
  const studentsWithWork = new Set([
    ...state.taskSubmissions.map((item) => item.studentId),
    ...state.works.map((item) => item.studentId),
  ]);
  const scoresFor = (id: string) => {
    const scores = studentsWithWork.has(id) ? abilityScores(state, id) : dimensions.map(() => 0);
    return scores.some((score) => score > 0) ? scores : sampleById.get(id)?.abilityScores ?? scores;
  };
  const scores = scoresFor(studentId);
  const measured = scores.filter((score) => score > 0);
  const overall = measured.length ? Math.round(measured.reduce((sum, score) => sum + score, 0) / measured.length) : null;
  const isActiveStudent = studentId === state.activeStudentId;
  const classId = student?.classId ?? (isActiveStudent ? state.classroom.id : "");
  const group = state.classGroups.find((item) => item.id === classId);
  const major = state.schoolMajors.find((item) => item.id === student?.majorId)?.name;
  const classmates = state.studentRecords
    .filter((item) => item.id !== studentId && item.classId === classId)
    .map((item) => scoresFor(item.id))
    .filter((values) => values.some((score) => score > 0));
  const cohort = overall === null ? classmates : [scores, ...classmates];
  const benchmark = classmates.length
    ? dimensions.map((_, index) => Math.round(
        cohort.reduce((sum, values) => sum + (values[index] ?? 0), 0) / cohort.length,
      ))
    : undefined;

  const submissions = state.taskSubmissions.filter((item) => item.studentId === studentId);
  const legacyWork = state.works.filter((item) => item.studentId === studentId);
  const storedScenes = state.sceneCompletions.filter((item) => item.studentId === studentId);
  const sceneNames = new Map(publishedScenes(state).map((item) => [item.id, item.name]));
  const sceneName = (id: string) => sceneNames.get(id) ?? sceneById(id)?.name ?? id;
  const sceneIds = new Set([
    ...submissions.map((item) => item.sceneId),
    ...legacyWork.map((item) => item.sceneId),
    ...storedScenes.map((item) => item.sceneId),
  ]);
  const scenes = [...sceneIds].map((id) => {
    const progress = sceneProgressFor(state, id, studentId);
    const stored = storedScenes.find((item) => item.sceneId === id);
    return {
      id,
      name: sceneName(id),
      status: progress.status === "未开始" && stored ? stored.status : progress.status,
      done: progress.requiredTaskIds.length
        ? progress.requiredTaskIds.filter((taskId) => progress.completedTaskIds.includes(taskId)).length
        : stored?.completedTaskIds.length ?? 0,
      total: progress.requiredTaskIds.length || stored?.requiredTaskIds.length || 0,
      score: progress.score ?? stored?.score,
    };
  }).filter((scene) => scene.status !== "未开始");
  const passedTasks = submissions.filter((item) => item.status === "已通过");
  const evidence = passedTasks.map((submission) => {
    const { task, score } = taskCompletionFor(state, submission.sceneId, submission.taskId, studentId);
    const review = submission.reviews.at(-1);
    return {
      id: submission.id,
      title: task?.title ?? submission.taskId,
      scene: sceneName(submission.sceneId),
      comment: review?.comment,
      date: review?.reviewedAt ?? submission.updatedAt,
      score: score ?? review?.total,
    };
  });
  for (const work of legacyWork) {
    if (work.status !== "已通过" || submissions.some((item) => item.sceneId === work.sceneId)) continue;
    const review = workReview(work);
    evidence.push({
      id: work.id,
      title: sceneName(work.sceneId),
      scene: "场景成果",
      comment: review?.comment,
      date: review?.reviewedAt ?? work.updatedAt,
      score: review?.total,
    });
  }
  const exams = state.examAttempts
    .filter((item) => item.studentId === studentId && (item.assessmentKind ?? "试卷") === "试卷")
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const certificates = state.certificates.filter((item) => item.studentId === studentId);
  const jobs = publishedJobs(state);
  const matches = overall === null ? [] : jobs
    .map((job) => ({ id: job.id, name: job.name, ...jobMatchForScores(scores, job) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 4);

  return {
    name: student?.name ?? (isActiveStudent ? state.resume.name : "学生"),
    studentNo: student?.studentNo,
    className: group?.name ?? (isActiveStudent ? state.classroom.name : undefined),
    education: isActiveStudent ? state.resume.education || major : major,
    status: student?.status,
    scores,
    overall,
    benchmark,
    matches,
    scenes,
    evidence: evidence.sort((a, b) => b.date.localeCompare(a.date)),
    passedCount: submissions.length ? passedTasks.length : sampleById.get(studentId)?.passed ?? 0,
    completedCount: scenes.filter((scene) => scene.status === "已完成").length,
    latestExam: exams[0],
    certificates,
  };
}

export type StudentPortraitData = ReturnType<typeof buildStudentPortrait>;
