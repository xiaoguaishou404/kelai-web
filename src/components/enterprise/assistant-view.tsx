import { useEffect, useRef, useSyncExternalStore, type FormEvent } from "react";
import type { AgentActivity } from "@page-agent/core";
import type { AssistantStore } from "./assistant-store";

const ACTION_LABELS: Record<string, string> = {
  click_element_by_index: "正在点击页面",
  input_text: "正在填写字段",
  select_dropdown_option: "正在选择选项",
  scroll: "正在浏览页面",
  scroll_horizontally: "正在横向浏览",
  wait: "正在等待页面",
  done: "正在整理结果",
};

function activityLabel(activity: AgentActivity | null) {
  if (!activity) return "正在分析页面";
  if (activity.type === "thinking") return "正在分析页面";
  if (activity.type === "executing") return ACTION_LABELS[activity.tool] ?? "正在执行页面操作";
  if (activity.type === "retrying") return `正在重试 ${activity.attempt}/${activity.maxAttempts}`;
  if (activity.type === "error") return "页面操作失败";
  return "正在整理下一步";
}

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="8" width="14" height="11" rx="3" />
      <path d="M12 4v4M8 13h.01M16 13h.01M9 16h6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="12" r="9" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M6 9h12M6 15h12" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.6 4.4L6 9l4.4 1.6L12 15l1.6-4.4L18 9l-4.4-1.6ZM5 16l-.8 2.2L2 19l2.2.8L5 22l.8-2.2L8 19l-2.2-.8Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.98a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.98 4.6a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8.98a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="spin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.2-8.56" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

