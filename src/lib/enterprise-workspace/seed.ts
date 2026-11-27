import { createPlatformAdminSeed } from "@/lib/platform-admin";
import { enrichScene, evaluationMethods, textbooks } from "@/lib/resource-content";
import {
  assessments,
  courses,
  evaluationStandards,
  jobLearningPaths,
  jobs,
  majorGroups,
  scenes,
  seededOfflineSessions,
} from "./catalog";
import { createAudit } from "./shared";
import {
  AbilityPointRecord,
  ClassGroup,
  CodeRule,
  Department,
  EnterpriseWorkspaceState,
  EvaluationMethodRecord,
  JobPosting,
  JobProfile,
  KnowledgePoint,
  LessonResult,
  Resource,
  ResourceContent,
  ResourceRights,
  SampleLearner,
  SchoolMajor,
  ScheduleEntry,
  StudentRecord,
  TaskSubmission,
  TeacherRecord,
  TeachingMaterial,
  TeachingPlan,
  TrainingProgram,
} from "./types";
import { dimensions } from "./types";

const createdAt = "2026-11-10 09:00";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createResourceRights(
  id: string,
  overrides: Partial<ResourceRights> = {},
): ResourceRights {
  return {
    ownership: "科工自有",
    ownerName: "中建科工集团有限公司",
    sourceNote: "基于中建科工工程实践与教学体系自研，完成项目名称、地点与商业信息脱敏。",
    desensitizationNote: "已移除业主名称、项目地址、合同金额与可识别业务数据。",
    agreementNo: `ZJKG-RIGHTS-${id.toUpperCase()}`,
    evidenceName: "教学资源权属确认单.pdf",
    useScopes: ["教学使用", "实训交付", "项目展示", "招聘引用"],
    validFrom: "2026-09-01",
    validUntil: "2029-08-31",
    status: "已确权",
    reviewNote: "",
    history: [],
    ...overrides,
  };
}

function seededRights(id: string) {
  if (id === "factory") {
    return createResourceRights(id, {
      ownership: "客户授权",
      ownerName: "工程项目客户",
      sourceNote: "由客户既有多层住宅改造案例改编，待补充正式教学使用授权协议。",
      desensitizationNote: "已隐去项目名称、楼栋编号与居民信息，仍需完成授权材料复核。",
      agreementNo: "",
      evidenceName: "",
      useScopes: ["教学使用", "实训交付"],
      status: "待确权",
      reviewNote: "待补充客户授权协议与脱敏确认材料",
    });
  }
  return createResourceRights(id);
}

function seededResource(
  base: Omit<Resource, "draftContent" | "publishedContent" | "reviewHistory" | "rights">,
  content: ResourceContent,
): Resource {
  return {
    ...base,
    draftContent: clone(content),
    publishedContent: clone(content),
    reviewHistory: [],
    rights: seededRights(base.id),
  };
}

function initialResources(): Resource[] {
  const values: Resource[] = [
    ...jobs.map((job, jobIndex) => {
      const pathSceneIds = new Set(
        jobLearningPaths.find((path) => path.jobId === job.id)?.sceneNodes.map((node) => node.sceneId) ?? [],
      );
      const relatedScenes = scenes.filter(
        (scene) => scene.jobId === job.id || pathSceneIds.has(scene.id),
      );
      const sceneCourseIds = new Set(relatedScenes.flatMap((scene) => scene.courseIds));
      const relatedCourses = courses.filter(
        (course) => course.jobId === job.id || sceneCourseIds.has(course.id),
      );
      const content: JobProfile = {
        ...job,
        code: `ZJKG-GW-${String(jobIndex + 1).padStart(3, "0")}`,
        majors: ["智能建造技术", "土木工程"],
        majorGroupIds: job.majorGroupIds ?? [],
        responsibilities: relatedScenes.flatMap((scene) => scene.tasks).slice(0, 8),
        requirements: ["掌握工程识图与专业基础方法", "能够依据图纸、监测与现场记录说明结论和边界", "具备现场沟通、协同与复盘表达能力"],
        certificates: ["中建科工岗位能力认证参考"],
        tasks: relatedScenes.flatMap((scene) =>
          scene.tasks.map((task, index) => ({
            id: `${job.id}-${scene.id}-task-${index + 1}`,
            name: task,
            description: scene.description,
            abilityPointIds: dimensions
              .map((_, dimension) => `${job.id}-ability-${dimension + 1}`)
              .filter((_, dimension) => scene.abilityWeights[dimension] > 0),
          })),
        ),
        abilityPoints: dimensions.map((name, dimension) => ({
          id: `${job.id}-ability-${dimension + 1}`,
          name,
          domain: dimensions[dimension],
          dimension,
          level: job.requiredDimensions.includes(dimension) ? "L4" : "L3",
          weight: job.target[dimension] >= 70 ? Math.round(100 / Math.max(1, job.target.filter((value) => value >= 70).length)) : 0,
        })),
        sceneIds: relatedScenes.map((scene) => scene.id),
        courseIds: relatedCourses.map((course) => course.id),
        assessmentIds: assessments.filter((item) => item.jobId === job.id).map((item) => item.id),
        standardIds: evaluationStandards.filter((item) => item.jobId === job.id).map((item) => item.id),
        buildMode: jobIndex % 2 === 0 ? "校企共建" : "独立建设",
        schoolIds: ["school-1"],
      };
      return seededResource(
        {
          id: job.id,
          code: content.code,
          name: job.name,
          type: "岗位",
          status: "已发布",
          description: job.description,
          version: "V1.0",
          relatedIds: [...relatedScenes.map((scene) => scene.id), ...relatedCourses.map((course) => course.id)],
          updatedAt: createdAt,
        },
        { kind: "job", data: content },
      );
    }),
    ...scenes.map((scene) =>
      seededResource(
        {
          id: scene.id,
          code: enrichScene(scene).code,
          name: scene.name,
          type: "场景",
          status: "已发布",
          description: scene.description,
          version: "V1.0",
          relatedIds: [scene.jobId, ...scene.courseIds],
          updatedAt: createdAt,
        },
        { kind: "scene", data: { ...scene, code: enrichScene(scene).code } },
      ),
    ),
    ...courses.map((course) =>
      seededResource(
        {
          id: course.id,
          code: course.code ?? `ZJKG-KC-${String(courses.indexOf(course) + 1).padStart(3, "0")}`,
          name: course.name,
          type: "课程",
          status: "已发布",
          description: `${course.chapters.length} 个章节 · 关联 ${scenes.find((scene) => scene.id === course.sceneId)?.name ?? "岗位实训"}`,
          version: "V1.0",
          relatedIds: [course.jobId, course.sceneId],
          updatedAt: createdAt,
        },
        {
          kind: "course",
          data: {
            ...course,
            code: course.code ?? `ZJKG-KC-${String(courses.indexOf(course) + 1).padStart(3, "0")}`,
            courseType: course.courseType ?? (course.id === "course-1" ? "颗粒课" : course.id === "course-5" ? "混合课" : "体系课"),
            totalHours: course.chapters.length * 4,
            abilityPointIds: [`${course.jobId}-ability-1`, `${course.jobId}-ability-2`],
          },
        },
      ),
    ),
    ...textbooks.map((textbook) =>
      seededResource(
        {
          id: textbook.id,
          code: textbook.code,
          name: textbook.name,
          type: "教材",
          status: "已发布",
          description: `${textbook.chapters.length} 章 · ${textbook.creator}`,
          version: "V1.0",
          relatedIds: [],
          updatedAt: createdAt,
        },
        { kind: "textbook", data: textbook },
      ),
    ),
    ...assessments.map((item) =>
      seededResource(
        {
          id: item.id,
          code: item.code,
          name: item.name,
          type: "测评",
          status: "已发布",
          description: `${item.questions.length} 题理论核验，${item.passScore} 分合格`,
          version: "V1.0",
          relatedIds: [item.jobId, item.standardId ?? ""].filter(Boolean),
          updatedAt: createdAt,
        },
        { kind: "assessment", data: item },
      ),
    ),
    ...evaluationStandards.map((standard) =>
      seededResource(
        {
          id: standard.id,
          code: standard.code,
          name: standard.name,
          type: "评价标准",
          status: "已发布",
          description: "证据 40% · 推理 40% · 交付 20%",
          version: "V1.0",
          relatedIds: [standard.jobId, ...scenes.filter((scene) => scene.jobId === standard.jobId).map((scene) => scene.id)],
          updatedAt: createdAt,
        },
        { kind: "standard", data: standard },
      ),
    ),
  ];
  return values;
}

