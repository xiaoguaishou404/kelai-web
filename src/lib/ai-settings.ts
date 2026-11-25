export type AiSettings = {
  baseURL: string;
  apiKey: string;
  model: string;
};

export type AiSettingsValidation =
  | { ok: true; settings: AiSettings }
  | { ok: false; error: string };

export const AI_SETTINGS_STORAGE_KEY = "colasoft-ai-config-v1";
export const AI_SETTINGS_CHANGE_EVENT = "colasoft:ai-settings-change";
export const DEFAULT_AI_BASE_URL = "https://api.deepseek.com";
export const DEFAULT_AI_MODEL = "deepseek-flash";

let memorySettings: AiSettings | null = null;

function normalizeSettings(parsed: Partial<AiSettings>): AiSettings | null {
  if (!parsed.baseURL || !parsed.apiKey || !parsed.model) return null;
  return {
    baseURL: normalizeBaseURL(parsed.baseURL),
    apiKey: parsed.apiKey.trim(),
    model: parsed.model.trim(),
  };
}

export function normalizeBaseURL(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function emptyAiSettings(): AiSettings {
  return {
    baseURL: DEFAULT_AI_BASE_URL,
    apiKey: "",
    model: DEFAULT_AI_MODEL,
  };
}

export function loadAiSettings(): AiSettings | null {
  if (typeof window === "undefined") return memorySettings;
  try {
    const raw = window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    if (!raw) return memorySettings;
    const settings = normalizeSettings(JSON.parse(raw) as Partial<AiSettings>);
    return settings ?? memorySettings;
  } catch {
    return memorySettings;
  }
}

export function readAiSettings(): AiSettings {
  return loadAiSettings() ?? emptyAiSettings();
}

export function validateAiSettings(input: AiSettings): AiSettingsValidation {
  const baseURL = normalizeBaseURL(input.baseURL);
  const apiKey = input.apiKey.trim();
  const model = input.model.trim();

  if (!baseURL) return { ok: false, error: "请填写服务地址" };
  if (!model) return { ok: false, error: "请填写模型名称" };
  if (!apiKey) return { ok: false, error: "请填写 API Key" };

  let url: URL;
  try {
    url = new URL(baseURL);
  } catch {
    return { ok: false, error: "服务地址格式不正确" };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, error: "服务地址需以 http:// 或 https:// 开头" };
  }
  if (url.protocol === "http:" && window.location.protocol === "https:") {
    return { ok: false, error: "HTTPS 页面不能连接 HTTP 服务" };
  }

  return { ok: true, settings: { baseURL, apiKey, model } };
}

function notifyChange() {
  window.dispatchEvent(new Event(AI_SETTINGS_CHANGE_EVENT));
}

export function saveAiSettings(validation: Extract<AiSettingsValidation, { ok: true }>) {
  memorySettings = validation.settings;
  try {
    window.localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(validation.settings));
  } catch {
    // Keep the in-memory configuration when storage is unavailable.
  }
  notifyChange();
}

export function clearAiSettings() {
  memorySettings = null;
  try {
    window.localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
  } catch {
    // Storage may be unavailable.
  }
  notifyChange();
}
