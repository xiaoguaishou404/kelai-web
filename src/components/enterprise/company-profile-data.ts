import {
  Activity, Award, BadgeCheck, Boxes, Building2, ChartNoAxesCombined, Cloud, Cpu,
  Fingerprint, Globe2, Layers3, Network, ScanLine, ShieldCheck, Sparkles,
} from "lucide-react";

const official = "https://ai.colasoft.com.cn";

export const companySources = {
  about: `${official}/about`,
  technology: `${official}/technology`,
  global: `${official}/industry-recognition/global-customers`,
  offices: `${official}/offices`,
  products: `${official}/products`,
  cases: `${official}/customers`,
  protocolMap: `${official}/wp-content/uploads/2023/07/${encodeURIComponent("科来《网络通讯协议图2023版》")}.pdf`,
};

export const companyMetrics = [
  { value: "2003", label: "公司成立" },
  { value: "430+", label: "核心知识产权" },
  { value: "200Gbps", label: "流量处理能力突破" },
  { value: "10,000+", label: "全球商业客户" },
];

export const companyOverview = [
  "科来网络技术股份有限公司于 2003 年在成都成立，长期研发网络流量采集与分析技术。业务覆盖性能管理、云网运维、安全分析、工业互联网监测与技术培训，为关键行业提供从流量采集到运行分析的产品与服务。",
  "在复杂系统里，一次业务卡顿可能同时涉及应用、数据库和多段网络。科来将交易与接口指标、云网路径、告警和原始报文关联起来，帮助运维团队缩小排查范围、核实故障原因，并为复盘保留可查证的依据。",
];

export const strengths = [
  { icon: Cpu, title: "自主研发", detail: "围绕流量采集、协议解析、数据检索与分析持续研发，累计拥有逾 430 项核心知识产权。" },
  { icon: Activity, title: "高性能处理", detail: "科来公布的流量处理能力已突破 200Gbps，全栈国产化方案实现了 100Gbps 处理能力。" },
  { icon: Globe2, title: "全球服务", detail: "产品与服务覆盖 110 多个国家和地区，全球商业客户超过一万家，其中包括 160 余家世界 500 强企业。", url: companySources.global },
  { icon: BadgeCheck, title: "技术标准", detail: "参与可观测性相关标准编制，包括《云计算智能化可观测性能力成熟度模型》。" },
];

export const capabilities = [
  { icon: Network, title: "采集与留存", detail: "从物理链路和虚拟网络采集流量，按故障时间窗保留原始报文与会话记录。发生问题时，可沿相关业务链路调取数据。" },
  { icon: Layers3, title: "解析与关联", detail: "将协议、地址、会话和交易指标置于同一分析视图。上下游团队可以按同一时间窗和链路对照数据，区分网络、应用及外部接口的影响。" },
  { icon: ScanLine, title: "诊断与验证", detail: "从交易变慢、接口失败或告警聚集入手，结合运行数据缩小故障范围，再用原始报文核实分析结论。" },
  { icon: ChartNoAxesCombined, title: "复盘与治理", detail: "把业务影响、关键证据和验证结果归入复盘报告，帮助团队跟踪性能基线、评估整改效果，并积累可重复使用的排障方法。" },
];

