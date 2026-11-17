export const WORKSPACE_STORAGE_KEY = "colasoft-enterprise-v3";

export const dimensions = ["环境部署", "需求理解", "链路分析", "故障定位", "安全研判", "交付汇报"];

export type Role = "student" | "teacher" | "manage";
export type ResourceType = "岗位" | "场景" | "课程" | "测评" | "评价标准";
export type ResourceStatus = "草稿" | "待审核" | "已发布" | "已下线" | "已驳回";
export type WorkStatus = "待评价" | "已通过" | "已退回";
export type ApplicationKind = "project" | "job";
export type ApplicationStatus =
  | "待审核"
  | "已驳回"
  | "已接单"
  | "待验收"
  | "已退回"
  | "已验收"
  | "待面试"
  | "已录用"
  | "未通过";
export type OrderStatus = "待确认" | "已确认" | "已授权" | "已结算" | "已取消";

export interface Evidence {
  id: string;
  time: string;
  title: string;
  detail: string;
}

export interface JobProfile {
  id: string;
  name: string;
  code?: string;
  category: string;
  stage: string;
  industry: string;
  description: string;
  majors?: string[];
  responsibilities?: string[];
  requirements?: string[];
  certificates?: string[];
  skills: string[];
  target: number[];
  requiredDimensions: number[];
  tasks?: JobTask[];
  abilityPoints?: AbilityPoint[];
  sceneIds?: string[];
  courseIds?: string[];
  assessmentIds?: string[];
  standardIds?: string[];
  buildMode?: "独立建设" | "校企共建";
  schoolIds?: string[];
}

export interface JobTask {
  id: string;
  name: string;
  description: string;
  abilityPointIds: string[];
}

export interface AbilityPoint {
  id: string;
  name: string;
  domain: string;
  dimension: number;
  level: string;
  weight: number;
}

export interface SceneProfile {
  id: string;
  name: string;
  industry: string;
  jobId: string;
  difficulty: string;
  description: string;
  required: boolean;
  tasks: string[];
  evidence: Evidence[];
  answer: string;
  abilityWeights: number[];
  courseIds: string[];
  trainingIds: string[];
}

export interface CourseProfile {
  id: string;
  name: string;
  jobId: string;
  sceneId: string;
  courseType?: "体系课" | "颗粒课" | "混合课";
  totalHours?: number;
  abilityPointIds?: string[];
  chapters: { title: string; content: string; method: string }[];
}

export interface AssessmentProfile {
  id: string;
  name: string;
  code?: string;
  jobId: string;
  standardId?: string;
  durationMinutes: number;
  passScore: number;
  questions: Question[];
}

export interface StandardProfile {
  id: string;
  name: string;
  code?: string;
  jobId: string;
  abilityPointWeights: { id: string; name: string; weight: number; level: string }[];
  levelBands: { level: string; min: number; max: number }[];
  recognitionRule: string;
  evidenceWeight?: number;
  reasoningWeight?: number;
  deliveryWeight?: number;
  passScore?: number;
  goodScore?: number;
  excellentScore?: number;
}

export interface ResourceReviewRecord {
  id: string;
  action: "提交审核" | "发布" | "驳回" | "下线" | "新版本";
  actor: string;
  note: string;
  at: string;
}

export type ResourceContent =
  | { kind: "job"; data: JobProfile }
  | { kind: "scene"; data: SceneProfile }
  | { kind: "course"; data: CourseProfile }
  | { kind: "assessment"; data: AssessmentProfile }
  | { kind: "standard"; data: StandardProfile };

export interface TrainingDay {
  day: number;
  title: string;
  courseId: string;
  sceneId?: string;
  activity: string;
}

export interface TrainingProfile {
  id: string;
  name: string;
  days: number;
  jobId: string;
  sceneId: string;
  dayPlans: TrainingDay[];
}

export interface Question {
  id: string;
  title: string;
  options: string[];
  answer: number;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  description: string;
  version: string;
  packageId: string;
  authorizedTo: string[];
  relatedIds: string[];
  reviewNote?: string;
  updatedAt: string;
  draftContent: ResourceContent;
  publishedContent?: ResourceContent;
  reviewHistory: ResourceReviewRecord[];
}

export interface Review {
  evidenceScore: number;
  reasoningScore: number;
  deliveryScore: number;
  total: number;
  tags: string[];
  comment: string;
  decision: "passed" | "returned";
  reviewer: string;
  reviewedAt: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  note: string;
}

export interface Work {
  id: string;
  studentId: string;
  studentName: string;
  sceneId: string;
  status: WorkStatus;
  analysis: string;
  nextStep: string;
  evidenceIds: string[];
  boundaryAcknowledged: boolean;
  submittedAt: string;
  updatedAt: string;
  reviews: Review[];
  history: AuditEvent[];
}

export interface ExamAttempt {
  id: string;
  studentId: string;
  jobId: string;
  answers: number[];
  score: number;
  passed: boolean;
  submittedAt: string;
}

export interface Certificate {
  id: string;
  number: string;
  studentId: string;
  jobId: string;
  issuedAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  major: string;
  teacherId: string;
  teacherName: string;
  schedule: string;
  studentIds: string[];
  assignedTrainingIds: string[];
}

export interface SampleLearner {
  id: string;
  name: string;
  classId: string;
  abilityScores: number[];
  passed: number;
  pending: number;
  returned: number;
  completedDays: number;
  readOnly: true;
}

export interface Resume {
  name: string;
  phone: string;
  education: string;
  summary: string;
}

