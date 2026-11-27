import type { PageAgentCore } from "@page-agent/core";
import { createRoot, type Root } from "react-dom/client";
import { AssistantStore, type AgentBinding } from "./assistant-store";
import { AssistantView } from "./assistant-view";

export class ZjkgPageAgentElement extends HTMLElement {
  #store = new AssistantStore();
  #container: HTMLDivElement | null = null;
  #root: Root | null = null;

  connectedCallback() {
    if (this.#root) return;
    this.id = "zjkg-ai-copilot";
    this.className = "ep-ai-copilot";
    this.setAttribute("data-page-agent-ignore", "true");
    this.setAttribute("data-page-agent-not-interactive", "true");

    if (!this.#container) {
      this.#container = document.createElement("div");
      this.appendChild(this.#container);
    }

    this.#root = createRoot(this.#container);
    this.#root.render(<AssistantView store={this.#store} host={this} />);
  }

  disconnectedCallback() {
    this.#root?.unmount();
    this.#root = null;
  }

  attachAgent(agent: PageAgentCore, binding: AgentBinding) {
    this.#store.attachAgent(agent, binding);
  }

  detachAgent() {
    this.#store.detachAgent();
  }

  setConfiguration(binding: AgentBinding) {
    this.#store.setConfiguration(binding);
  }

  setPath(path: string) {
    this.#store.setPath(path);
  }

  setRuntimeError(message: string) {
    this.#store.setRuntimeError(message);
  }
}

export function definePageAgentElement() {
  if (!customElements.get("zjkg-page-agent")) {
    customElements.define("zjkg-page-agent", ZjkgPageAgentElement);
  }
}
