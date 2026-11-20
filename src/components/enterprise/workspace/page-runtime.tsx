"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  certificateEligibility,
  examQuestions,
  generatedCertificateNumber,
  publishedAssessments,
  publishedCourses,
  publishedJobs,
  publishedScenes,
  publishedStandards,
  resourceRightsBlockedReason,
  resourceVisible,
  taskCompletionFor,
  type AssessmentProfile,
  type StandardProfile,
  type TaskSubmission,
} from "@/lib/enterprise-workspace";
import { buildApplication, useWorkspace } from "@/components/enterprise/workspace-store";
import { useWorkspaceRuntime } from "@/components/enterprise/workspace/runtime";

export function useWorkspacePage() {
  const store = useWorkspace();
  const { state, toggleFavorite, apply, resourceAction, issueCertificate } = store;
  const router = useRouter();
  const searchParams = useSearchParams();
  const runtime = useWorkspaceRuntime();
  const { notify } = runtime;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");
  const [tab, setTab] = useState("岗位");
  const [selected, setSelected] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [sceneTab, setSceneTab] = useState("overview");
  const [sceneTaskIndex, setSceneTaskIndex] = useState(0);
  const [resourceType, setResourceType] = useState<import("@/lib/enterprise-workspace").Resource["type"]>("岗位");
  const [creatingResource, setCreatingResource] = useState(false);

  const catalog = useMemo(() => {
    const jobs = publishedJobs(state);
    const scenes = publishedScenes(state);
    const courses = publishedCourses(state);
    const publishedAssessmentList = publishedAssessments(state);
    const publishedStandardList = publishedStandards(state);
    const accessibleAssessmentList = publishedAssessmentList.filter(
      (item) => state.role === "manage" || resourceVisible(state, item.id),
    );
    const accessibleStandardList = publishedStandardList.filter(
      (item) => state.role === "manage" || resourceVisible(state, item.id),
    );
    const jobById = (id: string) => jobs.find((item) => item.id === id);
    const sceneById = (id: string) => scenes.find((item) => item.id === id);
    const courseById = (id: string) => courses.find((item) => item.id === id);
    const assessment: AssessmentProfile =
      accessibleAssessmentList.find((item) => item.jobId === "service") ??
      accessibleAssessmentList[0] ??
      {
        id: "assessment-service",
        name: "技术服务岗位综合测评",
        jobId: "service",
        durationMinutes: 30,
        passScore: 80,
        questions: examQuestions,
      };
    const evaluationStandard: StandardProfile =
      accessibleStandardList.find((item) => item.jobId === "service") ??
      accessibleStandardList[0] ??
      {
        id: "standard-service",
        name: "技术服务工程师能力评价标准",
        jobId: "service",
        abilityPointWeights: [],
        levelBands: [],
        recognitionRule: "",
        evidenceWeight: 40,
        reasoningWeight: 40,
        deliveryWeight: 20,
        passScore: 60,
        goodScore: 80,
        excellentScore: 90,
      };
    return {
      jobs,
      scenes,
      courses,
      publishedAssessmentList,
      publishedStandardList,
      accessibleAssessmentList,
      accessibleStandardList,
      jobById,
      sceneById,
      courseById,
      assessment,
      evaluationStandard,
    };
  }, [state]);

  const taskStatus = (submission?: TaskSubmission, sceneId?: string, taskId?: string) => {
    if (sceneId && taskId) return taskCompletionFor(state, sceneId, taskId).status;
    return submission?.status ?? "未开始";
  };
  const taskStatusTone = (status: string) => {
    if (status === "已通过") return "success";
    if (status === "已退回") return "danger";
    if (status === "待评价" || status === "进行中") return "warning";
    return "muted";
  };
  const claimCertificate = () => {
    const eligibility = certificateEligibility(state);
    if (!eligibility.eligible) return notify("尚未满足结业凭证条件");
    issueCertificate();
    notify(`结业凭证 ${generatedCertificateNumber(state)} 已生成`);
  };
  const toggleFavoriteWithNotice = (id: string, noun = "岗位") => {
    toggleFavorite(id);
    notify(state.favorites.includes(id) ? "已取消收藏" : `${noun}已收藏`);
  };
  const applyWithNotice = (input: { kind: "project" | "job"; targetId: string; name: string; company: string }) => {
    if (state.applications.some((item) => item.kind === input.kind && item.targetId === input.targetId)) {
      return notify("已提交，请勿重复申请");
    }
    apply(buildApplication({ state, ...input }));
    notify(input.kind === "project" ? "项目申请已提交" : "简历已投递");
  };
  const resourceActionWithNotice = (
    id: string,
    action: "submit" | "publish" | "reject" | "offline" | "revise" | "confirm-rights" | "reject-rights" | "revoke-rights",
    note: string,
  ) => {
    const rightsReason = action === "publish" ? resourceRightsBlockedReason(state, id, "教学使用") : "";
    if (rightsReason) return notify(rightsReason);
    resourceAction(id, action, note);
    notify(
      action === "publish" ? "资源已发布"
        : action === "reject" ? "资源已驳回"
          : action === "confirm-rights" ? "资源权属已确认"
              : action === "reject-rights" ? "资源权属已驳回"
                : action === "revoke-rights" ? "资源权属已撤回"
                  : "资源状态已更新",
    );
  };
  const scrollToSection = (id: string) => {
    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
  };

  return {
    ...store,
    router,
    searchParams,
    ...runtime,
    ...catalog,
    query,
    setQuery,
    filter,
    setFilter,
    tab,
    setTab,
    selected,
    setSelected,
    answers,
    setAnswers,
    sceneTab,
    setSceneTab,
    sceneTaskIndex,
    setSceneTaskIndex,
    resourceType,
    setResourceType,
    creatingResource,
    setCreatingResource,
    scrollToSection,
    taskStatus,
    taskStatusTone,
    claimCertificate,
    toggleFavoriteWithNotice,
    applyWithNotice,
    resourceActionWithNotice,
  };
}