export interface ProjectPosting {
  id: string;
  name: string;
  company: string;
  description: string;
  deliverables: string[];
  acceptance: string[];
  schoolIds: string[];
  jobId: string;
  minMatch: number;
  deadline: string;
  status: "已发布" | "已下线";
}

export interface JobPosting {
  id: string;
  name: string;
  company: string;
  description: string;
  jobId: string;
  minMatch: number;
  status: "已发布" | "已下线";
}

export interface Application {
  id: string;
  kind: ApplicationKind;
  targetId: string;
  name: string;
  company: string;
  studentId: string;
  studentName: string;
  status: ApplicationStatus;
  resumeSnapshot?: Resume;
  deliveryText?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  history: AuditEvent[];
}

export interface School {
  id: string;
  name: string;
  college: string;
  plan: string;
  contact: string;
  status: string;
}

export interface Order {
  id: string;
  schoolId: string;
  packageId: string;
  name: string;
  amount: number;
  status: OrderStatus;
  resourceIds: string[];
  createdAt: string;
  updatedAt: string;
  history: AuditEvent[];
}

export interface ResourceAuthorization {
  id: string;
  resourceId: string;
  resourceVersion: string;
  schoolId: string;
  scope: string;
  expiresAt: string;
  authorizedBy: string;
  authorizedAt: string;
  status: "有效" | "已撤回";
}

export interface EnterpriseWorkspaceState {
  schemaVersion: 3;
  role: Role | null;
  activeSchoolId: string;
  activeStudentId: string;
  activeTeacherId: string;
  teacherGuideSeen: boolean;
  resources: Resource[];
  classroom: Classroom;
  classmates: SampleLearner[];
  works: Work[];
  completedDays: number[];
  trainingProgress: Record<string, number[]>;
  examAttempts: ExamAttempt[];
  certificates: Certificate[];
  projects: ProjectPosting[];
  jobPostings: JobPosting[];
  applications: Application[];
  orders: Order[];
  authorizations: ResourceAuthorization[];
  schools: School[];
  resume: Resume;
  favorites: string[];
  standardWeights: number[];
  auditEvents: AuditEvent[];
}

export const jobs: JobProfile[] = [
  {
    id: "service",
    name: "技术服务工程师",
    category: "网络分析",
    stage: "技术服务",
    industry: "金融",
    description: "从客户现场到问题闭环，完成采集部署、性能诊断与交付复盘。",
    skills: ["旁路采集", "TCP 分析", "故障定位"],
    target: [80, 75, 85, 90, 60, 85],
    requiredDimensions: [3, 5],
  },
  {
    id: "security",
    name: "全流量安全分析师",
    category: "安全运营",
    stage: "分析研判",
    industry: "能源",
    description: "还原通信行为，建立可追溯的威胁证据链，识别值得调查的风险。",
    skills: ["会话还原", "告警研判", "证据链"],
    target: [65, 70, 80, 80, 95, 80],
    requiredDimensions: [4, 5],
  },
  {
    id: "presales",
    name: "售前解决方案工程师",
    category: "解决方案",
    stage: "技术服务",
    industry: "政务",
    description: "理解业务问题，设计观测方案，以 PoC 证据支撑客户决策。",
    skills: ["需求访谈", "PoC 验证", "方案汇报"],
    target: [70, 95, 85, 75, 60, 95],
    requiredDimensions: [1, 5],
  },
  {
    id: "observability",
    name: "业务性能分析工程师",
    category: "可观测性",
    stage: "分析研判",
    industry: "医疗",
    description: "贯通用户、网络与应用链路，让业务性能问题可见、可定位。",
    skills: ["链路追踪", "响应分析", "基线对比"],
    target: [75, 80, 95, 90, 65, 80],
    requiredDimensions: [2, 3],
  },
  {
    id: "deployment",
    name: "网络采集实施工程师",
    category: "网络分析",
    stage: "采集基础设施",
    industry: "制造",
    description: "规划 TAP 与镜像采集，验证覆盖范围和采集质量。",
    skills: ["TAP 部署", "镜像配置", "采集验证"],
    target: [95, 70, 85, 75, 65, 75],
    requiredDimensions: [0, 2],
  },
  {
    id: "operations",
    name: "网络运维工程师",
    category: "可观测性",
    stage: "技术服务",
    industry: "运营商",
    description: "建立网络运行基线，处理异常工单并完成稳定性复盘。",
    skills: ["运行监控", "异常处置", "运维复盘"],
    target: [85, 75, 85, 85, 75, 80],
    requiredDimensions: [3, 5],
  },
];

