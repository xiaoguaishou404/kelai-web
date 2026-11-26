import type { AgentActivity, PageAgentCore } from "@page-agent/core";
import {
  DEFAULT_AI_MODEL,
  clearAiSettings,
  emptyAiSettings,
  readAiSettings,
  saveAiSettings,
  validateAiSettings,
  type AiSettings,
} from "@/lib/ai-settings";

export type AgentBinding = {
  model: string;
  maxSteps: number;
  configured: boolean | null;
};

export type AssistantState = {
  binding: AgentBinding;
  expanded: boolean;
  minimized: boolean;
  settingsOpen: boolean;
  settingsDirty: boolean;
  settingsMessage: string;
  settingsDraft: AiSettings;
  settingsRevealKey: boolean;
  settingsFocusToken: number;
  connecting: boolean;
  saved: boolean;
  running: boolean;
  activity: AgentActivity | null;
  result: string;
  error: string;
  draft: string;
  role: string;
  path: string;
  focusToken: number;
};

const MAX_STEPS = Number.MAX_SAFE_INTEGER;

const initialState: AssistantState = {
  binding: { model: DEFAULT_AI_MODEL, maxSteps: MAX_STEPS, configured: null },
  expanded: false,
  minimized: false,
  settingsOpen: false,
  settingsDirty: false,
  settingsMessage: "",
  settingsDraft: emptyAiSettings(),
  settingsRevealKey: false,
  settingsFocusToken: 0,
  connecting: false,
  saved: false,
  running: false,
  activity: null,
  result: "",
  error: "",
  draft: "",
  role: "页面助手",
  path: "",
  focusToken: 0,
};

function inferRole() {
  const user = document.querySelector(".ep-user")?.textContent?.trim() ?? "";
  return user.includes("科来运营") ? "科来管理" : user.includes("周启明") ? "教师" : user ? "学生" : "页面助手";
}

export function friendlyError(message: string) {
  if (/Authentication failed|AUTH_ERROR|HTTP 401|HTTP 403/i.test(message)) {
    return "API Key 无效或无权限，请重新配置。";
  }
  if (/Rate limit|RATE_LIMIT|HTTP 429/i.test(message)) {
    return "请求过于频繁或额度不足，请稍后再试。";
  }
  if (/HTTP 402|Insufficient Balance|insufficient_quota|余额不足/i.test(message)) {
    return "模型账户余额不足或额度耗尽，请检查服务商额度。";
  }
  if (/HTTP 404|model.*(not found|does not exist)|invalid model|模型不存在/i.test(message)) {
    return "模型名称不可用，请检查模型配置。";
  }
  if (/Network request failed|Failed to fetch|Load failed|CORS/i.test(message)) {
    return "无法连接模型服务：请检查服务地址、网络和跨域支持。";
  }
  return message.replace(/^\[PageAgent\]\s*/i, "");
}

export class AssistantStore {
  #state: AssistantState = initialState;
  #agent: PageAgentCore | null = null;
  #agentListeners: Array<[EventTarget, string, EventListener]> = [];
  #subscribers = new Set<() => void>();
  #pendingTask: string | null = null;
  #lastPath = "";

  subscribe = (listener: () => void) => {
    this.#subscribers.add(listener);
    return () => {
      this.#subscribers.delete(listener);
    };
  };

  getSnapshot = () => this.#state;

