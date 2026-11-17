import type { AbilityKey } from "@/lib/types";

export type CareerIndustry = "金融" | "运营商" | "能源" | "制造" | "医疗" | "政务" | "互联网" | "专业厂商";
export type CareerTrack = "网络分析" | "可观测性" | "安全运营" | "SRE / 运维";

export interface CareerLearningScene {
  id: string;
  title: string;
  summary: string;
  perspective: string;
  challengeId: "c1" | "c2" | "c3" | "c4" | "c5" | "c6";
}

export interface CareerMarketItem {
  id: string;
  company: string;
  abbreviation: string;
  industry: CareerIndustry;
  track: CareerTrack;
  title: string;
  locations: string[];
  careerId: "job-service" | "job-analysis" | "job-presale" | "job-ops";
  summary: string;
  scenario: string;
  skills: string[];
  abilities: AbilityKey[];
  sourceIds: string[];
  learningScenes: CareerLearningScene[];
}

export interface CareerDetailProfile {
  introduction: string;
  workObjects: string[];
  typicalDay: string[];
  responsibilities: string[];
  requirements: string[];
  growthPath: string[];
}

export interface CareerSource {
  id: string;
  label: string;
  url: string;
}

export const CAREER_DATA_UPDATED_AT = "2026-11-13";

export const CAREER_SOURCES: CareerSource[] = [
  { id: "colasoft", label: "科来产品体系", url: "https://ai.colasoft.com.cn/products" },
  { id: "aliyun", label: "阿里云云监控 2.0", url: "https://help.aliyun.com/zh/cms/cloudmonitor-2-0/" },
  { id: "tencent-observe", label: "腾讯云可观测平台", url: "https://cloud.tencent.com/document/product/248/13466" },
  { id: "tencent-soc", label: "腾讯云安全运营中心", url: "https://cloud.tencent.com/product/soc-private" },
  { id: "huawei", label: "华为云安全云脑", url: "https://www.huaweicloud.com/product/secmaster.html" },
  { id: "opentelemetry", label: "OpenTelemetry 官方文档", url: "https://opentelemetry.io/docs/" },
  { id: "prometheus", label: "Prometheus 官方文档", url: "https://prometheus.io/docs/introduction/overview/" },
  { id: "mitre", label: "MITRE ATT&CK", url: "https://attack.mitre.org/" },
];

const ROLE_DETAILS: Record<CareerMarketItem["careerId"], CareerDetailProfile> = {
  "job-service": {
    introduction: "面向真实业务现场，把采集环境、故障现象与流量证据串成可复核的服务闭环。",
    workObjects: ["客户网络与关键业务", "旁路采集设备与脱敏流量", "现场负责人和协同团队"],
    typicalDay: ["确认报障范围与采集边界", "在样本和会话中缩小问题范围", "同步结论、盲区与下一步协同动作"],
    responsibilities: ["部署并核对采集环境", "完成故障取证与边界说明", "形成客户可理解的复盘材料"],
    requirements: ["理解 TCP/IP 与典型业务链路", "能用证据排除不成立的猜测", "具备现场沟通与交付意识"],
    growthPath: ["初级交付工程师", "独立项目工程师", "行业技术顾问 / 服务负责人"],
  },
  "job-analysis": {
    introduction: "从告警、日志与流量中识别值得深查的事件，形成不越过证据边界的研判结论。",
    workObjects: ["安全与运维告警", "资产、日志和流量证据", "处置工单与复盘报告"],
    typicalDay: ["聚合同源事件并清理噪音", "关联业务影响与攻击或故障时间线", "给出处置优先级和补采建议"],
    responsibilities: ["建立告警取舍标准", "还原事件证据链", "推动研判、处置和复盘闭环"],
    requirements: ["理解常见协议与安全事件", "能区分事实、假设和不可见范围", "具备结构化分析与报告能力"],
    growthPath: ["初级分析员", "事件调查工程师", "SOC 研判专家 / 运营负责人"],
  },
  "job-presale": {
    introduction: "把客户原话转译成可验证目标，用链路、证据和演示结果完成一次克制的 PoC。",
    workObjects: ["客户需求与业务痛点", "PoC 范围和验收指标", "方案演示与复盘材料"],
    typicalDay: ["访谈并收敛待验证问题", "设计采集范围和验证路径", "组织演示、答疑与复盘"],
    responsibilities: ["澄清需求与成功标准", "规划 PoC 链路和证据边界", "讲清结论而非堆叠产品功能"],
    requirements: ["能听懂业务语言并转成技术问题", "具备链路表达与方案组织能力", "能处理追问且不夸大效果"],
    growthPath: ["方案助理", "售前 / 实施工程师", "行业解决方案架构师"],
  },
  "job-ops": {
    introduction: "持续维护业务观测面，用指标、链路和流量判断异常发生在哪一层并推动恢复。",
    workObjects: ["业务服务与依赖链路", "指标、日志、Trace 和流量", "告警规则与稳定性目标"],
    typicalDay: ["巡检关键服务和采集状态", "处理告警并定位异常依赖", "复盘故障并补齐观测盲区"],
    responsibilities: ["建设与维护可观测能力", "完成故障定界和跨团队协同", "治理告警、容量与稳定性风险"],
    requirements: ["理解应用、网络与基础设施关系", "会使用黄金指标和链路证据", "具备自动化与复盘意识"],
    growthPath: ["运维 / 可观测工程师", "平台可靠性工程师", "SRE / 可观测平台负责人"],
  },
};