export const products = [
  {
    icon: Activity, name: "UPM 业务性能管理", category: "业务性能",
    detail: "汇集网络、应用和业务指标，为运维团队提供统一的性能视图。发现业务体验异常时，可以沿应用链路逐步下钻，并调取 RAS 沉淀的报文核实。",
    url: `${official}/solutions/digital-business-performance`,
  },
  {
    icon: Boxes, name: "RAS 高保真运行回溯", category: "全流量回溯",
    detail: "在关键节点持续采集并保存原始流量，支持按时间窗、会话和协议检索。历史故障可回到发生时的报文，供定位、取证与复盘使用。",
    url: `${official}/products/ras-retrospective-analysis`,
  },
  {
    icon: Sparkles, name: "小科 AI", category: "智能诊断",
    detail: "通过自然语言查询运行状态，调用性能、云网、告警和回溯数据进行关联分析。分析结果可保留相关证据，供工程师进一步核对。",
    url: `${official}/products/xiaoke-ai`,
  },
  {
    icon: Cloud, name: "CMC 云魔方", category: "云网可观测",
    detail: "面向混合云、资源池和云上应用，观察虚拟网络路径及云内东西向流量，帮助排查跨主机、跨网段或云上云下的链路问题。",
    url: `${official}/products/cmc-cloud-observability`,
  },
  {
    icon: ChartNoAxesCombined, name: "北极星业务监控平台", category: "交易体验",
    detail: "从业务交易视角监测成功率、响应时间和接口表现，支持单笔交易追踪。适用于梳理支付、渠道服务等高连续性业务的影响范围。",
    url: `${official}/products/polaris-business-monitoring`,
  },
  {
    icon: ScanLine, name: "混天绫智能监控平台", category: "智能运维",
    detail: "面向数据中心与云资源池，结合运行基线、多源告警和事件关联，将重复或相关的告警归并为待处理事件，帮助定位需要优先响应的问题。",
    url: `${official}/products/huntianling-aiops`,
  },
  {
    icon: ShieldCheck, name: "TSA 安全数据分析", category: "安全研判",
    detail: "以全流量数据支撑风险识别、告警研判和事件回溯。分析人员可以围绕时间线查看可疑会话和相关证据，整理安全事件处理报告。",
    url: `${official}/products/tsa-ai-native-security-analytics`,
  },
  {
    icon: Fingerprint, name: "BFC 数据安全管理", category: "数据安全",
    detail: "围绕数据访问行为建立可视化分析视图，帮助团队识别异常访问、核对数据流转路径，为日常数据安全运营提供依据。",
    url: `${official}/products/bfc-data-security-analytics`,
  },
  {
    icon: Layers3, name: "智算中心可观测", category: "AI 基础设施",
    detail: "联合主机、GPU、网卡和交换机的运行数据，观察训练链路与集群健康，帮助区分通讯延迟、设备状态和作业表现之间的影响。",
    url: `${official}/products/ai-computing-observability`,
  },
];

export const industryPractices = [
  {
    industry: "金融", title: "追踪核心交易链路", image: "/resources/covers/bank.webp", alt: "金融服务场景",
    detail: "金融交易跨越渠道、网关、应用和数据库。科来的公开案例将交易成功率、响应时间与单笔交易追踪关联，再用 RAS 查阅故障时间窗的报文，支持确认影响范围、明确责任边界及保障后的复盘。",
    url: `${official}/customers/financial-core-transaction`,
  },
  {
    industry: "能源", title: "保障调度与生产连续性", image: "/resources/covers/energy.webp", alt: "能源设施场景",
    detail: "在电网、油气和管网等场景，调度、监控与生产系统往往横跨多个数据中心和管理域。科来将关键链路状态、业务指标和告警事件放在同一时间线上，协助团队还原异常经过并形成运行风险报告。",
    url: `${official}/solutions/industries/energy-business-continuity`,
  },
  {
    industry: "运营商", title: "观测云资源池与服务体验", image: "/resources/covers/cloud-migration.webp", alt: "云资源池场景",
    detail: "当资源池中的业务访问变慢，问题可能来自虚拟网络、应用依赖或底层采集盲区。统一查看路径、业务体验和相关告警，可帮助运营团队明确问题所在的域，并用同一组指标评估服务质量。",
    url: companySources.cases,
  },
  {
    industry: "先进制造", title: "梳理产线系统依赖", image: "/resources/covers/factory.webp", alt: "工业制造场景",
    detail: "生产设备、测试系统、制造执行系统与数据平台互相依赖。科来公开资料覆盖 IT 与 OT 联合观测，重点关注链路波动是否影响产线、测试或数据采集，并为计划外停机复盘保留线索。",
    url: companySources.cases,
  },
  {
    industry: "公共服务", title: "还原服务接口与用户影响", image: "/resources/covers/hospital.webp", alt: "公共服务设施场景",
    detail: "公开案例围绕服务事项和接口链路建立体验视图，将接口响应与高保真回溯数据关联。多个系统承建方可以据此确认用户影响、协商责任边界，并跟踪服务改进情况。",
    url: `${official}/customers/public-service-experience`,
  },
  {
    industry: "智算中心", title: "分析训练作业的长尾", image: "/resources/covers/dc-change.webp", alt: "数据中心设施场景",
    detail: "在大模型训练集群中，个别节点掉队会拖慢整体作业。通过主机与网络遥测对照 GPU 利用率、网卡状态和训练阶段，可以为定位通信拥塞及集群性能问题提供线索。",
    url: `${official}/products/ai-computing-observability`,
  },
];

