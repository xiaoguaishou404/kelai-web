import { resource } from "./base";
import {
  CourseChapter,
  CourseProfile,
  JobProfile,
  SceneProfile,
  SceneTaskDetail,
  TeachingResourceItem,
} from "@/lib/enterprise-workspace/types";

const jobDetails: Record<string, Pick<JobProfile, "aliases" | "salaryRange" | "careerPaths" | "recommended">> = {
  service: {
    aliases: ["技术服务顾问", "网络分析工程师"],
    salaryRange: "10-18K",
    careerPaths: ["技术服务工程师", "高级现场专家", "交付负责人", "行业解决方案专家"],
    recommended: true,
  },
  security: {
    aliases: ["安全分析师", "全流量研判工程师"],
    salaryRange: "12-22K",
    careerPaths: ["安全分析师", "高级研判工程师", "安全运营负责人", "行业安全专家"],
    recommended: true,
  },
  presales: {
    aliases: ["售前顾问", "解决方案工程师"],
    salaryRange: "12-24K",
    careerPaths: ["售前工程师", "高级解决方案顾问", "行业方案负责人"],
  },
  observability: {
    aliases: ["可观测性工程师", "业务性能分析师"],
    salaryRange: "12-20K",
    careerPaths: ["性能分析工程师", "可观测性专家", "平台架构顾问"],
    recommended: true,
  },
  deployment: {
    aliases: ["实施工程师", "采集部署工程师"],
    salaryRange: "8-14K",
    careerPaths: ["实施工程师", "交付专家", "项目技术负责人"],
  },
  operations: {
    aliases: ["网络运维工程师", "运行保障工程师"],
    salaryRange: "8-15K",
    careerPaths: ["网络运维工程师", "运行专家", "稳定性负责人"],
  },
  nfr: {
    aliases: ["应用性能工程师", "性能保障工程师"],
    salaryRange: "14-24K",
    careerPaths: ["应用性能工程师", "性能架构师", "可观测性负责人"],
    recommended: true,
  },
  incident: {
    aliases: ["应急响应工程师", "安全事件分析师"],
    salaryRange: "13-22K",
    careerPaths: ["应急响应工程师", "安全事件负责人", "安全运营专家"],
    recommended: true,
  },
  delivery: {
    aliases: ["实施交付工程师", "项目交付工程师"],
    salaryRange: "9-16K",
    careerPaths: ["项目交付工程师", "交付经理", "项目负责人"],
  },
  solution: {
    aliases: ["解决方案顾问", "行业售前顾问"],
    salaryRange: "15-26K",
    careerPaths: ["解决方案顾问", "行业方案专家", "方案总监"],
    recommended: true,
  },
};

export function enrichJob(job: JobProfile): JobProfile {
  return {
    ...job,
    aliases: job.aliases ?? jobDetails[job.id]?.aliases ?? [],
    salaryRange: job.salaryRange ?? jobDetails[job.id]?.salaryRange,
    careerPaths: job.careerPaths ?? jobDetails[job.id]?.careerPaths ?? [],
    recommended: job.recommended ?? jobDetails[job.id]?.recommended ?? false,
    publishedAt: job.publishedAt ?? "2026-09-18",
    knowledgePointIds:
      job.knowledgePointIds ??
      (job.skills ?? []).map((skill, index) => `${job.id}-knowledge-${index + 1}`),
  };
}