const ROLE_SCENES: Record<CareerMarketItem["careerId"], CareerLearningScene[]> = {
  "job-service": [
    { id: "service-environment", title: "把现场采集环境搭起来", summary: "核对管理口、采集口和样本时间窗，先建立可信的取证入口。", perspective: "技术服务视角：环境可用且边界明确，才开始对客户问题下判断。", challengeId: "c1" },
    { id: "service-locate", title: "用流量证据完成故障定界", summary: "比较时延、重传与应用等待，判断慢发生在哪一段。", perspective: "技术服务视角：交付可复核结论，并说明还需要谁继续排查。", challengeId: "c4" },
    { id: "service-review", title: "向客户完成证据复盘", summary: "按需求、链路、结论、证据和建议组织十五分钟汇报。", perspective: "技术服务视角：不越过采集盲区，不把 PoC 说成效果承诺。", challengeId: "c6" },
  ],
  "job-analysis": [
    { id: "analysis-alert", title: "从告警噪音中保留有效风险", summary: "按业务影响和时间相关性分组事件，说明暂缓理由。", perspective: "分析岗位视角：优先处理真正触及关键业务的事件。", challengeId: "c5" },
    { id: "analysis-evidence", title: "还原慢交易证据链", summary: "用会话证据排除拥塞猜测，限定可见范围。", perspective: "分析岗位视角：结论必须能被证据复核，未知部分保持未知。", challengeId: "c4" },
    { id: "analysis-report", title: "形成可行动的研判报告", summary: "把现象、证据、影响和协同建议组织成复盘。", perspective: "分析岗位视角：让处置团队知道为什么做、下一步做什么。", challengeId: "c6" },
  ],
  "job-presale": [
    { id: "presale-discovery", title: "把客户原话转成验证目标", summary: "分离事实与猜测，明确业务、时间和待验证假设。", perspective: "售前视角：先定义问题，不顺着客户猜测直接推荐设备。", challengeId: "c2" },
    { id: "presale-path", title: "设计 PoC 链路与采集边界", summary: "画出端到端跳数、责任边界和本次验证盲区。", perspective: "售前视角：提前约定哪些结论本次 PoC 能够支持。", challengeId: "c3" },
    { id: "presale-review", title: "完成不夸大的 PoC 汇报", summary: "围绕需求和证据回应追问，给出可执行的下一步。", perspective: "售前视角：以验证结果推进决策，而不是罗列功能。", challengeId: "c6" },
  ],
  "job-ops": [
    { id: "ops-observability", title: "建立可用的观测入口", summary: "确认样本、采集口和代表性会话都处于可用状态。", perspective: "运维视角：先保证观测数据可信，再处理业务告警。", challengeId: "c1" },
    { id: "ops-topology", title: "补齐业务链路与观测盲区", summary: "标明依赖节点、责任边界以及当前没有数据的部分。", perspective: "运维视角：让跨团队排障围绕同一张链路图展开。", challengeId: "c3" },
    { id: "ops-incident", title: "定位并协同恢复慢交易", summary: "比较传输和应用等待指标，确定下一位协同对象。", perspective: "运维视角：快速定界并恢复，同时保留复盘所需证据。", challengeId: "c4" },
  ],
};