export const milestones = [
  { phase: "2003—2009", title: "创立与海外拓展", detail: "科来在成都成立，早期以网络分析工具为核心。据公司公开资料，产品在 2004 年已进入全球 46 个国家。此后推出中文技术交流版，并开展 CSNA 网络分析认证培训。" },
  { phase: "2010—2012", title: "全流量与回溯分析落地", detail: "发布全流量与回溯分析相关产品，将保存原始报文、定位故障时间窗和复核故障证据纳入产品能力。科来网络分析产品曾获 PC Magazine 评测认可。" },
  { phase: "2013—2017", title: "进入企业级数据中心", detail: "网络分析工具逐步拓展至数据中心运行保障。结合分布式流量采集与大数据分析，支持组织跨设备、跨业务的性能管理和故障排查。" },
  { phase: "2018—2020", title: "国际市场认可与标准参与", detail: "在 Gartner 网络性能监控与诊断相关报告中获评「远见者」，并作为代表性供应商被纳入相关市场指南。同期持续参与行业标准研制。" },
  { phase: "2021", title: "云魔方发布", detail: "推出云魔方智能云网分析平台，与主流云和国产化生态开展适配，扩展云资源池、虚拟网络与混合云环境的流量观测能力。" },
  { phase: "2022", title: "混天绫与高性能产品发布", detail: "发布混天绫智能监控分析平台，面向多云多网运维提供告警关联能力。同年推出匹配存储、检索与分析能力的 100G 高性能产品。" },
  { phase: "2023", title: "获评国家知识产权示范企业", detail: "公司公布核心知识产权超过 430 项，研发积累覆盖流量采集、存储、检索、协议分析与可观测产品工程化等方向。" },
  { phase: "2024—2025", title: "全栈 AI 与处理性能升级", detail: "将 AI 诊断接入全栈产品，公布流量处理能力突破 200Gbps、全栈国产化处理能力达 100Gbps，并参与云计算可观测性相关标准编制。" },
];

export const recognitions = [
  { icon: Award, title: "Gartner 市场认可", detail: "据科来公开资料，2018、2019 年在 Gartner NPMD 魔力象限获评「远见者」，并入选后续市场指南。", url: `${official}/recognitions/gartner-global-recognition` },
  { icon: ChartNoAxesCombined, title: "IDC 连续八年市场认可", detail: "据科来转述的 IDC 报告，2018—2025 年在中国相关市场连续八年保持领先。", url: `${official}/recognitions/idc-eight-year-market-recognition` },
  { icon: BadgeCheck, title: "国家知识产权示范企业", detail: "2023 年获评国家知识产权示范企业，已积累逾 430 项核心知识产权。", url: `${official}/recognitions/national-ip-demonstration-enterprise` },
  { icon: Building2, title: "红鲱鱼 Global Top 100", detail: "入选红鲱鱼面向创新企业的全球榜单，系科来公开列出的国际市场认可之一。", url: `${official}/recognitions/red-herring-global-top-100` },
];

export const csnaPrograms = [
  { code: "CSNA-A", name: "网络分析助理", detail: "网络分析基础方向。适合从常见协议、通信流程和报文证据入手，建立初步的网络故障分析能力。" },
  { code: "CSNA-E", name: "网络分析专家", detail: "网络分析进阶方向。重点连接报文、链路和业务表现，用于理解复杂业务性能问题并形成可复核的分析结论。" },
  { code: "CSNA-S", name: "网络安全分析专家", detail: "网络安全分析方向。围绕可疑流量、事件证据和调查时间线，理解如何用网络分析支撑安全事件研判。" },
];
