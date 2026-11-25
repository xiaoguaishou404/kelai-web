"use client";

import type { ReactNode } from "react";
import { useWorkspace } from "@/components/enterprise/workspace-store";
import type { ScheduleEntry, TeachingPlan, TrainingProgram } from "@/lib/enterprise-workspace/types";
import { CatalogPanel } from "./catalog-panel";

function nameOf(list: { id: string; name: string }[], id: string) {
  return list.find((item) => item.id === id)?.name ?? id;
}

export function ProgramPanel() {
  const { state } = useWorkspace();
  return (
    <CatalogPanel<TrainingProgram>
      entity="trainingPrograms"
      title="人才培养方案"
      description="组织专业下的岗位、课程与培养要求。"
      items={state.trainingPrograms}
      columns={[
        { key: "code", label: "编码" },
        { key: "name", label: "名称" },
        { key: "majorId", label: "专业", render: (item) => nameOf(state.schoolMajors, item.majorId) },
        { key: "jobIds", label: "岗位数", render: (item) => `${item.jobIds.length} 个` },
        { key: "status", label: "状态" },
      ]}
      fields={[
        { key: "code", label: "编码" },
        { key: "name", label: "名称" },
        { key: "majorId", label: "所属专业", type: "select", options: state.schoolMajors.map((item) => ({ value: item.id, label: item.name })) },
        { key: "jobIds", label: "关联岗位 ID（逗号分隔）", type: "tags", wide: true },
        { key: "courseIds", label: "关联课程 ID（逗号分隔）", type: "tags", wide: true },
        { key: "description", label: "方案说明", type: "textarea", wide: true },
        { key: "status", label: "状态", type: "select", options: ["启用", "停用"] },
      ]}
      blank={() => ({
        id: crypto.randomUUID(),
        code: `PGM-${String(state.trainingPrograms.length + 1).padStart(2, "0")}`,
        name: "",
        majorId: state.schoolMajors[0]?.id ?? "",
        jobIds: [],
        courseIds: [],
        description: "",
        status: "启用",
        updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      })}
    />
  );
}

export function TeachingPlanPanel() {
  const { state } = useWorkspace();
  return (
    <CatalogPanel<TeachingPlan>
      entity="teachingPlans"
      title="教学计划"
      description="规划学期内的培养方案、班级与课程安排。"
      items={state.teachingPlans}
      columns={[
        { key: "name", label: "名称" },
        { key: "term", label: "学期" },
        { key: "programId", label: "培养方案", render: (item) => nameOf(state.trainingPrograms, item.programId) },
        { key: "classId", label: "班级", render: (item) => nameOf(state.classGroups, item.classId) },
        { key: "status", label: "状态" },
      ]}
      fields={[
        { key: "code", label: "编码" },
        { key: "name", label: "名称" },
        { key: "term", label: "学期" },
        { key: "programId", label: "培养方案", type: "select", options: state.trainingPrograms.map((item) => ({ value: item.id, label: item.name })) },
        { key: "classId", label: "班级", type: "select", options: state.classGroups.map((item) => ({ value: item.id, label: item.name })) },
        { key: "courseIds", label: "关联课程 ID（逗号分隔）", type: "tags", wide: true },
        { key: "startDate", label: "开始日期", type: "date" },
        { key: "endDate", label: "结束日期", type: "date" },
        { key: "status", label: "状态", type: "select", options: ["草稿", "执行中", "已结束"] },
      ]}
      blank={() => ({
        id: crypto.randomUUID(),
        code: `PLAN-${String(state.teachingPlans.length + 1).padStart(2, "0")}`,
        name: "",
        term: "2026 秋季",
        programId: state.trainingPrograms[0]?.id ?? "",
        classId: state.classGroups[0]?.id ?? "",
        courseIds: [],
        startDate: "2026-09-01",
        endDate: "2027-01-15",
        status: "草稿",
      })}
    />
  );
}

export function SchedulePanel() {
  const { state } = useWorkspace();
  const courses = state.resources.flatMap((item) => item.draftContent.kind === "course" ? [item.draftContent.data] : []);
  const scenes = state.resources.flatMap((item) => item.draftContent.kind === "scene" ? [item.draftContent.data] : []);
  return (
    <CatalogPanel<ScheduleEntry>
      entity="scheduleEntries"
      title="排课管理"
      description="安排班级、教师、课程或场景与上课时间。"
      items={state.scheduleEntries}
      columns={[
        { key: "weekday", label: "星期", render: (item) => `${item.weekday} ${item.startTime}-${item.endTime}` },
        { key: "classId", label: "班级", render: (item) => nameOf(state.classGroups, item.classId) },
        { key: "teacherId", label: "教师", render: (item) => nameOf(state.teacherRecords, item.teacherId) },
        { key: "courseId", label: "课程 / 场景", render: (item) => item.courseId ? nameOf(courses, item.courseId) : nameOf(scenes, item.sceneId) },
        { key: "location", label: "地点" },
        { key: "status", label: "状态" },
      ]}
      fields={[
        { key: "term", label: "学期" },
        { key: "classId", label: "班级", type: "select", options: state.classGroups.map((item) => ({ value: item.id, label: item.name })) },
        { key: "teacherId", label: "教师", type: "select", options: state.teacherRecords.map((item) => ({ value: item.id, label: item.name })) },
        { key: "courseId", label: "课程", type: "select", options: [{ value: "", label: "不排课程" }, ...courses.map((item) => ({ value: item.id, label: item.name }))] },
        { key: "sceneId", label: "场景", type: "select", options: [{ value: "", label: "不排场景" }, ...scenes.map((item) => ({ value: item.id, label: item.name }))] },
        { key: "location", label: "地点" },
        { key: "weekday", label: "星期", type: "select", options: ["周一", "周二", "周三", "周四", "周五"] },
        { key: "startTime", label: "开始时间" },
        { key: "endTime", label: "结束时间" },
        { key: "status", label: "状态", type: "select", options: ["待上课", "已结束"] },
      ]}
      blank={() => ({
        id: crypto.randomUUID(),
        term: "2026 秋季",
        classId: state.classGroups[0]?.id ?? "",
        teacherId: state.teacherRecords[0]?.id ?? "",
        courseId: "",
        sceneId: "",
        location: "",
        weekday: "周一",
        startTime: "09:00",
        endTime: "10:40",
        status: "待上课",
      })}
    />
  );
}

export function renderAcademicPage(platformId: string, pageId: string): ReactNode | null {
  if (platformId !== "affairs") return null;
  if (pageId === "programs") return <ProgramPanel />;
  if (pageId === "teaching-plans") return <TeachingPlanPanel />;
  if (pageId === "scheduling") return <SchedulePanel />;
  return null;
}