// 岗位均为基于公开产品能力整理的学习样本，不代表对应公司此刻存在招聘名额。
const CAREER_MARKET_BASE_ITEMS: Omit<CareerMarketItem, "learningScenes">[] = [
  {
    id: "colasoft-traffic", company: "科来网络", abbreviation: "科", industry: "专业厂商", track: "网络分析",
    title: "网络回溯分析工程师", locations: ["成都", "全国项目"], careerId: "job-service",
    summary: "围绕高保真流量采集、会话回溯与故障证据闭环的能力样本。",
    scenario: "关键业务慢或断时，核对采集边界、还原会话并向客户说明证据。",
    skills: ["TCP/IP", "流量取证", "旁路采集", "故障定界"], abilities: ["deploy", "locate", "report"], sourceIds: ["colasoft"],
  },
  {
    id: "colasoft-aiops", company: "科来网络", abbreviation: "科", industry: "专业厂商", track: "可观测性",
    title: "AIOps 可观测方案工程师", locations: ["成都", "北京"], careerId: "job-presale",
    summary: "围绕统一性能管理、告警收敛和跨云网应用定界的能力样本。",
    scenario: "将业务体验、网络、应用与告警事件组织为可复核的 PoC 方案。",
    skills: ["AIOps", "告警收敛", "业务性能", "PoC"], abilities: ["listen", "path", "report"], sourceIds: ["colasoft"],
  },
  {
    id: "aliyun-observe", company: "阿里云", abbreviation: "阿", industry: "互联网", track: "可观测性",
    title: "云原生可观测工程师", locations: ["杭州", "北京"], careerId: "job-ops",
    summary: "指标、日志、链路和事件统一观测的云平台能力样本。",
    scenario: "在微服务和容器环境中建立观测图谱，定位接口与依赖异常。",
    skills: ["OpenTelemetry", "Prometheus", "链路追踪", "Kubernetes"], abilities: ["deploy", "path", "locate"], sourceIds: ["aliyun", "opentelemetry"],
  },
  {
    id: "tencent-observe", company: "腾讯云", abbreviation: "腾", industry: "互联网", track: "可观测性",
    title: "全栈可观测平台工程师", locations: ["深圳", "北京"], careerId: "job-ops",
    summary: "覆盖应用、前端、终端、拨测和 Prometheus 的能力样本。",
    scenario: "关联用户体验、调用链与基础设施指标，缩小性能故障范围。",
    skills: ["APM", "RUM", "云拨测", "Grafana"], abilities: ["path", "locate", "alert"], sourceIds: ["tencent-observe", "prometheus"],
  },
  {
    id: "huawei-secmaster", company: "华为云", abbreviation: "华", industry: "互联网", track: "安全运营",
    title: "云安全运营工程师", locations: ["深圳", "东莞"], careerId: "job-analysis",
    summary: "围绕资产风险、威胁检测和自动化响应的能力样本。",
    scenario: "从多源告警中还原攻击链，配置响应剧本并形成运营报告。",
    skills: ["SIEM", "SOAR", "威胁检测", "攻击链"], abilities: ["alert", "locate", "report"], sourceIds: ["huawei", "mitre"],
  },
  {
    id: "tencent-soc", company: "腾讯安全", abbreviation: "腾", industry: "专业厂商", track: "安全运营",
    title: "SOC 分析工程师", locations: ["深圳", "北京"], careerId: "job-analysis",
    summary: "基于日志、流量、情报和实体行为开展检测响应的能力样本。",
    scenario: "研判高价值事件、还原攻击时间线并推动工单闭环。",
    skills: ["TDIR", "UEBA", "威胁情报", "事件响应"], abilities: ["alert", "locate", "report"], sourceIds: ["tencent-soc", "mitre"],
  },
  {
    id: "sangfor-soc", company: "深信服", abbreviation: "深", industry: "专业厂商", track: "安全运营",
    title: "安全运营服务工程师", locations: ["深圳", "全国项目"], careerId: "job-service",
    summary: "面向客户安全态势、告警研判和处置闭环的学习样本。",
    scenario: "驻场或远程完成资产梳理、事件研判、复盘和持续运营。",
    skills: ["态势感知", "告警降噪", "应急响应", "客户沟通"], abilities: ["listen", "alert", "report"], sourceIds: ["mitre"],
  },
  {
    id: "qianxin-soc", company: "奇安信", abbreviation: "奇", industry: "专业厂商", track: "安全运营",
    title: "威胁分析工程师", locations: ["北京", "全国项目"], careerId: "job-analysis",
    summary: "面向流量检测、关联分析和安全事件调查的能力样本。",
    scenario: "把资产、日志和流量证据关联到攻击技战术并给出处置建议。",
    skills: ["NDR", "SIEM", "ATT&CK", "事件调查"], abilities: ["alert", "locate", "report"], sourceIds: ["mitre"],
  },
  {
    id: "icbc-ops", company: "工商银行", abbreviation: "工", industry: "金融", track: "SRE / 运维",
    title: "金融核心系统运维", locations: ["北京", "上海"], careerId: "job-ops",
    summary: "高可用交易链路、变更风险和故障协同的行业能力样本。",
    scenario: "围绕关键交易窗口完成监控、故障定界、升级与复盘。",
    skills: ["高可用", "容量管理", "变更管理", "应急协同"], abilities: ["path", "locate", "report"], sourceIds: ["opentelemetry"],
  },
  {
    id: "cmb-observe", company: "招商银行", abbreviation: "招", industry: "金融", track: "可观测性",
    title: "金融应用可观测工程师", locations: ["深圳", "杭州"], careerId: "job-ops",
    summary: "移动金融与核心依赖全链路观测的行业能力样本。",
    scenario: "通过指标、日志和链路定位高峰期接口性能与依赖问题。",
    skills: ["APM", "调用链", "SLO", "数据库性能"], abilities: ["path", "locate", "alert"], sourceIds: ["opentelemetry", "prometheus"],
  },
  {
    id: "pingan-sre", company: "平安科技", abbreviation: "平", industry: "金融", track: "SRE / 运维",
    title: "平台可靠性工程师", locations: ["深圳", "上海"], careerId: "job-ops",
    summary: "面向大规模金融科技平台稳定性治理的能力样本。",
    scenario: "定义 SLI/SLO、治理告警并推动重大故障复盘。",
    skills: ["SRE", "SLO", "混沌演练", "故障复盘"], abilities: ["alert", "locate", "report"], sourceIds: ["prometheus"],
  },
  {
    id: "unionpay-security", company: "中国银联", abbreviation: "银", industry: "金融", track: "安全运营",
    title: "支付安全运营分析师", locations: ["上海"], careerId: "job-analysis",
    summary: "支付网络安全监测、事件分析和跨团队响应的行业能力样本。",
    scenario: "识别影响支付链路的风险事件，保留证据并推动处置。",
    skills: ["支付安全", "日志分析", "风险研判", "应急响应"], abilities: ["alert", "locate", "report"], sourceIds: ["mitre"],
  },
  {
    id: "cmcc-netops", company: "中国移动", abbreviation: "移", industry: "运营商", track: "网络分析",
    title: "骨干网质量分析工程师", locations: ["北京", "省级公司"], careerId: "job-service",
    summary: "面向大规模承载网性能、路径和质量分析的行业能力样本。",
    scenario: "结合时延、丢包和路径变化定位跨域网络质量问题。",
    skills: ["路由协议", "网络遥测", "QoS", "流量分析"], abilities: ["deploy", "path", "locate"], sourceIds: ["colasoft"],
  },
  {
    id: "ctcc-cloudops", company: "中国电信", abbreviation: "电", industry: "运营商", track: "可观测性",
    title: "云网运营工程师", locations: ["北京", "省级公司"], careerId: "job-ops",
    summary: "云、网、边缘资源统一监控和故障协同的行业能力样本。",
    scenario: "关联云资源和承载网络，界定客户业务异常所在层级。",
    skills: ["云网融合", "网络遥测", "告警关联", "故障定界"], abilities: ["path", "locate", "report"], sourceIds: ["colasoft"],
  },
  {
    id: "sgcc-ops", company: "国家电网", abbreviation: "网", industry: "能源", track: "SRE / 运维",
    title: "生产系统运行监控", locations: ["北京", "省级单位"], careerId: "job-ops",
    summary: "生产控制与管理信息系统稳定运行的行业能力样本。",
    scenario: "关注关键系统可用性、网络边界、变更和应急协同。",
    skills: ["运行监控", "网络分区", "应急预案", "变更审计"], abilities: ["path", "alert", "report"], sourceIds: ["prometheus"],
  },
  {
    id: "cnpc-security", company: "中国石油", abbreviation: "油", industry: "能源", track: "安全运营",
    title: "工业网络安全运营", locations: ["北京", "区域单位"], careerId: "job-analysis",
    summary: "办公网与生产网资产风险、边界监测和事件处置能力样本。",
    scenario: "识别工业环境异常通信，限定影响范围并协同现场处置。",
    skills: ["工控安全", "资产测绘", "流量基线", "事件响应"], abilities: ["path", "alert", "locate"], sourceIds: ["mitre"],
  },
  {
    id: "byd-netops", company: "比亚迪", abbreviation: "比", industry: "制造", track: "网络分析",
    title: "智能制造网络运维", locations: ["深圳", "西安"], careerId: "job-service",
    summary: "工厂园区、数据中心和业务系统网络保障的行业能力样本。",
    scenario: "围绕产线关键业务定位网络、应用与第三方边界。",
    skills: ["园区网", "数据中心网络", "流量分析", "故障协同"], abilities: ["deploy", "path", "locate"], sourceIds: ["colasoft"],
  },
  {
    id: "midea-iot", company: "美的集团", abbreviation: "美", industry: "制造", track: "可观测性",
    title: "工业互联网可观测工程师", locations: ["佛山", "上海"], careerId: "job-ops",
    summary: "工业互联网平台、设备接入和应用链路监控能力样本。",
    scenario: "关联设备、边缘节点、消息链路和云应用的异常。",
    skills: ["IoT", "消息队列", "时序指标", "链路追踪"], abilities: ["deploy", "path", "locate"], sourceIds: ["opentelemetry"],
  },
  {
    id: "siemens-industry", company: "西门子中国", abbreviation: "西", industry: "制造", track: "安全运营",
    title: "工业安全分析工程师", locations: ["北京", "上海"], careerId: "job-analysis",
    summary: "工业控制环境资产、通信行为和安全事件分析能力样本。",
    scenario: "在不中断生产的前提下分析异常流量和安全影响。",
    skills: ["OT 安全", "工业协议", "资产识别", "风险评估"], abilities: ["listen", "path", "alert"], sourceIds: ["mitre"],
  },
  {
    id: "united-imaging-sre", company: "联影医疗", abbreviation: "联", industry: "医疗", track: "SRE / 运维",
    title: "医疗云平台可靠性工程师", locations: ["上海", "武汉"], careerId: "job-ops",
    summary: "医疗影像平台服务质量、性能和故障响应的行业能力样本。",
    scenario: "守护影像上传、处理和访问链路，明确院内外责任边界。",
    skills: ["SRE", "云平台", "容量管理", "隐私合规"], abilities: ["path", "locate", "report"], sourceIds: ["prometheus"],
  },
  {
    id: "neusoft-health", company: "东软集团", abbreviation: "东", industry: "医疗", track: "可观测性",
    title: "医疗应用性能工程师", locations: ["沈阳", "大连"], careerId: "job-service",
    summary: "医院信息系统接口、数据库与网络性能分析能力样本。",
    scenario: "从挂号、检验等业务现象追到接口、数据库或网络边界。",
    skills: ["APM", "数据库性能", "接口监控", "现场沟通"], abilities: ["listen", "locate", "report"], sourceIds: ["opentelemetry"],
  },
  {
    id: "inspur-gov", company: "浪潮软件", abbreviation: "浪", industry: "政务", track: "SRE / 运维",
    title: "政务云运维工程师", locations: ["济南", "全国项目"], careerId: "job-service",
    summary: "多租户政务云资源、应用和事件运营的能力样本。",
    scenario: "保障政务应用运行，协调云资源、网络和应用团队排障。",
    skills: ["云运维", "ITSM", "监控告警", "应急值守"], abilities: ["deploy", "locate", "report"], sourceIds: ["prometheus"],
  },
  {
    id: "digital-gov-soc", company: "数字广东", abbreviation: "数", industry: "政务", track: "安全运营",
    title: "政务安全运营分析师", locations: ["广州"], careerId: "job-analysis",
    summary: "面向政务平台资产、日志和安全事件统一运营的能力样本。",
    scenario: "研判跨系统事件，形成影响范围、证据和处置建议。",
    skills: ["SOC", "资产管理", "日志分析", "运营报告"], abilities: ["alert", "locate", "report"], sourceIds: ["tencent-soc", "mitre"],
  },
  {
    id: "bytedance-sre", company: "字节跳动", abbreviation: "字", industry: "互联网", track: "SRE / 运维",
    title: "大规模服务可靠性工程师", locations: ["北京", "上海"], careerId: "job-ops",
    summary: "高并发服务容量、可用性和自动化运维能力样本。",
    scenario: "基于 SLO 发现风险，处理告警并复盘复杂依赖故障。",
    skills: ["SRE", "Kubernetes", "自动化", "容量治理"], abilities: ["deploy", "alert", "locate"], sourceIds: ["prometheus", "opentelemetry"],
  },
];