export function enrichScene(scene: SceneProfile): SceneProfile {
  if (scene.taskDetails?.length) return scene;
  const taskTypes: SceneTaskDetail["type"][] = ["训练", "训练", "测评", "复盘"];
  const taskWeights = [20, 25, 30, 25];
  const taskRubrics: SceneTaskDetail["rubric"][] = [
    [
      { id: "evidence", label: "事实梳理", description: "能区分业务现象、时间范围和已知事实。", weight: 40 },
      { id: "method", label: "分析方法", description: "任务步骤完整，方法选择符合问题。", weight: 40 },
      { id: "boundary", label: "边界意识", description: "能说明当前证据无法覆盖的范围。", weight: 20 },
    ],
    [
      { id: "evidence", label: "链路证据", description: "关键链路节点与流量证据匹配。", weight: 40 },
      { id: "reasoning", label: "判断推理", description: "能够区分传输等待与应用处理等待。", weight: 40 },
      { id: "delivery", label: "成果表达", description: "图示或结论能够支持下一步协作。", weight: 20 },
    ],
    [
      { id: "accuracy", label: "判断准确性", description: "选择的异常会话与结论一致。", weight: 45 },
      { id: "evidence", label: "证据支撑", description: "证据数量、来源和时间窗相互印证。", weight: 35 },
      { id: "reasoning", label: "排除替代原因", description: "能解释为什么排除其他可能。", weight: 20 },
    ],
    [
      { id: "evidence", label: "证据完整", description: "结论逐条对应可追溯证据。", weight: 30 },
      { id: "reasoning", label: "复盘推理", description: "说明定位路径、替代原因和未知边界。", weight: 40 },
      { id: "delivery", label: "交付表达", description: "结论与下一步建议清晰、可执行。", weight: 30 },
    ],
  ];
  const assessmentSets: SceneTaskDetail["assessmentMethods"][] = [
    [
      { id: "quiz", type: "随堂测", title: "任务随堂测", description: "完成 5 道即时检测题。", mode: "线上", weight: 40, required: true, passScore: 60 },
      { id: "practice", type: "实操考核", title: "过程实操", description: "按任务步骤完成操作并提交记录。", mode: "混合", weight: 30, required: true, passScore: 60 },
      { id: "classroom", type: "线下课堂", title: "课堂参与", description: "完成签到并参与课堂讨论。", mode: "线下", weight: 30, required: true, passScore: 60 },
    ],
    [
      { id: "quiz", type: "随堂测", title: "方法随堂测", description: "验证关键方法与边界判断。", mode: "线上", weight: 30, required: true, passScore: 60 },
      { id: "work", type: "作品评审", title: "任务成果评审", description: "提交任务成果并由教师评价。", mode: "混合", weight: 70, required: true, passScore: 60 },
    ],
    [
      { id: "bank", type: "题库", title: "知识抽测", description: "从岗位题库随机抽题。", mode: "线上", weight: 40, required: true, passScore: 60 },
      { id: "defense", type: "现场答辩", title: "现场答辩", description: "说明判断依据并回答教师质询。", mode: "线下", weight: 60, required: true, passScore: 60 },
    ],
    [
      { id: "work", type: "作品评审", title: "成果评审", description: "提交复盘报告并接受评价。", mode: "线上", weight: 40, required: true, passScore: 60 },
      { id: "defense", type: "现场答辩", title: "现场答辩", description: "完成现场汇报和追问。", mode: "线下", weight: 40, required: true, passScore: 60 },
      { id: "classroom", type: "线下课堂", title: "课堂出勤与参与", description: "完成课堂签到和分组活动。", mode: "线下", weight: 20, required: true, passScore: 60 },
    ],
  ];
  return {
    ...scene,
    code: scene.code ?? `KL-CJ-${String(["bank", "energy", "hospital", "factory"].indexOf(scene.id) + 1).padStart(3, "0")}`,
    department: scene.department ?? "网络空间安全学院",
    majors: scene.majors ?? ["网络工程", "网络空间安全"],
    learningGoal:
      scene.learningGoal ??
      `能够围绕“${scene.name}”完成问题界定、证据筛选、链路判断与交付表达。`,
    taskDetails: scene.tasks.map((title, index) => ({
      id: `${scene.id}-task-${index + 1}`,
      title,
      description:
        [
          "明确业务现象、时间范围和受影响对象，形成第一版问题界定。",
          "从流量证据中提炼关键事实，并区分传输等待与应用等待。",
          "选择最能支撑结论的证据，完成一页式定位判断。",
          "说明采集边界、不可见范围和下一步验证建议，形成可交付成果。",
        ][index] ?? "完成本任务并提交可复核成果。",
      type: taskTypes[index] ?? "训练",
      minutes: [20, 35, 30, 25][index] ?? 30,
      goal: `完成“${title}”，并留下能够被教师复核的过程记录。`,
      evidenceIds: scene.evidence.slice(0, index < 2 ? 2 : 4).map((item) => item.id),
      resources: [
        resource(`${scene.id}-task-${index + 1}-doc`, "文档", `${title}任务说明`, "任务背景、操作步骤与交付要求"),
        resource(`${scene.id}-task-${index + 1}-video`, "视频", "方法演示", "结合当前场景的方法操作演示"),
        resource(`${scene.id}-task-${index + 1}-quiz`, "习题", "任务自检", "提交前检查关键证据与边界"),
      ],
      abilityPointIds: dimensionsForScene(scene),
      weight: taskWeights[index] ?? Math.round(100 / Math.max(1, scene.tasks.length)),
      required: true,
      requiredEvidenceIds:
        scene.id === "bank" && index === 2
          ? ["wait", "retry"]
          : scene.evidence.slice(0, Math.min(2, scene.evidence.length)).map((item) => item.id),
      deliverable:
        [
          "问题界定记录",
          "端到端链路草图与证据说明",
          "一页式异常会话判断",
          "故障复盘报告与下一步建议",
        ][index] ?? "任务过程记录与成果摘要",
      rubric: taskRubrics[index] ?? taskRubrics[0],
      deliveryMode: "混合",
      assessmentMethods: assessmentSets[index] ?? assessmentSets[0],
    })),
    resourceItems: [
      resource(`${scene.id}-r1`, "视频", "现场问题还原", "客户报障与业务现场背景"),
      resource(`${scene.id}-r2`, "文档", "脱敏流量样本说明", "样本字段、时间范围和采集点"),
      resource(`${scene.id}-r3`, "思维导图", "分析路径", "从问题到证据的方法路径"),
      resource(`${scene.id}-r4`, "知识图谱", "场景知识关系", "岗位、能力点、任务和证据关系"),
    ],
    abilityPointIds: dimensionsForScene(scene),
    evaluationStandardId: scene.jobId === "service" ? "standard-service" : undefined,
    knowledgePointIds: [`${scene.id}-kp-1`, `${scene.id}-kp-2`, `${scene.id}-kp-3`],
  };
}

