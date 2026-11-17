import type { AgentActivity, PageAgentCore } from "@page-agent/core";

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

export class ColasoftPageAgentElement extends HTMLElement {
  #agent: PageAgentCore | null = null;
  #binding: AgentBinding = { model: "deepseek-flash", maxSteps: Number.MAX_SAFE_INTEGER, configured: null };
  #expanded = false;
  #minimized = false;
  #running = false;
  #activity: AgentActivity | null = null;
  #result = "";
  #error = "";
  #currentTask = "";
  #listeners: Array<[EventTarget, string, EventListener]> = [];

  connectedCallback() {
    if (this.dataset.ready === "true") return;
    this.dataset.ready = "true";
    this.id = "colasoft-ai-copilot";
    this.className = "ep-ai-copilot";
    this.setAttribute("data-page-agent-ignore", "true");
    this.setAttribute("data-page-agent-not-interactive", "true");
    this.innerHTML = `
      <div class="ep-ai-shell">
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
          <span data-agent-config>完整页面上下文 · 敏感字段已脱敏</span>
          <kbd>⌘K</kbd>
        </div>
      </div>
      <button type="button" class="ep-ai-fab" data-agent-action="restore" aria-label="打开 AI 助手">${ICONS.bot}</button>
    `;
    this.#bindEvents();
    this.#render();
  }

  disconnectedCallback() {
    this.#listeners.forEach(([target, type, listener]) => target.removeEventListener(type, listener));
    this.#listeners = [];
  }

  attachAgent(agent: PageAgentCore, binding: AgentBinding) {
    this.#agent = agent;
    this.#binding = binding;
    this.#listen(agent, "statuschange", () => {
      this.#running = agent.status === "running";
      this.#render();
    });
    this.#listen(agent, "activity", (event) => {
      this.#activity = (event as CustomEvent<AgentActivity>).detail;
      this.#render();
    });
    this.#render();
  }

  setConfiguration(binding: AgentBinding) {
    this.#binding = binding;
    this.#render();
  }

  setPath(path: string) {
    this.hidden = !path.startsWith("/platform") || path === "/platform/login";
    this.#refreshRole();
  }

  #listen(target: EventTarget, type: string, listener: EventListener) {
    target.addEventListener(type, listener);
    this.#listeners.push([target, type, listener]);
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
      }
    }) as EventListener);

    this.#listen(this, "input", ((event: Event) => {
      if ((event.target as Element | null)?.matches("[data-agent-input]")) this.#updateSubmitButton();
    }) as EventListener);

    this.#listen(this, "focusin", ((event: Event) => {
      if ((event.target as Element | null)?.matches("[data-agent-input]") && !this.#expanded) {
        this.#expanded = true;
        this.#render();
      }
    }) as EventListener);

    this.#listen(this, "keydown", ((event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing && (event.target as Element | null)?.matches("[data-agent-input]")) {
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
  }

  #input() {
    return this.querySelector<HTMLInputElement>("[data-agent-input]");
  }

  async #runTask(prompt = this.#input()?.value ?? "") {
    const task = prompt.trim();
    if (!task || this.#running) return;
    if (this.#binding.configured === false) {
      this.#error = "AI 服务未配置：请在服务端设置 AI_API_KEY。";
      this.#expanded = true;
      this.#render();
      return;
    }
    if (!this.#agent) {
      this.#error = "AI 组件仍在初始化，请稍后重试。";
      this.#expanded = true;
      this.#render();
      return;
    }

    this.#expanded = true;
    this.#minimized = false;
    this.#running = true;
    this.#activity = null;
    this.#result = "";
    this.#error = "";
    this.#currentTask = task;
    this.#render();

    try {
      const result = await this.#agent.execute(task);
      this.#result = result.data.trim() || (result.success ? "任务已完成。" : "任务未完成。");
      if (!result.success) this.#error = this.#result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI 任务执行失败。";
      this.#error = /aborted/i.test(message) ? "" : message;
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
    if (button) button.disabled = !this.#input()?.value.trim();
  }

  #render() {
    this.classList.toggle("expanded", this.#expanded);
    this.classList.toggle("is-minimized", this.#minimized);
    const panel = this.querySelector<HTMLElement>("[data-agent-panel]");
    const expand = this.querySelector<HTMLElement>("[data-agent-action='expand']");
    const send = this.querySelector<HTMLButtonElement>("[data-agent-action='submit'], [data-agent-action='stop']");
    const minimize = this.querySelector<HTMLElement>("[data-agent-action='minimize']");
    const fab = this.querySelector<HTMLElement>("[data-agent-action='restore']");
    const config = this.querySelector<HTMLElement>("[data-agent-config]");
    if (!panel || !expand || !send || !minimize || !fab || !config) return;

    fab.hidden = !this.#minimized;
    if (this.#minimized) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }

    this.#refreshRole();
    expand.hidden = this.#expanded;
    expand.style.display = this.#expanded ? "none" : "grid";
    minimize.style.display = "grid";

    if (!this.#expanded) {
      panel.hidden = true;
      panel.innerHTML = "";
    } else {
      const status = this.#running
        ? `<div class="ep-ai-status is-running">${ICONS.spinner}${this.#activityLabel()}</div>`
        : this.#error
          ? `<div class="ep-ai-status is-error">${ICONS.alert}${this.#error}</div>`
          : this.#result
            ? `<div class="ep-ai-result">${ICONS.check}<div><b>任务完成</b><p>${this.#result}</p></div></div>`
            : `<div class="ep-ai-status">${ICONS.spark}告诉我要完成的页面任务。</div>`;
      panel.hidden = false;
      panel.innerHTML = `
        <div class="ep-ai-panel-head" data-page-agent-ignore="true" data-page-agent-not-interactive>
          <div><span>${ICONS.spark}科来业务副驾</span><small>${this.#binding.model} · ${this.#binding.maxSteps >= 1_000_000 ? "不限步数" : `${this.#binding.maxSteps} 步`}</small></div>
          <button type="button" data-agent-action="collapse" aria-label="收起 AI 助手">${ICONS.close}</button>
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
      ? "配置 AI_API_KEY 后启用"
      : "完整页面上下文 · 敏感字段已脱敏";
  }
}

export function definePageAgentElement() {
  if (!customElements.get("colasoft-page-agent")) {
    customElements.define("colasoft-page-agent", ColasoftPageAgentElement);
  }
}