const classNames = [
  "周晚宁", "许澄", "马川", "沈予安", "陈予白", "何清越", "梁书衡", "赵晚晴", "吴砚秋",
  "郑知夏", "孙泊", "顾言川", "唐清禾", "陆星遥", "叶闻舟", "宋以宁", "谢时安", "苏景行",
  "程书瑶", "方奕辰", "罗思齐", "蒋予墨", "叶初晴", "潘亦舟", "邓知微", "夏嘉言", "魏星辰",
  "孟清和", "田雨桐",
];

const classmates: SampleLearner[] = classNames.map((name, index) => {
  const passed = [1, 2, 2, 3, 1, 0, 2, 1, 3, 1, 0, 2, 2, 1, 1, 3, 0, 2, 1, 2, 0, 1, 3, 2, 1, 2, 0, 1, 2][index];
  const pending = index % 9 === 0 ? 1 : 0;
  const returned = index % 7 === 0 ? 1 : 0;
  const scores = dimensions.map((_, dimension) => {
    const base = 48 + ((index * 11 + dimension * 7) % 38);
    return passed === 0 && dimension > 2 ? Math.max(20, base - 20) : base;
  });
  return {
    id: `student-sample-${index + 1}`,
    name,
    classId: "class-1",
    abilityScores: scores,
    passed,
    pending,
    returned,
    readOnly: true,
  };
});

function buildAbilityCatalog(): AbilityPointRecord[] {
  const domainPoints: AbilityPointRecord[] = dimensions.map((name, index) => ({
    id: `ability-${index + 1}`,
    code: `ZJKG-AB-${String(index + 1).padStart(3, "0")}`,
    name,
    domain: name,
    dimension: index,
    level: index === 3 || index === 5 ? "L4" : "L3",
    description: `围绕${name}形成的可观察能力点，可被岗位、场景和测评引用。`,
    status: "启用",
  }));
  const skillNames = Array.from(new Set(jobs.flatMap((job) => job.skills)))
    .filter((name) => !dimensions.includes(name));
  const skillPoints: AbilityPointRecord[] = skillNames.map((name, index) => {
    const job = jobs.find((item) => item.skills.includes(name));
    const dimension = job ? job.target.indexOf(Math.max(...job.target)) : index % dimensions.length;
    return {
      id: `ability-skill-${index + 1}`,
      code: `ZJKG-AB-${String(index + 7).padStart(3, "0")}`,
      name,
      domain: job?.category ?? "综合能力",
      dimension: Math.max(0, dimension),
      level: "L3",
      description: `${name}相关的岗位能力点，来源于岗位技能要求。`,
      status: "启用",
    };
  });
  return [...domainPoints, ...skillPoints];
}

