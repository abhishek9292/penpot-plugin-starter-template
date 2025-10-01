// src/main.ts

import "./style.css" 
/**
 * Basic typing for messages — loosened to `any` for compatibility.
 * Add stricter types later if you want.
 */
type PenpotMessage = any;

/* ---------------------------
   Apply theme from URL params
   --------------------------- */
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";


function $<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector(selector) as T | null;
}
/* ---------------------------
   Expose quick button handler
   (if you still have data-handler elements)
   --------------------------- */
$("[data-handler='create-text']")?.addEventListener("click", () => {
  // keep targetOrigin strict in production if possible
  parent.postMessage({ type: "create-text" }, "*");
});



/* ---------------------------
   Forward any other global message handling (if needed)
   --------------------------- */
window.addEventListener("message", (event: MessageEvent<PenpotMessage>) => {
  // this was in your small snippet — keep it as global if plugins send theme updates
  if (event.data?.source === "penpot" && event.data.theme) {
    document.body.dataset.theme = event.data.theme;
  }
});


type Tab = 'designPage' | 'output' | 'config';

const connectionStatusEl = document.getElementById('connectionStatus') as HTMLDivElement;
const btnDesignPage = document.getElementById('btn-designPage') as HTMLButtonElement;
const btnOutput = document.getElementById('btn-output') as HTMLButtonElement;
const btnConfig = document.getElementById('btn-config') as HTMLButtonElement;
const tabContent = document.getElementById('tabContent') as HTMLDivElement;
const statusEl = document.getElementById('status') as HTMLDivElement;

const tabButtons: Record<Tab, HTMLButtonElement> = {
  designPage: btnDesignPage,
  output: btnOutput,
  config: btnConfig,
};

let activeTab: Tab | null = null;

/** Helper: set connection status */
function setConnection(connected: boolean, message?: string) {
  connectionStatusEl.classList.toggle('connected', connected);
  connectionStatusEl.classList.toggle('disconnected', !connected);
  connectionStatusEl.textContent = connected ? `🟢 ${message ?? 'Connected'}` : `🔴 ${message ?? 'Disconnected'}`;
}

/** Load fragment from public/shared and inject it. */
async function loadFragment(name: 'design-body' | 'config-body') {
  const url = `/shared/${name}.html`;
  const resp = await fetch(url, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
  return resp.text();
}

/** Open tab and render content */
async function openTab(tab: Tab) {
  if (activeTab === tab) return;
  Object.entries(tabButtons).forEach(([k, btn]) => {
    const isActive = k === tab;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
  activeTab = tab;

  tabContent.innerHTML = `<div style="display:flex;gap:8px;align-items:center;"><span class="loading-indicator" aria-hidden="true"></span><span>Loading…</span></div>`;

  try {
    if (tab === 'designPage') {
      const html = await loadFragment('design-body');
      tabContent.innerHTML = html;
      initDesignBindings(); // wire form + examples now that DOM is injected
    } else if (tab === 'output') {
      // output tab: if a design was generated, show last HTML or show hint
      tabContent.innerHTML = `<div id="output-root"><div style="color:var(--muted)">No design rendered yet. Generate from Design tab.</div></div>`;
    } else if (tab === 'config') {
      const html = await loadFragment('config-body');
      tabContent.innerHTML = html;
      initConfigBindings();
    }
  } catch (err) {
    tabContent.innerHTML = `<div class="status error">Failed to load tab: ${String(err)}</div>`;
  }
}

/** When design fragment injected, wire handlers */
function initDesignBindings() {
   
}

/** Simple config bindings */
function initConfigBindings() {
  const saveBtn = document.getElementById('saveCfg') as HTMLButtonElement | null;
  if (!saveBtn) return;
  saveBtn.addEventListener('click', () => {
    const endpoint = (document.getElementById('cfg-endpoint') as HTMLInputElement | null)?.value ?? '';
    const useGpu = (document.getElementById('cfg-gpu') as HTMLInputElement | null)?.checked ?? false;
    // persist to localStorage (example)
    localStorage.setItem('plugin_cfg', JSON.stringify({ endpoint, useGpu }));
    showStatus('Config saved', 'success');
  });
}

/** status helper */
function showStatus(message: string, type: '' | 'success' | 'error') {
  statusEl.style.display = 'block';
  statusEl.className = 'status' + (type ? ` ${type}` : '');
  statusEl.textContent = message;
  setTimeout(() => {
    // auto-hide after short delay
    statusEl.style.display = 'none';
  }, 2500);
}
 
// wire topbar buttons
btnDesignPage.addEventListener('click', () => openTab('designPage'));
btnOutput.addEventListener('click', () => openTab('output'));
btnConfig.addEventListener('click', () => openTab('config'));

// startup
openTab('designPage')