  #set(patch: Partial<AssistantState>) {
    this.#state = { ...this.#state, ...patch };
    this.#subscribers.forEach((listener) => listener());
  }

  setDraft(draft: string) {
    this.#set({ draft });
  }

  expand() {
    this.#set({
      expanded: true,
      minimized: false,
      focusToken: this.#state.focusToken + 1,
    });
  }

  collapse() {
    this.#set({ expanded: false });
  }

  minimize() {
    this.#set({ expanded: false, settingsOpen: false, minimized: true });
  }

  restore() {
    this.#set({ expanded: false, minimized: false });
  }

  openSettings(message = "") {
    this.#set({
      settingsOpen: true,
      settingsMessage: message,
      expanded: true,
      minimized: false,
      settingsRevealKey: false,
      settingsFocusToken: this.#state.settingsFocusToken + 1,
      ...(this.#state.settingsDirty ? {} : { settingsDraft: readAiSettings() }),
    });
  }

  closeSettings() {
    this.#set({ settingsOpen: false, settingsMessage: "", settingsRevealKey: false });
  }

  updateSettingsDraft(patch: Partial<AiSettings>) {
    this.#set({
      settingsDraft: { ...this.#state.settingsDraft, ...patch },
      settingsDirty: true,
      saved: false,
      settingsMessage: "",
    });
  }

  toggleSettingsKeyVisibility() {
    this.#set({ settingsRevealKey: !this.#state.settingsRevealKey });
  }

  saveSettings() {
    const validation = validateAiSettings(this.#state.settingsDraft);
    if (!validation.ok) {
      this.#set({ settingsMessage: validation.error });
      return false;
    }

    saveAiSettings(validation);
    this.#set({
      binding: {
        model: validation.settings.model,
        maxSteps: this.#state.binding.maxSteps,
        configured: true,
      },
      settingsDraft: validation.settings,
      settingsDirty: false,
      settingsOpen: false,
      settingsMessage: "",
      settingsRevealKey: false,
      saved: true,
      error: "",
    });
    return true;
  }

  clearSettings() {
    clearAiSettings();
    this.detachAgent();
    this.#pendingTask = null;
    this.#set({
      binding: {
        model: DEFAULT_AI_MODEL,
        maxSteps: this.#state.binding.maxSteps,
        configured: false,
      },
      settingsDirty: false,
      settingsOpen: false,
      settingsMessage: "",
      settingsDraft: emptyAiSettings(),
      settingsRevealKey: false,
      connecting: false,
      saved: false,
      running: false,
      activity: null,
      result: "",
      error: "",
    });
  }

  setConfiguration(binding: AgentBinding) {
    this.#set({ binding });
    if (binding.configured === false) {
      this.#pendingTask = null;
      this.#set({ connecting: false });
    }
  }

  attachAgent(agent: PageAgentCore, binding: AgentBinding) {
    this.#clearAgentListeners();
    this.#agent = agent;
    this.#set({ binding, connecting: false });

    this.#listenAgent(agent, "statuschange", () => {
      this.#set({ running: agent.status === "running" });
    });
    this.#listenAgent(agent, "activity", (event) => {
      this.#set({ activity: (event as CustomEvent<AgentActivity>).detail });
    });

    if (this.#pendingTask) {
      const task = this.#pendingTask;
      this.#pendingTask = null;
      this.#set({ running: false });
      void this.runTask(task);
    }
  }

  detachAgent() {
    this.#clearAgentListeners();
    this.#agent = null;
    this.#set({ running: false, activity: null });
  }

  setRuntimeError(message: string) {
    this.#pendingTask = null;
    this.#set({
      connecting: false,
      running: false,
      error: message,
      expanded: true,
    });
  }

  setPath(path: string) {
    if (this.#lastPath && this.#lastPath !== path) {
      this.#pendingTask = null;
      this.#set({ connecting: false });
    }
    this.#lastPath = path;
    this.#set({ path, role: inferRole() });
  }

  stop() {
    void this.#agent?.stop();
  }

  async runTask(task = this.#state.draft) {
    const prompt = task.trim();
    if (!prompt || this.#state.running || this.#state.connecting) return;

    if (this.#state.settingsDirty) {
      this.openSettings("设置已修改，请先点击「保存并连接」。");
      return;
    }

    if (this.#state.binding.configured === false) {
      this.openSettings("请先填写并保存 API Key。");
      return;
    }

    if (!this.#agent) {
      this.#pendingTask = prompt;
      this.#set({
        connecting: true,
        expanded: true,
        minimized: false,
        result: "",
        error: "",
      });
      return;
    }

    this.#set({
      expanded: true,
      minimized: false,
      settingsOpen: false,
      settingsMessage: "",
      saved: false,
      running: true,
      activity: null,
      result: "",
      error: "",
    });

    try {
      const result = await this.#agent.execute(prompt);
      const text = result.data.trim() || (result.success ? "任务已完成。" : "任务未完成。");
      this.#set({ result: text });
      if (!result.success) this.#set({ error: friendlyError(text) });
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI 任务执行失败。";
      const aborted = /aborted/i.test(message);
      this.#set({
        error: aborted ? "" : friendlyError(message),
        result: aborted ? "任务已停止。" : "",
      });
    } finally {
      this.#set({ running: false, activity: null, draft: "" });
    }
  }

  #listenAgent(target: EventTarget, type: string, listener: EventListener) {
    target.addEventListener(type, listener);
    this.#agentListeners.push([target, type, listener]);
  }

  #clearAgentListeners() {
    this.#agentListeners.forEach(([target, type, listener]) => target.removeEventListener(type, listener));
    this.#agentListeners = [];
  }
}