function buildKnowledgePoints(): KnowledgePoint[] {
  const names = Array.from(new Set(jobs.flatMap((job) => job.skills)));
  return names.map((name, index) => {
    const job = jobs.find((item) => item.skills.includes(name));
    return {
      id: `knowledge-${index + 1}`,
      code: `ZJKG-KP-${String(index + 1).padStart(3, "0")}`,
      name,
      domain: job?.category ?? "综合知识",
      description: `与“${name}”相关的知识要点，可被岗位、场景和课程引用。`,
      tags: [job?.industry ?? "通用", "岗位知识"],
      status: "启用",
      updatedAt: createdAt,
    };
  });
}

function buildTeachingMaterials(): TeachingMaterial[] {
  const types: TeachingMaterial["type"][] = ["文档", "图片", "视频", "习题", "思维导图", "知识图谱", "录音"];
  const samples = [
    ["钢结构深化任务说明", "任务背景、操作步骤与交付要求"],
    ["节点构造示意图", "梁柱、支撑与伸臂桁架节点"],
    ["智能建造演示视频", "结合项目案例演示施工与数字化流程"],
    ["章节自测题", "检验概念、方法与边界判断"],
    ["质量问题分析思维导图", "从现象到证据的排查路径"],
    ["岗位知识关系图", "岗位、场景、能力点与证据的关系"],
    ["现场协调会录音", "脱敏后的业主、设计与施工沟通片段"],
    ["工程复盘报告模板", "结论、证据、边界与下一步建议"],
    ["智慧工地拓扑图片", "设备接入、边缘网关与平台关系"],
    ["机器人作业演示", "焊接、喷涂与巡检作业过程"],
    ["课后练习集", "按任务组织的巩固练习"],
    ["能力点对照表", "能力点、任务与评价方式对照"],
  ];
  return samples.map(([title, description], index) => ({
    id: `material-${index + 1}`,
    code: `ZJKG-MT-${String(index + 1).padStart(3, "0")}`,
    type: types[index % types.length],
    title,
    description,
    fileName: `${title}.${["pdf", "png", "mp4", "docx", "xmind", "json", "mp3"][index % 7]}`,
    owner: "中建科工产业学院",
    status: "启用",
    updatedAt: createdAt,
  }));
}

function buildEvaluationMethodCatalog(): EvaluationMethodRecord[] {
  return evaluationMethods.map((method, index) => ({
    id: method.id,
    code: `ZJKG-EM-${String(index + 1).padStart(3, "0")}`,
    name: method.name,
    form: method.form,
    duration: method.duration,
    use: method.use,
    description: `${method.name}：${method.form}，适用于${method.use}。`,
    passScore: 60,
    status: "启用",
  }));
}

function buildCodeRules(): CodeRule[] {
  const rules: [string, string][] = [
    ["岗位", "ZJKG-GW"],
    ["场景", "ZJKG-CJ"],
    ["课程", "ZJKG-KC"],
    ["教材", "ZJKG-JC"],
    ["测评", "ZJKG-CP"],
    ["评价标准", "ZJKG-BZ"],
    ["能力点", "ZJKG-AB"],
    ["教学素材", "ZJKG-MT"],
    ["证书", "ZJKG-ZS"],
    ["测评方式", "ZJKG-EM"],
  ];
  return rules.map(([resourceType, prefix], index) => ({
    id: `code-rule-${index + 1}`,
    resourceType,
    prefix,
    pattern: `${prefix}-{0000}`,
    nextNumber: 1,
    status: "启用",
  }));
}

function buildDepartments(): Department[] {
  return [
    { id: "dept-cybersecurity", code: "DEPT-SC", name: "智能建造学院", schoolId: "school-1", status: "启用" },
    { id: "dept-computer", code: "DEPT-IND", name: "建筑工业化学院", schoolId: "school-1", status: "启用" },
    { id: "dept-media", code: "DEPT-UR", name: "城市更新学院", schoolId: "school-1", status: "启用" },
  ];
}

function buildSchoolMajors(): SchoolMajor[] {
  return [
    { id: "major-network-engineering", code: "MAJ-SC", name: "智能建造技术", departmentId: "dept-cybersecurity", schoolId: "school-1", description: "面向钢结构施工、智能建造与项目交付。", status: "启用" },
    { id: "major-cyber-security", code: "MAJ-CE", name: "土木工程", departmentId: "dept-cybersecurity", schoolId: "school-1", description: "面向结构设计、施工与工程管理。", status: "启用" },
    { id: "major-computer", code: "MAJ-IND", name: "装配式建筑工程技术", departmentId: "dept-computer", schoolId: "school-1", description: "面向构件生产、模块化产品与产线管理。", status: "启用" },
    { id: "major-digital-media", code: "MAJ-UR", name: "城市更新技术", departmentId: "dept-media", schoolId: "school-1", description: "面向城市体检、更新策划与既有建筑改造。", status: "启用" },
  ];
}

function buildTeacherRecords(): TeacherRecord[] {
  return [
    { id: "teacher-zhou", teacherNo: "T2024001", name: "周启明", departmentId: "dept-cybersecurity", schoolId: "school-1", title: "副教授", phone: "138-0000-1001", email: "zhou@example.edu", status: "在职" },
    { id: "teacher-wang", teacherNo: "T2024002", name: "王明", departmentId: "dept-cybersecurity", schoolId: "school-1", title: "讲师", phone: "138-0000-1002", email: "wang@example.edu", status: "在职" },
    { id: "teacher-li", teacherNo: "T2024003", name: "李静", departmentId: "dept-computer", schoolId: "school-1", title: "讲师", phone: "138-0000-1003", email: "li@example.edu", status: "在职" },
    { id: "teacher-chen", teacherNo: "T2024004", name: "陈晨", departmentId: "dept-media", schoolId: "school-1", title: "副教授", phone: "138-0000-1004", email: "chen@example.edu", status: "在职" },
  ];
}

