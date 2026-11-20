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
    description: "租户、套餐、组织账号、角色与审计",
    groups: [
      {
        id: "tenant",
        label: "租户与系统资源",
        description: "院校租户、套餐、行业专业和前台配置",
        pages: [
          page("tenant", "租户信息", "维护院校租户的基础资料与联系人", "租户"),
          page("package", "套餐情况", "查看已开通平台、有效期与扩容情况", "套餐", ["export"]),
          page("codes", "资源编码", "统一岗位、场景、课程、能力点等资源编码", "编码"),
          page("industries", "行业管理", "维护产业分类与启停状态", "行业"),
          page("majors", "专业管理", "维护专业、别名和适用专业群", "专业"),
          page("backgrounds", "前台背景", "配置各频道首页的封面与背景", "页面配置", ["edit"]),
          page("mallpush", "商城推送", "将资源包推送至指定院校", "推送记录"),
        ],
      },
      {
        id: "organization",
        label: "组织与用户",
        description: "组织、师生、账号、角色和关系",
        pages: [
          page("org", "组织架构", "维护院系、专业和教学组织", "组织"),
          page("students", "学生管理", "维护学生信息、班级和专业", "学生"),
          page("teachers", "教职工管理", "维护教师、审核人与教务人员", "教职工"),
          page("accounts", "账户列表", "管理登录账号、状态和所属角色", "账户"),
          page("roles", "角色权限", "配置平台、模块和操作权限", "角色"),
          page("positions", "职位管理", "维护教职工职位和职责范围", "职位"),
          page("relations", "人员关系", "维护班主任、专业负责人等关系", "关系"),
        ],
      },
      {
        id: "audit",
        label: "审计日志",
        description: "追踪登录及业务操作",
        pages: [
          page("loglogin", "登录日志", "查看用户登录结果与来源", "日志", ["export"]),
          page("logoperation", "操作日志", "查看资源、审批和教学操作记录", "日志", ["export"]),
        ],
      },
    ],
  },
  {
    id: "career",
    label: "职业岗位学习平台",
    short: "岗位",
    description: "岗位建设、归档、审批、推荐与学习路径",
    groups: [
      {
        id: "catalog",
        label: "岗位中心",
        description: "岗位标准与版本管理",
        pages: [
          page("positions", "岗位管理", "建设岗位职责、能力模型、证书和关联资源", "岗位"),
          page("archive", "岗位归档", "查阅已归档岗位与历史版本", "岗位", ["edit", "export"]),
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
        label: "展示与路径",
        description: "控制前台推荐与岗位学习路径",
        pages: [
          page("recommend", "岗位推荐", "配置前台推荐岗位及排序", "推荐位", ["edit"]),
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
          page("archive", "场景归档", "查阅已归档场景及历史记录", "场景", ["edit", "export"]),
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
          page("archive", "历史档案", "查阅历史课程与教材版本", "课程", ["edit", "export"]),
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
          page("questions", "现场问答", "维护课堂与实训现场问答", "问答"),
        ],
      },
      {
        id: "private",
        label: "我的资源",
        description: "个人资源与复用范围",
        pages: [
          page("mine", "我的资源", "查看和复用本人上传的资源", "资源", ["create", "edit", "archive"]),
          page("tags", "标签管理", "维护资源分类和检索标签", "标签"),
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
        description: "组织、专业、师生与职位",
        pages: [
          page("org", "组织架构", "维护院系、专业和班级", "组织"),
          page("majors", "专业管理", "维护专业标准与培养方向", "专业"),
          page("students", "学生管理", "维护在籍学生与班级归属", "学生"),
          page("teachers", "教职工管理", "维护授课教师与教务人员", "教职工"),
          page("relations", "人员关系", "维护班主任、负责人和协作关系", "关系"),
          page("positions", "职位管理", "维护校内岗位与职责", "职位"),
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
        id: "approval",
        label: "审批管理",
        description: "教务批次、工作流与审批",
        pages: [
          page("batches", "批次管理", "组织教务相关业务建设批次", "批次"),
          page("workflows", "工作流管理", "配置教务审批节点", "工作流", ["create", "edit"]),
          page("approvals", "审批中心", "处理教务提交与复核", "审批", ["approve", "export"]),
        ],
      },
    ],
  },
  {
    id: "alliance",
    label: "产业联盟与品牌运营平台",
    short: "联盟",
    description: "校企合作、品牌运营、专家和就业服务",
    groups: [
      {
        id: "cooperation",
        label: "产教融合",
        description: "学校、企业、项目、协议、成果和专家",
        pages: [
          page("school", "学校信息", "维护合作院校与联系人", "学校"),
          page("enterprises", "合作企业", "维护企业和行业合作方向", "企业"),
          page("projects", "合作项目", "发布校企课题和验收要求", "项目"),
          page("agreements", "合作协议", "管理协议范围与有效期", "协议"),
          page("achievements", "合作成果", "沉淀共建课程、场景和项目成果", "成果"),
          page("experts", "专家资源库", "维护行业专家与参与领域", "专家"),
          page("permissions", "专家权限", "配置专家在资源与项目中的操作范围", "权限"),
          page("dictionaries", "字典管理", "维护行业、合作类型等字典", "字典"),
        ],
      },
      {
        id: "brands",
        label: "品牌运营",
        description: "人才、雇主、岗位、专业、师资和文化品牌",
        pages: [
          page("brands", "品牌概览", "查看各品牌内容与运营状态", "品牌", ["export"]),
          page("brands-talent", "人才品牌", "维护优秀学生与人才案例", "品牌"),
          page("brands-employer", "雇主品牌", "维护合作企业与用人案例", "品牌"),
          page("brands-job", "岗位品牌", "维护岗位成长与实战故事", "品牌"),
          page("brands-major", "专业品牌", "维护专业建设成果", "品牌"),
          page("brands-teacher", "师资品牌", "维护教师能力与教学成果", "品牌"),
          page("brands-culture", "文化思政品牌", "维护思政案例与行业价值观内容", "品牌"),
        ],
      },
      {
        id: "employment",
        label: "就业服务",
        description: "就业项目、岗位和投递",
        pages: [
          page("employment-project", "就业项目", "组织实习、就业与校企联合招聘", "就业项目"),
          page("employment-job", "岗位与投递", "管理招聘岗位和学生投递", "就业岗位", ["edit", "export"]),
        ],
      },
    ],
  },
  {
    id: "ai",
    label: "AI 智能服务平台",
    short: "AI",
    description: "知识问答、知识库、智能体和服务审核",
    groups: [
      {
        id: "assistant",
        label: "知识助手",
        description: "基于本地知识库的业务问答",
        pages: [page("chat", "AI 助手", "检索本站资源并生成有出处的业务回答", "会话", ["export"])],
      },
      {
        id: "catalog",
        label: "知识与智能体",
        description: "知识库、智能体和外部服务",
        pages: [
          page("reviews", "上架审核", "审核知识库和智能体上架申请", "审核", ["approve", "export"]),
          page("kbs", "知识库管理", "维护知识文档、标签与可用范围", "知识库"),
          page("agents", "智能体管理", "配置智能体定位、知识和发布状态", "智能体"),
          page("integrations", "外部服务", "配置模型服务与连接状态", "服务"),
        ],
      },
    ],
  },
];
