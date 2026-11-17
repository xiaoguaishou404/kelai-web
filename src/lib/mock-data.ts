import { EXTRA_CHALLENGES } from "@/lib/scenario-data";
import type {
  Ability,
  Career,
  Challenge,
  ClassRoom,
  DemoState,
  Person,
  Submission,
  Tenant,
} from "@/lib/types";

export const STORAGE_KEY = "colasoft-teaching-demo-v2";

export const SCHOOL = {
  name: "江城理工学院",
  college: "网络空间安全学院",
};

export const ABILITIES: Ability[] = [
  {
    key: "deploy",
    name: "装机与环境部署",
    required: false,
    summary: "完成软件初始化、样本导入和采集链路连通核对。",
  },
  {
    key: "listen",
    name: "听懂问题",
    required: false,
    summary: "把客户报障原话收敛成可验证的业务痛点。",
  },
  {
    key: "path",
    name: "画出链路",
    required: false,
    summary: "标出端到端跳数、第三方边界和当前采集盲区。",
  },
  {
    key: "locate",
    name: "故障定位",
    required: true,
    summary: "依据流量证据指出慢或断发生在哪一跳。",
  },
  {
    key: "alert",
    name: "告警取舍",
    required: false,
    summary: "从重复噪音中挑出值得深查的风险事件。",
  },
  {
    key: "report",
    name: "汇报结论",
    required: true,
    summary: "用证据、边界和下一步建议完成 PoC 复盘。",
  },
];

export const PEOPLE: Person[] = [
  {
    id: "s1",
    name: "林知远",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s2",
    name: "周晚宁",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s3",
    name: "许澄",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s4",
    name: "马川",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s5",
    name: "沈予安",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s6",
    name: "陈予白",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s7",
    name: "何清越",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s8",
    name: "梁书衡",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s9",
    name: "赵晚晴",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s10",
    name: "吴砚秋",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s11",
    name: "郑知夏",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s12",
    name: "孙泊",
    role: "student",
    title: "2024 级学员",
    org: "网络分析 1 班",
  },
  {
    id: "s13",
    name: "顾言川",
    role: "student",
    title: "2025 级学员",
    org: "网络分析 2 班",
  },
  {
    id: "s14",
    name: "唐清禾",
    role: "student",
    title: "2025 级学员",
    org: "网络分析 2 班",
  },
  {
    id: "s15",
    name: "陆星遥",
    role: "student",
    title: "2025 级学员",
    org: "网络分析 2 班",
  },
  {
    id: "s16",
    name: "叶闻舟",
    role: "student",
    title: "2025 级学员",
    org: "网络分析 2 班",
  },
  {
    id: "s17",
    name: "宋以宁",
    role: "student",
    title: "2025 级学员",
    org: "网络分析 2 班",
  },
  {
    id: "s18",
    name: "谢时安",
    role: "student",
    title: "2025 级学员",
    org: "网络分析 2 班",
  },
  {
    id: "t1",
    name: "周启明",
    role: "teacher",
    title: "专业教师",
    org: SCHOOL.college,
  },
  {
    id: "l1",
    name: "陈疏影",
    role: "leader",
    title: "学院负责人",
    org: SCHOOL.college,
  },
  {
    id: "o1",
    name: "沈衡",
    role: "operator",
    title: "院校运营",
    org: "科来网络",
  },
];

export const DEMO_STUDENT_ID = "s1";

export const CLASSROOMS: ClassRoom[] = [
  {
    id: "class-1",
    name: "2024 级网络分析 1 班",
    major: "网络空间安全",
    termLabel: "2026 年春季实训",
    teacherId: "t1",
    studentIds: ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12"],
  },
  {
    id: "class-2",
    name: "2025 级网络分析 2 班",
    major: "网络工程",
    termLabel: "2026 年春季实训",
    teacherId: "t1",
    studentIds: ["s13", "s14", "s15", "s16", "s17", "s18"],
  },
];

// 合成院校数据，沿用教学时钟以保持既有实训记录一致。
const extraNames = ["苏景行", "程书瑶", "方奕辰", "罗思齐", "蒋予墨", "叶初晴", "潘亦舟", "邓知微", "夏嘉言", "魏星辰", "孟清和", "田雨桐", "卢景明", "钟以宁", "石云帆", "杜若溪", "贺承泽", "廖映秋", "白子谦", "陶望舒", "袁向晚", "任修远", "秦安然", "邵庭轩", "谢听澜", "姜乐言", "薛映川", "范星野", "彭芷晴", "韩若愚", "孔予希", "邱怀瑾", "宋亦舒", "崔明远"];
for (let number = 19; number <= 120; number += 1) {
  const group = number <= 36 ? 1 : number <= 64 ? 2 : number <= 92 ? 3 : 4;
  const nameIndex = number - 19;
  const suffix = ["", "宁", "然"][Math.floor(nameIndex / extraNames.length)];
  PEOPLE.push({ id: `s${number}`, name: `${extraNames[nameIndex % extraNames.length]}${suffix}`, role: "student", title: "院校实训学员", org: group < 3 ? `网络分析 ${group} 班` : group === 3 ? "可观测性工程班" : "安全运营实践班" });
}
CLASSROOMS[0].studentIds.push(...Array.from({ length: 18 }, (_, i) => `s${i + 19}`));
CLASSROOMS[1].studentIds.push(...Array.from({ length: 28 }, (_, i) => `s${i + 37}`));
CLASSROOMS.push(
  { id: "class-3", name: "2024 级可观测性工程班", major: "计算机科学与技术", termLabel: "2026 年春季实训", teacherId: "t1", studentIds: Array.from({ length: 28 }, (_, i) => `s${i + 65}`) },
  { id: "class-4", name: "2024 级安全运营实践班", major: "信息安全", termLabel: "2026 年春季实训", teacherId: "t1", studentIds: Array.from({ length: 28 }, (_, i) => `s${i + 93}`) },
);

export const CLASSROOM = CLASSROOMS[0];