export function AssistantView({ store, host }: { store: AssistantStore; host: HTMLElement }) {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const inputRef = useRef<HTMLInputElement>(null);
  const keyRef = useRef<HTMLInputElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    host.classList.toggle("is-minimized", state.minimized);
  }, [host, state.minimized]);

  useEffect(() => {
    if (!state.settingsOpen) return;
    const timer = window.setTimeout(() => {
      const keyValue = keyRef.current?.value ?? "";
      if (!keyValue) keyRef.current?.focus();
      else if (store.getSnapshot().settingsDirty) saveRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [state.settingsOpen, state.settingsFocusToken, store]);

  useEffect(() => {
    if (!state.focusToken) return;
    inputRef.current?.focus();
  }, [state.focusToken]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        store.expand();
      }
      if (event.key === "Escape" && store.getSnapshot().settingsOpen) {
        event.preventDefault();
        store.closeSettings();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [store]);

  useEffect(() => {
    if (!state.settingsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!host.contains(event.target as Node)) store.closeSettings();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [host, state.settingsOpen, store]);

  const submitSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    store.saveSettings();
  };

  const showPanel = state.expanded && !state.settingsOpen;
  const isRunning = state.running;
  const sendDisabled = state.connecting || !state.draft.trim();
  const configLabel = !state.binding.configured
    ? state.settingsDirty
      ? "待保存 · 点击保存并连接"
      : "未配置 · 填写 API Key"
    : state.settingsDirty
      ? "有改动 · 点击保存并连接"
      : "本机 Key · 敏感字段已脱敏";

  const status = state.connecting ? (
    <div className="ep-ai-status is-running"><SpinnerIcon />正在连接模型服务…</div>
  ) : state.running ? (
    <div className="ep-ai-status is-running"><SpinnerIcon />{activityLabel(state.activity)}</div>
  ) : state.error ? (
    <div className="ep-ai-status is-error"><AlertIcon />{state.error}</div>
  ) : state.saved ? (
    <div className="ep-ai-result"><CheckIcon /><div><b>配置已保存</b><p>可以直接发送页面任务。</p></div></div>
  ) : state.result ? (
    <div className="ep-ai-result"><CheckIcon /><div><b>任务完成</b><p>{state.result}</p></div></div>
  ) : (
    <div className="ep-ai-status"><SparkIcon />告诉我要完成的页面任务。</div>
  );

  return (
    <>
      <div className="ep-ai-shell" data-page-agent-ignore="true" data-page-agent-not-interactive="true">
        <form
          className="ep-ai-settings-panel"
          data-page-agent-ignore="true"
          data-page-agent-not-interactive="true"
          hidden={!state.settingsOpen}
          aria-label="模型服务设置"
          onSubmit={submitSettings}
        >
          <div className="ep-ai-settings-head">
            <b>模型服务</b>
            <button type="button" aria-label="关闭设置" onClick={() => store.closeSettings()}><CloseIcon /></button>
          </div>
          <label className="ep-ai-field ep-ai-field-wide">
            <span>服务地址</span>
            <input
              value={state.settingsDraft.baseURL}
              onChange={(event) => store.updateSettingsDraft({ baseURL: event.target.value })}
              aria-label="服务地址"
              placeholder="https://api.deepseek.com"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <div className="ep-ai-settings-row">
            <label className="ep-ai-field">
              <span>模型</span>
              <input
                value={state.settingsDraft.model}
                onChange={(event) => store.updateSettingsDraft({ model: event.target.value })}
                aria-label="模型"
                placeholder="deepseek-flash"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <label className="ep-ai-field">
              <span>API Key</span>
              <span className="ep-ai-key">
                <input
                  ref={keyRef}
                  type={state.settingsRevealKey ? "text" : "password"}
                  value={state.settingsDraft.apiKey}
                  onChange={(event) => store.updateSettingsDraft({ apiKey: event.target.value })}
                  aria-label="API Key"
                  placeholder="sk-…"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="button" onClick={() => store.toggleSettingsKeyVisibility()}>{state.settingsRevealKey ? "隐藏" : "显示"}</button>
              </span>
            </label>
          </div>
          <div className="ep-ai-settings-foot">
            <p className="ep-ai-settings-error">{state.settingsMessage}</p>
            <div className="ep-ai-settings-actions">
              <button type="button" className="ep-ai-settings-clear" onClick={() => store.clearSettings()}>清除</button>
              <button ref={saveRef} type="submit" className="ep-ai-settings-save">保存并连接</button>
            </div>
          </div>
          <p className="ep-ai-settings-note">Key 仅保存在本机浏览器，直接发送至所填模型服务。</p>
        </form>

        <div
          className="ep-ai-panel"
          data-page-agent-ignore="true"
          data-page-agent-not-interactive="true"
          aria-live="polite"
          hidden={!showPanel}
        >
          {showPanel && (
            <>
              <div className="ep-ai-panel-head">
                <div>
                  <span><SparkIcon />科工产业副驾</span>
                  <small>{state.binding.model} · {state.binding.maxSteps >= 1_000_000 ? "不限步数" : `${state.binding.maxSteps} 步`}</small>
                </div>
                <div className="ep-ai-panel-actions">
                  <button type="button" aria-label="模型服务设置" onClick={() => store.openSettings()}><SettingsIcon /></button>
                  <button type="button" aria-label="收起 AI 助手" onClick={() => store.collapse()}><CloseIcon /></button>
                </div>
              </div>
              {status}
            </>
          )}
        </div>

        <div className="ep-ai-bar" data-page-agent-ignore="true" data-page-agent-not-interactive="true">
          {!state.expanded && (
            <button type="button" className="ep-ai-expand" aria-label="展开 AI 助手" onClick={() => store.expand()}><ChevronIcon /></button>
          )}
          <span className="ep-ai-mark"><BotIcon /></span>
          <span className="ep-ai-context">{state.role}</span>
          <input
            ref={inputRef}
            value={state.draft}
            onChange={(event) => store.setDraft(event.target.value)}
            onFocus={() => { if (!state.expanded) store.expand(); }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void store.runTask();
              }
            }}
            placeholder="让 AI 帮你完成当前页面任务…"
            aria-label="AI 业务指令"
            autoComplete="off"
          />
          <button type="button" className="ep-ai-minimize" aria-label="最小化到右下角" onClick={() => store.minimize()}><MinimizeIcon /></button>
          <button
            type="button"
            className={isRunning ? "ep-ai-send stop" : "ep-ai-send"}
            aria-label={isRunning ? "停止任务" : "发送指令"}
            disabled={!isRunning && sendDisabled}
            onClick={() => { if (isRunning) store.stop(); else void store.runTask(); }}
          >
            {isRunning ? <StopIcon /> : <SendIcon />}
          </button>
        </div>

        <div className="ep-ai-privacy" data-page-agent-ignore="true" data-page-agent-not-interactive="true">
          <button type="button" className="ep-ai-config" onClick={() => store.openSettings()}>
            <SettingsIcon />
            <span>{configLabel}</span>
          </button>
          <kbd>⌘K</kbd>
        </div>
      </div>

      <button type="button" className="ep-ai-fab" aria-label="打开 AI 助手" onClick={() => store.restore()}><BotIcon /></button>
    </>
  );
}
