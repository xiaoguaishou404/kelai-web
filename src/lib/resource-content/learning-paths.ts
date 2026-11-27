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
    answer: `围绕“${input.name}”先确认工程目标与现场边界，再选择相互印证的证据形成结论，并说明仍需补测或联合确认的范围。`,
    abilityWeights: [0.12, 0.18, 0.22, 0.22, 0.1, 0.16],
    courseIds: input.courseIds ?? [],
  };
}

export const learningPathScenes: SceneProfile[] = [
  buildLearningScene({
    id: "customer-scope",
    name: "更新项目居民需求界定",
    jobId: "observability",
    industry: "城市更新",
    description: "居民只描述“房子旧、生活不方便”，需要把模糊诉求转换成可核查的安全、功能与运营问题。",
    tasks: ["整理居民原始诉求", "核实房屋与片区现状", "形成首版更新问题清单", "向多方复述问题边界"],
    courseIds: ["course-7"],
    evidence: [
      ["居民诉求", "09:00:12", "屋面渗漏、楼道昏暗、停车困难是反映最集中的问题。"],
      ["房屋现状", "09:02:20", "三栋建筑建于 1985 年，未做过系统性结构加固。"],
      ["已有资料", "09:04:08", "街道已提供片区体检报告与产权底册。"],
      ["待核实项", "09:05:30", "居民自筹意愿与历史建筑保护范围尚未确认。"],
    ],
  }),
  buildLearningScene({
    id: "delivery-defense",
    name: "更新实施方案答辩",
    jobId: "observability",
    industry: "城市更新",
    description: "把体检结论、更新方案、资金测算和实施路径组织成可审批的方案，并回应居民与主管部门质询。",
    tasks: ["整理结论与证据对应关系", "编写实施方案摘要", "准备替代方案说明", "完成现场答辩"],
    courseIds: ["course-5", "course-13"],
    evidence: [
      ["安全结论", "14:20:06", "两栋住宅抗震能力不足，建议加固或拆除重建。"],
      ["资金测算", "14:20:18", "原拆原建成本约 1.2 万元/㎡，需政策性资金支持。"],
      ["保护边界", "14:21:30", "沿街立面属于风貌保护范围，不得改变尺度。"],
      ["实施建议", "14:22:10", "采用分期实施，先解决安全隐患再导入运营。"],
    ],
  }),
  buildLearningScene({
    id: "asset-baseline",
    name: "既有建筑信息普查",
    jobId: "incident",
    industry: "既有建筑",
    description: "建立建筑年代、结构形式、使用状态和改造历史的基线，明确检测鉴定范围。",
    tasks: ["识别建筑与结构类型", "核对图纸与改造记录", "标注安全隐患", "形成普查与检测计划"],
    courseIds: ["course-8"],
    evidence: [
      ["建筑清单", "08:40:01", "片区共 46 栋建筑，其中 12 栋为砖混结构。"],
      ["图纸资料", "08:43:22", "8 栋建筑缺少完整竣工图，需现场测绘。"],
      ["使用状态", "08:45:10", "3 栋底层商铺存在违规夹层与拆改。"],
      ["检测范围", "08:47:30", "首批优先检测砖混住宅与人员密集公共建筑。"],
    ],
  }),
  buildLearningScene({
    id: "dns-investigation",
    name: "既有结构检测数据分析",
    jobId: "incident",
    industry: "既有建筑",
    description: "回弹、钻芯、沉降与裂缝观测数据同时返回，需要判断结构安全状态并确定加固优先级。",
    tasks: ["核对检测方法与抽样位置", "比对材料强度推定值", "分析沉降与裂缝趋势", "形成鉴定结论与加固建议"],
    courseIds: ["course-8"],
    evidence: [
      ["回弹结果", "09:08:31", "三层柱混凝土强度推定值低于原设计 C30。"],
      ["钻芯修正", "09:09:12", "芯样强度与回弹推定值偏差 8%，需以芯样为准。"],
      ["沉降观测", "09:09:40", "近半年沉降速率 0.02mm/d，趋于稳定。"],
      ["裂缝观测", "09:10:20", "主要裂缝宽度 0.3mm，尚未持续扩展。"],
    ],
  }),
  buildLearningScene({
    id: "security-defense",
    name: "检测鉴定报告答辩",
    jobId: "incident",
    industry: "既有建筑",
    description: "在专家评审会上解释检测抽样、强度推定、安全等级和加固建议，并回应业主质询。",
    tasks: ["整理检测依据", "说明结论与不确定性", "准备加固方案比选", "完成专家答辩"],
    courseIds: ["course-8", "course-5"],
    evidence: [
      ["检测依据", "10:02:11", "依据现行鉴定标准与原设计图纸开展检测。"],
      ["抽样代表性", "10:05:24", "每层抽取 3 个构件，覆盖不同受力部位。"],
      ["安全等级", "10:08:02", "综合评定为 C 级，需加固后继续使用。"],
      ["加固建议", "10:09:45", "优先采用增大截面与粘钢组合方案。"],
    ],
  }),
  buildLearningScene({
    id: "baseline-analysis",
    name: "项目进度基线分析",
    jobId: "delivery",
    industry: "基础设施",
    description: "建立设计、采购、制造、安装四条主线的进度基线，识别关键路径与前置条件。",
    tasks: ["拆分工作包", "确定关键路径", "核对资源与前置条件", "提交进度纠偏计划"],
    courseIds: ["course-13"],
    evidence: [
      ["计划工期", "13:30:01", "总工期 240 天，钢结构安装位于关键路径。"],
      ["设计进度", "13:32:18", "深化图滞后 6 天，可能影响工厂下料。"],
      ["工厂产能", "13:35:06", "当前排产已满，新增构件需插单协调。"],
      ["现场条件", "13:38:40", "塔吊预计 12 天后完成安装验收。"],
    ],
  }),
  buildLearningScene({
    id: "joint-troubleshooting",
    name: "设计施工运维联合协调",
    jobId: "nfr",
    industry: "建筑数字化",
    description: "设计模型、施工进度与运维需求出现冲突，需要把三方信息汇聚到同一模型和时间线。",
    tasks: ["建立统一模型基线", "核对设计与现场偏差", "识别运维接口需求", "形成联合协调任务"],
    courseIds: ["course-12"],
    evidence: [
      ["模型版本", "14:18:10", "施工模型与最新设计版存在 7 处构件差异。"],
      ["现场反馈", "14:20:06", "两处预留洞口位置与设备基础冲突。"],
      ["运维需求", "14:24:32", "运维方要求补充设备编码与检修空间信息。"],
      ["协调结论", "14:27:18", "以现场复测为准更新模型，并在交付前完成编码映射。"],
    ],
  }),
  buildLearningScene({
    id: "observability-defense",
    name: "数字孪生交付答辩",
    jobId: "nfr",
    industry: "建筑数字化",
    description: "面向业主与运维团队汇报数字孪生交付成果，说明数据来源、更新机制和不可见边界。",
    tasks: ["整理模型与数据来源", "说明更新频率", "演示关键运维场景", "完成交付答辩"],
    courseIds: ["course-12", "course-5"],
    evidence: [
      ["模型范围", "15:00:08", "交付模型覆盖建筑、结构与主要机电系统。"],
      ["数据来源", "15:01:22", "进度来自项目管理平台，设备数据来自物联网关。"],
      ["更新机制", "15:02:30", "施工期每日更新，运维期按设备告警触发。"],
      ["边界说明", "15:03:18", "隐蔽工程内部状态仍依赖定期巡检与抽检。"],
    ],
  }),
];
