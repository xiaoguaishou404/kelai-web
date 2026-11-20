import { platformDefinitions } from "./definitions";
import {
  ApprovalBatch,
  ApprovalRequest,
  ApprovalWorkflow,
  CertificateDefinition,
  PlatformAdminState,
  PlatformDefinition,
  PlatformGroupDefinition,
  PlatformPageDefinition,
  PlatformRecord,
} from "./types";

const seededUpdatedAt = "2026-11-18 16:40";

const demoRecordNames: Record<string, string> = {
  "career:positions": "技术服务工程师",
  tenant: "江城理工学院",
  package: "岗位培养专业版",
  codes: "资源编码规范",
  industries: "网络与信息服务",
  majors: "网络工程",
  backgrounds: "产业链分析首页",
  mallpush: "年度场景更新包",
  org: "网络空间安全学院",
  students: "林知远",
  teachers: "周启明",
  accounts: "院校管理员账号",
  roles: "资源建设专家",
  positions: "专业负责人",
  relations: "网络工程 2401 班主任",
  loglogin: "教师端登录记录",
  logoperation: "资源审核操作记录",
  positionsCareer: "技术服务工程师",
  archiveCareer: "历史岗位版本",
  recommend: "推荐岗位配置",
  "learn-roads": "技术服务工程师学习路径",
  scenarios: "银行网点交易变慢定位",
  archiveScene: "历史场景版本",
  batches: "2026 秋季资源建设批次",
  workflows: "资源三级审批",
  approvals: "资源审批待办",
  system: "网络协议与流量分析基础",
  granular: "TCP 性能诊断实务",
  hybrid: "故障复盘与交付表达",
  textbooks: "流量分析方法与实战",
  culture: "网络分析职业规范与数据合规",
  "question-banks": "技术服务岗位题库",
  exams: "技术服务岗位综合测评",
  "exam-usage": "技术服务岗位综合测评 · 第 1 场",
  methods: "场景实操评价",
  "scene-results": "银行交易场景成果",
  "lesson-results": "协议分析课程节点",
  "daily-exams": "技术服务综合测评",
  "job-ability": "技术服务岗位能力认定",
  "job-ability-results": "林知远岗位能力认定",
  knowledge: "业务时间窗与五元组",
  ability: "故障定位",
  certificates: "岗位实战结业凭证",
  doc: "故障复盘报告模板",
  image: "业务链路示意图",
  video: "客户故障分析演示",
  questions: "如何确认不可见边界",
  mine: "我的网络分析案例",
  tags: "重点资源",
  programs: "网络工程人才培养方案",
  "teaching-plans": "2026 秋季教学计划",
  scheduling: "网络工程 2401 排课",
  portraits: "网络工程 2401 能力画像",
  school: "江城理工学院",
  enterprises: "科来网络",
  projects: "银行网点交易异常复盘",
  agreements: "校企合作框架协议",
  achievements: "岗位场景课程共建成果",
  experts: "周明",
  permissions: "专家资源评审权限",
  dictionaries: "行业分类字典",
  brands: "品牌运营概览",
  "brands-talent": "优秀学员成长档案",
  "brands-employer": "科来雇主品牌",
  "brands-job": "技术服务岗位品牌",
  "brands-major": "网络工程专业品牌",
  "brands-teacher": "双师型教师案例",
  "brands-culture": "数据合规与职业责任",
  "employment-project": "2027 届网络分析实习项目",
  "employment-job": "技术服务工程师实习",
  chat: "资源知识助手",
  reviews: "场景资源上架审核",
  kbs: "岗位与场景教学知识库",
  agents: "教学资源推荐助手",
  integrations: "本地知识检索服务",
};

const seedName = (
  definition: PlatformDefinition,
  group: PlatformGroupDefinition,
  pageDefinition: PlatformPageDefinition,
) =>
  demoRecordNames[`${definition.id}:${pageDefinition.id}`] ??
  demoRecordNames[pageDefinition.id] ??
  `${definition.short}${group.label}${pageDefinition.entity}`;