export const CAREERS: Career[] = [
  {
    id: "job-service",
    title: "技术服务工程师",
    summary: "到客户现场完成采集部署、故障取证和复盘说明，服务金融、能源与政务网络。",
    companyTypes: ["科来及同类分析厂商", "行业集成商", "运维服务商"],
    skills: ["旁路采集", "回溯取证", "故障边界说明", "现场沟通"],
    abilities: ["deploy", "locate", "report"],
    certificate: "可对照 CSNA 了解协议分析基础，平台内不组织考试。",
  },
  {
    id: "job-analysis",
    title: "协议与安全分析",
    summary: "从全流量中区分真实风险与重复告警，并给出可复核的证据链。",
    companyTypes: ["安全分析团队", "行业 SOC 服务商", "网络分析厂商"],
    skills: ["告警甄别", "会话还原", "证据链", "误报说明"],
    abilities: ["alert", "locate", "listen"],
    certificate: "外部安全认证按院校安排报考，平台只提供能力对照。",
  },
  {
    id: "job-presale",
    title: "售前实施工程师",
    summary: "把客户原话转成验证目标，完成 PoC 范围、链路图和结论汇报。",
    companyTypes: ["科来售前实施", "可观测性厂商", "行业解决方案团队"],
    skills: ["需求转译", "PoC 范围", "链路表达", "下一步建议"],
    abilities: ["listen", "path", "report"],
    certificate: "岗位更看重复盘表达，不把单一厂商证书当作录用条件。",
  },
  {
    id: "job-ops",
    title: "可观测性运维",
    summary: "维护采集环境与业务观测面，判断性能问题落在哪一跳。",
    companyTypes: ["金融科技", "运营商", "先进制造信息化部门"],
    skills: ["环境连通", "业务链路", "性能定位", "观测盲区"],
    abilities: ["deploy", "path", "locate"],
    certificate: "可结合学校现有网络工程证书体系，平台不替代发证。",
  },
];

const locateEvidence = [
  {
    id: "ev-rtt",
    time: "15:02:11",
    title: "柜面到网点前置",
    detail: "往返时延 18ms，会话正常建立，没有出现连接失败。",
  },
  {
    id: "ev-arrive",
    time: "15:02:14",
    title: "前置请求已到总行",
    detail: "交易请求穿过专线并到达总行接入区，请求本身没有滞留。",
  },
  {
    id: "ev-app",
    time: "15:04:02",
    title: "核心响应等待",
    detail: "总行接入区到业务返回耗时 47 秒，等待发生在应用响应。",
  },
  {
    id: "ev-loss",
    time: "15:04:03",
    title: "重传占比",
    detail: "链路重传占比 1.2%，不足以解释下午三点的整段转圈。",
  },
];