function buildStudentRecords(): StudentRecord[] {
  return [
    {
      id: "student-lin",
      studentNo: "20240101",
      name: "林知远",
      classId: "class-1",
      schoolId: "school-1",
      majorId: "major-network-engineering",
      phone: "138-0000-2027",
      email: "lin@example.edu",
      status: "在读",
    },
    ...classmates.map((learner, index) => ({
      id: learner.id,
      studentNo: `2024${String(index + 2).padStart(4, "0")}`,
      name: learner.name,
      classId: "class-1",
      schoolId: "school-1",
      majorId: "major-network-engineering",
      phone: `138-0000-3${String(index + 1).padStart(3, "0")}`,
      email: `student${index + 1}@example.edu`,
      status: "在读" as const,
    })),
  ];
}

function buildStudentCourseProgress(): Record<string, Record<string, number[]>> {
  const firstCourse = courses[0]?.id ?? "course-0";
  const secondCourse = courses[1]?.id ?? "course-1";
  return {
    "student-lin": { [firstCourse]: [0, 1] },
    "student-sample-1": { [firstCourse]: [0, 1, 2] },
    "student-sample-2": { [firstCourse]: [0], [secondCourse]: [0] },
    "student-sample-3": { [firstCourse]: [0, 1] },
    "student-sample-4": { [firstCourse]: [0] },
  };
}

function buildClassGroups(): ClassGroup[] {
  return [
    {
      id: "class-1",
      code: "CLS-2401",
      name: "智能建造 2401",
      majorId: "major-network-engineering",
      schoolId: "school-1",
      teacherId: "teacher-zhou",
      studentIds: ["student-lin", ...classmates.map((item) => item.id)],
      status: "在读",
    },
  ];
}

function buildTrainingPrograms(): TrainingProgram[] {
  return [
    {
      id: "program-network",
      code: "PGM-2026-01",
      name: "智能建造技术人才培养方案",
      majorId: "major-network-engineering",
      jobIds: ["service", "security", "observability"],
      courseIds: courses.slice(0, 4).map((course) => course.id),
      description: "以智能建造与城市更新岗位能力为主线，组织课程、场景与实训任务。",
      status: "启用",
      updatedAt: createdAt,
    },
  ];
}

function buildTeachingPlans(): TeachingPlan[] {
  return [
    {
      id: "plan-2026-fall",
      code: "PLAN-2026-01",
      name: "2026 秋季教学计划",
      term: "2026 秋季",
      programId: "program-network",
      classId: "class-1",
      courseIds: courses.slice(0, 3).map((course) => course.id),
      startDate: "2026-09-01",
      endDate: "2027-01-15",
      status: "执行中",
    },
  ];
}

function buildLessonResults(): LessonResult[] {
  return [
    {
      id: "lesson-result-1",
      studentId: "student-lin",
      courseId: courses[0]?.id ?? "course-0",
      chapterIndex: 0,
      score: 88,
      comment: "能够说明钢结构识图与深化设计的基本路径，章节练习完成。",
      reviewer: "周启明",
      reviewedAt: createdAt,
    },
  ];
}

function buildScheduleEntries(): ScheduleEntry[] {
  return [
    {
      id: "schedule-1",
      term: "2026 秋季",
      classId: "class-1",
      teacherId: "teacher-zhou",
      courseId: "",
      sceneId: scenes[0]?.id ?? "",
      location: "智能建造实训中心",
      weekday: "周一",
      startTime: "09:00",
      endTime: "10:40",
      status: "待上课",
    },
    {
      id: "schedule-2",
      term: "2026 秋季",
      classId: "class-1",
      teacherId: "teacher-zhou",
      courseId: courses[0]?.id ?? "",
      sceneId: "",
      location: "智能建造 2401 教室",
      weekday: "周三",
      startTime: "14:00",
      endTime: "15:40",
      status: "待上课",
    },
    {
      id: "schedule-3",
      term: "2026 秋季",
      classId: "class-1",
      teacherId: "teacher-wang",
      courseId: "",
      sceneId: scenes[1]?.id ?? "",
      location: "建筑工业化实训车间",
      weekday: "周五",
      startTime: "10:00",
      endTime: "11:40",
      status: "待上课",
    },
  ];
}

