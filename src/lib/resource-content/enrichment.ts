import { resource } from "./base";
import {
  CourseChapter,
  CourseProfile,
  JobProfile,
  SceneProfile,
  SceneTaskDetail,
  TeachingResourceItem,
} from "@/lib/enterprise-workspace/types";

const sceneCodeIndex: Record<string, number> = {
  bank: 1,
  energy: 2,
  hospital: 3,
  factory: 4,
  "payment-peak": 5,
  "cloud-migration": 6,
  "ranch-encryption": 7,
  "branch-cutover": 8,
  "poc-value": 9,
  "dc-change": 10,
  "tap-quality": 11,
  "trace-degradation": 12,
  "incident-handoff": 13,
  "customer-scope": 14,
  "delivery-defense": 15,
  "asset-baseline": 16,
  "dns-investigation": 17,
  "security-defense": 18,
  "baseline-analysis": 19,
  "joint-troubleshooting": 20,
  "observability-defense": 21,
};

const jobDetails: Record<string, Pick<JobProfile, "aliases" | "salaryRange" | "careerPaths" | "recommended">> = {
  service: {
    aliases: ["钢结构深化设计师", "BIM 深化工程师"],
    salaryRange: "10-18K",
    careerPaths: ["深化设计工程师", "专业负责人", "设计经理", "技术总监"],
    recommended: true,
  },
  security: {
    aliases: ["智慧工地实施工程师", "智能建造专员"],
    salaryRange: "11-19K",
    careerPaths: ["智能建造实施工程师", "智慧工地负责人", "项目数字化经理"],
    recommended: true,
  },
  presales: {
    aliases: ["模块化产品工程师", "MiC 产品经理"],
    salaryRange: "12-22K",
    careerPaths: ["产品工程师", "产品经理", "模块化业务负责人"],
    recommended: true,
  },
  observability: {
    aliases: ["城市更新策划师", "更新项目前期经理"],
    salaryRange: "13-24K",
    careerPaths: ["更新策划师", "片区负责人", "城市更新总监"],
    recommended: true,
  },
  deployment: {
    aliases: ["构件工艺工程师", "产线工艺工程师"],
    salaryRange: "9-16K",
    careerPaths: ["工艺工程师", "产线经理", "制造基地负责人"],
  },
  operations: {
    aliases: ["钢结构安装工程师", "吊装工程师"],
    salaryRange: "10-20K",
    careerPaths: ["安装工程师", "施工经理", "项目总工"],
    recommended: true,
  },
  nfr: {
    aliases: ["BIM 工程师", "数字孪生工程师"],
    salaryRange: "12-22K",
    careerPaths: ["BIM 工程师", "数字建造负责人", "数字化总监"],
    recommended: true,
  },
  incident: {
    aliases: ["结构检测工程师", "加固改造工程师"],
    salaryRange: "10-18K",
    careerPaths: ["检测加固工程师", "鉴定负责人", "城市更新技术总监"],
  },
  delivery: {
    aliases: ["项目管理工程师", "施工项目经理"],
    salaryRange: "11-21K",
    careerPaths: ["项目管理工程师", "项目经理", "区域项目总监"],
    recommended: true,
  },
  solution: {
    aliases: ["智能建造顾问", "建筑数字化方案顾问"],
    salaryRange: "15-26K",
    careerPaths: ["解决方案顾问", "行业方案专家", "方案总监"],
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
      { id: "evidence", label: "事实梳理", description: "能区分工程现象、时间窗口和已知条件。", weight: 40 },
      { id: "method", label: "分析方法", description: "任务步骤完整，方法选择符合工程问题。", weight: 40 },
      { id: "boundary", label: "边界意识", description: "能说明当前资料无法覆盖的范围。", weight: 20 },
    ],
    [
      { id: "evidence", label: "过程证据", description: "关键工序、测量数据与现场记录匹配。", weight: 40 },
      { id: "reasoning", label: "判断推理", description: "能够区分设计、制造与施工环节的影响。", weight: 40 },
      { id: "delivery", label: "成果表达", description: "图示或结论能够支持下一步协作。", weight: 20 },
    ],
    [
      { id: "accuracy", label: "判断准确性", description: "选择的证据与工程结论一致。", weight: 45 },
      { id: "evidence", label: "证据支撑", description: "数据、图纸与现场记录相互印证。", weight: 35 },
      { id: "reasoning", label: "排除替代原因", description: "能解释为什么排除其他可能。", weight: 20 },
    ],
    [
      { id: "evidence", label: "证据完整", description: "结论逐条对应可追溯证据。", weight: 30 },
      { id: "reasoning", label: "复盘推理", description: "说明处理路径、替代方案和未知边界。", weight: 40 },
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
    code: scene.code ?? `ZJKG-CJ-${String(sceneCodeIndex[scene.id] ?? 99).padStart(3, "0")}`,
    department: scene.department ?? "智能建造学院",
    majors: scene.majors ?? ["智能建造技术", "土木工程"],
    learningGoal:
      scene.learningGoal ??
      `能够围绕“${scene.name}”完成条件界定、证据筛选、专业判断与交付表达。`,
    taskDetails: scene.tasks.map((title, index) => ({
      id: `${scene.id}-task-${index + 1}`,
      title,
      description:
        [
          "明确任务目标、现场条件和已知约束，形成第一版工作界定。",
          "按工序或专业要求完成任务，记录关键数据、依据和现场反馈。",
          "依据规范与证据完成专业判断，说明取舍理由和替代方案。",
          "说明检测边界、未验证事项和下一步建议，形成可交付成果。",
        ][index] ?? "完成本任务并提交可复核成果。",
      type: taskTypes[index] ?? "训练",
      minutes: [20, 35, 30, 25][index] ?? 30,
      goal: `完成“${title}”，并留下能够被教师复核的过程记录。`,
      evidenceIds: scene.evidence.slice(0, index < 2 ? 2 : 4).map((item) => item.id),
      resources: [
        resource(`${scene.id}-task-${index + 1}-doc`, "文档", `${title}任务说明`, "任务背景、操作步骤与交付要求"),
        resource(`${scene.id}-task-${index + 1}-video`, "视频", "方法演示", "结合当前场景的工艺与管理方法演示"),
        resource(`${scene.id}-task-${index + 1}-quiz`, "习题", "任务自检", "提交前检查关键证据与边界"),
      ],
      abilityPointIds: dimensionsForScene(scene),
      weight: taskWeights[index] ?? Math.round(100 / Math.max(1, scene.tasks.length)),
      required: true,
      requiredEvidenceIds:
        scene.id === "bank" && index === 2
          ? ["wind", "datum"]
          : scene.evidence.slice(0, Math.min(2, scene.evidence.length)).map((item) => item.id),
      deliverable:
        [
          "问题界定记录",
          "施工组织草案与证据说明",
          "一页式专业判断",
          "复盘报告与下一步建议",
        ][index] ?? "任务过程记录与成果摘要",
      rubric: taskRubrics[index] ?? taskRubrics[0],
      deliveryMode: "混合",
      assessmentMethods: assessmentSets[index] ?? assessmentSets[0],
    })),
    resourceItems: [
      resource(`${scene.id}-r1`, "视频", "现场问题还原", "项目背景、施工阶段与关键约束"),
      resource(`${scene.id}-r2`, "文档", "脱敏工程资料说明", "图纸、监测数据与现场记录的范围"),
      resource(`${scene.id}-r3`, "思维导图", "处理路径", "从问题到证据的专业判断路径"),
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
      [`理解${chapter.title}的核心方法`, "能够结合岗位案例完成判断", "说明处理过程与不可见边界"],
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