export const CHALLENGES: Challenge[] = [
  {
    id: "c1",
    code: "ENV-01",
    title: "旁路采集环境初始化",
    scene: "合作银行的实训镜像里预置了一台未初始化的分析主机和一份网点镜像流量。",
    summary: "完成科来软件初始化、样本导入，并确认旁路采集口能够看到业务会话。",
    abilities: ["deploy"],
    required: false,
    difficulty: "基础",
    minutes: 45,
    version: "2026.1",
    stages: [
      { id: "c1-s1", title: "完成初始化", prompt: "确认软件可打开，并记录版本与采集口。" },
      { id: "c1-s2", title: "导入样本", prompt: "导入脱敏流量，检查时间范围和会话数量。" },
      { id: "c1-s3", title: "连通核对", prompt: "找出柜面到前置的代表性会话，证明链路已可见。" },
    ],
    criteria: ["软件与样本可用", "采集口判断正确", "能指出一份可见会话"],
    expertAnswer: "先核对分析主机版本和监听口，再导入 branch-core 样本。可见性止于已镜像的网点核心交换，专线对端未镜像的部分不能当作已经看见。",
    pitfalls: ["把管理口当成采集口", "样本未加载就开始下结论"],
    teacherGuide: "重点看学生是否区分管理口、采集口和未被镜像的跳数，不要求背诵安装步骤。",
    tools: ["网络回溯分析系统", "样本管理"],
    sample: "branch-init-0900.cap",
    evidence: [
      { id: "c1-e1", time: "09:12:01", title: "采集口状态", detail: "监听口 eth2 已收到镜像流量，管理口 eth0 仅有控制会话。" },
      { id: "c1-e2", time: "09:16:40", title: "样本规模", detail: "样本覆盖 14:40–15:20，共 18,420 条会话。" },
    ],
    labContext: {
      businessChain: ["柜面终端", "网点前置", "核心交换镜像口", "RAS 分析主机"],
      protocols: ["802.1Q", "TCP", "DNS", "HTTP"],
      indicators: ["采集口包速率", "丢包计数", "会话时间窗", "五元组"],
      visibility: "仅能看到交换机 SPAN/TAP 复制到 eth2 的流量；管理口 eth0 与未镜像 VLAN 不在证据范围。",
      deliverables: ["记录镜像口与管理口", "核对样本时间窗和会话数", "提交一条可复核五元组"],
    },
  },
  {
    id: "c2",
    code: "ASK-02",
    title: "把报障原话转成业务痛点",
    scene: "网点主任说：下午三点系统特别卡，是不是专线又满了，你们给升级设备吧。",
    summary: "收敛模糊报障，写清受影响业务、发生时间和尚未证实的猜测。",
    abilities: ["listen"],
    required: false,
    difficulty: "基础",
    minutes: 30,
    version: "2026.1",
    stages: [
      { id: "c2-s1", title: "摘出事实", prompt: "保留客户真正观察到的现象。" },
      { id: "c2-s2", title: "分离猜测", prompt: "标出“专线满了”和“需要升级”属于未经证实的判断。" },
    ],
    criteria: ["现象具体", "猜测与事实分开", "没有直接跳到卖设备"],
    expertAnswer: "可核实的现象是工作日 15:00 左右柜面转账等待变长。专线拥塞和设备老化都只是待验证假设，下一步应先看已镜像链路的证据。",
    pitfalls: ["复述成网络故障", "顺着客户要求直接推荐升级"],
    teacherGuide: "通过的回答必须包含业务、时间和待验证假设。只写“网络慢”应退回。",
    tools: ["任务记录"],
    sample: "访谈纪要 · 网点主任",
    evidence: [
      { id: "c2-e1", time: "访谈", title: "原话", detail: "下午三点转账页面转圈，柜台排队明显变长。" },
      { id: "c2-e2", time: "访谈", title: "未证实猜测", detail: "客户认为专线带宽不足，但没有提供利用率数据。" },
    ],
  },
  {
    id: "c3",
    code: "PATH-03",
    title: "柜面交易链路与采集盲区",
    scene: "交易从柜面终端出发，经过网点前置、专线和总行接入区，最后进入核心业务。",
    summary: "画出端到端跳数，明确当前镜像点能看见什么、不能看见什么。",
    abilities: ["path"],
    required: false,
    difficulty: "进阶",
    minutes: 40,
    version: "2026.1",
    stages: [
      { id: "c3-s1", title: "列出跳数", prompt: "按业务方向写出主要网络与系统节点。" },
      { id: "c3-s2", title: "标出边界", prompt: "区分银行自有区域、专线服务商和核心系统责任边界。" },
      { id: "c3-s3", title: "标注盲区", prompt: "说明哪一段没有镜像，结论不能覆盖那里。" },
    ],
    criteria: ["跳数完整", "责任边界明确", "盲区没有被说成已验证"],
    expertAnswer: "柜面终端、网点前置和网点核心交换处于当前镜像覆盖内。专线对端到核心应用内部没有采集，不能把应用内部锁等待说成已经看见。",
    pitfalls: ["只画一条直线", "把不可见的核心内部写成已定位"],
    teacherGuide: "看链路图是否同时出现覆盖范围和盲区。缺少盲区说明的成果应退回。",
    tools: ["链路草图", "回溯分析系统"],
    sample: "branch-path-1500.cap",
    evidence: [
      { id: "c3-e1", time: "15:01:02", title: "可见节点", detail: "柜面、前置和网点核心交换的会话均可还原。" },
      { id: "c3-e2", time: "边界", title: "不可见节点", detail: "总行核心应用进程内部没有旁路流量。" },
    ],
  },
  {
    id: "c4",
    code: "LOC-04",
    title: "网点交易变慢定位",
    scene: "城商行网点每到 15:00，柜面转账开始长时间等待。旁路镜像已覆盖网点核心交换。",
    summary: "在真实软件与脱敏样本中自主取证，判断慢在传输、排队还是应用等待。",
    abilities: ["locate"],
    required: true,
    difficulty: "综合",
    minutes: 70,
    version: "2026.1",
    stages: [
      {
        id: "c4-s1",
        title: "锁定业务现象",
        prompt: "写清哪类交易、从什么时间开始变慢。",
        drill: {
          ask: "基础问答：哪句才是可核对的现象？",
          choices: [
            { text: "下午系统卡，建议直接升级设备", right: false },
            { text: "工作日 15:00 左右柜面转账等待变长", right: true },
          ],
        },
      },
      {
        id: "c4-s2",
        title: "核对可见范围",
        prompt: "标明证据所能覆盖的最后一跳。",
        drill: {
          ask: "基础问答：这次镜像覆盖到哪一跳？",
          choices: [
            { text: "已经看见总行核心应用内部", right: false },
            { text: "只覆盖到已镜像的网点核心交换", right: true },
          ],
        },
      },
      {
        id: "c4-s3",
        title: "比较候选原因",
        prompt: "用重传、时延和应用响应时间排除或保留假设。",
        drill: {
          ask: "基础问答：47 秒主要耗在哪里？",
          choices: [
            { text: "专线重传把带宽打满", right: false },
            { text: "等待业务返回，重传约 1.2%", right: true },
          ],
        },
      },
      {
        id: "c4-s4",
        title: "写下不可见边界",
        prompt: "说明本次结论不能延伸到哪一段。",
        drill: {
          ask: "基础问答：结论能写到哪里？",
          choices: [
            { text: "已经定位核心系统内部根因", right: false },
            { text: "停在已镜像链路，核心内部仍是盲区", right: true },
          ],
        },
      },
    ],
    criteria: ["结论对应具体证据", "排除过程清楚", "明确写出不可见边界"],
    expertAnswer: "15:02 的转账请求已经到达总行接入区，链路重传仅 1.2%。47 秒消耗在等待业务返回，更像核心应用响应慢，而不是专线拥塞。核心应用内部原因不在本次采集范围内。",
    pitfalls: ["看到等待就认为带宽不足", "没有区分网络时延和应用响应", "把专家范本整段粘贴"],
    teacherGuide: "允许学生使用不同取证顺序。验收只看结论是否被证据支持、是否承认盲区，以及答辩能否解释为什么排除拥塞。",
    tools: ["网络回溯分析系统", "业务性能管理"],
    sample: "branch-slow-1500.cap",
    evidence: locateEvidence,
    labContext: {
      businessChain: ["柜面终端", "网点前置", "网点核心交换", "MPLS 专线", "总行接入区", "核心交易"],
      protocols: ["TCP", "HTTP", "TLS", "DNS"],
      indicators: ["RTT 18ms", "重传率 1.2%", "服务端响应等待 47s", "三次握手耗时"],
      visibility: "镜像覆盖柜面至网点核心交换，并能确认请求到达总行接入区；核心应用进程、数据库锁与专线运营商内部不可见。",
      deliverables: ["故障时间窗与业务五元组", "网络时延/重传与应用等待对照", "可见边界", "下一步协同对象"],
    },
  },
  {
    id: "c5",
    code: "ALT-05",
    title: "海量告警里的有效风险",
    scene: "同一时段安全与运维告警叠在一起，其中大量是重复扫描和已知策略抖动。",
    summary: "挑选真正影响柜面业务的事件，说明其余告警为什么先不深查。",
    abilities: ["alert"],
    required: false,
    difficulty: "进阶",
    minutes: 35,
    version: "2026.1",
    stages: [
      { id: "c5-s1", title: "分组告警", prompt: "按重复噪音、已知变更和可能影响业务来分组。" },
      { id: "c5-s2", title: "保留一件", prompt: "选出一件需要深查的事件并说明影响面。" },
    ],
    criteria: ["不是逐条复述", "选择与业务影响有关", "说明暂缓理由"],
    expertAnswer: "重复端口扫描没有触及交易会话，可归档。15:03 的核心响应超时与柜面等待重合，应作为深查入口。",
    pitfalls: ["按告警级别从高到低机械处理", "没有说明暂缓原因"],
    teacherGuide: "学生只要能说明取舍标准即可，不要求唯一的告警编号。",
    tools: ["安全分析台", "告警样本"],
    sample: "alert-branch-1500.json",
    evidence: [
      { id: "c5-e1", time: "15:00:12", title: "重复扫描", detail: "外部扫描未进入交易 VLAN，连续出现 146 次。" },
      { id: "c5-e2", time: "15:03:10", title: "响应超时", detail: "核心交易响应超时与柜面等待开始时间重合。" },
    ],
    labContext: {
      businessChain: ["流量探针", "日志采集", "事件关联", "研判队列", "处置工单"],
      protocols: ["Syslog", "NetFlow/IPFIX", "TCP", "DNS"],
      indicators: ["告警重复度", "受影响资产", "交易 VLAN 命中", "事件时间相关性"],
      visibility: "样本只覆盖脱敏流量与预置日志；没有终端内存、主机 EDR 和互联网归属情报，不能据此确认完整攻击链。",
      deliverables: ["告警分组规则", "保留事件与业务影响", "暂缓事件及理由", "需要补采的数据"],
    },
  },
  {
    id: "c6",
    code: "RPT-06",
    title: "十五分钟 PoC 复盘",
    scene: "面向网点科技负责人和总行网络负责人，做一次不推销产品的复盘。",
    summary: "讲清需求、链路、结论、证据边界和下一步建议。",
    abilities: ["report"],
    required: true,
    difficulty: "综合",
    minutes: 30,
    version: "2026.1",
    stages: [
      { id: "c6-s1", title: "组织五段", prompt: "按需求、链路、结论、证据、建议组织口述提纲。" },
      { id: "c6-s2", title: "准备追问", prompt: "准备“为什么不是带宽问题”的回答。" },
    ],
    criteria: ["结构完整", "结论与证据一致", "下一步可执行且不越界"],
    expertAnswer: "建议先把结论限定在已镜像链路：排除专线重传，转交应用团队核查 15:00 的核心响应。下一步只增加总行接入区之后的协同排查，不在本次 PoC 中承诺优化效果。",
    pitfalls: ["以产品功能清单代替结论", "建议超出证据能支持的范围"],
    teacherGuide: "答辩时追问一次“为什么”。能解释排除过程即可通过，背诵术语但不能落地的成果应退回。",
    tools: ["复盘提纲"],
    sample: "无新样本，沿用定位挑战证据",
    evidence: [
      { id: "c6-e1", time: "结论", title: "可陈述事实", detail: "请求已到达总行接入区，等待主要来自业务返回。" },
      { id: "c6-e2", time: "边界", title: "不能陈述", detail: "不能声称已经找到核心系统内部的根因。" },
    ],
  },
  {
    id: "c7",
    code: "OBS-07",
    title: "接口黄金指标异常",
    scene: "新发布的支付接口成功率下降，但主机 CPU 看起来正常。",
    summary: "从请求量、时延、成功率和依赖跳数判断异常落点。此挑战尚未对院校发布。",
    abilities: ["locate", "alert"],
    required: false,
    difficulty: "综合",
    minutes: 50,
    version: "2026.2-draft",
    stages: [
      { id: "c7-s1", title: "阅读指标", prompt: "区分流量下降、错误率升高和依赖超时。" },
      { id: "c7-s2", title: "确定深查对象", prompt: "指出应继续取证的依赖，而不是重启全部服务。" },
    ],
    criteria: ["指标解读正确", "深查对象具体"],
    expertAnswer: "成功率下降伴随依赖超时上升，主机资源正常。应优先核查账户服务依赖，而不是扩大到全链路重启。",
    pitfalls: ["看到 CPU 正常就认为没有故障"],
    teacherGuide: "草稿内容，发布前不对学生可见。",
    tools: ["业务监控", "回溯分析系统"],
    sample: "api-golden-draft.cap",
    evidence: [
      { id: "c7-e1", time: "10:21", title: "依赖超时", detail: "账户服务超时占比升高，接入主机 CPU 仍低于 35%。" },
    ],
    labContext: {
      businessChain: ["移动端", "API 网关", "支付服务", "账户服务", "数据库"],
      protocols: ["HTTP/2", "gRPC", "OpenTelemetry Trace", "Prometheus"],
      indicators: ["请求率", "错误率", "P95/P99 时延", "依赖超时", "Trace ID"],
      visibility: "可观测数据覆盖网关到数据库客户端 Span；数据库内部执行计划和移动运营商网络不在本次采集范围。",
      deliverables: ["黄金指标异常时间窗", "异常 Trace ID", "最慢依赖与影响面", "排除主机资源的依据"],
    },
  },
];

