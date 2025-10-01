// src/tabs/index.ts
import { btnDesignPage, btnOutput, btnConfig, tabContent } from '../dom';

export type TabKey = 'designPage' | 'output' | 'config';
let active: TabKey | null = null;

function setActiveButton(tab: TabKey) {
  const map: Record<TabKey, HTMLButtonElement | null> = {
    designPage: btnDesignPage,
    output: btnOutput,
    config: btnConfig,
  };
  (Object.keys(map) as TabKey[]).forEach(k => {
    const btn = map[k];
    const isActive = k === tab;
    btn?.classList.toggle('active', isActive);
    btn?.setAttribute('aria-pressed', String(isActive));
  });
}

async function importTabModule(tab: TabKey) {
  // dynamic import -> each tab in its own chunk
  if (tab === 'designPage') return import('./designPage');
  if (tab === 'output') return import('./output');
  return import('./config');
}

export async function openTab(tab: TabKey) {
  if (active === tab) return;
  setActiveButton(tab);
  active = tab;

  if (!tabContent) return;
  tabContent.innerHTML = `<div style="display:flex;gap:8px;align-items:center;"><span class="loading-indicator" aria-hidden="true"></span><span>Loading…</span></div>`;

  try {
    const mod = await importTabModule(tab);
    // each module exports mount(tabContent)
    await mod.mount(tabContent);
  } catch (err) {
    tabContent.innerHTML = `<div class="status error">Failed to load tab: ${String(err)}</div>`;
  }
}

export function initTabButtons() {
  btnDesignPage?.addEventListener('click', () => openTab('designPage'));
  btnOutput?.addEventListener('click', () => openTab('output'));
  btnConfig?.addEventListener('click', () => openTab('config'));
}