export const scenes: SceneProfile[] = [
  {
    id: "bank",
    name: "银行网点交易变慢定位",
    industry: "金融",
    jobId: "service",
    difficulty: "进阶",
    description: "下午三点，柜面交易持续转圈。专线利用率正常，需要从流量证据识别真正的等待环节。",
    required: true,
    tasks: ["确认客户报障与时间范围", "绘制网点到核心业务链路", "对比正常与异常交易会话", "提交故障定位与复盘报告"],
    evidence: [
      { id: "rtt", time: "10:12:04", title: "柜面到前置", detail: "RTT 18ms，连接建立正常。" },
      { id: "arrive", time: "10:13:04", title: "请求到达总行", detail: "交易请求已穿过专线到达总行接入区。" },
      { id: "wait", time: "10:14:04", title: "核心响应等待", detail: "核心应用响应耗时 47 秒。" },
      { id: "retry", time: "10:15:04", title: "链路重传", detail: "重传占比 1.2%，需结合基线判断。" },
    ],
    answer: "先对齐业务时间窗，再比较网络传输与应用等待。现有证据指向核心应用响应等待，建议应用团队联合核查日志。采集范围未覆盖数据库，不能直接判断数据库故障。",
    abilityWeights: [0, 0.15, 0.2, 0.5, 0, 0.15],
    courseIds: ["course-0", "course-2", "course-5"],
    trainingIds: ["network"],
  },
  {
    id: "energy",
    name: "能源专网告警去噪与研判",
    industry: "能源",
    jobId: "security",
    difficulty: "进阶",
    description: "30 分钟内出现 1,286 条告警，区分巡检噪声与真正影响业务的事件。",
    required: false,
    tasks: ["核对采集范围", "归并巡检扫描告警", "还原异常 DNS 会话", "提交值班研判摘要"],
    evidence: [
      { id: "scan", time: "09:02:11", title: "巡检扫描", detail: "1,140 条告警来自登记巡检源。" },
      { id: "dns", time: "09:08:31", title: "DNS 异常", detail: "18 次 DNS 解析失败。" },
      { id: "timeout", time: "09:09:02", title: "用户超时", detail: "业务查询与 DNS 失败发生在同一时间窗。" },
      { id: "boundary", time: "09:10:45", title: "采集边界", detail: "生产控制区未接入本次采集。" },
    ],
    answer: "依据巡检窗口和白名单归并扫描，优先核查 DNS 失败与用户超时的关联。当前证据仅覆盖办公管理区。",
    abilityWeights: [0, 0.1, 0.15, 0.2, 0.4, 0.15],
    courseIds: ["course-3", "course-5"],
    trainingIds: ["security"],
  },
  {
    id: "hospital",
    name: "医疗影像调阅超时排查",
    industry: "医疗",
    jobId: "observability",
    difficulty: "进阶",
    description: "门诊高峰影像查询超时，HIS 挂号正常，需要明确异常边界。",
    required: false,
    tasks: ["划定影像查询链路", "对比传输与等待时间", "核查会话异常", "提交联合排障建议"],
    evidence: [
      { id: "ttfb", time: "14:20:06", title: "首字节等待", detail: "首字节等待 8.6 秒。" },
      { id: "base", time: "14:20:11", title: "正常基线", detail: "同类查询正常基线 240ms。" },
      { id: "his", time: "14:21:09", title: "挂号链路", detail: "HIS 挂号服务正常。" },
      { id: "storage", time: "14:22:18", title: "存储边界", detail: "存储后端未采集。" },
    ],
    answer: "影像查询等待显著偏离基线，先排除明显的传输异常，再联合 PACS 应用核查，保留存储端不可见边界。",
    abilityWeights: [0, 0.1, 0.25, 0.5, 0, 0.15],
    courseIds: ["course-2", "course-5"],
    trainingIds: ["network"],
  },
  {
    id: "factory",
    name: "制造产线 MES 间歇断连",
    industry: "制造",
    jobId: "operations",
    difficulty: "综合",
    description: "换班后 12 台采集终端间歇断连，MES 主站正常，A 车间未受影响。",
    required: false,
    tasks: ["验证双向采集质量", "还原断连时间线", "关联 ARP 与 TCP 异常", "提交恢复与验证方案"],
    evidence: [
      { id: "arp", time: "08:32:18", title: "ARP 冲突", detail: "B 车间出现重复 ARP 响应。" },
      { id: "shift", time: "08:35:02", title: "换班时间", detail: "异常集中出现在换班后。" },
      { id: "tcp", time: "08:36:47", title: "TCP 重连", detail: "12 台终端出现 TCP 重连。" },
      { id: "scope", time: "08:38:12", title: "对照范围", detail: "A 车间会话正常，需核对交换机事件。" },
    ],
    answer: "优先核对 B 车间地址冲突与网络变更，用 ARP、TCP 和交换机时间线相互印证。",
    abilityWeights: [0.15, 0.15, 0.25, 0.3, 0, 0.15],
    courseIds: ["course-1", "course-2", "course-5"],
    trainingIds: ["network"],
  },
];

