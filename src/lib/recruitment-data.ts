import type { AbilityKey } from "@/lib/types";
import type { CareerTrack } from "@/lib/career-market-data";

export const RECRUITMENT_CHECKED_AT = "2026-11-13";
export type RecruitmentChannel = "校园招聘" | "社会招聘" | "官网核验";
export type RecruitmentEvidence = "职位要求已核验" | "官方招聘入口" | "行业参考";
export interface EmployerRequirement {
  text: string;
  origin: "official" | "preparation";
  ability?: AbilityKey;
  taskId?: string;
}
export interface RecruitmentCompany {
  id: string;
  company: string;
  shortName: string;
  category: string;
  role: string;
  tracks: CareerTrack[];
  cities: string[];
  cityNote: string;
  channel: RecruitmentChannel;
  evidence: RecruitmentEvidence;
  sourceUrl: string;
  sourceLabel: string;
  searchTerms: string[];
  education: string;
  experience: string;
  eligibilityNote: string;
  reason: string;
  requirements: EmployerRequirement[];
  bonus: string[];
  preparation: string;
}

// 官方页面核验快照；未取得具体 JD 的条目不推断在招状态、招聘城市或学历门槛。
export const RECRUITMENT_COMPANIES: RecruitmentCompany[] = [
  {
    id: "h3c-support", company: "新华三集团", shortName: "H3C", category: "ICT 基础设施", role: "技术支持工程师（J17248）", tracks: ["网络分析", "可观测性", "SRE / 运维"], cities: ["深圳"], cityNote: "官方职位列出深圳；其他城市需另查职位。", channel: "社会招聘", evidence: "职位要求已核验", sourceUrl: "https://career.h3c.com/social/jobs?LocId=%5B%7B%22id%22%3A%224403%22%2C%22label%22%3A%22%E6%B7%B1%E5%9C%B3%E5%B8%82%22%7D%5D", sourceLabel: "新华三官方社招 · J17248", searchTerms: ["J17248", "技术支持工程师"], education: "全日制本科及以上，计算机、通信等相关专业", experience: "2–3 年及以上云计算运维或交付经验", eligibilityNote: "这是有经验要求的社招职位，适合了解长期能力目标；在校生可另查新华三校招。", reason: "将网络协议、云平台运维与客户交付结合，与故障定界和实战汇报方向相关。",
    requirements: [
      { text: "理解 TCP/IP、HTTP 与数通网络基础。", origin: "official", ability: "path", taskId: "c3" },
      { text: "能够独立分析、处理问题并与团队协作。", origin: "official", ability: "locate", taskId: "c4" },
      { text: "了解 OpenStack 及计算、网络、存储等云平台技术。", origin: "official" },
      { text: "参与项目技术支持、工程实施、培训及交流。", origin: "official", ability: "report", taskId: "c6" },
    ], bonus: ["具备华三或 VMware 平台运维经验", "熟悉 CAS、UIS、VDI 等相关产品"], preparation: "准备一次有时间线、关键指标、排除过程和协同边界的排障复盘；云平台与工作年限仍需额外积累。",
  },
  {
    id: "uniontech-ops", company: "统信软件", shortName: "UOS", category: "操作系统与基础软件", role: "运维研发工程师", tracks: ["可观测性", "SRE / 运维", "网络分析"], cities: ["武汉"], cityNote: "官方职位标注武汉。", channel: "校园招聘", evidence: "职位要求已核验", sourceUrl: "https://uniontech.com/m/zhaopin-info/1868.html", sourceLabel: "统信官方职位 · 运维研发工程师", searchTerms: ["运维研发工程师"], education: "官方职位标注本科", experience: "校园招聘；具体毕业届次需向企业核验", eligibilityNote: "页面未明确毕业年份与截止日期，申请前需核对当前岗位是否仍开放。", reason: "Linux 运维、网络基础和排障文档与平台训练相关，同时要求自动化开发能力。",
    requirements: [
      { text: "掌握 Linux 常用操作、Shell 与网络配置基础。", origin: "official", ability: "deploy", taskId: "c1" },
      { text: "理解 TCP/IP、HTTP、DNS 等网络基础。", origin: "official", ability: "path", taskId: "c3" },
      { text: "具备问题排查、学习和团队协作能力。", origin: "official", ability: "locate", taskId: "c4" },
      { text: "至少掌握一门脚本语言，了解 Git 和 CI/CD。", origin: "official" },
    ], bonus: ["系统管理或网络服务部署项目经验", "接触 Ansible、Prometheus、ELK 或开源项目"], preparation: "整理环境部署、故障定位和复盘材料；另外补充一份脚本自动化作品，平台六维画像不能证明编程能力。",
  },
  {
    id: "sangfor-service", company: "深信服", shortName: "信", category: "网络安全与云计算", role: "FAE / 远程技术服务方向", tracks: ["网络分析", "安全运营", "SRE / 运维", "可观测性"], cities: ["长沙"], cityNote: "官方列表中的远程技术服务岗位标注长沙；FAE 城市需逐岗核验。", channel: "校园招聘", evidence: "官方招聘入口", sourceUrl: "https://hr.sangfor.com/campucompon/schoolRecruitment", sourceLabel: "深信服官方校园招聘", searchTerms: ["远程技术服务工程师", "FAE技术服务工程师"], education: "按具体职位详情核验", experience: "官方校招页面列有 27 届相关岗位", eligibilityNote: "已核验招聘入口及岗位方向，尚未取得该具体岗位的完整任职要求。以下为学习准备建议。", reason: "技术服务方向需要把现场现象转换为可验证问题，适合关注网络排障与客户交付。",
    requirements: [
      { text: "准备网络协议与采集链路的基础说明。", origin: "preparation", ability: "path", taskId: "c3" },
      { text: "能按业务影响收敛报障范围。", origin: "preparation", ability: "listen", taskId: "c2" },
      { text: "用真实证据说明定位结论与协同对象。", origin: "preparation", ability: "locate", taskId: "c4" },
    ], bonus: ["可展示的服务场景复盘", "环境搭建与客户沟通练习"], preparation: "进入官网检索具体服务岗位，先确认毕业届别与工作城市，再逐项对照正式 JD。",
  },
  {
    id: "huawei-service", company: "华为", shortName: "华", category: "ICT 与云服务", role: "ICT 网络 / 云计算服务方向", tracks: ["网络分析", "可观测性", "SRE / 运维"], cities: [], cityNote: "当前仅核验官方招聘入口，工作城市与派遣范围需逐岗确认。", channel: "官网核验", evidence: "官方招聘入口", sourceUrl: "https://career.huawei.com/cn/", sourceLabel: "华为招聘官网", searchTerms: ["ICT网络技术工程师", "云计算服务工程师"], education: "以具体职位为准", experience: "校招、社招要求分别查看", eligibilityNote: "不将集团招聘入口视为某个职位当前开放的证明。", reason: "关注 ICT 交付、网络运行与云服务，能够延伸到链路定界和跨团队协同。",
    requirements: [
      { text: "准备业务网络拓扑、采集范围与故障边界说明。", origin: "preparation", ability: "path", taskId: "c3" },
      { text: "建立结构化排障过程，区分事实与假设。", origin: "preparation", ability: "locate", taskId: "c4" },
      { text: "练习方案讲解和客户复盘。", origin: "preparation", ability: "report", taskId: "c6" },
    ], bonus: ["端到端交付项目表达", "云平台基础知识与沟通能力"], preparation: "按服务类关键词检索官网；专业、语言、派遣和毕业届次均以具体职位为准。",
  },
  {
    id: "qianxin-security", company: "奇安信", shortName: "奇", category: "网络安全", role: "安全运营 / 安全服务方向", tracks: ["安全运营", "网络分析"], cities: [], cityNote: "城市由官方职位筛选器提供，当前未固化城市清单。", channel: "校园招聘", evidence: "官方招聘入口", sourceUrl: "https://campus.qianxin.com/campus/jobSearch?jobTag=all", sourceLabel: "奇安信官方校招职位入口", searchTerms: ["安全运营", "安全服务", "流量分析"], education: "按具体职位要求核验", experience: "当前校招说明面向国内 2027 届毕业生", eligibilityNote: "官方已公布校招批次；具体岗位、学历、专业与城市仍需逐项确认。", reason: "安全事件研判与处置协同，对应告警取舍、证据判断和研判汇报。",
    requirements: [
      { text: "按资产与业务影响解释告警优先级。", origin: "preparation", ability: "alert", taskId: "c5" },
      { text: "通过流量证据还原事件时间线。", origin: "preparation", ability: "locate", taskId: "c4" },
      { text: "提交事实、假设与补采建议分明的研判摘要。", origin: "preparation", ability: "report", taskId: "c6" },
    ], bonus: ["安全事件分析作品", "说明重复告警去噪的方法"], preparation: "先查看具体职位的技能范围；平台研判任务只能覆盖部分基础能力，不替代攻防或开发训练。",
  },
  {
    id: "tencent-observe", company: "腾讯", shortName: "腾", category: "互联网与云服务", role: "可观测 / 技术运营方向", tracks: ["可观测性", "SRE / 运维", "安全运营"], cities: [], cityNote: "城市、团队和岗位有效期以官网详情为准。", channel: "官网核验", evidence: "官方招聘入口", sourceUrl: "https://join.qq.com/", sourceLabel: "腾讯官方校园招聘", searchTerms: ["技术运营", "运维", "安全", "可观测"], education: "以具体职位为准", experience: "请按毕业届次选择对应招聘批次", eligibilityNote: "仅核验官方入口；未确认某个同名岗位当前有名额。", reason: "可观测性与技术运营方向重视服务指标、异常定界和故障协同。",
    requirements: [
      { text: "解释业务指标与链路信号如何共同支撑判断。", origin: "preparation", ability: "path", taskId: "c3" },
      { text: "用响应等待与传输指标排除替代原因。", origin: "preparation", ability: "locate", taskId: "c4" },
      { text: "按真实业务影响梳理告警。", origin: "preparation", ability: "alert", taskId: "c5" },
    ], bonus: ["监控与故障复盘实践", "脚本、容器及平台工具需另行补充"], preparation: "用推荐关键词检索官网，并将具体 JD 中的开发、系统与学历要求单独核对。",
  },
  {
    id: "bytedance-sre", company: "字节跳动", shortName: "字", category: "互联网平台", role: "SRE / 基础架构运维方向", tracks: ["SRE / 运维", "可观测性"], cities: [], cityNote: "未固化国内工作城市，请在官方职位列表选择。", channel: "官网核验", evidence: "官方招聘入口", sourceUrl: "https://jobs.bytedance.com/", sourceLabel: "字节跳动官方招聘入口", searchTerms: ["SRE", "运维", "基础架构"], education: "以具体职位为准", experience: "请区分实习、校招与社招要求", eligibilityNote: "海外 SRE 职位不能等同于国内岗位，本页未用海外职位条件替代国内要求。", reason: "SRE 方向可由系统可观测、故障定位和可靠性复盘训练逐步延伸。",
    requirements: [
      { text: "解释一次异常的发生时间、影响范围和观测边界。", origin: "preparation", ability: "listen", taskId: "c2" },
      { text: "提供定位结论对应的关键指标与排除过程。", origin: "preparation", ability: "locate", taskId: "c4" },
      { text: "以可执行建议完成跨团队复盘。", origin: "preparation", ability: "report", taskId: "c6" },
    ], bonus: ["Linux、自动化与容器实践需额外准备", "可展示的排障与复盘作品"], preparation: "先核对国内团队与岗位级别；平台能力画像仅涵盖实战问题分析的一部分。",
  },
  {
    id: "colasoft-network", company: "科来网络", shortName: "科", category: "网络分析与可观测性", role: "网络分析 / 技术交付能力参考", tracks: ["网络分析", "可观测性", "安全运营", "SRE / 运维"], cities: [], cityNote: "未核验招聘城市，不按公司所在地推断工作地。", channel: "官网核验", evidence: "行业参考", sourceUrl: "https://ai.colasoft.com.cn/", sourceLabel: "科来官方产品与行业能力介绍", searchTerms: ["技术服务", "网络分析", "可观测性"], education: "未取得官方职位要求", experience: "未取得具体招聘公告", eligibilityNote: "此项仅用于行业与能力认知；官网产品页面不是招聘启事。", reason: "产品方向覆盖高保真流量、业务性能与安全分析，与平台的取证、定界和汇报训练相关。",
    requirements: [
      { text: "说明旁路流量能够证明与不能证明的范围。", origin: "preparation", ability: "path", taskId: "c3" },
      { text: "形成可复核的故障取证过程。", origin: "preparation", ability: "locate", taskId: "c4" },
      { text: "以客户可理解的方式汇报结论。", origin: "preparation", ability: "report", taskId: "c6" },
    ], bonus: ["科来分析工具实训材料", "保留证据来源和场景限制的报告"], preparation: "先从官方渠道确认是否发布招聘公告，再核验具体岗位条件。",
  },
];

