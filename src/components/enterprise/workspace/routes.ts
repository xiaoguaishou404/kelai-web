import { Role } from "@/lib/enterprise-workspace";

export const channels = [
  ["industry", "首页"],
  ["resources", "岗位与场景资源馆"],
  ["courses", "课程与教材资源馆"],
  ["assessment", "测评与证书资源馆"],
  ["projects", "产业项目实战"],
  ["employment", "就业服务中心"],
];

export const studentNav = [
  ["learning", "我的学习"],
  ["learning/portrait", "能力画像"],
  ["learning/projects", "我的项目"],
  ["learning/applications", "投递记录"],
  ["learning/resume", "我的简历"],
];

export const teacherNav = [
  ["teacher", "教学总览"],
  ["teacher/classes", "班级与学生"],
  ["teacher/classroom", "课堂教学"],
  ["teacher/reviews", "成果评价"],
];

export const schoolAdminNav = [
  ["admin/system/tenant", "系统管理"],
  ["admin/career/positions", "职业岗位学习"],
  ["admin/scene/scenarios", "实践场景学习"],
  ["admin/course/system", "数字课程服务"],
  ["admin/ability/question-banks", "能力评测认证"],
  ["admin/resource/knowledge", "教学资源共享"],
  ["admin/affairs/programs", "教务服务"],
  ["admin/alliance/school", "产业联盟与品牌"],
  ["admin/ai/chat", "AI 智能服务"],
];

export const management = [
  ["manage", "企业看板"],
  ["manage/resources", "资源建设与审核"],
  ["manage/standards", "能力评价标准"],
  ["manage/schools", "合作院校与协议"],
  ["manage/projects", "项目派单与验收"],
  ["manage/recruitment", "招聘与人才库"],
];

const workspaceAreaByRoot: Record<string, Role> = {
  learning: "student",
  teacher: "teacher",
  admin: "schoolAdmin",
  manage: "manage",
};

export function workspaceAreaForPath(page: string): Role | null {
  return workspaceAreaByRoot[page.split("/")[0]] ?? null;
}

const channelHeroPages = new Set(["courses", "assessment", "projects", "employment"]);
export const fullBleedPages = new Set(["industry", "resources", "policy", ...channelHeroPages, "industry/company"]);

export function pageTitle(page: string) {
  if (page.startsWith("employment/")) return "岗位详情";
  const detailTitles = {
    job: "岗位详情",
    scene: "场景实训",
    course: "课程学习",
    exam: "岗位测评",
    resource: "资源详情",
    standard: "岗位评价标准",
    project: "项目详情",
    "industry/company": "关于科来",
    textbook: "数字教材",
    certificate: "证书详情",
    "evaluation-method": "测评方式",
    policy: "国家政策",
    login: "身份选择",
  } as Record<string, string>;
  return [...channels, ...studentNav, ...teacherNav, ...management, ...schoolAdminNav].find(([url]) => url === page)?.[1]
    ?? detailTitles[page]
    ?? detailTitles[page.split("/")[0]]
    ?? "岗位培养";
}