export const courses: CourseProfile[] = [
  {
    id: "course-0",
    name: "网络协议与流量分析基础",
    jobId: "service",
    sceneId: "bank",
    chapters: [
      { title: "业务问题与学习目标", content: "掌握五元组、协议分层和会话边界，能够从业务操作中识别对应通信。", method: "按 DNS 解析、TCP 建连、请求发送、响应返回逐段拆解。" },
      { title: "协议分层与五元组", content: "先确认业务时间窗，再用五元组锁定同类会话。", method: "对齐时间、地址和端口后比较正常与异常请求。" },
      { title: "样本会话核查", content: "柜面请求已到总行，连接建立正常，应用响应耗时 47 秒。", method: "把传输等待与应用处理分开记录。" },
      { title: "实操与复盘", content: "进入银行场景完成证据比对并说明不可见边界。", method: "每条结论必须能回指一条证据。" },
    ],
  },
  {
    id: "course-1",
    name: "旁路采集与环境部署",
    jobId: "deployment",
    sceneId: "factory",
    chapters: [
      { title: "业务问题与学习目标", content: "识别管理口与采集口，完成旁路采集范围规划。", method: "先验证采集质量，再分析业务。" },
      { title: "采集点与镜像方向", content: "核对镜像方向、VLAN 覆盖、包速率和丢包计数。", method: "双向会话与单向镜像需要区分。" },
      { title: "制造现场案例", content: "B 车间上联镜像需要覆盖双向会话。", method: "绘制采集点位与不可见区域。" },
      { title: "实操与复盘", content: "形成采集验收清单并进入 MES 案例。", method: "采集问题不能直接归因于业务应用。" },
    ],
  },
  {
    id: "course-2",
    name: "TCP 性能诊断实务",
    jobId: "service",
    sceneId: "bank",
    chapters: [
      { title: "业务问题与学习目标", content: "区分连接建立、传输往返与应用等待。", method: "比较 SYN、RTT、重传、窗口和首字节等待。" },
      { title: "传输指标", content: "单一指标不能解释完整业务等待。", method: "先找时间差，再排除链路异常。" },
      { title: "医疗影像案例", content: "首字节等待 8.6 秒，正常基线 240ms。", method: "结合业务与采集范围解释异常。" },
      { title: "实操与复盘", content: "对齐两条业务查询并写出定位依据。", method: "明确应用、网络与存储边界。" },
    ],
  },
  {
    id: "course-3",
    name: "全流量安全事件研判",
    jobId: "security",
    sceneId: "energy",
    chapters: [
      { title: "业务问题与学习目标", content: "从告警数量转向业务风险。", method: "结合源地址、时间窗、资产角色与巡检白名单。" },
      { title: "告警归并", content: "高数量不等于高风险。", method: "区分扫描、DNS 异常和业务超时。" },
      { title: "能源管理区案例", content: "多数告警来自合法巡检。", method: "优先调查与用户超时相关的通信。" },
      { title: "实操与复盘", content: "提交告警归并规则和调查优先级。", method: "说明生产控制区不在采集范围。" },
    ],
  },
  {
    id: "course-4",
    name: "客户需求与 PoC 方案",
    jobId: "presales",
    sceneId: "bank",
    chapters: [
      { title: "业务问题与学习目标", content: "把客户原话转成可验证的问题和 PoC 目标。", method: "确认业务、时间、基线、验收和可见性。" },
      { title: "事实与假设", content: "客户提出升级专线，但问题也可能来自应用等待。", method: "把猜测保留为待验证假设。" },
      { title: "PoC 范围", content: "明确采集点、指标、交付物和验收标准。", method: "避免把不可见节点写入结论。" },
      { title: "实操与复盘", content: "形成一页式 PoC 方案。", method: "方案结论必须对应证据计划。" },
    ],
  },
  {
    id: "course-5",
    name: "故障复盘与交付表达",
    jobId: "service",
    sceneId: "bank",
    chapters: [
      { title: "业务问题与学习目标", content: "形成客户与技术团队都能理解的结论。", method: "按问题、证据、判断、边界和建议组织。" },
      { title: "结论结构", content: "区分观察事实与待验证假设。", method: "先回答为什么，再给下一步。" },
      { title: "银行案例复盘", content: "能够证明应用响应等待，但数据库未采集。", method: "下一步建议限定在可验证范围。" },
      { title: "答辩与修订", content: "解释证据选择、替代原因和不可见边界。", method: "口头说明不能脱离书面证据。" },
    ],
  },
];

const networkDays: [string, string, string?][] = [
  ["技术服务岗位与客户现场", "course-4"],
  ["旁路采集环境初始化", "course-1"],
  ["协议分层与五元组", "course-0"],
  ["业务访谈与故障时间窗", "course-4"],
  ["端到端链路绘制", "course-4"],
  ["TCP 建连与握手", "course-2"],
  ["往返时延与重传", "course-2"],
  ["应用响应时间分析", "course-2"],
  ["正常与异常基线对比", "course-2"],
  ["银行交易慢案例研判", "course-2", "bank"],
  ["医疗影像查询超时分析", "course-2", "hospital"],
  ["MES 断连时间线还原", "course-1", "factory"],
  ["证据清单与边界说明", "course-5", "bank"],
  ["客户复盘与口头答辩", "course-5", "bank"],
  ["综合成果交付", "course-5", "bank"],
];

const securityTitles = [
  "全流量安全岗位认知", "安全分析环境与采集范围", "协议与资产识别", "会话还原基础", "DNS 异常识别",
  "扫描行为与白名单", "告警归并与去重", "巡检窗口核对", "异常外联调查", "横向通信识别",
  "加密流量可见性", "威胁证据链组织", "能源专网管理区案例", "风险与业务影响评估", "误报排除与复核",
  "调查优先级排序", "值班研判报告", "复盘答辩与案例变体", "综合安全研判实操", "结业交付与岗位测评",
];

export const trainings: TrainingProfile[] = [
  {
    id: "network",
    name: "网络故障定位实战短训",
    days: 15,
    jobId: "service",
    sceneId: "bank",
    dayPlans: networkDays.map(([title, courseId, sceneId], index) => ({
      day: index + 1,
      title,
      courseId,
      sceneId,
      activity: sceneId ? "阅读案例材料、完成流量分析并提交证据结论" : "完成课程章节、记录方法要点并进入下一学习节点",
    })),
  },
  {
    id: "security",
    name: "全流量安全分析实战短训",
    days: 20,
    jobId: "security",
    sceneId: "energy",
    dayPlans: securityTitles.map((title, index) => ({
      day: index + 1,
      title,
      courseId: index < 10 ? "course-3" : "course-5",
      sceneId: index >= 12 ? "energy" : undefined,
      activity: index >= 12 ? "核对巡检窗口与 DNS 会话，形成值班研判摘要" : "完成安全分析方法章节并记录采集边界",
    })),
  },
];

