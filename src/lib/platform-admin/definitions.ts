import { PlatformDefinition, PlatformPageDefinition } from "./types";

const page = (
  id: string,
  label: string,
  description: string,
  entity: string,
  capabilities: PlatformPageDefinition["capabilities"] = ["create", "edit", "archive", "export"],
): PlatformPageDefinition => ({ id, label, description, entity, capabilities });

export const platformDefinitions: PlatformDefinition[] = [
  {
    id: "system",
    label: "系统管理",
    short: "系统",
    description: "院校租户、资源编码与操作审计",
    groups: [
      {
        id: "tenant",
        label: "租户与编码",
        description: "院校租户与统一资源编码",
        pages: [
          page("tenant", "租户信息", "维护院校租户的基础资料与联系人", "租户"),
          page("codes", "资源编码", "统一岗位、场景、课程、能力点等资源编码", "编码"),
        ],
      },
      {
        id: "audit",
        label: "审计日志",
        description: "追踪业务操作",
        pages: [
          page("logoperation", "操作日志", "查看资源、审批和教学操作记录", "日志", ["export"]),
        ],
      },
    ],
  },
  {
    id: "career",
    label: "职业岗位学习平台",
    short: "岗位",
    description: "岗位建设、专业群、审批与学习路径",
    groups: [
      {
        id: "catalog",
        label: "岗位中心",
        description: "岗位标准与版本管理",
        pages: [
          page("positions", "岗位管理", "建设岗位职责、能力模型、证书和关联资源", "岗位"),
          page("major-groups", "专业群适配", "维护专业群与专业、岗位的对应关系", "专业群"),
        ],
      },
      {
        id: "approval",
        label: "批次与审批",
        description: "岗位资源提交、流转和审核",
        pages: [
          page("workflows", "审批流程", "配置岗位资源的多级审批节点", "工作流", ["create", "edit"]),
          page("approvals", "审批中心", "处理岗位资源审批与意见记录", "审批", ["approve", "export"]),
        ],
      },
      {
        id: "display",
        label: "学习路径",
        description: "编排岗位下的课程与场景顺序",
        pages: [
          page("learn-roads", "学习路径", "编排岗位下的课程与场景顺序", "学习路径", ["create", "edit"]),
        ],
      },
    ],
  },
  {
    id: "scene",
    label: "实践场景学习平台",
    short: "场景",
    description: "实践场景、任务链、资源与评价",
    groups: [
      {
        id: "catalog",
        label: "场景中心",
        description: "场景版本、任务链与关联岗位",
        pages: [
          page("scenarios", "场景管理", "建设业务背景、任务链、证据、资源和量规", "场景"),
        ],
      },
      {
        id: "approval",
        label: "批次与审批",
        description: "场景资源批次和多级审核",
        pages: [
          page("batches", "批次分组", "按建设批次组织场景并绑定流程", "批次"),
          page("workflows", "审批流程", "配置场景审核节点和审核身份", "工作流", ["create", "edit"]),
          page("approvals", "审批中心", "处理场景审批并回写资源状态", "审批", ["approve", "export"]),
        ],
      },
    ],
  },
  {
    id: "course",
    label: "数字课程服务平台",
    short: "课程",
    description: "体系课、颗粒课、混合课、教材与审批",
    groups: [
      {
        id: "catalog",
        label: "在线课程",
        description: "课程节点、章节资源和学习进度",
        pages: [
          page("system", "体系课管理", "建设完整岗位课程与章节结构", "课程"),
          page("granular", "颗粒课管理", "维护短时知识节点和配套资源", "课程"),
          page("hybrid", "混合课模板", "组织线上章节与线下实践任务", "混合课"),
          page("culture", "文化思政课", "建设行业价值观、职业规范与案例内容", "文化思政课"),
          page("textbooks", "数字教材", "维护教材目录、章节正文与配套资源", "教材"),
        ],
      },
      {
        id: "approval",
        label: "批次与审批",
        description: "课程资源的提交与审核",
        pages: [
          page("batches", "批次分组", "组织课程建设批次并绑定流程", "批次"),
          page("workflows", "审批流程", "配置课程审核节点", "工作流", ["create", "edit"]),
          page("approvals", "审批中心", "处理课程与教材审批", "审批", ["approve", "export"]),
        ],
      },
    ],
  },
  {
    id: "ability",
    label: "能力评测认证平台",
    short: "测评",
    description: "题库、试卷、考试、评价和岗位能力认定",
    groups: [
      {
        id: "assessment",
        label: "测评资源",
        description: "题库、试卷和考试安排",
        pages: [
          page("question-banks", "题库管理", "维护多题型题目、答案与能力点", "题库"),
          page("exams", "试卷管理", "组卷、分配分值并配置合格线", "试卷"),
          page("exam-usage", "考试管理", "安排考试范围、时间与答题对象", "考试"),
          page("methods", "测评方式", "配置笔试、实操、答辩等测评方式", "测评方式"),
        ],
      },
      {
        id: "approval",
        label: "批次与审批",
        description: "测评资源审核",
        pages: [
          page("batches", "批次分组", "组织测评资源建设批次", "批次"),
          page("workflows", "审批流程", "配置题库和试卷审核节点", "工作流", ["create", "edit"]),
          page("approvals", "审批中心", "处理测评资源审批", "审批", ["approve", "export"]),
        ],
      },
      {
        id: "results",
        label: "结果与认证",
        description: "评价结果和岗位能力认定",
        pages: [
          page("scene-results", "场景任务评价", "查看并复核学生场景成果", "评价结果", ["edit", "export"]),
          page("lesson-results", "课程节点评价", "查看课程节点完成与成绩", "评价结果", ["edit", "export"]),
          page("daily-exams", "日常考试评价", "复核考试成绩和异常答卷", "考试结果", ["edit", "export"]),
          page("job-ability", "认定规则", "配置岗位能力等级与认定条件", "认定规则", ["create", "edit"]),
          page("job-ability-results", "认定结果", "查看学生岗位能力认定", "认定结果", ["export"]),
        ],
      },
    ],
  },
  {
    id: "resource",
    label: "教学资源共享服务平台",
    short: "资源",
    description: "知识点、能力点、证书和多媒体教学资源",
    groups: [
      {
        id: "public",
        label: "公共资源库",
        description: "统一维护可复用教学资产",
        pages: [
          page("knowledge", "知识点库", "维护知识点、标签与关联课程", "知识点"),
          page("ability", "能力点库", "维护能力点、领域与胜任等级", "能力点"),
          page("certificates", "证书库", "维护平台、行业、企业和职业技能证书", "证书"),
          page("doc", "文档资源", "管理课件、案例、报告和模板", "文档"),
          page("image", "图片资源", "管理封面、示意图和现场图片", "图片"),
          page("video", "视频资源", "管理课程视频、案例和演示素材", "视频"),
        ],
      },
    ],
  },
  {
    id: "affairs",
    label: "教务服务平台",
    short: "教务",
    description: "培养方案、教学计划、排课和学生画像",
    groups: [
      {
        id: "organization",
        label: "教务管理",
        description: "组织、师生与教学归属",
        pages: [
          page("org", "组织架构", "维护院系、专业和班级", "组织"),
          page("students", "学生管理", "维护在籍学生与班级归属", "学生"),
          page("teachers", "教职工管理", "维护授课教师与教务人员", "教职工"),
        ],
      },
      {
        id: "teaching",
        label: "教学管理",
        description: "方案、计划、课表与画像",
        pages: [
          page("programs", "人才培养方案", "组织课程、场景和能力培养要求", "培养方案"),
          page("teaching-plans", "教学计划", "规划学期教学内容与进度", "教学计划"),
          page("scheduling", "排课管理", "安排教师、班级、场景和场地", "排课"),
          page("portraits", "学生画像", "查看班级与学生能力达成", "画像", ["export"]),
        ],
      },
      {
        id: "results",
        label: "结果与认证",
        description: "证书报名审核",
        pages: [
          page("certificate-enrollments", "证书报名审核", "审核本校学生证书报名", "报名", ["edit"]),
        ],
      },
    ],
  },
  {
    id: "alliance",
    label: "院校与就业服务",
    short: "院校就业",
    description: "服务院校、产业项目与就业投递",
    groups: [
      {
        id: "cooperation",
        label: "院校与项目",
        description: "服务院校与产业项目验收",
        pages: [
          page("school", "学校信息", "维护服务院校与联系人", "学校"),
          page("projects", "产业项目", "发布产业项目与验收要求", "项目"),
        ],
      },
      {
        id: "employment",
        label: "就业服务",
        description: "招聘岗位和学生投递",
        pages: [
          page("employment-job", "岗位与投递", "管理招聘岗位和学生投递", "就业岗位", ["edit", "export"]),
        ],
      },
    ],
  },
];
