// src/main.ts

import "./style.css";

/**
 * Basic typing for messages — loosened to `any` for compatibility.
 * Add stricter types later if you want.
 */
type PenpotMessage = any;
type Tab = 'designPage' | 'output' | 'config';

class PenpotPlugin {
  private connectionStatusEl: HTMLDivElement;
  private btnDesignPage: HTMLButtonElement;
  private btnOutput: HTMLButtonElement;
  private btnConfig: HTMLButtonElement;
  private tabContent: HTMLDivElement;
  private statusEl: HTMLDivElement;
  
  private tabButtons: Record<Tab, HTMLButtonElement>;
  private activeTab: Tab | null = null;
  
  private searchParams: URLSearchParams;

  constructor() {
    this.searchParams = new URLSearchParams(window.location.search);
    
    // Initialize elements
    this.connectionStatusEl = this.$<HTMLDivElement>('#connectionStatus')!;
    this.btnDesignPage = this.$<HTMLButtonElement>('#btn-designPage')!;
    this.btnOutput = this.$<HTMLButtonElement>('#btn-output')!;
    this.btnConfig = this.$<HTMLButtonElement>('#btn-config')!;
    this.tabContent = this.$<HTMLDivElement>('#tabContent')!;
    this.statusEl = this.$<HTMLDivElement>('#status')!;
    
    this.tabButtons = {
      designPage: this.btnDesignPage,
      output: this.btnOutput,
      config: this.btnConfig,
    };

    this.init();
  }

  private $<T extends HTMLElement = HTMLElement>(selector: string): T | null {
    return document.querySelector(selector) as T | null;
  }

  private init(): void {
    // Apply theme from URL params
    document.body.dataset.theme = this.searchParams.get("theme") ?? "light";

    // Set up quick button handler
    this.setupQuickButtonHandler();
    
    // Set up message listeners
    this.setupMessageListeners();
    
    // Wire topbar buttons
    this.setupTabHandlers();
    
    // Startup
    this.openTab('designPage');
  }

  private setupQuickButtonHandler(): void {
    this.$("[data-handler='create-text']")?.addEventListener("click", () => {
      parent.postMessage({ type: "create-text" }, "*");
    });
  }

  private setupMessageListeners(): void {
    window.addEventListener("message", (event: MessageEvent<PenpotMessage>) => {
      if (event.data?.source === "penpot" && event.data.theme) {
        document.body.dataset.theme = event.data.theme;
      }
    });
  }

  private setupTabHandlers(): void {
    this.btnDesignPage.addEventListener('click', () => this.openTab('designPage'));
    this.btnOutput.addEventListener('click', () => this.openTab('output'));
    this.btnConfig.addEventListener('click', () => this.openTab('config'));
  }

  /** Helper: set connection status */
  public setConnection(connected: boolean, message?: string): void {
    this.connectionStatusEl.classList.toggle('connected', connected);
    this.connectionStatusEl.classList.toggle('disconnected', !connected);
    this.connectionStatusEl.textContent = connected 
      ? `🟢 ${message ?? 'Connected'}` 
      : `🔴 ${message ?? 'Disconnected'}`;
  }

  /** Load fragment from public/shared and inject it. */
  private async loadFragment(name: 'design-body' | 'config-body'): Promise<string> {
    const url = `/shared/${name}.html`;
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
    return resp.text();
  }

  /** Open tab and render content */
  public async openTab(tab: Tab): Promise<void> {
    if (this.activeTab === tab) return;
    
    // Update tab buttons
    Object.entries(this.tabButtons).forEach(([k, btn]) => {
      const isActive = k === tab;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    
    this.activeTab = tab;

    // Show loading state
    this.tabContent.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;">
        <span class="loading-indicator" aria-hidden="true"></span>
        <span>Loading…</span>
      </div>
    `;

    try {
      if (tab === 'designPage') {
        const html = await this.loadFragment('design-body');
        this.tabContent.innerHTML = html;
        this.initDesignBindings();
      } else if (tab === 'output') {
        this.tabContent.innerHTML = `
          <div id="output-root">
            <div style="color:var(--muted)">
              No design rendered yet. Generate from Design tab.
            </div>
          </div>
        `;
      } else if (tab === 'config') {
        const html = await this.loadFragment('config-body');
        this.tabContent.innerHTML = html;
        this.initConfigBindings();
      }
    } catch (err) {
      this.tabContent.innerHTML = 
        `<div class="status error">Failed to load tab: ${String(err)}</div>`;
    }
  }

  /** When design fragment injected, wire handlers */
  private initDesignBindings(): void {
    // Design bindings implementation
  }

  /** Simple config bindings */
  private initConfigBindings(): void {
    const saveBtn = this.$<HTMLButtonElement>('#saveCfg');
    if (!saveBtn) return;
    
    saveBtn.addEventListener('click', () => {
      const endpoint = (this.$<HTMLInputElement>('#cfg-endpoint')?.value ?? '');
      const useGpu = (this.$<HTMLInputElement>('#cfg-gpu')?.checked ?? false);
      
      // Persist to localStorage (example)
      localStorage.setItem('plugin_cfg', JSON.stringify({ endpoint, useGpu }));
      this.showStatus('Config saved', 'success');
    });
  }

  /** Status helper */
  public showStatus(message: string, type: '' | 'success' | 'error'): void {
    this.statusEl.style.display = 'block';
    this.statusEl.className = 'status' + (type ? ` ${type}` : '');
    this.statusEl.textContent = message;
    
    setTimeout(() => {
      this.statusEl.style.display = 'none';
    }, 2500);
  }
}

// Initialize the plugin when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PenpotPlugin();
});