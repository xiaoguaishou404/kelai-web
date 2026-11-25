import type { AgentActivity, PageAgentCore } from "@page-agent/core";
import {
  DEFAULT_AI_MODEL,
  clearAiSettings,
  readAiSettings,
  saveAiSettings,
  validateAiSettings,
} from "@/lib/ai-settings";

type AgentBinding = {
  model: string;
  maxSteps: number;
  configured: boolean | null;
};

const ICONS = {
  bot: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M8 13h.01M16 13h.01M9 16h6"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>',
  send: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  stop: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>',
  minimize: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 9h12M6 15h12"/></svg>',
  spark: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.6 4.4L6 9l4.4 1.6L12 15l1.6-4.4L18 9l-4.4-1.6ZM5 16l-.8 2.2L2 19l2.2.8L5 22l.8-2.2L8 19l-2.2-.8Z"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  settings: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.98a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.98 4.6a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8.98a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></svg>',
  spinner: '<svg class="spin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.2-8.56"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>',
  alert: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
};

const ACTION_LABELS: Record<string, string> = {
  click_element_by_index: "正在点击页面",
  input_text: "正在填写字段",
  select_dropdown_option: "正在选择选项",
  scroll: "正在浏览页面",
  scroll_horizontally: "正在横向浏览",
  wait: "正在等待页面",
  done: "正在整理结果",
};