export const REVIEW_TAGS = [
  "证据充分",
  "边界清楚",
  "链路完整",
  "答辩清楚",
  "结论含糊",
  "未说明依据",
  "疑似照搬",
  "建议补充盲区",
];

function submission(
  studentId: string,
  challengeId: string,
  partial: Partial<Submission>,
): Submission {
  return {
    id: `${studentId}-${challengeId}`,
    challengeId,
    studentId,
    status: "not_started",
    completedStageIds: [],
    deliverable: "",
    explanation: "",
    evidenceIds: [],
    desktopMinutes: 0,
    resets: 0,
    updatedAt: "2026-03-01 09:00",
    ...partial,
  };
}

CHALLENGES.push(...EXTRA_CHALLENGES);

const challengeIds = CHALLENGES.map(item => item.id);

function blankSet(studentId: string, overrides: Record<string, Partial<Submission>>) {
  return challengeIds.map((challengeId) =>
    submission(studentId, challengeId, overrides[challengeId] ?? {}),
  );
}

const strongReview = (score: number, note: string, reviewedAt: string): Submission["review"] => ({
  score,
  tags: ["证据充分", "答辩清楚"],
  defenseNote: note,
  comment: "结论和证据能够对应，边界表达清楚。",
  decision: "passed",
  reviewedAt,
});

