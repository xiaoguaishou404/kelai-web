import type { PageAgentCore } from "@page-agent/core";
import type { PageController } from "@page-agent/page-controller";
import {
  definePageAgentElement,
  type ColasoftPageAgentElement,
} from "@/components/enterprise/page-agent-element";
import {
  AI_SETTINGS_CHANGE_EVENT,
  DEFAULT_AI_MODEL,
  loadAiSettings,
  type AiSettings,
} from "@/lib/ai-settings";

export type PageAgentRuntime = {
  host: ColasoftPageAgentElement;
  agent: PageAgentCore | null;
  pageController: PageController | null;
  syncPath: (pathname: string) => void;
  refresh: () => Promise<void>;
};

declare global {
  interface Window {
    __COLASOFT_PAGE_AGENT_RUNTIME__?: PageAgentRuntime;
  }
}

const MAX_STEPS = Number.MAX_SAFE_INTEGER;

const HIGH_RISK_LABELS = [
  "提交审核",
  "审核发布",
  "确认发布",
  "通过确权",
  "确认已确权",
  "驳回权属",
  "撤回权属",
  "驳回内容",
  "下线",
  "通过并回写画像",
  "退回修改",
  "提交成果",
  "确认投递",
  "立即投递",
  "申请接单",
];

let pendingRuntime: Promise<PageAgentRuntime> | null = null;
let refreshSequence = 0;

function maskSensitiveContent(content: string) {
  return content
    .replace(/\b(1[3-9]\d)\d{4}(\d{4})\b/g, "$1****$2")
    .replace(/\b([a-zA-Z0-9._%+-])[^@\s]*(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, "$1***$2")
    .replace(/\b(\d{6})(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/g, "$1********")
    .replace(/\b(\d{4})\d{8,11}(\d{4})\b/g, "$1********$2")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
    .replace(/\b(sk|ak)-[A-Za-z0-9_-]{12,}\b/gi, "$1-[REDACTED]")
    .replace(/\b(?:KL|AS|ST|RA|PKG|RSO)-[A-Z0-9-]{6,}\b/g, "[授权编号已脱敏]");
}

function setupHighRiskProtection(host: HTMLElement) {
  const mark = () => {
    document.querySelectorAll<HTMLElement>("button, a, [role='button']").forEach((element) => {
      if (host.contains(element)) return;
      const text = (element.textContent ?? "").trim();
      if (HIGH_RISK_LABELS.some((label) => text === label || text.startsWith(`${label} `))) {
        element.setAttribute("data-page-agent-not-interactive", "true");
      }
    });
  };
  mark();
  const observer = new MutationObserver(mark);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("pagehide", () => observer.disconnect(), { once: true });
}

async function buildAgent(settings: AiSettings) {
  const [{ PageAgentCore }, { PageController }] = await Promise.all([
    import("@page-agent/core"),
    import("@page-agent/page-controller"),
  ]);

  const pageController = new PageController({
    enableMask: true,
    viewportExpansion: -1,
    keepSemanticTags: true,
    includeAttributes: ["data-*", "aria-*"],
  });

  const agent = new PageAgentCore({
    pageController,
    baseURL: settings.baseURL,
    apiKey: settings.apiKey,
    model: settings.model,
    language: "zh-CN",
    maxSteps: MAX_STEPS,
    maxRetries: 2,
    experimentalScriptExecutionTool: false,
    experimentalLlmsTxt: false,
    transformPageContent: maskSensitiveContent,
    instructions: {
      system: `
你是场景化产教融合平台的页面操作助手。你只能依据当前页面可见内容和 DOM 工具操作。
先观察页面再操作；不得猜测未显示的数据。需要更多信息时先导航或滚动查看。
遇到复杂表单时按页面可见步骤逐项填写，不通过内部函数创建数据。
提交审核、发布、确权和权属撤回由用户手动完成。
任务结束后用简洁中文说明已完成内容、当前停留位置和仍需用户确认的事项。
      `.trim(),
    },
  });

  return { agent, pageController };
}

function disposeAgent(runtime: PageAgentRuntime) {
  const agent = runtime.agent;
  const pageController = runtime.pageController;
  runtime.agent = null;
  runtime.pageController = null;
  try {
    agent?.dispose();
  } catch {
    // The agent may already be disposed.
  }
  try {
    pageController?.dispose();
  } catch {
    // The controller may already be disposed.
  }
  runtime.host.detachAgent();
}

async function refreshRuntime(runtime: PageAgentRuntime) {
  const sequence = ++refreshSequence;
  disposeAgent(runtime);

  const settings = loadAiSettings();
  if (!settings) {
    runtime.host.setConfiguration({
      model: DEFAULT_AI_MODEL,
      maxSteps: MAX_STEPS,
      configured: false,
    });
    return;
  }

  try {
    const { agent, pageController } = await buildAgent(settings);
    if (sequence !== refreshSequence) {
      agent.dispose();
      pageController.dispose();
      return;
    }
    runtime.agent = agent;
    runtime.pageController = pageController;
    runtime.host.attachAgent(agent, {
      model: settings.model,
      maxSteps: MAX_STEPS,
      configured: true,
    });
  } catch (error) {
    console.error("[AI] 初始化模型连接失败", error);
    runtime.host.setConfiguration({
      model: settings.model,
      maxSteps: MAX_STEPS,
      configured: false,
    });
    runtime.host.setRuntimeError("模型服务连接失败，请检查配置。");
  }
}

async function createRuntime(pathname: string): Promise<PageAgentRuntime> {
  definePageAgentElement();
  const host = document.createElement("colasoft-page-agent") as ColasoftPageAgentElement;
  document.body.appendChild(host);
  setupHighRiskProtection(host);

  const runtime: PageAgentRuntime = {
    host,
    agent: null,
    pageController: null,
    syncPath: (path) => host.setPath(path),
    refresh: async () => {
      await refreshRuntime(runtime);
    },
  };

  window.addEventListener(AI_SETTINGS_CHANGE_EVENT, () => {
    void runtime.refresh();
  });

  const initialSettings = loadAiSettings();
  host.setConfiguration({
    model: initialSettings?.model ?? DEFAULT_AI_MODEL,
    maxSteps: MAX_STEPS,
    configured: Boolean(initialSettings),
  });
  host.setPath(pathname);

  window.__COLASOFT_PAGE_AGENT_RUNTIME__ = runtime;
  await runtime.refresh();
  return runtime;
}

export async function ensurePageAgentRuntime(pathname: string) {
  const existing = window.__COLASOFT_PAGE_AGENT_RUNTIME__;
  if (existing) {
    existing.syncPath(pathname);
    return existing;
  }
  if (!pendingRuntime) {
    pendingRuntime = createRuntime(pathname).finally(() => {
      pendingRuntime = null;
    });
  }
  return pendingRuntime;
}