function friendlyError(message: string) {
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

export class ColasoftPageAgentElement extends HTMLElement {
  #agent: PageAgentCore | null = null;
  #binding: AgentBinding = { model: DEFAULT_AI_MODEL, maxSteps: Number.MAX_SAFE_INTEGER, configured: null };
  #expanded = false;
  #minimized = false;
  #settingsOpen = false;
  #settingsDirty = false;
  #settingsError = "";
  #connecting = false;
  #pendingTask: string | null = null;
  #saved = false;
  #lastPath = "";
  #running = false;
  #activity: AgentActivity | null = null;
  #result = "";
  #error = "";
  #listeners: Array<[EventTarget, string, EventListener]> = [];
  #agentListeners: Array<[EventTarget, string, EventListener]> = [];

  connectedCallback() {
    if (this.dataset.ready === "true") return;
    this.dataset.ready = "true";
    this.id = "colasoft-ai-copilot";
    this.className = "ep-ai-copilot";
    this.setAttribute("data-page-agent-ignore", "true");
    this.setAttribute("data-page-agent-not-interactive", "true");
    this.innerHTML = `
      <div class="ep-ai-shell">
        <div class="ep-ai-settings-panel" data-agent-settings hidden role="group" aria-label="模型服务设置" data-page-agent-ignore="true" data-page-agent-not-interactive>
          <div class="ep-ai-settings-head">
            <b>模型服务</b>
            <button type="button" data-agent-action="settings-close" aria-label="关闭设置">${ICONS.close}</button>
          </div>
          <label class="ep-ai-field ep-ai-field-wide">
            <span>服务地址</span>
            <input data-settings-base aria-label="服务地址" placeholder="https://api.deepseek.com" autocomplete="off" spellcheck="false" />
          </label>
          <div class="ep-ai-settings-row">
            <label class="ep-ai-field">
              <span>模型</span>
              <input data-settings-model aria-label="模型" placeholder="deepseek-flash" autocomplete="off" spellcheck="false" />
            </label>
            <label class="ep-ai-field">
              <span>API Key</span>
              <span class="ep-ai-key">
                <input type="password" data-settings-key aria-label="API Key" placeholder="sk-…" autocomplete="off" spellcheck="false" />
                <button type="button" data-agent-action="toggle-key">显示</button>
              </span>
            </label>
          </div>
          <div class="ep-ai-settings-foot">
            <p class="ep-ai-settings-error" data-settings-error></p>
            <div class="ep-ai-settings-actions">
              <button type="button" class="ep-ai-settings-clear" data-agent-action="settings-clear">清除</button>
              <button type="button" class="ep-ai-settings-save" data-agent-action="settings-save">保存并连接</button>
            </div>
          </div>
          <p class="ep-ai-settings-note">Key 仅保存在本机浏览器，直接发送至所填模型服务。</p>
        </div>
        <div class="ep-ai-panel" data-agent-panel hidden data-page-agent-ignore="true" data-page-agent-not-interactive></div>
        <div class="ep-ai-bar" data-page-agent-ignore="true" data-page-agent-not-interactive>
          <button type="button" class="ep-ai-expand" data-agent-action="expand" aria-label="展开 AI 助手">${ICONS.chevron}</button>
          <span class="ep-ai-mark">${ICONS.bot}</span>
          <span class="ep-ai-context" data-agent-role>页面助手</span>
          <input data-agent-input placeholder="让 AI 帮你完成当前页面任务…" aria-label="AI 业务指令" autocomplete="off" />
          <button type="button" class="ep-ai-minimize" data-agent-action="minimize" aria-label="最小化到右下角">${ICONS.minimize}</button>
          <button type="button" class="ep-ai-send" data-agent-action="submit" aria-label="发送指令" disabled>${ICONS.send}</button>
        </div>
        <div class="ep-ai-privacy" data-page-agent-ignore="true" data-page-agent-not-interactive>
          <button type="button" class="ep-ai-config" data-agent-action="settings">${ICONS.settings}<span data-agent-config></span></button>
          <kbd>⌘K</kbd>
        </div>
      </div>
      <button type="button" class="ep-ai-fab" data-agent-action="restore" aria-label="打开 AI 助手">${ICONS.bot}</button>
    `;
    this.#fillSettingsFields();
    this.#bindEvents();
    this.#render();
  }

  disconnectedCallback() {
    this.#listeners.forEach(([target, type, listener]) => target.removeEventListener(type, listener));
    this.#listeners = [];
    this.#clearAgentListeners();
  }

  attachAgent(agent: PageAgentCore, binding: AgentBinding) {
    this.#clearAgentListeners();
    this.#agent = agent;
    this.#binding = binding;
    this.#listenAgent(agent, "statuschange", () => {
      this.#running = agent.status === "running";
      this.#render();
    });
    this.#listenAgent(agent, "activity", (event) => {
      this.#activity = (event as CustomEvent<AgentActivity>).detail;
      this.#render();
    });
    this.#connecting = false;
    this.#render();

    if (this.#pendingTask) {
      const task = this.#pendingTask;
      this.#pendingTask = null;
      this.#running = false;
      void this.#runTask(task);
    }
  }

  detachAgent() {
    this.#clearAgentListeners();
    this.#agent = null;
    this.#running = false;
    this.#activity = null;
    this.#render();
  }

  setConfiguration(binding: AgentBinding) {
    this.#binding = binding;
    if (binding.configured === false) {
      this.#connecting = false;
      this.#pendingTask = null;
    }
    this.#render();
  }

  setRuntimeError(message: string) {
    this.#connecting = false;
    this.#pendingTask = null;
    this.#running = false;
    this.#error = message;
    this.#expanded = true;
    this.#render();
  }

  setPath(path: string) {
    if (this.#lastPath && this.#lastPath !== path) {
      this.#pendingTask = null;
      this.#connecting = false;
    }
    this.#lastPath = path;
    this.hidden = !path.startsWith("/platform") || path === "/platform/login";
    if (this.hidden) {
      this.#settingsOpen = false;
      this.#settingsError = "";
      this.#minimized = false;
      this.#render();
    }
    this.#refreshRole();
  }

  #listen(target: EventTarget, type: string, listener: EventListener) {
    target.addEventListener(type, listener);
    this.#listeners.push([target, type, listener]);
  }

  #listenAgent(target: EventTarget, type: string, listener: EventListener) {
    target.addEventListener(type, listener);
    this.#agentListeners.push([target, type, listener]);
  }

  #clearAgentListeners() {
    this.#agentListeners.forEach(([target, type, listener]) => target.removeEventListener(type, listener));
    this.#agentListeners = [];
  }

  #bindEvents() {
    this.#listen(this, "click", ((event: Event) => {
      const button = (event.target as Element | null)?.closest<HTMLElement>("[data-agent-action]");
      if (!button) return;
      event.preventDefault();
      const action = button.dataset.agentAction;
      if (action === "expand") {
        this.#expanded = true;
        this.#minimized = false;
        this.#render();
        this.#input()?.focus();
      } else if (action === "collapse") {
        this.#expanded = false;
        this.#render();
      } else if (action === "minimize") {
        this.#expanded = false;
        this.#settingsOpen = false;
        this.#minimized = true;
        this.#render();
      } else if (action === "restore") {
        this.#expanded = false;
        this.#minimized = false;
        this.#render();
      } else if (action === "submit") {
        void this.#runTask();
      } else if (action === "stop") {
        void this.#agent?.stop();
      } else if (action === "settings") {
        this.#openSettings();
      } else if (action === "settings-close") {
        this.#settingsOpen = false;
        this.#settingsError = "";
        this.#render();
      } else if (action === "settings-save") {
        this.#saveSettings();
      } else if (action === "settings-clear") {
        this.#clearSettings();
      } else if (action === "toggle-key") {
        const input = this.#settingsField("key");
        if (!input) return;
        const reveal = input.type === "password";
        input.type = reveal ? "text" : "password";
        button.textContent = reveal ? "隐藏" : "显示";
      }
    }) as EventListener);

    this.#listen(this, "input", ((event: Event) => {
      const target = event.target as Element | null;
      if (target?.matches("[data-agent-input]")) this.#updateSubmitButton();
      if (target?.matches("[data-settings-base], [data-settings-model], [data-settings-key]")) {
        this.#settingsDirty = true;
        this.#saved = false;
        this.#setSettingsError("");
        this.#render();
      }
    }) as EventListener);

    this.#listen(this, "focusin", ((event: Event) => {
      if ((event.target as Element | null)?.matches("[data-agent-input]") && !this.#expanded) {
        this.#expanded = true;
        this.#render();
      }
    }) as EventListener);

    this.#listen(this, "keydown", ((event: KeyboardEvent) => {
      const target = event.target as Element | null;
      if (event.key === "Escape" && this.#settingsOpen) {
        event.preventDefault();
        this.#settingsOpen = false;
        this.#settingsError = "";
        this.#render();
        return;
      }
      if (target?.matches("[data-settings-base], [data-settings-model], [data-settings-key]") && event.key === "Enter") {
        event.preventDefault();
        this.#saveSettings();
        return;
      }
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing && target?.matches("[data-agent-input]")) {
        event.preventDefault();
        void this.#runTask();
      }
    }) as EventListener);

    this.#listen(window, "keydown", ((event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        this.#expanded = true;
        this.#minimized = false;
        this.#render();
        window.setTimeout(() => this.#input()?.focus(), 0);
      }
    }) as EventListener);

    this.#listen(document, "pointerdown", ((event: PointerEvent) => {
      if (!this.#settingsOpen) return;
      if (this.contains(event.target as Node)) return;
      this.#settingsOpen = false;
      this.#settingsError = "";
      this.#render();
    }) as EventListener);
  }

  #input() {
    return this.querySelector<HTMLInputElement>("[data-agent-input]");
  }

  #settingsField(name: "base" | "model" | "key") {
    return this.querySelector<HTMLInputElement>(`[data-settings-${name}]`);
  }

  #fillSettingsFields() {
    const settings = readAiSettings();
    const base = this.#settingsField("base");
    const model = this.#settingsField("model");
    const key = this.#settingsField("key");
    if (base) base.value = settings.baseURL;
    if (model) model.value = settings.model;
    if (key) key.value = settings.apiKey;
  }

  #openSettings(message = "") {
    this.#settingsOpen = true;
    this.#settingsError = message;
    this.#expanded = true;
    this.#minimized = false;
    this.#render();
    window.setTimeout(() => {
      const field = this.#settingsField("key");
      if (field && !field.value) {
        field.focus();
        return;
      }
      if (this.#settingsDirty) {
        this.querySelector<HTMLButtonElement>("[data-agent-action='settings-save']")?.focus();
      }
    }, 0);
  }

  #setSettingsError(message: string) {
    this.#settingsError = message;
    const element = this.querySelector<HTMLElement>("[data-settings-error]");
    if (element) element.textContent = message;
  }

  #saveSettings() {
    const base = this.#settingsField("base");
    const model = this.#settingsField("model");
    const key = this.#settingsField("key");
    const validation = validateAiSettings({
      baseURL: base?.value ?? "",
      model: model?.value ?? "",
      apiKey: key?.value ?? "",
    });

    if (!validation.ok) {
      this.#setSettingsError(validation.error);
      return false;
    }

    this.#binding = {
      model: validation.settings.model,
      maxSteps: this.#binding.maxSteps,
      configured: true,
    };
    saveAiSettings(validation);
    this.#settingsDirty = false;
    this.#saved = true;
    this.#settingsOpen = false;
    this.#settingsError = "";
    this.#error = "";
    this.#render();
    return true;
  }

  #clearSettings() {
    clearAiSettings();
    this.detachAgent();
    this.#binding = {
      model: DEFAULT_AI_MODEL,
      maxSteps: this.#binding.maxSteps,
      configured: false,
    };
    this.#settingsDirty = false;
    this.#saved = false;
    this.#settingsOpen = false;
    this.#settingsError = "";
    this.#connecting = false;
    this.#pendingTask = null;
    this.#result = "";
    this.#error = "";
    this.#fillSettingsFields();
    const key = this.#settingsField("key");
    if (key) key.type = "password";
    const toggle = this.querySelector<HTMLElement>("[data-agent-action='toggle-key']");
    if (toggle) toggle.textContent = "显示";
    this.#render();
  }

  async #runTask(prompt = this.#input()?.value ?? "") {
    const task = prompt.trim();
    if (!task || this.#running || this.#connecting) return;

    if (this.#settingsDirty) {
      this.#openSettings("设置已修改，请先点击「保存并连接」。");
      return;
    }

    if (this.#binding.configured === false) {
      this.#openSettings("请先填写并保存 API Key。");
      return;
    }

    if (!this.#agent) {
      this.#pendingTask = task;
      this.#connecting = true;
      this.#expanded = true;
      this.#minimized = false;
      this.#result = "";
      this.#error = "";
      this.#render();
      return;
    }

    this.#expanded = true;
    this.#minimized = false;
    this.#settingsOpen = false;
    this.#settingsError = "";
    this.#saved = false;
    this.#running = true;
    this.#activity = null;
    this.#result = "";
    this.#error = "";
    this.#render();

    try {
      const result = await this.#agent.execute(task);
      this.#result = result.data.trim() || (result.success ? "任务已完成。" : "任务未完成。");
      if (!result.success) this.#error = friendlyError(this.#result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI 任务执行失败。";
      this.#error = /aborted/i.test(message) ? "" : friendlyError(message);
      this.#result = /aborted/i.test(message) ? "任务已停止。" : "";
    } finally {
      this.#running = false;
      this.#activity = null;
      const input = this.#input();
      if (input) input.value = "";
      this.#render();
    }
  }

  #activityLabel() {
    const activity = this.#activity;
    if (!activity) return "正在分析页面";
    if (activity.type === "thinking") return "正在分析页面";
    if (activity.type === "executing") return ACTION_LABELS[activity.tool] ?? "正在执行页面操作";
    if (activity.type === "retrying") return `正在重试 ${activity.attempt}/${activity.maxAttempts}`;
    if (activity.type === "error") return "页面操作失败";
    return "正在整理下一步";
  }

  #refreshRole() {
    const user = document.querySelector(".ep-user")?.textContent?.trim() ?? "";
    const role = user.includes("科来运营") ? "科来管理" : user.includes("周启明") ? "教师" : user ? "学生" : "页面助手";
    const element = this.querySelector("[data-agent-role]");
    if (element) element.textContent = role;
  }

  #updateSubmitButton() {
    const button = this.querySelector<HTMLButtonElement>("[data-agent-action='submit']");
    if (button) button.disabled = this.#connecting || !this.#input()?.value.trim();
  }

  #render() {
    this.classList.toggle("expanded", this.#expanded);
    this.classList.toggle("is-minimized", this.#minimized);
    this.classList.toggle("is-settings", this.#settingsOpen);
    const panel = this.querySelector<HTMLElement>("[data-agent-panel]");
    const settings = this.querySelector<HTMLElement>("[data-agent-settings]");
    const expand = this.querySelector<HTMLElement>("[data-agent-action='expand']");
    const send = this.querySelector<HTMLButtonElement>("[data-agent-action='submit'], [data-agent-action='stop']");
    const minimize = this.querySelector<HTMLElement>("[data-agent-action='minimize']");
    const fab = this.querySelector<HTMLElement>("[data-agent-action='restore']");
    const config = this.querySelector<HTMLElement>("[data-agent-config]");
    const settingsError = this.querySelector<HTMLElement>("[data-settings-error]");
    if (!panel || !settings || !expand || !send || !minimize || !fab || !config) return;

    fab.hidden = !this.#minimized;
    if (this.#minimized) {
      panel.hidden = true;
      panel.innerHTML = "";
      settings.hidden = true;
      return;
    }

    this.#refreshRole();
    expand.hidden = this.#expanded;
    expand.style.display = this.#expanded ? "none" : "grid";
    minimize.style.display = "grid";
    settings.hidden = !this.#settingsOpen;
    if (settingsError) settingsError.textContent = this.#settingsError;

    if (this.#settingsOpen) {
      panel.hidden = true;
      panel.innerHTML = "";
    } else if (!this.#expanded) {
      panel.hidden = true;
      panel.innerHTML = "";
    } else {
      const status = this.#connecting
        ? `<div class="ep-ai-status is-running">${ICONS.spinner}正在连接模型服务…</div>`
        : this.#running
          ? `<div class="ep-ai-status is-running">${ICONS.spinner}${this.#activityLabel()}</div>`
          : this.#error
            ? `<div class="ep-ai-status is-error">${ICONS.alert}${this.#error}</div>`
            : this.#saved
              ? `<div class="ep-ai-result">${ICONS.check}<div><b>配置已保存</b><p>可以直接发送页面任务。</p></div></div>`
              : this.#result
                ? `<div class="ep-ai-result">${ICONS.check}<div><b>任务完成</b><p>${this.#result}</p></div></div>`
                : `<div class="ep-ai-status">${ICONS.spark}告诉我要完成的页面任务。</div>`;
      panel.hidden = false;
      panel.innerHTML = `
        <div class="ep-ai-panel-head" data-page-agent-ignore="true" data-page-agent-not-interactive>
          <div><span>${ICONS.spark}科来业务副驾</span><small>${this.#binding.model} · ${this.#binding.maxSteps >= 1_000_000 ? "不限步数" : `${this.#binding.maxSteps} 步`}</small></div>
          <div class="ep-ai-panel-actions">
            <button type="button" data-agent-action="settings" aria-label="模型服务设置">${ICONS.settings}</button>
            <button type="button" data-agent-action="collapse" aria-label="收起 AI 助手">${ICONS.close}</button>
          </div>
        </div>
        ${status}
      `;
    }

    const isSubmit = send.dataset.agentAction === "submit";
    if (this.#running && isSubmit) {
      send.dataset.agentAction = "stop";
      send.className = "ep-ai-send stop";
      send.setAttribute("aria-label", "停止任务");
      send.innerHTML = ICONS.stop;
      send.disabled = false;
    } else if (!this.#running && !isSubmit) {
      send.dataset.agentAction = "submit";
      send.className = "ep-ai-send";
      send.setAttribute("aria-label", "发送指令");
      send.innerHTML = ICONS.send;
      this.#updateSubmitButton();
    } else {
      this.#updateSubmitButton();
    }

    config.textContent = this.#binding.configured === false
      ? this.#settingsDirty
        ? "待保存 · 点击保存并连接"
        : "未配置 · 填写 API Key"
      : this.#settingsDirty
        ? "有改动 · 点击保存并连接"
        : "本机 Key · 敏感字段已脱敏";
  }
}

export function definePageAgentElement() {
  if (!customElements.get("colasoft-page-agent")) {
    customElements.define("colasoft-page-agent", ColasoftPageAgentElement);
  }
}