function createAdditionalSubmissions(): Submission[] {
  const records = PEOPLE.filter(person => person.role === "student" && Number(person.id.slice(1)) > 18).flatMap(person => {
    const number = Number(person.id.slice(1));
    return CHALLENGES.filter(challenge => number > 18 || EXTRA_CHALLENGES.some(extra => extra.id === challenge.id)).map((challenge, index) => {
      const progress = (number * 7 + index * 11) % 20;
      const status: Submission["status"] = challenge.id === "c7" ? "not_started" : progress < 8 ? "passed" : progress < 11 ? "submitted" : progress < 13 ? "returned" : progress < 17 ? "in_progress" : "not_started";
      const minutes = status === "not_started" ? 0 : 14 + (number * 3 + index * 5) % 26;
      const complete = status === "passed" || status === "submitted" || status === "returned";
      const date = `2026-03-${String(18 + (number + index) % 8).padStart(2, "0")}`;
      const hour = String(9 + (number + index) % 8).padStart(2, "0");
      const time = `${date} ${hour}:50`;
      const evidence = complete ? challenge.evidence.map(item => item.id) : challenge.evidence.slice(0, 1).map(item => item.id);
      const returned = status === "returned";
      const record = submission(person.id, challenge.id, {
        status, desktopMinutes: minutes, completedStageIds: complete ? challenge.stages.map(item => item.id) : status === "in_progress" ? challenge.stages.slice(0, 1).map(item => item.id) : [],
        evidenceIds: status === "not_started" ? [] : evidence,
        deliverable: complete ? returned ? `初步判断：${challenge.summary}。现有结论尚未完成正常基线对比，需要补充关键指标。` : `${challenge.expertAnswer} 核验记录：${challenge.evidence.map(item => item.detail).join("；")}` : "",
        explanation: complete ? returned ? "已收集部分样本，但未区分相关性与因果关系，待补充对照会话。" : `对照指标：${challenge.labContext?.indicators.join("、") ?? "采集范围、关键会话与时间窗"}。${challenge.labContext?.visibility ?? "结论限定在样本可见范围，不外推不可见节点。"}` : "",
        updatedAt: time, desktopSessions: minutes ? [{ startedAt: `${date} ${hour}:${String(50 - minutes).padStart(2, "0")}`, endedAt: time, minutes }] : [],
        review: status === "passed" || returned ? { score: returned ? 48 + number % 12 : 72 + (number * 3 + index) % 25, tags: returned ? ["未说明依据", "建议补充盲区"] : number % 2 ? ["证据充分", "答辩清楚"] : ["边界清楚"], defenseNote: returned ? "能够复述现象，但尚不能解释指标如何排除其他原因。" : `已解释${challenge.labContext?.indicators[0] ?? "采集范围"}的判断依据，并回答替代原因追问。`, comment: returned ? "请补充正常与异常会话对比，标记证据来源，再按相同指标重交。" : "交付物、证据与结论对应，能够说明不可见范围。建议进一步压缩汇报篇幅。", decision: returned ? "returned" : "passed", reviewedAt: `${date} 18:10` } : undefined,
      });
      return record;
    });
  });
  return records.map(record => {
    // 汇报任务的已开始状态需要具备定位前置成果。
    if (record.challengeId === "c6" && record.status !== "not_started" && records.find(item => item.studentId === record.studentId && item.challengeId === "c4")?.status !== "passed") return { ...record, status: "not_started" as const, review: undefined, desktopMinutes: 0, desktopSessions: [], completedStageIds: [], evidenceIds: [], deliverable: "", explanation: "" };
    return record;
  });
}