const additionalJobPostings: JobPosting[] = [
  ["job-posting-nfr", "BIM 与数字孪生工程师", "中建科工", "nfr", "建筑数字化", "深圳", "全职", 14, 22, 1, "BIM 建模与数字孪生能力匹配"],
  ["job-posting-incident", "既有建筑检测加固工程师", "中建科工城市更新", "incident", "城市更新", "上海", "全职", 12, 19, 2, "结构检测与加固方案能力匹配"],
  ["job-posting-delivery", "工程项目管理工程师", "中建科工", "delivery", "建筑工程", "深圳", "全职", 12, 20, 2, "进度成本与多方协同能力匹配"],
  ["job-posting-solution", "智能建造解决方案顾问", "中建科工智能科技", "solution", "智能建造", "深圳", "全职", 16, 26, 3, "智能建造方案与价值验证能力匹配"],
  ["job-posting-obs-intern", "城市更新策划实习生", "中建科工城市更新", "observability", "城市更新", "深圳", "实习", 5, 8, 1, "城市体检与更新策划基础匹配"],
  ["job-posting-sec-remote", "智慧工地实施工程师", "科工智能科技", "security", "智能建造", "广州", "全职", 10, 16, 4, "智慧工地与设备接入能力匹配"],
  ["job-posting-service-shenzhen", "钢结构深化设计师", "中建科工设计院", "service", "建筑设计", "深圳", "全职", 11, 18, 3, "钢结构深化与 BIM 能力匹配"],
  ["job-posting-ops-shanghai", "钢结构安装工程师", "中建科工华东", "operations", "建筑工程", "上海", "全职", 11, 18, 5, "吊装与测量校正能力匹配"],
  ["job-posting-deploy-gz", "装配式构件工艺工程师", "中建科工绿色科技", "deployment", "建筑工业化", "惠州", "全职", 9, 15, 6, "构件工艺与产线管理能力匹配"],
  ["job-posting-presales-nanjing", "模块化产品工程师", "中建科工绿色科技", "presales", "模块化建筑", "深圳", "全职", 12, 20, 7, "模块化产品与箱体组合能力匹配"],
  ["job-posting-incident-chengdu", "结构检测工程师", "西南检测中心", "incident", "工程检测", "成都", "全职", 9, 15, 8, "检测鉴定与报告表达能力匹配"],
  ["job-posting-nfr-intern", "BIM 实习生", "中建科工设计院", "nfr", "建筑设计", "深圳", "实习", 5, 8, 9, "BIM 建模与协同基础匹配"],
].map(([id, name, company, jobId, industry, city, employmentType, salaryMin, salaryMax, publishedDaysAgo, matchHighlight]) => ({
  id: String(id),
  name: String(name),
  company: String(company),
  description: `${String(name)}岗位围绕真实业务系统完成分析、协作和交付。`,
  jobId: String(jobId),
  minMatch: 80,
  industry: String(industry),
  city: String(city),
  employmentType: employmentType as JobPosting["employmentType"],
  experience: employmentType === "实习" ? "1年以内" : "1-3年",
  education: employmentType === "实习" ? "大专" : "本科",
  salaryMin: Number(salaryMin),
  salaryMax: Number(salaryMax),
  companySize: "100-1000人",
  companyType: "民营",
  publishedDaysAgo: Number(publishedDaysAgo),
  matchHighlight: String(matchHighlight),
  responsibilities: ["完成岗位核心分析任务", "记录过程、证据与交付结果", "参与团队复盘和持续改进"],
  requirements: ["具备相关岗位基础知识", "能够清晰说明判断依据", "具备协作和交付意识"],
  status: "已发布" as const,
}));

function seedTaskSubmissions(): TaskSubmission[] {
  const samples: [string, string, number][] = [
    ["customer-scope", "customer-scope-task-1", 100],
    ["customer-scope", "customer-scope-task-2", 96],
    ["customer-scope", "customer-scope-task-3", 92],
    ["bank", "bank-task-1", 98],
    ["bank", "bank-task-2", 94],
    ["bank", "bank-task-3", 90],
    ["asset-baseline", "asset-baseline-task-1", 20],
    ["asset-baseline", "asset-baseline-task-2", 16],
    ["baseline-analysis", "baseline-analysis-task-1", 30],
    ["baseline-analysis", "baseline-analysis-task-2", 24],
  ];
  const at = "2026-11-16 16:00";
  return samples.flatMap(([sceneId, taskId, total]) => {
    const scene = scenes.find((item) => item.id === sceneId);
    const task = scene ? enrichScene(scene).taskDetails?.find((item) => item.id === taskId) : undefined;
    if (!task) return [];
    const assessmentResults = task.assessmentMethods
      .filter((method) => method.required && ["随堂测", "题库"].includes(method.type))
      .map((method) => ({
        id: `seed-result-${taskId}-${method.id}`,
        methodId: method.id,
        type: method.type,
        status: "已通过" as const,
        score: total,
        submittedAt: at,
        reviewer: "随堂测自动评分",
        comment: "已完成岗位场景随堂检测",
      }));
    const submission: TaskSubmission = {
      id: `seed-submission-${taskId}`,
      studentId: "student-lin",
      studentName: "林知远",
      sceneId,
      taskId,
      status: "已通过",
      evidenceIds: task.requiredEvidenceIds,
      worksheet: task.type === "训练" ? "已完成任务步骤、证据核对与过程记录。" : "",
      answer: task.type === "测评" ? "已完成专业判断、证据说明与替代方案排除。" : "",
      analysis: task.type === "复盘" ? "已说明问题范围、证据关系和定位结论。" : "",
      nextStep: task.type === "复盘" ? "继续补充未验证边界，并进入下一任务验证。" : "",
      boundaryAcknowledged: task.type === "复盘",
      submittedAt: at,
      updatedAt: at,
      reviews: [{
        id: `seed-review-${taskId}`,
        reviewer: "周启明",
        reviewedAt: at,
        decision: "passed",
        total,
        comment: "证据与过程完整，能够进入下一任务。",
        tags: ["证据清楚", "过程完整"],
        scores: task.rubric.map((item) => ({
          rubricId: item.id,
          label: item.label,
          score: Math.round(item.weight * total / 100),
          weight: item.weight,
        })),
      }],
      assessmentResults,
      history: [createAudit("周启明", "通过任务成果", taskId, "演示学习记录")],
    };
    return [submission];
  });
}