export const examQuestions: Question[] = [
  { id: "q1", title: "采集范围之外的数据库故障可以直接确定吗？", options: ["不能，需补充证据", "可以直接确定"], answer: 0 },
  { id: "q2", title: "应用响应等待 47 秒时，优先核查什么？", options: ["应用处理与关联日志", "立即升级专线"], answer: 0 },
  { id: "q3", title: "提交故障结论应包含什么？", options: ["证据、边界与下一步建议", "仅写故障名称"], answer: 0 },
  { id: "q4", title: "高数量告警如何处理？", options: ["结合白名单与业务影响研判", "按数量直接判定高危"], answer: 0 },
  { id: "q5", title: "正常与异常流量如何比较？", options: ["对齐业务和时间窗", "任意选取数据"], answer: 0 },
];

export const assessment: AssessmentProfile = {
  id: "assessment-service",
  name: "技术服务岗位综合测评",
  code: "AS-2026-001",
  jobId: "service",
  standardId: "standard-service",
  durationMinutes: 30,
  passScore: 80,
  questions: examQuestions,
};

export const evaluationStandard: StandardProfile = {
  id: "standard-service",
  name: "技术服务工程师能力评价标准",
  code: "ST-2026-001",
  jobId: "service",
  abilityPointWeights: dimensions.map((name, index) => ({
    id: `ability-${index + 1}`,
    name,
    weight: [15, 15, 20, 25, 10, 15][index],
    level: "L4",
  })),
  levelBands: [
    { level: "未达标", min: 0, max: 59 },
    { level: "L1", min: 60, max: 69 },
    { level: "L2", min: 70, max: 79 },
    { level: "L3", min: 80, max: 89 },
    { level: "L4", min: 90, max: 100 },
  ],
  recognitionRule: "核心维度达到 60 分，并通过至少一项必选场景。",
  evidenceWeight: 40,
  reasoningWeight: 40,
  deliveryWeight: 20,
  passScore: 60,
  goodScore: 80,
  excellentScore: 90,
};

const createdAt = "2026-11-10 09:00";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function seededResource(
  base: Omit<Resource, "draftContent" | "publishedContent" | "reviewHistory">,
  content: ResourceContent,
): Resource {
  return {
    ...base,
    draftContent: clone(content),
    publishedContent: clone(content),
    reviewHistory: [],
  };
}

function initialResources(): Resource[] {
  const baseIds = [
    ...jobs.map((item) => item.id),
    ...scenes.filter((item) => item.id !== "factory").map((item) => item.id),
    ...courses.filter((item) => item.id !== "course-5").map((item) => item.id),
    assessment.id,
    evaluationStandard.id,
  ];
  const values: Resource[] = [
    ...jobs.map((job, jobIndex) => {
      const relatedScenes = scenes.filter((scene) => scene.jobId === job.id);
      const relatedCourses = courses.filter((course) => course.jobId === job.id);
      const content: JobProfile = {
        ...job,
        code: `KL-GW-${String(jobIndex + 1).padStart(3, "0")}`,
        majors: ["网络工程", "网络空间安全"],
        responsibilities: relatedScenes.map((scene) => scene.tasks[0] ?? scene.name),
        requirements: ["掌握网络协议与流量分析方法", "能够依据证据说明结论与边界", "具备客户沟通和复盘表达能力"],
        certificates: ["CSNA 能力体系参考"],
        tasks: relatedScenes.map((scene, index) => ({
          id: `${job.id}-task-${index + 1}`,
          name: scene.tasks[0] ?? scene.name,
          description: scene.description,
          abilityPointIds: dimensions.map((_, dimension) => `${job.id}-ability-${dimension + 1}`).filter((_, dimension) => scene.abilityWeights[dimension] > 0),
        })),
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
        assessmentIds: job.id === "service" ? [assessment.id] : [],
        standardIds: job.id === "service" ? [evaluationStandard.id] : [],
        buildMode: jobIndex % 2 === 0 ? "校企共建" : "独立建设",
        schoolIds: ["school-1"],
      };
      return seededResource(
        {
          id: job.id,
          name: job.name,
          type: "岗位",
          status: "已发布",
          description: job.description,
          version: "V1.0",
          packageId: "base",
          authorizedTo: ["school-1"],
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
          name: scene.name,
          type: "场景",
          status: "已发布",
          description: scene.description,
          version: "V1.0",
          packageId: scene.id === "factory" ? "renewal" : "base",
          authorizedTo: scene.id === "factory" ? [] : ["school-1"],
          relatedIds: [scene.jobId, ...scene.courseIds],
          updatedAt: createdAt,
        },
        { kind: "scene", data: scene },
      ),
    ),
    ...courses.map((course) =>
      seededResource(
        {
          id: course.id,
          name: course.name,
          type: "课程",
          status: "已发布",
          description: `${course.chapters.length} 个章节 · 关联 ${scenes.find((scene) => scene.id === course.sceneId)?.name ?? "岗位实训"}`,
          version: "V1.0",
          packageId: course.id === "course-5" ? "renewal" : "base",
          authorizedTo: course.id === "course-5" ? [] : ["school-1"],
          relatedIds: [course.jobId, course.sceneId],
          updatedAt: createdAt,
        },
        {
          kind: "course",
          data: {
            ...course,
            courseType: course.id === "course-1" ? "颗粒课" : course.id === "course-5" ? "混合课" : "体系课",
            totalHours: course.chapters.length * 4,
            abilityPointIds: [`${course.jobId}-ability-1`, `${course.jobId}-ability-2`],
          },
        },
      ),
    ),
    seededResource(
      {
        id: assessment.id,
        name: assessment.name,
        type: "测评",
        status: "已发布",
        description: "五题理论核验，80 分合格",
        version: "V1.0",
        packageId: "base",
        authorizedTo: ["school-1"],
        relatedIds: ["service", evaluationStandard.id],
        updatedAt: createdAt,
      },
      { kind: "assessment", data: assessment },
    ),
    seededResource(
      {
        id: evaluationStandard.id,
        name: evaluationStandard.name,
        type: "评价标准",
        status: "已发布",
        description: "证据 40% · 推理 40% · 交付 20%",
        version: "V1.0",
        packageId: "base",
        authorizedTo: ["school-1"],
        relatedIds: ["service", ...scenes.map((scene) => scene.id)],
        updatedAt: createdAt,
      },
      { kind: "standard", data: evaluationStandard },
    ),
  ];
  return values.map((resource) => ({
    ...resource,
    authorizedTo: baseIds.includes(resource.id) ? ["school-1"] : resource.authorizedTo,
  }));
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
    completedDays: Math.min(15, 4 + ((index * 3) % 9)),
    readOnly: true,
  };
});