export function createSeedState(): DemoState {
  const zhou = blankSet("s2", {
    c1: { status: "passed", desktopMinutes: 38, completedStageIds: ["c1-s1", "c1-s2", "c1-s3"], deliverable: "已完成采集口核对。", explanation: "eth2 才能看见镜像流量。", review: strongReview(93, "能说明管理口和采集口的差别。", "2026-03-12 15:18"), updatedAt: "2026-03-12 10:26" },
    c2: { status: "passed", desktopMinutes: 27, completedStageIds: ["c2-s1", "c2-s2"], deliverable: "15:00 柜面转账等待变长。", explanation: "升级设备只是客户猜测。", review: strongReview(89, "事实和猜测分得开。", "2026-03-13 16:40"), updatedAt: "2026-03-13 11:14" },
    c3: { status: "passed", desktopMinutes: 34, completedStageIds: ["c3-s1", "c3-s2", "c3-s3"], deliverable: "已标出专线对端盲区。", explanation: "看不见的节点没有写入结论。", review: strongReview(87, "链路和盲区同时存在。", "2026-03-16 15:06"), updatedAt: "2026-03-16 09:48" },
    c4: { status: "passed", desktopMinutes: 49, completedStageIds: ["c4-s1", "c4-s2", "c4-s3", "c4-s4"], deliverable: "慢在核心响应，不是重传。", explanation: "重传比例不能支持拥塞判断。", evidenceIds: ["ev-app", "ev-loss"], review: strongReview(91, "排除拥塞的理由具体。", "2026-03-18 18:11"), updatedAt: "2026-03-18 14:22" },
    c5: { status: "passed", desktopMinutes: 23, completedStageIds: ["c5-s1", "c5-s2"], deliverable: "保留核心响应超时。", explanation: "重复扫描未进入交易 VLAN。", review: strongReview(84, "取舍标准清楚。", "2026-03-19 15:27"), updatedAt: "2026-03-19 10:36" },
    c6: { status: "passed", desktopMinutes: 31, completedStageIds: ["c6-s1", "c6-s2"], deliverable: "五段复盘提纲。", explanation: "下一步只建议协同应用团队。", review: strongReview(88, "没有把 PoC 说成效果承诺。", "2026-03-21 16:44"), updatedAt: "2026-03-21 11:19" },
  });

  return {
    demoDataRevision: 3,
    role: "student",
    teacherTrained: false,
    environmentChecked: false,
    challengePackConfirmed: false,
    selectedChallengeIds: challengeIds.filter((id) => id !== "c7"),
    publishedChallengeIds: challengeIds.filter((id) => id !== "c7"),
    historicalMinutes: 168 * 60 + 47,
    tenantQuotaHours: 1200,
    environment: {
      version: "Colasoft Lab Desktop 2.4.3",
      contentRuntimeVersion: "2026.1",
      health: "healthy",
      capacity: 30,
      samplePack: "金融慢交易脱敏样本包 2026.03",
      maintenance: false,
      timeoutMinutes: 40,
      imageId: "CLS-RAS-LAB-2026.03-r2",
      collector: "双口旁路采集 · eth2 监听 / eth0 管理",
      samplePeriod: "2026-03-18 14:40–15:20（教学时钟）",
      sampleDigest: "SHA-256 7f31…c9a2（演示截断值）",
    },
    contentDrafts: {
      ...Object.fromEntries(CHALLENGES.filter(item => item.id !== "c7").map(item => [item.id, {
        challengeId: item.id, definition: item, stage: "published" as const, title: item.title, version: item.version, abilities: item.abilities,
        targetJobs: "网络分析、技术服务、可观测性工程", industries: item.id === "c8" ? "医疗" : item.id === "c9" ? "先进制造" : item.id === "c10" ? "能源" : "金融",
        scene: item.scene, targetProblem: item.summary, stageSummary: item.stages.map(stage => stage.title).join(" → "), acceptanceMetrics: item.criteria.join("；"), expertTemplate: item.expertAnswer,
        requiredEnvironmentVersion: "2026.1", tenantIds: ["tenant-jiangcheng"], updatedAt: "2026-03-25 09:00", publishedAt: "2026-03-18 09:00",
      }])),
      c7: {
        challengeId: "c7",
        stage: "draft",
        title: "接口黄金指标异常",
        version: "2026.2",
        abilities: ["locate", "alert"],
        targetJobs: "可观测性运维、协议与安全分析",
        industries: "金融科技、数字支付",
        scene: "新发布的支付接口成功率下降，但主机 CPU 看起来正常。",
        targetProblem: "从黄金指标与依赖链路判断异常落点，避免无依据地重启全部服务。",
        stageSummary: "读取黄金指标 → 对齐异常时间窗 → 定位最慢依赖 → 给出处置边界",
        acceptanceMetrics: "指出异常时间窗；提供异常 Trace ID；定位账户服务依赖；说明排除主机资源的依据。",
        expertTemplate: "成功率下降伴随依赖超时上升，主机资源正常。应优先核查账户服务依赖，而不是扩大到全链路重启。",
        requiredEnvironmentVersion: "2026.2",
        tenantIds: ["tenant-jiangcheng"],
        updatedAt: "2026-03-25 10:20",
      },
    },
    seatRequest: 0,
    seatsConfirmed: false,
    rosterImportedByClass: {
      "class-1": false,
      "class-2": true,
      "class-3": true,
      "class-4": true,
    },
    updatePackRequested: false,
    updatePackConfirmed: false,
    localCaseRequested: false,
    localCaseQuoted: false,
    localCaseAccepted: false,
    submissions: [
      ...createAdditionalSubmissions(),
      ...blankSet("s1", {
        c1: {
          status: "passed",
          desktopMinutes: 31,
          resets: 1,
          completedStageIds: ["c1-s1", "c1-s2", "c1-s3"],
          deliverable: "分析主机已初始化，样本覆盖 14:40–15:20。",
          explanation: "柜面到前置的会话出现在 eth2，管理口没有业务流量。",
          evidenceIds: ["c1-e1", "c1-e2"],
          desktopSessions: [{ startedAt: "2026-03-11 14:48", endedAt: "2026-03-11 15:19", minutes: 31 }],
          updatedAt: "2026-03-11 15:26",
          review: {
            score: 88,
            tags: ["证据充分", "边界清楚"],
            defenseNote: "能解释为什么不能凭管理口判断业务可见性。",
            comment: "环境核对完整，采集范围表达准确。",
            decision: "passed",
            reviewedAt: "2026-03-12 09:47",
          },
        },
        c2: {
          status: "passed",
          desktopMinutes: 17,
          completedStageIds: ["c2-s1", "c2-s2"],
          deliverable: "工作日 15:00 左右柜面转账等待变长，柜台排队增加。",
          explanation: "“专线满了”和“升级设备”目前都没有证据。",
          evidenceIds: ["c2-e1"],
          desktopSessions: [{ startedAt: "2026-03-13 09:57", endedAt: "2026-03-13 10:14", minutes: 17 }],
          updatedAt: "2026-03-13 10:18",
          review: {
            score: 83,
            tags: ["答辩清楚"],
            defenseNote: "被追问后仍没有把猜测写成事实。",
            comment: "业务现象具体，假设收敛得住。",
            decision: "passed",
            reviewedAt: "2026-03-13 16:22",
          },
        },
        c3: {
          status: "submitted",
          desktopMinutes: 22,
          completedStageIds: ["c3-s1", "c3-s2", "c3-s3"],
          deliverable: "柜面终端 → 网点前置 → 网点核心交换 → 专线 → 总行接入区 → 核心业务。当前只镜像到网点核心交换。",
          explanation: "专线对端和核心应用内部没有采集，所以这两段不能写成已经定位。",
          evidenceIds: ["c3-e1", "c3-e2"],
          desktopSessions: [{ startedAt: "2026-03-24 13:42", endedAt: "2026-03-24 14:04", minutes: 22 }],
          updatedAt: "2026-03-24 14:07",
        },
        c4: {
          status: "in_progress",
          desktopMinutes: 16,
          completedStageIds: ["c4-s1", "c4-s2"],
          deliverable: "",
          explanation: "",
          desktopSessions: [
            { startedAt: "2026-03-24 16:41", endedAt: "2026-03-24 16:48", minutes: 7 },
            { startedAt: "2026-03-25 14:12", endedAt: "2026-03-25 14:26", minutes: 9 },
          ],
          updatedAt: "2026-03-25 14:26",
        },
        c5: {
          status: "returned",
          desktopMinutes: 11,
          completedStageIds: ["c5-s1", "c5-s2"],
          deliverable: "高危告警一共 12 条，建议全部排查。",
          explanation: "级别高的告警应该优先。",
          desktopSessions: [{ startedAt: "2026-03-22 17:28", endedAt: "2026-03-22 17:39", minutes: 11 }],
          updatedAt: "2026-03-22 17:43",
          review: {
            score: 57,
            tags: ["未说明依据", "结论含糊"],
            defenseNote: "答辩时不能说明哪些告警真正影响柜面交易。",
            comment: "请按业务影响重做分组，并写出暂缓处理重复扫描的理由。",
            decision: "returned",
            reviewedAt: "2026-03-23 11:16",
          },
        },
      }),
      ...zhou,
      ...blankSet("s3", {
        c1: {
          status: "passed",
          desktopMinutes: 29,
          completedStageIds: ["c1-s1", "c1-s2", "c1-s3"],
          deliverable: "样本已导入，看到柜面会话。",
          explanation: "采集口判断经过一次重置后纠正。",
          review: { score: 76, tags: ["建议补充盲区"], defenseNote: "纠正后能找到业务会话。", comment: "基本通过，盲区表述还可以更明确。", decision: "passed", reviewedAt: "2026-03-15 16:08" },
          updatedAt: "2026-03-15 14:16",
        },
        c2: {
          status: "passed",
          desktopMinutes: 19,
          completedStageIds: ["c2-s1", "c2-s2"],
          deliverable: "下午三点转账变慢。",
          explanation: "客户的升级建议先记为假设。",
          review: { score: 70, tags: ["建议补充盲区"], defenseNote: "现象基本清楚。", comment: "时间范围可以再具体些。", decision: "passed", reviewedAt: "2026-03-16 15:41" },
          updatedAt: "2026-03-16 11:27",
        },
        c4: {
          status: "returned",
          desktopMinutes: 27,
          completedStageIds: ["c4-s1", "c4-s3"],
          deliverable: "专线带宽不足，建议扩容。",
          explanation: "因为下午变慢，所以应该是链路拥塞。",
          review: { score: 54, tags: ["未说明依据", "建议补充盲区"], defenseNote: "没有拿出重传或时延证据。", comment: "结论跳到了扩容。请用样本比较重传和应用响应时间。", decision: "returned", reviewedAt: "2026-03-24 18:22" },
          updatedAt: "2026-03-24 17:36",
        },
      }),
      ...blankSet("s4", {
        c1: { status: "in_progress", desktopMinutes: 23, completedStageIds: ["c1-s1"], updatedAt: "2026-03-25 08:37" },
        c3: { status: "in_progress", desktopMinutes: 14, completedStageIds: ["c3-s1"], updatedAt: "2026-03-25 11:16" },
      }),
      ...blankSet("s5", {
        c2: { status: "in_progress", desktopMinutes: 11, completedStageIds: ["c2-s1"], updatedAt: "2026-03-24 19:23" },
      }),
      ...blankSet("s6", {
        c1: { status: "passed", desktopMinutes: 27, completedStageIds: ["c1-s1", "c1-s2", "c1-s3"], deliverable: "eth2 已看到柜面会话。", explanation: "管理口没有业务流量。", review: strongReview(81, "采集口判断正确。", "2026-03-12 16:12"), updatedAt: "2026-03-12 15:41" },
        c2: { status: "passed", desktopMinutes: 22, completedStageIds: ["c2-s1", "c2-s2"], deliverable: "15:00 左右柜面等待变长。", explanation: "升级建议先记为假设。", review: strongReview(78, "事实和猜测分开了。", "2026-03-14 10:26"), updatedAt: "2026-03-14 09:52" },
        c3: { status: "passed", desktopMinutes: 31, completedStageIds: ["c3-s1", "c3-s2", "c3-s3"], deliverable: "镜像停在网点核心交换。", explanation: "专线对端没有写入结论。", review: strongReview(74, "盲区写出来了。", "2026-03-17 15:33"), updatedAt: "2026-03-17 14:18" },
        c4: { status: "passed", desktopMinutes: 44, completedStageIds: ["c4-s1", "c4-s2", "c4-s3", "c4-s4"], deliverable: "47 秒在等业务返回。", explanation: "重传 1.2% 解释不了整段等待。", evidenceIds: ["ev-app", "ev-loss"], review: strongReview(71, "排除过程还算清楚。", "2026-03-20 11:08"), updatedAt: "2026-03-20 10:17" },
        c5: { status: "passed", desktopMinutes: 18, completedStageIds: ["c5-s1", "c5-s2"], deliverable: "保留核心响应超时。", explanation: "重复扫描未进交易 VLAN。", review: strongReview(62, "取舍理由基本成立。", "2026-03-21 09:46"), updatedAt: "2026-03-20 17:28" },
      }),
      ...blankSet("s7", {
        c1: { status: "passed", desktopMinutes: 33, completedStageIds: ["c1-s1", "c1-s2", "c1-s3"], deliverable: "样本与采集口已核对。", explanation: "业务会话只出现在 eth2。", review: strongReview(89, "环境边界清楚。", "2026-03-12 17:05"), updatedAt: "2026-03-12 16:22" },
        c2: { status: "passed", desktopMinutes: 21, completedStageIds: ["c2-s1", "c2-s2"], deliverable: "柜面转账在 15:00 后变慢。", explanation: "客户的带宽判断尚未证实。", review: strongReview(86, "现象时间具体。", "2026-03-14 11:19"), updatedAt: "2026-03-14 10:41" },
        c3: { status: "passed", desktopMinutes: 29, completedStageIds: ["c3-s1", "c3-s2", "c3-s3"], deliverable: "画出了可见跳与盲区。", explanation: "核心内部不在本次镜像里。", review: strongReview(84, "链路和责任边界同时在。", "2026-03-17 16:27"), updatedAt: "2026-03-17 15:06" },
        c4: { status: "passed", desktopMinutes: 46, completedStageIds: ["c4-s1", "c4-s2", "c4-s3", "c4-s4"], deliverable: "慢在应用响应。", explanation: "重传比例不足以支持拥塞。", evidenceIds: ["ev-app", "ev-loss"], review: strongReview(80, "证据能对上结论。", "2026-03-19 18:14"), updatedAt: "2026-03-19 16:52" },
        c5: { status: "passed", desktopMinutes: 19, completedStageIds: ["c5-s1", "c5-s2"], deliverable: "深查核心响应超时。", explanation: "重复扫描先归档。", review: strongReview(77, "取舍标准清楚。", "2026-03-20 15:39"), updatedAt: "2026-03-20 14:11" },
        c6: { status: "passed", desktopMinutes: 26, completedStageIds: ["c6-s1", "c6-s2"], deliverable: "复盘限定在已镜像链路。", explanation: "下一步只协同应用团队。", review: strongReview(73, "没有把 PoC 说成承诺。", "2026-03-22 10:18"), updatedAt: "2026-03-22 09:27" },
      }),
      ...blankSet("s8", {
        c1: { status: "passed", desktopMinutes: 24, completedStageIds: ["c1-s1", "c1-s2", "c1-s3"], deliverable: "采集口已连通。", explanation: "先确认了 eth2。", review: strongReview(79, "初始化完整。", "2026-03-15 11:24"), updatedAt: "2026-03-15 10:38" },
        c2: { status: "in_progress", desktopMinutes: 14, completedStageIds: ["c2-s1"], updatedAt: "2026-03-24 16:18" },
      }),
      ...blankSet("s9", {
        c1: { status: "passed", desktopMinutes: 28, completedStageIds: ["c1-s1", "c1-s2", "c1-s3"], deliverable: "样本时间窗已核对。", explanation: "管理口无业务流量。", review: strongReview(81, "可见范围说得清。", "2026-03-13 14:52"), updatedAt: "2026-03-13 14:06" },
        c2: { status: "passed", desktopMinutes: 16, completedStageIds: ["c2-s1", "c2-s2"], deliverable: "15:00 柜面排队变长。", explanation: "升级设备仍是猜测。", review: strongReview(74, "假设没有写成事实。", "2026-03-16 09:33"), updatedAt: "2026-03-15 17:21" },
        c3: { status: "submitted", desktopMinutes: 21, completedStageIds: ["c3-s1", "c3-s2", "c3-s3"], deliverable: "镜像覆盖到网点核心交换。", explanation: "总行核心内部仍是盲区。", evidenceIds: ["c3-e1"], updatedAt: "2026-03-24 15:33" },
      }),
      ...blankSet("s10", {
        c1: { status: "in_progress", desktopMinutes: 23, completedStageIds: ["c1-s1"], updatedAt: "2026-03-25 09:14" },
      }),
      ...blankSet("s11", {
        c2: { status: "passed", desktopMinutes: 18, completedStageIds: ["c2-s1", "c2-s2"], deliverable: "转账等待从 15:00 开始。", explanation: "专线拥塞还没证据。", review: strongReview(70, "现象基本具体。", "2026-03-18 11:42"), updatedAt: "2026-03-18 10:55" },
        c5: { status: "in_progress", desktopMinutes: 15, completedStageIds: ["c5-s1"], updatedAt: "2026-03-25 13:47" },
      }),
      ...blankSet("s12", {
        c1: { status: "in_progress", desktopMinutes: 13, completedStageIds: ["c1-s1"], updatedAt: "2026-03-25 10:06" },
        c2: { status: "passed", desktopMinutes: 16, completedStageIds: ["c2-s1", "c2-s2"], deliverable: "柜台反馈下午转圈变长。", explanation: "先不接受升级建议。", review: strongReview(68, "猜测被单独标出。", "2026-03-17 10:21"), updatedAt: "2026-03-16 18:36" },
      }),
      ...blankSet("s13", {
        c1: { status: "passed", desktopMinutes: 26, completedStageIds: ["c1-s1", "c1-s2", "c1-s3"], deliverable: "完成采集口与样本核对。", explanation: "业务流量来自 eth2。", review: strongReview(85, "可见边界清楚。", "2026-03-20 14:20"), updatedAt: "2026-03-20 11:03" },
        c2: { status: "passed", desktopMinutes: 18, completedStageIds: ["c2-s1", "c2-s2"], deliverable: "15:00 后柜面转账等待变长。", explanation: "专线拥塞仍需证据。", review: strongReview(82, "事实与假设分开。", "2026-03-21 10:16"), updatedAt: "2026-03-21 09:32" },
        c3: { status: "submitted", desktopMinutes: 24, completedStageIds: ["c3-s1", "c3-s2", "c3-s3"], deliverable: "链路覆盖到网点核心交换，总行内部为盲区。", explanation: "结论不越过镜像边界。", evidenceIds: ["c3-e1", "c3-e2"], updatedAt: "2026-03-25 09:18" },
      }),
      ...blankSet("s14", {
        c1: { status: "passed", desktopMinutes: 31, completedStageIds: ["c1-s1", "c1-s2", "c1-s3"], deliverable: "镜像样本已导入。", explanation: "管理口不承载业务流量。", review: strongReview(78, "采集口判断正确。", "2026-03-20 16:08"), updatedAt: "2026-03-20 15:12" },
        c2: { status: "passed", desktopMinutes: 20, completedStageIds: ["c2-s1", "c2-s2"], deliverable: "记录了转账等待现象。", explanation: "设备升级不是已证实结论。", review: strongReview(76, "现象收敛正确。", "2026-03-22 11:27"), updatedAt: "2026-03-22 10:48" },
        c4: { status: "returned", desktopMinutes: 40, completedStageIds: ["c4-s1", "c4-s3"], deliverable: "建议直接扩容专线。", explanation: "下午慢可能是带宽不足。", review: { score: 51, tags: ["未说明依据", "建议补充盲区"], defenseNote: "未比较重传与响应等待。", comment: "请补充证据并限定可见边界。", decision: "returned", reviewedAt: "2026-03-25 11:40" }, updatedAt: "2026-03-25 10:54" },
      }),
      ...blankSet("s15", {
        c1: { status: "passed", desktopMinutes: 28, completedStageIds: ["c1-s1", "c1-s2", "c1-s3"], deliverable: "完成环境初始化。", explanation: "eth2 可见业务会话。", review: strongReview(80, "环境核对完整。", "2026-03-21 15:06"), updatedAt: "2026-03-21 14:22" },
        c2: { status: "in_progress", desktopMinutes: 12, completedStageIds: ["c2-s1"], updatedAt: "2026-03-25 13:12" },
      }),
      ...blankSet("s16", {
        c1: { status: "in_progress", desktopMinutes: 40, completedStageIds: ["c1-s1"], updatedAt: "2026-03-25 14:02" },
      }),
      ...blankSet("s17", {
        c1: { status: "passed", desktopMinutes: 22, completedStageIds: ["c1-s1", "c1-s2", "c1-s3"], deliverable: "采集环境已连通。", explanation: "已核对样本时间窗。", review: strongReview(74, "基本完成。", "2026-03-22 16:32"), updatedAt: "2026-03-22 15:44" },
        c2: { status: "submitted", desktopMinutes: 17, completedStageIds: ["c2-s1", "c2-s2"], deliverable: "工作日 15:00 柜面转账等待变长。", explanation: "带宽不足和升级设备仍是假设。", evidenceIds: ["c2-e1", "c2-e2"], updatedAt: "2026-03-25 15:08" },
      }),
      ...blankSet("s18", {
        c3: { status: "in_progress", desktopMinutes: 16, completedStageIds: ["c3-s1"], updatedAt: "2026-03-24 17:36" },
      }),
    ],
  };
}