export function seedWorkspace(): EnterpriseWorkspaceState {
  const resources = initialResources();
  return {
    schemaVersion: 16,
    role: null,
    activeSchoolId: "school-1",
    activeStudentId: "student-lin",
    activeTeacherId: "teacher-zhou",
    teacherGuideSeen: false,
    resources,
    majorGroups: clone(majorGroups),
    classroom: {
      id: "class-1",
      name: "智能建造 2401",
      major: "智能建造技术",
      teacherId: "teacher-zhou",
      teacherName: "周启明",
      schedule: "2026-11-17",
      studentIds: ["student-lin", ...classmates.map((item) => item.id)],
    },
    classmates,
    works: [],
    taskSubmissions: seedTaskSubmissions(),
    sceneCompletions: [],
    learningPaths: clone(jobLearningPaths),
    offlineSessions: clone(seededOfflineSessions),
    attendanceRecords: [],
    examAttempts: [],
    certificates: [],
    projects: [
      {
        id: "project-bank",
        name: "超高层钢结构智慧建造实践",
        company: "中建科工",
        description: "基于 400 米级塔楼项目，完成伸臂桁架合龙组织与智慧建造中心部署复盘。",
        deliverables: ["合龙专项方案", "智慧建造中心部署清单", "施工复盘报告"],
        acceptance: ["测量与温度修正有依据", "机器人协同边界清楚", "安全停止条件明确"],
        schoolIds: ["school-1"],
        jobId: "operations",
        minMatch: 60,
        deadline: "2026-12-20",
        status: "已发布",
        code: "WO-STEEL-1201",
        category: "超高层施工",
        workStatus: "待接单",
        teamSize: 4,
        duration: "4 周",
        reward: "3,000 元/组",
        deliveryMode: "远程",
        outcome: "交付可复核的合龙方案、智慧建造部署清单和施工复盘",
      },
      {
        id: "project-energy",
        name: "模块化工厂产线节拍优化",
        company: "中建科工绿色科技",
        description: "对焊接与箱体产线进行节拍测量，提出产能恢复与质量保持方案。",
        deliverables: ["产线节拍平衡图", "瓶颈分析", "优化实施方案"],
        acceptance: ["数据采集完整", "质量指标不下降", "方案可执行"],
        schoolIds: ["school-1"],
        jobId: "deployment",
        minMatch: 60,
        deadline: "2026-12-28",
        status: "已发布",
        code: "WO-MFG-1202",
        category: "智能制造",
        workStatus: "待接单",
        teamSize: 5,
        duration: "4 周",
        reward: "3,600 元/组",
        deliveryMode: "驻场",
        outcome: "形成可执行的产线节拍优化方案与质量验证记录",
      },
      {
        id: "project-cloud",
        name: "体育中心改造施工协同",
        company: "中建科工",
        description: "结合大型场馆改造，梳理既有结构、赛事保障与施工组织的界面。",
        deliverables: ["施工界面矩阵", "风险清单", "协同实施计划"],
        acceptance: ["界面责任清晰", "赛事保障优先", "风险可追溯"],
        schoolIds: ["school-1"],
        jobId: "delivery",
        minMatch: 60,
        deadline: "2027-01-08",
        status: "已发布",
        code: "WO-REN-1203",
        category: "城市更新",
        workStatus: "进行中",
        teamSize: 4,
        duration: "6 周",
        reward: "4,800 元/组",
        deliveryMode: "混合",
        outcome: "完成改造施工界面矩阵、风险清单与协同计划",
      },
      {
        id: "project-incident",
        name: "既有住宅原拆原建方案",
        company: "中建科工城市更新",
        description: "针对危旧住宅，完成鉴定结论梳理、原拆原建测算与居民沟通方案。",
        deliverables: ["实施方案", "资金测算", "居民沟通计划"],
        acceptance: ["安全结论明确", "资金边界清楚", "回迁规则可执行"],
        schoolIds: ["school-1"],
        jobId: "observability",
        minMatch: 60,
        deadline: "2027-01-15",
        status: "已发布",
        code: "WO-UR-1204",
        category: "城市更新",
        workStatus: "进行中",
        teamSize: 6,
        duration: "3 周",
        reward: "4,000 元/组",
        deliveryMode: "混合",
        outcome: "交付实施方案、资金测算和居民沟通计划",
      },
      {
        id: "project-collection",
        name: "模块化学校箱体吊装",
        company: "中建科工绿色科技",
        description: "为 24 班模块化学校编制箱体组合、运输与吊装专项方案。",
        deliverables: ["箱体组合图", "吊装顺序", "运输计划"],
        acceptance: ["堆场与交通约束有解", "吊装顺序合理", "安全措施完整"],
        schoolIds: ["school-1"],
        jobId: "presales",
        minMatch: 60,
        deadline: "2027-01-20",
        status: "已发布",
        code: "WO-MOD-1205",
        category: "模块化建筑",
        workStatus: "已完成",
        teamSize: 3,
        duration: "2 周",
        reward: "2,400 元/组",
        deliveryMode: "驻场",
        outcome: "完成箱体组合、运输计划和吊装专项方案",
      },
      {
        id: "project-poc",
        name: "智慧工地平台接入验证",
        company: "中建科工智能科技",
        description: "在真实项目验证塔吊、环境、劳务与视频数据接入及告警闭环。",
        deliverables: ["接入方案", "告警规则", "验收报告"],
        acceptance: ["数据口径统一", "断网可续传", "告警可行动"],
        schoolIds: ["school-1"],
        jobId: "security",
        minMatch: 60,
        deadline: "2027-02-01",
        status: "已发布",
        code: "WO-SITE-1206",
        category: "智能建造",
        workStatus: "待接单",
        teamSize: 3,
        duration: "5 周",
        reward: "5,000 元/组",
        deliveryMode: "混合",
        outcome: "形成接入方案、分级告警规则和验收报告",
      },
    ],
    jobPostings: [
      {
        id: "job-posting-service",
        name: "钢结构深化设计工程师 · 2027 届实习",
        company: "中建科工",
        description: "参与超高层与场馆项目的深化设计，完成节点建模、构件清单与图纸交底。",
        jobId: "service",
        minMatch: 80,
        industry: "建筑设计",
        city: "深圳",
        employmentType: "实习",
        experience: "1年以内",
        education: "本科",
        salaryMin: 6,
        salaryMax: 9,
        companySize: "1000人以上",
        companyType: "国企",
        publishedDaysAgo: 1,
        matchHighlight: "识图建模与节点深化能力符合岗位要求",
        responsibilities: ["完成钢结构深化建模与节点设计", "输出构件清单与加工图", "参与设计与工厂、现场的交底"],
        requirements: ["掌握 CAD 与 BIM 基础", "理解钢结构构造与连接", "具备图纸自检意识"],
        status: "已发布",
      },
      {
        id: "job-posting-security",
        name: "智能建造实施工程师",
        company: "中建科工智能科技",
        description: "负责智慧工地平台、建筑机器人与现场数据接入的实施与运维。",
        jobId: "security",
        minMatch: 80,
        industry: "智能建造",
        city: "深圳",
        employmentType: "全职",
        experience: "1-3年",
        education: "本科",
        salaryMin: 12,
        salaryMax: 18,
        companySize: "1000人以上",
        companyType: "国企",
        publishedDaysAgo: 2,
        matchHighlight: "设备接入与现场协同能力突出",
        responsibilities: ["部署智慧工地与建筑机器人", "完成设备接入和数据校验", "组织现场培训与运维"],
        requirements: ["了解物联网与网络基础", "具备现场实施经验", "能够编写实施文档"],
        status: "已发布",
      },
      {
        id: "job-posting-observability",
        name: "城市更新项目策划师",
        company: "中建科工城市更新",
        description: "参与片区体检、更新策划与投建运方案编制。",
        jobId: "observability",
        minMatch: 80,
        industry: "城市更新",
        city: "深圳",
        employmentType: "全职",
        experience: "3-5年",
        education: "本科",
        salaryMin: 14,
        salaryMax: 22,
        companySize: "1000人以上",
        companyType: "国企",
        publishedDaysAgo: 2,
        matchHighlight: "城市体检与资金平衡分析能力匹配",
        responsibilities: ["开展片区体检与居民调研", "编制更新实施方案", "协调政府、居民与运营方"],
        requirements: ["熟悉城市更新政策", "具备方案与测算能力", "擅长多方沟通"],
        status: "已发布",
      },
      {
        id: "job-posting-deployment",
        name: "装配式构件工艺工程师",
        company: "中建科工绿色科技",
        description: "负责钢构件与模块箱体的工艺编制、产线节拍和质量追溯。",
        jobId: "deployment",
        minMatch: 80,
        industry: "建筑工业化",
        city: "惠州",
        employmentType: "全职",
        experience: "1-3年",
        education: "大专",
        salaryMin: 9,
        salaryMax: 14,
        companySize: "500-1000人",
        companyType: "国企",
        publishedDaysAgo: 3,
        matchHighlight: "焊接工艺与产线管理能力匹配",
        responsibilities: ["编制构件生产工艺", "优化产线节拍与工装", "维护质量追溯记录"],
        requirements: ["熟悉焊接或装配工艺", "能读懂工艺文件", "具备现场改善意识"],
        status: "已发布",
      },
      {
        id: "job-posting-presales",
        name: "模块化建筑产品工程师",
        company: "中建科工绿色科技",
        description: "面向学校、医院与公寓场景，完成模块化产品选型、组合与交付方案。",
        jobId: "presales",
        minMatch: 80,
        industry: "模块化建筑",
        city: "深圳",
        employmentType: "全职",
        experience: "1-3年",
        education: "本科",
        salaryMin: 13,
        salaryMax: 20,
        companySize: "500-1000人",
        companyType: "国企",
        publishedDaysAgo: 3,
        matchHighlight: "产品化设计与方案表达能力较强",
        responsibilities: ["分析客户使用需求", "完成箱体组合与产品选型", "编制交付与运输方案"],
        requirements: ["理解模块化建筑体系", "具备建筑制图能力", "能够进行方案汇报"],
        status: "已发布",
      },
      {
        id: "job-posting-operations",
        name: "钢结构安装工程师",
        company: "中建科工",
        description: "组织超高层与大跨度钢结构吊装、测量校正和焊接管理。",
        jobId: "operations",
        minMatch: 80,
        industry: "建筑工程",
        city: "上海",
        employmentType: "全职",
        experience: "1-3年",
        education: "本科",
        salaryMin: 11,
        salaryMax: 17,
        companySize: "1000人以上",
        companyType: "国企",
        publishedDaysAgo: 4,
        matchHighlight: "吊装组织与测量校正能力匹配",
        responsibilities: ["编制吊装与安装方案", "组织测量校正和焊接验收", "落实施工安全措施"],
        requirements: ["掌握钢结构施工工艺", "能使用测量仪器", "具备现场组织能力"],
        status: "已发布",
      },
      {
        id: "job-posting-bank-network",
        name: "大跨度场馆施工工程师",
        company: "中建科工",
        description: "负责体育场馆屋盖滑移、提升等大跨度钢结构施工组织。",
        jobId: "operations",
        minMatch: 80,
        industry: "场馆建设",
        city: "深圳",
        employmentType: "全职",
        experience: "3-5年",
        education: "本科",
        salaryMin: 14,
        salaryMax: 22,
        companySize: "1000人以上",
        companyType: "国企",
        publishedDaysAgo: 4,
        matchHighlight: "滑移施工与同步控制经验相关",
        responsibilities: ["编制大跨度施工方案", "组织滑移与同步控制", "监测结构与支撑状态"],
        requirements: ["熟悉大跨度钢结构施工", "掌握监测与应急方法", "具备跨专业协调经验"],
        status: "已发布",
      },
      {
        id: "job-posting-soc",
        name: "智慧工地运维工程师",
        company: "科工智能科技",
        description: "维护智慧工地平台、现场网络与设备告警，保障数据连续可用。",
        jobId: "security",
        minMatch: 80,
        industry: "智能建造",
        city: "深圳",
        employmentType: "全职",
        experience: "1-3年",
        education: "本科",
        salaryMin: 10,
        salaryMax: 16,
        companySize: "100-500人",
        companyType: "国企",
        publishedDaysAgo: 5,
        matchHighlight: "设备运维与告警处置能力较完整",
        responsibilities: ["维护现场网络与边缘设备", "处理平台与设备告警", "参与值班和复盘"],
        requirements: ["了解网络与物联网基础", "能够排查设备离线问题", "具备文档整理能力"],
        status: "已发布",
      },
      {
        id: "job-posting-observability-junior",
        name: "城市更新策划助理",
        company: "中建科工城市更新",
        description: "协助城市体检、居民调研和更新项目资料整理。",
        jobId: "observability",
        minMatch: 80,
        industry: "城市更新",
        city: "上海",
        employmentType: "实习",
        experience: "1年以内",
        education: "本科",
        salaryMin: 5,
        salaryMax: 8,
        companySize: "1000人以上",
        companyType: "国企",
        publishedDaysAgo: 6,
        matchHighlight: "调研与资料分析基础匹配",
        responsibilities: ["整理体检与调研资料", "协助编制更新方案", "维护项目台账"],
        requirements: ["关注城市更新议题", "具备调研分析能力", "熟练使用办公软件"],
        status: "已发布",
      },
      {
        id: "job-posting-remote-support",
        name: "钢结构深化设计工程师",
        company: "中建科工设计院",
        description: "承担超高层、场馆与模块化项目的深化设计与技术支持。",
        jobId: "service",
        minMatch: 80,
        industry: "建筑设计",
        city: "深圳",
        employmentType: "全职",
        experience: "1-3年",
        education: "本科",
        salaryMin: 12,
        salaryMax: 19,
        companySize: "1000人以上",
        companyType: "国企",
        publishedDaysAgo: 7,
        matchHighlight: "BIM 深化与跨专业协同能力匹配",
        responsibilities: ["完成深化设计与节点优化", "协调设计与工厂接口", "支持现场技术问题处理"],
        requirements: ["熟练使用深化设计软件", "理解加工与安装工艺", "具备沟通协调能力"],
        status: "已发布",
      },
      {
        id: "job-posting-data-center",
        name: "BIM 与数字孪生工程师",
        company: "中建科工数字建造中心",
        description: "建立项目 BIM 与数字孪生场景，打通设计、施工与运维数据。",
        jobId: "nfr",
        minMatch: 80,
        industry: "建筑数字化",
        city: "深圳",
        employmentType: "全职",
        experience: "1-3年",
        education: "本科",
        salaryMin: 13,
        salaryMax: 21,
        companySize: "1000人以上",
        companyType: "国企",
        publishedDaysAgo: 8,
        matchHighlight: "模型构建与数据贯通能力相关",
        responsibilities: ["建立与维护 BIM 模型", "搭建数字孪生看板", "制定数据编码与更新机制"],
        requirements: ["掌握 BIM 软件与数据标准", "了解施工流程", "具备可视化表达能力"],
        status: "已发布",
      },
      {
        id: "job-posting-security-delivery",
        name: "既有建筑检测加固工程师",
        company: "中建科工城市更新",
        description: "开展既有建筑检测鉴定、加固设计与改造施工管理。",
        jobId: "incident",
        minMatch: 80,
        industry: "工程检测",
        city: "上海",
        employmentType: "全职",
        experience: "1-3年",
        education: "本科",
        salaryMin: 10,
        salaryMax: 16,
        companySize: "1000人以上",
        companyType: "国企",
        publishedDaysAgo: 9,
        matchHighlight: "检测鉴定与加固方案能力匹配",
        responsibilities: ["完成现场检测与鉴定", "编制加固设计方案", "组织改造施工与验收"],
        requirements: ["熟悉检测鉴定规范", "掌握常见加固工法", "具备报告编写能力"],
        status: "已发布",
      },
      ...additionalJobPostings,
    ],
    applications: [],
    schools: [
      { id: "school-1", name: "华南建筑职业技术大学", college: "智能建造学院", plan: "岗位培养专业版", contact: "陈疏影", status: "服务中" },
      { id: "school-2", name: "岭南建设职业技术学院", college: "建筑工业化学院", plan: "试用", contact: "待补充", status: "合作洽谈" },
      { id: "school-3", name: "滨海城市更新学院", college: "城市更新学院", plan: "待签约", contact: "待补充", status: "方案确认" },
      { id: "school-4", name: "中原智能建造职业学院", college: "智能建造学院", plan: "岗位培养标准版", contact: "赵文清", status: "服务中" },
      { id: "school-5", name: "江南应用技术大学", college: "土木与建筑学院", plan: "岗位培养专业版", contact: "林若川", status: "服务中" },
      { id: "school-6", name: "西部绿色建筑学院", college: "建筑环境学院", plan: "试用", contact: "周明远", status: "方案确认" },
    ],
    abilityCatalog: buildAbilityCatalog(),
    knowledgeCatalog: buildKnowledgePoints(),
    teachingMaterials: buildTeachingMaterials(),
    evaluationMethodCatalog: buildEvaluationMethodCatalog(),
    codeRules: buildCodeRules(),
    departments: buildDepartments(),
    schoolMajors: buildSchoolMajors(),
    classGroups: buildClassGroups(),
    studentRecords: buildStudentRecords(),
    teacherRecords: buildTeacherRecords(),
    trainingPrograms: buildTrainingPrograms(),
    teachingPlans: buildTeachingPlans(),
    scheduleEntries: buildScheduleEntries(),
    lessonResults: buildLessonResults(),
    resume: {
      name: "林知远",
      phone: "138-0000-2027",
      education: "智能建造技术 · 2027 届",
      summary: "关注钢结构深化与智能建造，正在完成中建科工岗位实训。",
    },
    favorites: [],
    standardWeights: [20, 18, 16, 16, 15, 15],
    auditEvents: [],
    studentCourseProgress: buildStudentCourseProgress(),
    platformAdmin: createPlatformAdminSeed(),
  };
}