export function seedWorkspace(): EnterpriseWorkspaceState {
  const resources = initialResources();
  return {
    schemaVersion: 3,
    role: null,
    activeSchoolId: "school-1",
    activeStudentId: "student-lin",
    activeTeacherId: "teacher-zhou",
    teacherGuideSeen: false,
    resources,
    classroom: {
      id: "class-1",
      name: "网络工程 2401",
      major: "网络工程",
      teacherId: "teacher-zhou",
      teacherName: "周启明",
      schedule: "2026-11-17",
      studentIds: ["student-lin", ...classmates.map((item) => item.id)],
      assignedTrainingIds: ["network"],
    },
    classmates,
    works: [],
    completedDays: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    trainingProgress: { network: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    examAttempts: [],
    certificates: [],
    projects: [
      {
        id: "project-bank",
        name: "银行网点交易异常复盘",
        company: "科来网络",
        description: "基于脱敏交易样本完成等待环节定位、证据清单和客户复盘。",
        deliverables: ["定位报告", "关键证据清单", "下一步验证建议"],
        acceptance: ["结论有证据支撑", "说明采集边界", "建议可执行"],
        schoolIds: ["school-1"],
        jobId: "service",
        minMatch: 60,
        deadline: "2026-12-20",
        status: "已发布",
      },
      {
        id: "project-energy",
        name: "能源专网告警研判专项",
        company: "科来网络",
        description: "对巡检噪声、DNS 异常与业务超时进行关联研判。",
        deliverables: ["告警归并规则", "优先调查清单", "值班研判摘要"],
        acceptance: ["说明告警取舍依据", "保留可见边界", "给出调查优先级"],
        schoolIds: ["school-1"],
        jobId: "security",
        minMatch: 60,
        deadline: "2026-12-28",
        status: "已发布",
      },
    ],
    jobPostings: [
      {
        id: "job-posting-service",
        name: "技术服务工程师 · 2027 届实习",
        company: "科来网络",
        description: "参与客户现场问题定位、流量分析与交付复盘。",
        jobId: "service",
        minMatch: 60,
        status: "已发布",
      },
      {
        id: "job-posting-security",
        name: "全流量安全分析实习生",
        company: "生态安全服务单位",
        description: "协助归并告警、还原会话并整理研判证据。",
        jobId: "security",
        minMatch: 70,
        status: "已发布",
      },
      {
        id: "job-posting-observability",
        name: "可观测性分析工程师",
        company: "行业数字化服务商",
        description: "参与业务链路测量、性能基线和异常定位。",
        jobId: "observability",
        minMatch: 70,
        status: "已发布",
      },
    ],
    applications: [],
    authorizations: resources.flatMap((resource) =>
      resource.authorizedTo.map((schoolId) => ({
        id: `auth-${resource.id}-${schoolId}`,
        resourceId: resource.id,
        resourceVersion: resource.version,
        schoolId,
        scope: "网络工程专业",
        expiresAt: "2027-12-31",
        authorizedBy: "科来运营",
        authorizedAt: resource.updatedAt,
        status: "有效" as const,
      })),
    ),
    orders: [
      {
        id: "order-base-2026",
        schoolId: "school-1",
        packageId: "base",
        name: "2026 岗位培养基础资源包",
        amount: 80000,
        status: "已授权",
        resourceIds: initialResources().filter((item) => item.packageId === "base").map((item) => item.id),
        createdAt: "2026-08-20 10:00",
        updatedAt: "2026-09-01 09:30",
        history: [],
      },
      {
        id: "order-renewal-2027",
        schoolId: "school-1",
        packageId: "renewal",
        name: "2027 年度场景更新包",
        amount: 22000,
        status: "待确认",
        resourceIds: ["factory", "course-5"],
        createdAt,
        updatedAt: createdAt,
        history: [],
      },
    ],
    schools: [
      { id: "school-1", name: "江城理工学院", college: "网络空间安全学院", plan: "岗位培养专业版", contact: "陈疏影", status: "服务中" },
      { id: "school-2", name: "岭南信息职业技术学院", college: "信息工程学院", plan: "试用", contact: "待补充", status: "合作洽谈" },
      { id: "school-3", name: "滨海科技学院", college: "计算机学院", plan: "待签约", contact: "待补充", status: "方案确认" },
    ],
    resume: {
      name: "林知远",
      phone: "",
      education: "网络工程 · 2027 届",
      summary: "关注网络分析与业务性能诊断，正在完成科来岗位实训。",
    },
    favorites: [],
    standardWeights: [15, 15, 20, 25, 10, 15],
    auditEvents: [],
  };
}

export function nowLabel() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function createAudit(actor: string, action: string, target: string, note: string): AuditEvent {
  return { id: crypto.randomUUID(), at: nowLabel(), actor, action, target, note };
}

export function jobById(id: string) {
  return jobs.find((item) => item.id === id);
}

export function sceneById(id: string) {
  return scenes.find((item) => item.id === id);
}

export function courseById(id: string) {
  return courses.find((item) => item.id === id);
}

export function trainingById(id: string) {
  return trainings.find((item) => item.id === id);
}

export function resourceById(state: EnterpriseWorkspaceState, id: string) {
  return state.resources.find((item) => item.id === id);
}

export function publishedContent(state: EnterpriseWorkspaceState, id: string) {
  const resource = resourceById(state, id);
  return resource?.publishedContent?.data;
}

export function publishedJobs(state: EnterpriseWorkspaceState) {
  return state.resources
    .map((resource) => resource.publishedContent?.kind === "job" ? resource.publishedContent.data : undefined)
    .filter((item): item is JobProfile => Boolean(item));
}

export function publishedScenes(state: EnterpriseWorkspaceState) {
  return state.resources
    .map((resource) => resource.publishedContent?.kind === "scene" ? resource.publishedContent.data : undefined)
    .filter((item): item is SceneProfile => Boolean(item));
}

export function publishedCourses(state: EnterpriseWorkspaceState) {
  return state.resources
    .map((resource) => resource.publishedContent?.kind === "course" ? resource.publishedContent.data : undefined)
    .filter((item): item is CourseProfile => Boolean(item));
}

export function publishedAssessments(state: EnterpriseWorkspaceState) {
  return state.resources
    .map((resource) => resource.publishedContent?.kind === "assessment" ? resource.publishedContent.data : undefined)
    .filter((item): item is AssessmentProfile => Boolean(item));
}

export function publishedStandards(state: EnterpriseWorkspaceState) {
  return state.resources
    .map((resource) => resource.publishedContent?.kind === "standard" ? resource.publishedContent.data : undefined)
    .filter((item): item is StandardProfile => Boolean(item));
}

export function resourceVisible(state: EnterpriseWorkspaceState, id: string) {
  const resource = resourceById(state, id);
  const authorized = state.authorizations?.some(
    (item) => item.resourceId === id && item.schoolId === state.activeSchoolId && item.status === "有效",
  ) ?? Boolean(resource?.authorizedTo.includes(state.activeSchoolId));
  return Boolean(resource && resource.status !== "已下线" && resource.publishedContent && authorized);
}

export function resourceName(state: EnterpriseWorkspaceState, id: string, fallback: string) {
  const resource = resourceById(state, id);
  return resource?.publishedContent?.data.name ?? resource?.name ?? fallback;
}

export function activeTrainingIds(state: EnterpriseWorkspaceState) {
  return state.classroom.assignedTrainingIds;
}

export function jobTrainingReadiness(state: EnterpriseWorkspaceState, jobId: string) {
  const resource = resourceById(state, jobId);
  const job = resource?.publishedContent?.kind === "job" ? resource.publishedContent.data : undefined;
  if (!resource || resource.status === "已下线" || !job) return { ready: false, reason: "岗位标准尚未发布" };
  if (!resourceVisible(state, jobId)) return { ready: false, reason: "岗位尚未授权给当前院校" };
  const sceneReady = (job.sceneIds ?? []).some((id) => resourceVisible(state, id));
  const courseReady = (job.courseIds ?? []).some((id) => resourceVisible(state, id));
  if (!sceneReady) return { ready: false, reason: "缺少已发布并授权的场景" };
  if (!courseReady) return { ready: false, reason: "缺少已发布并授权的课程" };
  return { ready: true, reason: "" };
}

export function completedDays(state: EnterpriseWorkspaceState, trainingId = "network") {
  return state.trainingProgress?.[trainingId] ?? (trainingId === "network" ? state.completedDays : []);
}

export function currentTrainingDay(state: EnterpriseWorkspaceState, trainingId = "network") {
  const training = trainingById(trainingId);
  if (!training) return undefined;
  const done = completedDays(state, trainingId);
  return training.dayPlans.find((item) => !done.includes(item.day)) ?? training.dayPlans[training.dayPlans.length - 1];
}

export function latestWork(state: EnterpriseWorkspaceState, sceneId: string) {
  return state.works.find((item) => item.studentId === state.activeStudentId && item.sceneId === sceneId);
}

export function workReview(work?: Work) {
  return work?.reviews[work.reviews.length - 1];
}

export function workBlockedReason(state: EnterpriseWorkspaceState, sceneId: string) {
  if (state.role !== "student") return "切换到学生学习身份后可提交成果";
  const scene = sceneById(sceneId);
  if (!scene) return "场景不存在";
  if (!resourceVisible(state, scene.id)) return "该场景尚未授权给当前院校";
  const training = trainings.find((item) => item.id === scene.trainingIds.find((id) => state.classroom.assignedTrainingIds.includes(id)));
  const assignedJobPath = state.resources.some(
    (resource) =>
      resource.publishedContent?.kind === "job" &&
      (resource.publishedContent.data.sceneIds ?? []).includes(sceneId) &&
      state.classroom.assignedTrainingIds.includes(`path-${resource.id}`),
  );
  if (!training && !assignedJobPath) return "教师尚未将关联短训或岗位学习路径分配给当前班级";
  const work = latestWork(state, sceneId);
  if (work?.status === "待评价") return "本项成果正在等待教师评价";
  if (work?.status === "已通过") return "本项成果已通过";
  return "";
}

export function abilityScores(state: EnterpriseWorkspaceState, studentId = state.activeStudentId) {
  const passed = state.works.filter((item) => item.studentId === studentId && item.status === "已通过");
  const sums = dimensions.map(() => 0);
  const weights = dimensions.map(() => 0);
  passed.forEach((work) => {
    const scene = sceneById(work.sceneId);
    const score = workReview(work)?.total ?? 0;
    if (!scene) return;
    scene.abilityWeights.forEach((weight, index) => {
      if (weight <= 0) return;
      sums[index] += score * weight;
      weights[index] += weight;
    });
  });
  return sums.map((sum, index) => (weights[index] ? Math.round(sum / weights[index]) : 0));
}

export function jobMatch(state: EnterpriseWorkspaceState, job: JobProfile, studentId = state.activeStudentId) {
  const scores = abilityScores(state, studentId);
  const match = Math.round(
    job.target.reduce((sum, target, index) => sum + Math.min(scores[index] / target, 1), 0) /
      job.target.length *
      100,
  );
  const missing = job.requiredDimensions
    .filter((index) => scores[index] < 60)
    .map((index) => dimensions[index]);
  return { match, missing, ready: match >= 60 && missing.length === 0, scores };
}

export function passedRequiredScene(state: EnterpriseWorkspaceState) {
  return state.works.some((item) => item.studentId === state.activeStudentId && item.status === "已通过" && sceneById(item.sceneId)?.required);
}

export function certificateEligibility(state: EnterpriseWorkspaceState) {
  const latestExam = state.examAttempts
    .filter((item) => item.studentId === state.activeStudentId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
  const examReady = Boolean(latestExam && latestExam.score >= assessment.passScore);
  const sceneReady = passedRequiredScene(state);
  return {
    latestExam,
    examReady,
    sceneReady,
    eligible: examReady && sceneReady,
    certificate: state.certificates.find((item) => item.studentId === state.activeStudentId),
  };
}

export function generatedCertificateNumber(state: EnterpriseWorkspaceState) {
  return `KL-TD-2026-${String(state.certificates.length + 1).padStart(4, "0")}`;
}

export function resumeComplete(resume: Resume) {
  return Boolean(resume.name.trim() && resume.phone.trim() && resume.education.trim() && resume.summary.trim());
}

export function classMetrics(state: EnterpriseWorkspaceState) {
  const activeScores = abilityScores(state);
  const scoreArrays = [activeScores, ...state.classmates.map((item) => item.abilityScores)];
  const abilities = dimensions.map((_, index) =>
    Math.round(scoreArrays.reduce((sum, scores) => sum + scores[index], 0) / scoreArrays.length),
  );
  const activePassed = state.works.filter((item) => item.status === "已通过").length;
  const activePending = state.works.filter((item) => item.status === "待评价").length;
  const activeReturned = state.works.filter((item) => item.status === "已退回").length;
  const samplePassed = state.classmates.reduce((sum, item) => sum + item.passed, 0);
  const samplePending = state.classmates.reduce((sum, item) => sum + item.pending, 0);
  const sampleReturned = state.classmates.reduce((sum, item) => sum + item.returned, 0);
  const learnersWithProgress = state.classmates.filter((item) => item.passed > 0).length + (activePassed > 0 ? 1 : 0);
  const completed = state.classmates.reduce((sum, item) => sum + item.completedDays, 0) + completedDays(state).length;
  return {
    abilities,
    passed: activePassed + samplePassed,
    pending: activePending + samplePending,
    returned: activeReturned + sampleReturned,
    learnersWithProgress,
    passRate: Math.round((learnersWithProgress / state.classroom.studentIds.length) * 100),
    completedDays: completed,
    average: Math.round(abilities.reduce((sum, item) => sum + item, 0) / abilities.length),
    weak: dimensions.map((name, index) => ({ name, score: abilities[index] })).sort((a, b) => a.score - b.score)[0],
  };
}

export function orderForPackage(state: EnterpriseWorkspaceState, packageId: string) {
  return state.orders.find((item) => item.schoolId === state.activeSchoolId && item.packageId === packageId);
}

export function applicationTarget(state: EnterpriseWorkspaceState, application: Application) {
  return application.kind === "project"
    ? state.projects.find((item) => item.id === application.targetId)
    : state.jobPostings.find((item) => item.id === application.targetId);
}

export function projectEligibility(state: EnterpriseWorkspaceState, project: ProjectPosting) {
  const job = jobById(project.jobId);
  const match = job ? jobMatch(state, job) : { match: 0, missing: [], ready: false };
  if (!resumeComplete(state.resume)) return { ok: false, reason: "请先补全联系方式", match };
  if (!project.schoolIds.includes(state.activeSchoolId)) return { ok: false, reason: "项目未向当前院校开放", match };
  if (match.missing.length) return { ok: false, reason: `缺少${match.missing.join("、")}证据`, match };
  if (match.match < project.minMatch) return { ok: false, reason: `能力匹配需达到 ${project.minMatch}%`, match };
  return { ok: true, reason: "", match };
}

export function jobPostingEligibility(state: EnterpriseWorkspaceState, posting: JobPosting) {
  const job = jobById(posting.jobId);
  const match = job ? jobMatch(state, job) : { match: 0, missing: [], ready: false };
  if (!resumeComplete(state.resume)) return { ok: false, reason: "请先补全简历", match };
  if (match.missing.length) return { ok: false, reason: `缺少${match.missing.join("、")}证据`, match };
  if (match.match < posting.minMatch) return { ok: false, reason: `匹配度需达到 ${posting.minMatch}%`, match };
  return { ok: true, reason: "", match };
}