export const TENANTS: Tenant[] = [
  {
    id: "tenant-jiangcheng",
    code: "EDU-HB-JCIT-001",
    school: SCHOOL.name,
    college: SCHOOL.college,
    region: "华中 · 教学专有区",
    plan: "基础年费 · 2026",
    concurrent: 30,
    renewal: "2027-02-28",
    status: "active",
    primary: true,
    quotaHours: 400,
    environment: "金融网络分析实训池",
    dataBoundary: "租户隔离；学生成果与姓名仅校内可见",
    mockUsedHours: 168,
  },
  {
    id: "tenant-binjiang",
    code: "EDU-HD-BJVC-014",
    school: "滨江职业技术学院",
    college: "信息工程学院",
    region: "华东 · 教学共享区",
    plan: "基础年费 · 2025",
    concurrent: 15,
    renewal: "2026-12-15",
    status: "expiring",
    primary: false,
    quotaHours: 180,
    environment: "网络运维基础实训池",
    dataBoundary: "租户隔离；运营端仅展示额度汇总",
    mockUsedHours: 142,
  },
];

export const NAV_ITEMS = {
  student: [
    { href: "/student/careers", label: "岗位地图" },
    { href: "/student/challenges", label: "任务学习中心" },
    { href: "/student", label: "个人中心" },
  ],
  teacher: [
    { href: "/teacher", label: "教学总览" },
    { href: "/teacher/classes", label: "班级管理" },
  ],
  leader: [
    { href: "/leader", label: "院校总览" },
    { href: "/leader/classes", label: "班级分析" },
    { href: "/leader/usage", label: "资源使用" },
  ],
  operator: [
    { href: "/operator", label: "运营总览" },
    { href: "/operator/tenants", label: "院校租户" },
    { href: "/operator/content", label: "内容中心" },
  ],
} as const;

export const ROLE_HOME: Record<Person["role"], string> = {
  student: "/student/careers",
  teacher: "/teacher",
  leader: "/leader",
  operator: "/operator",
};
