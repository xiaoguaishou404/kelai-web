export const RESEARCH_RETRIEVED_AT = "2026-11-13";

export const INDUSTRY_RESEARCH_SOURCES = [
  {
    id: "colasoft-ras",
    name: "科来 RAS 高保真运行回溯分析",
    url: "https://ai.colasoft.com.cn/products/ras-retrospective-analysis",
    supports: "故障窗口、会话级与包级事实；作为 UPM 的高保真探针",
  },
  {
    id: "colasoft-upm",
    name: "科来 UPM 业务性能管理",
    url: "https://ai.colasoft.com.cn/products/upm-business-performance",
    supports: "业务体验、接口、链路与 RAS 探针证据的统一分析",
  },
  {
    id: "colasoft-dpi",
    name: "科来全流量采集与深度协议解析",
    url: "https://ai.colasoft.com.cn/technology/full-packet-dpi",
    supports: "持续采集、协议解析、可检索关联与故障现场还原",
  },
  {
    id: "otel-signals",
    name: "OpenTelemetry Signals",
    url: "https://opentelemetry.io/zh/docs/concepts/signals",
    supports: "Trace、Metric、Log 与 Baggage 等可观测信号定义",
  },
  {
    id: "mitre-attack",
    name: "MITRE ATT&CK",
    url: "https://attack.mitre.org/",
    supports: "安全检测、调查与响应中的攻击技战术知识框架",
  },
  {
    id: "rfc9293",
    name: "IETF RFC 9293 · TCP",
    url: "https://www.rfc-editor.org/rfc/rfc9293",
    supports: "TCP 连接、确认、重传与协议行为的标准依据",
  },
] as const;

export const DEMO_DATA_NOTICE =
  "基于公开资料整理的演示样本：品牌与产品能力来自公开页面；院校、人员、合同、机时、样本时间、成绩和运营状态均为 Mock，不代表真实客户、招聘或在线环境。";