export function createPlatformAdminSeed(): PlatformAdminState {
  const records: PlatformRecord[] = [];
  const codePrefixes: Record<string, string> = {
    system: "SYS",
    career: "JOB",
    scene: "SCN",
    course: "CRS",
    ability: "ASM",
    resource: "RES",
    affairs: "ACA",
    alliance: "ALN",
    ai: "AIS",
  };
  platformDefinitions.forEach((definition, platformIndex) => {
    definition.groups.forEach((group, groupIndex) => {
      group.pages.slice(0, 2).forEach((pageDefinition, pageIndex) => {
        const index = platformIndex * 10 + groupIndex * 2 + pageIndex + 1;
        records.push({
          id: `${definition.id}-${pageDefinition.id}-${index}`,
          platformId: definition.id,
          pageId: pageDefinition.id,
          name: pageDefinition.entity === "审批" ? `${group.label}待办事项` : seedName(definition, group, pageDefinition),
          code: `${codePrefixes[definition.id] ?? "KL"}-${String(index).padStart(4, "0")}`,
          status: pageDefinition.capabilities.includes("approve") ? "待审批" : index % 5 === 0 ? "草稿" : "已发布",
          owner: ["王明", "李静", "周启明", "陈晨"][index % 4],
          updatedAt: seededUpdatedAt,
          data: {
            所属模块: group.label,
            说明: pageDefinition.description,
            关联院校: "江城理工学院",
            适用范围: "网络工程、网络空间安全专业群",
          },
        });
      });
    });
  });

  platformDefinitions.forEach((definition, platformIndex) => {
    definition.groups.forEach((group, groupIndex) => {
      group.pages.forEach((pageDefinition, pageIndex) => {
        const existing = records.filter(
          (item) => item.platformId === definition.id && item.pageId === pageDefinition.id,
        );
        for (let index = existing.length; index < 5; index += 1) {
          records.push({
            id: `${definition.id}-${pageDefinition.id}-extra-${index + 1}`,
            platformId: definition.id,
            pageId: pageDefinition.id,
            name:
              pageDefinition.entity === "审批"
                ? `${group.label}审批记录 ${index + 1}`
                : `${seedName(definition, group, pageDefinition)} · ${["基础版", "行业版", "综合版", "扩展版"][index - 1] ?? `版本 ${index + 1}`}`,
            code: `${codePrefixes[definition.id] ?? "KL"}-${String(platformIndex * 100 + groupIndex * 10 + pageIndex * 5 + index + 1).padStart(4, "0")}`,
            status: pageDefinition.capabilities.includes("approve") ? ["待审批", "已通过", "已驳回"][index % 3] : index % 4 === 0 ? "草稿" : "已发布",
            owner: ["王明", "李静", "周启明", "陈晨"][index % 4],
            updatedAt: seededUpdatedAt,
            data: {
              所属模块: group.label,
              说明: pageDefinition.description,
              关联院校: index % 2 === 0 ? "江城理工学院" : "江南应用技术大学",
              适用范围: "网络工程、网络空间安全专业群",
            },
          });
        }
      });
    });
  });

  const workflows: ApprovalWorkflow[] = platformDefinitions
    .filter((definition) => ["career", "scene", "course", "ability", "affairs"].includes(definition.id))
    .map((definition) => ({
      id: `flow-${definition.id}`,
      platformId: definition.id,
      name: `${definition.short}资源三级审批`,
      description: "院系初审、专业复核、教务终审",
      steps: [
        { name: "院系初审", identity: "departmentLead" },
        { name: "专业复核", identity: "majorLead" },
        { name: "教务终审", identity: "academicAffairs" },
      ],
    }));

  const batches: ApprovalBatch[] = workflows.map((flow, index) => ({
    id: `batch-${flow.platformId}`,
    platformId: flow.platformId,
    name: `2026 秋季${platformDefinitions.find((item) => item.id === flow.platformId)?.short}资源建设批次`,
    code: `BATCH-2026-${String(index + 1).padStart(3, "0")}`,
    flowId: flow.id,
    status: "开放中",
    createdAt: "2026-09-01 09:00",
  }));

  const pendingApproval: ApprovalRequest = {
    id: "approval-bank-scene",
    resourceId: "bank",
    platformId: "scene",
    title: "银行网点交易变慢定位",
    code: "KL-CJ-001",
    batchId: "batch-scene",
    flowId: "flow-scene",
    submittedBy: "周启明",
    submittedAt: "2026-11-18 15:20",
    status: "审批中",
    currentStep: 0,
    steps: workflows.find((item) => item.id === "flow-scene")!.steps.map((step, index) => ({
      id: `approval-bank-scene-${index}`,
      ...step,
      state: "pending",
    })),
  };

  const certificates: CertificateDefinition[] = [
    {
      id: "cert-platform",
      name: "岗位实战结业凭证",
      category: "平台认证",
      issuer: "科来-知与场景化产教融合平台",
      level: "岗位达标",
      jobIds: ["service"],
      abilityCount: 6,
      condition: "完成岗位学习路径、通过必选场景任务和综合测评",
      format: "学习记录 + 实操成果 + 综合测评",
      examDate: "随到随测",
      status: "报名中",
      sample: false,
    },
    {
      id: "cert-csna",
      name: "CSNA 网络分析能力认证",
      category: "行业认证",
      issuer: "行业能力认证机构",
      level: "中级",
      jobIds: ["service", "operations"],
      abilityCount: 18,
      condition: "完成规定训练并通过理论与实操考核",
      format: "线上理论 + 场景实操",
      examDate: "2026-12-18",
      status: "报名中",
      sample: true,
    },
    {
      id: "cert-keli",
      name: "科来流量分析工程师能力认证",
      category: "企业认证",
      issuer: "科来网络（演示）",
      level: "中级",
      jobIds: ["service", "observability"],
      abilityCount: 22,
      condition: "岗位能力达到中级，并提交完整实训成果",
      format: "在线测评 + 案例答辩",
      examDate: "2026-12-08",
      status: "报名中",
      sample: true,
    },
    {
      id: "cert-vocational",
      name: "网络运行与安全职业技能等级证书",
      category: "职业技能等级",
      issuer: "职业技能等级评价机构（示例）",
      level: "四级",
      jobIds: ["operations", "security"],
      abilityCount: 26,
      condition: "完成规定学时并通过理论与技能考核",
      format: "理论机考 + 技能考核",
      examDate: "2026-12-28",
      status: "即将开放",
      sample: true,
    },
    {
      id: "cert-incident",
      name: "安全事件响应专项能力认证",
      category: "企业认证",
      issuer: "科来网络（演示）",
      level: "中级",
      jobIds: ["incident", "security"],
      abilityCount: 20,
      condition: "完成应急响应场景并通过证据复盘",
      format: "事件演练 + 复盘答辩",
      examDate: "2027-01-06",
      status: "报名中",
      sample: true,
    },
    {
      id: "cert-observability",
      name: "业务可观测性分析认证",
      category: "行业认证",
      issuer: "行业能力认证机构",
      level: "中级",
      jobIds: ["observability", "nfr", "operations"],
      abilityCount: 24,
      condition: "完成性能基线与跨团队排障场景",
      format: "案例分析 + 在线测评",
      examDate: "2027-01-12",
      status: "报名中",
      sample: true,
    },
    {
      id: "cert-delivery",
      name: "网络采集实施能力认证",
      category: "企业认证",
      issuer: "科来网络（演示）",
      level: "初级",
      jobIds: ["deployment", "delivery"],
      abilityCount: 16,
      condition: "完成采集部署与质量验收任务",
      format: "现场实操 + 验收记录",
      examDate: "2027-01-18",
      status: "报名中",
      sample: true,
    },
    {
      id: "cert-solution",
      name: "行业解决方案顾问认证",
      category: "平台认证",
      issuer: "科来-知与场景化产教融合平台",
      level: "高级",
      jobIds: ["presales", "solution"],
      abilityCount: 22,
      condition: "完成客户 PoC 和方案答辩",
      format: "PoC 成果 + 方案汇报",
      examDate: "2027-02-02",
      status: "即将开放",
      sample: true,
    },
  ];

  return {
    reviewerIdentity: "departmentLead",
    records,
    workflows,
    batches,
    approvals: [pendingApproval],
    certificates,
    enrollments: [],
    examSchedules: [
      {
        id: "exam-schedule-1",
        assessmentId: "assessment-service",
        name: "技术服务岗位综合测评 · 第 1 场",
        classId: "class-1",
        openAt: "2026-11-19 09:00",
        closeAt: "2026-11-20 18:00",
        durationMinutes: 30,
        status: "进行中",
      },
      {
        id: "exam-schedule-security",
        assessmentId: "assessment-security",
        name: "全流量安全分析岗位综合测评 · 第 1 场",
        classId: "class-1",
        openAt: "2026-11-21 09:00",
        closeAt: "2026-11-21 18:00",
        durationMinutes: 45,
        status: "待开始",
      },
      {
        id: "exam-schedule-observability",
        assessmentId: "assessment-observability",
        name: "业务性能分析岗位综合测评 · 第 1 场",
        classId: "class-1",
        openAt: "2026-11-22 09:00",
        closeAt: "2026-11-22 18:00",
        durationMinutes: 40,
        status: "待开始",
      },
    ],
    aiMessages: [
      {
        id: "ai-welcome",
        role: "assistant",
        text: "我会依据平台内的岗位、场景、课程和评价数据回答，并标注来源。",
        sources: [],
        at: "2026-11-18 16:30",
      },
    ],
  };
}