export const CAREER_MARKET_ITEMS: CareerMarketItem[] = CAREER_MARKET_BASE_ITEMS.map((item) => ({
  ...item,
  learningScenes: ROLE_SCENES[item.careerId],
}));

export function careerDetailOf(item: CareerMarketItem): CareerDetailProfile {
  return ROLE_DETAILS[item.careerId];
}

export function careerById(id: string) {
  return CAREER_MARKET_ITEMS.find((item) => item.id === id);
}

export function careerRelationsForChallenge(challengeId: string) {
  return CAREER_MARKET_ITEMS.flatMap((career) =>
    career.learningScenes
      .filter((scene) => scene.challengeId === challengeId)
      .map((scene) => ({ career, scene })),
  );
}

export const INDUSTRY_OUTLOOK: Record<CareerIndustry, { focus: string; signal: string }> = {
  金融: { focus: "核心交易稳定性、全链路追踪、安全响应", signal: "高可靠与证据闭环" },
  运营商: { focus: "云网融合、网络遥测、跨域故障定界", signal: "网络与云协同" },
  能源: { focus: "生产网络边界、工控资产、应急保障", signal: "OT 可见性增强" },
  制造: { focus: "园区与产线网络、IoT 链路、工业安全", signal: "IT/OT 融合" },
  医疗: { focus: "关键业务连续性、接口性能、隐私合规", signal: "业务体验优先" },
  政务: { focus: "多租户云运维、统一安全运营、值守响应", signal: "集约化运营" },
  互联网: { focus: "云原生观测、SLO、自动化和容量治理", signal: "全栈可观测" },
  专业厂商: { focus: "流量证据、产品交付、SOC 与客户沟通", signal: "复合型能力" },
};