// 具体安全岗位与全国技术服务岗位：独立保留门槛，避免混为应届生机会。
RECRUITMENT_COMPANIES.push({
  id: "uniontech-security", company: "统信软件", shortName: "UOS", category: "操作系统安全", role: "安全研发工程师", tracks: ["安全运营"], cities: ["武汉"], cityNote: "官方职位标注武汉。", channel: "校园招聘", evidence: "职位要求已核验", sourceUrl: "https://www.uniontech.com/Recruitment.html", sourceLabel: "统信官方招聘 · 安全研发工程师", searchTerms: ["安全研发工程师"], education: "本科及以上，安全相关专业", experience: "校园招聘；毕业届次需核验", eligibilityNote: "职责包含安全研发与应急响应，不能将其等同于纯告警运营岗位。", reason: "应急研判与协同处置部分与安全运营相关；代码审计和漏洞研究需额外训练。",
  requirements: [{ text: "安全相关专业本科及以上。", origin: "official" }, { text: "具备逻辑分析、沟通协调及规划能力。", origin: "official", ability: "report", taskId: "c6" }, { text: "工作涉及代码审计、渗透测试与漏洞分析。", origin: "official" }], bonus: [], preparation: "将研判报告作为部分证据；另外准备安全研发、代码审计或漏洞分析实践。",
}, {
  id: "uniontech-service", company: "统信软件", shortName: "UOS", category: "基础软件技术服务", role: "技术工程师", tracks: ["网络分析", "SRE / 运维", "可观测性"], cities: ["全国"], cityNote: "官方职位标注全国，具体驻场地点由招聘方确认。", channel: "社会招聘", evidence: "职位要求已核验", sourceUrl: "https://www.uniontech.com/Recruitment.html", sourceLabel: "统信官方招聘 · 技术工程师", searchTerms: ["技术工程师"], education: "计算机相关专业本科", experience: "5 年以上服务器实施、售后支持或驻场经验", eligibilityNote: "有明确经验门槛，适合作为长期目标，不视为应届生可直接申请的岗位。", reason: "现场服务、Linux 维护与客户问题闭环，关联环境部署、故障定界及业务沟通。",
  requirements: [{ text: "熟练使用 Linux 及常见发行版。", origin: "official", ability: "deploy", taskId: "c1" }, { text: "了解高可用、容器或存储等基础技术。", origin: "official" }, { text: "具备客户服务意识及快速解决问题的能力。", origin: "official", ability: "listen", taskId: "c2" }], bonus: [], preparation: "关注驻场与服务经验的积累；平台任务记录不能替代工作年限。",
});

export function recruitmentForTrack(track: CareerTrack) {
  return RECRUITMENT_COMPANIES.filter(company => company.tracks.includes(track));
}