function dimensionsForScene(scene: SceneProfile) {
  return scene.abilityWeights
    .map((weight, index) => ({ weight, id: `${scene.jobId}-ability-${index + 1}` }))
    .filter((item) => item.weight > 0)
    .map((item) => item.id);
}

export function getChapterResources(course: CourseProfile, index: number): TeachingResourceItem[] {
  const chapter = course.chapters[index];
  if (chapter?.resources?.length) return chapter.resources;
  return [
    resource(`${course.id}-${index}-quiz`, "习题", "章节自测", "检验概念、方法与边界判断"),
    resource(`${course.id}-${index}-video`, "视频", "方法演示", "结合岗位案例演示本章方法"),
    resource(`${course.id}-${index}-doc`, "文档", "案例工作纸", "记录证据、判断和下一步建议"),
    resource(`${course.id}-${index}-map`, "思维导图", "方法结构图", "整理本章关键概念与操作步骤"),
    resource(`${course.id}-${index}-kg`, "知识图谱", "章节知识关系", "查看本章与岗位、场景和能力点的关系"),
  ];
}

export function enrichChapter(chapter: CourseChapter, course: CourseProfile, index: number): CourseChapter {
  return {
    ...chapter,
    objectives:
      chapter.objectives ??
      [`理解${chapter.title}的核心方法`, "能够结合岗位案例完成判断", "说明分析过程与不可见边界"],
    points:
      chapter.points ??
      (course.chapters[index].method
        .split(/[。；，,]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 3)),
    resources: getChapterResources(course, index),
  };
}
