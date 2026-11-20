import { SceneProfile } from "@/lib/enterprise-workspace/types";

type SceneSeedInput = {
  id: string;
  name: string;
  jobId: string;
  industry: string;
  description: string;
  tasks: string[];
  evidence: [string, string, string][];
  courseIds?: string[];
};

function buildLearningScene(input: SceneSeedInput): SceneProfile {
  return {
    id: input.id,
    name: input.name,
    industry: input.industry,
    jobId: input.jobId,
    difficulty: "进阶",
    description: input.description,
    required: true,
    tasks: input.tasks,
    evidence: input.evidence.map(([title, time, detail], index) => ({
      id: `${input.id}-evidence-${index + 1}`,
      title,
      time,
      detail,
    })),
    answer: `围绕“${input.name}”先确认业务目标与采集边界，再选择相互印证的证据形成结论，并说明仍不可见的范围。`,
    abilityWeights: [0.1, 0.15, 0.25, 0.25, 0.1, 0.15],
    courseIds: input.courseIds ?? [],
    trainingIds: [],
  };
}

export const learningPathScenes: SceneProfile[] = [
  buildLearningScene({
    id: "customer-scope",
    name: "客户现场问题界定",
    jobId: "service",
    industry: "金融",
    description: "客户只描述“交易变慢”，需要把模糊反馈转换成可验证的时间、对象、链路和交付边界。",
    tasks: ["整理客户原始描述", "确认业务时间窗与影响对象", "形成首版分析计划", "向客户复述问题边界"],
    courseIds: ["course-4"],
    evidence: [
      ["客户报障", "09:00:12", "柜面转账持续转圈，问题从下午三点开始明显。"],
      ["影响范围", "09:02:20", "三个网点出现同类现象，手机银行暂未反馈异常。"],
      ["已知事实", "09:04:08", "专线利用率正常，应用尚未提供日志。"],
      ["待验证项", "09:05:30", "数据库与核心应用内部耗时仍不可见。"],
    ],
  }),
  buildLearningScene({
    id: "delivery-defense",
    name: "故障复盘与现场答辩",
    jobId: "service",
    industry: "金融",
    description: "把证据、判断和边界组织成可交付复盘，并在教师和客户角色质询下完成现场答辩。",
    tasks: ["整理结论与证据对应关系", "编写客户复盘摘要", "准备替代原因说明", "完成现场答辩"],
    courseIds: ["course-5"],
    evidence: [
      ["应用等待", "14:20:06", "核心应用响应耗时 47 秒。"],
      ["链路正常", "14:20:18", "RTT 18ms，没有明显丢包。"],
      ["数据库盲区", "14:21:30", "数据库内部未接入采集。"],
      ["复盘建议", "14:22:10", "应用日志与数据库等待需要联合核查。"],
    ],
  }),
  buildLearningScene({
    id: "asset-baseline",
    name: "资产基线与采集范围",
    jobId: "security",
    industry: "能源",
    description: "建立办公区、管理区和生产控制区的资产与可见性基线，明确安全研判的边界。",
    tasks: ["识别资产角色", "核对采集区段", "标注不可见资产", "形成采集边界说明"],
    courseIds: ["course-1"],
    evidence: [
      ["资产清单", "08:40:01", "办公区 128 台资产完成登记。"],
      ["网络分区", "08:43:22", "生产控制区与办公管理区通过隔离设备连接。"],
      ["采集点位", "08:45:10", "镜像覆盖办公区核心交换。"],
      ["可见性边界", "08:47:30", "生产控制区流量未进入本次采集。"],
    ],
  }),
  buildLearningScene({
    id: "dns-investigation",
    name: "DNS 异常与异常外联调查",
    jobId: "security",
    industry: "能源",
    description: "DNS 解析失败、用户超时和异常域名请求同时出现，需要还原会话并确认调查优先级。",
    tasks: ["还原 DNS 会话", "关联异常域名", "核对业务超时", "形成调查优先级"],
    courseIds: ["course-3"],
    evidence: [
      ["DNS 失败", "09:08:31", "18 次解析请求在 30 秒内失败。"],
      ["异常域名", "09:09:12", "多个终端访问同一低频域名。"],
      ["用户超时", "09:09:40", "业务查询与 DNS 失败发生在同一时间窗。"],
      ["控制区边界", "09:10:20", "控制区未采集，无法确认是否存在同类请求。"],
    ],
  }),
  buildLearningScene({
    id: "security-defense",
    name: "安全研判复盘与现场答辩",
    jobId: "security",
    industry: "能源",
    description: "在值班复盘会上解释告警取舍、证据强弱和业务影响，并回应现场质询。",
    tasks: ["整理告警归并依据", "形成风险判断", "准备答辩要点", "完成现场答辩"],
    courseIds: ["course-5"],
    evidence: [
      ["巡检噪声", "10:02:11", "1,140 条扫描告警来自已登记巡检源。"],
      ["业务影响", "10:05:24", "两类业务查询出现集中超时。"],
      ["证据强度", "10:08:02", "异常域名与会话行为能够相互印证。"],
      ["不可见范围", "10:09:45", "控制区缺少采集数据。"],
    ],
  }),
  buildLearningScene({
    id: "baseline-analysis",
    name: "业务性能基线分析",
    jobId: "observability",
    industry: "医疗",
    description: "建立影像查询的正常基线，识别首字节等待、传输时间与应用处理时间的差异。",
    tasks: ["定义性能指标", "建立正常时段基线", "对比异常查询", "提交基线分析结论"],
    courseIds: ["course-2"],
    evidence: [
      ["正常基线", "13:30:01", "同类查询正常首字节等待 240ms。"],
      ["异常等待", "14:20:06", "异常查询首字节等待 8.6 秒。"],
      ["网络往返", "14:20:15", "RTT 22ms，链路指标正常。"],
      ["应用盲区", "14:21:20", "应用内部线程耗时未采集。"],
    ],
  }),
  buildLearningScene({
    id: "joint-troubleshooting",
    name: "跨团队联合排障",
    jobId: "observability",
    industry: "医疗",
    description: "把网络、应用和存储团队的信息汇聚为同一张时间线，明确下一步联合验证动作。",
    tasks: ["建立联合时间线", "核对各方指标", "识别等待环节", "形成联合排查任务"],
    courseIds: ["course-2"],
    evidence: [
      ["挂号正常", "14:18:10", "HIS 挂号事务响应稳定。"],
      ["影像等待", "14:20:06", "PACS 查询首字节等待显著。"],
      ["存储反馈", "14:24:32", "存储侧暂无慢盘告警。"],
      ["应用日志", "14:27:18", "应用线程池队列出现堆积。"],
    ],
  }),
  buildLearningScene({
    id: "observability-defense",
    name: "可观测性案例答辩",
    jobId: "observability",
    industry: "医疗",
    description: "面向技术团队汇报性能问题定位思路，说明指标基线、跨团队证据和不可见边界。",
    tasks: ["整理链路指标", "组织判断依据", "准备客户答复", "完成案例答辩"],
    courseIds: ["course-5"],
    evidence: [
      ["链路拆分", "15:00:08", "用户、网络、应用和存储层等待被拆分。"],
      ["异常尺度", "15:01:22", "异常查询等待约为基线的 35 倍。"],
      ["应用证据", "15:02:30", "线程池队列持续高位。"],
      ["边界说明", "15:03:18", "存储内部慢 I/O 仍需联合验证。"],
    ],
  }),
];
