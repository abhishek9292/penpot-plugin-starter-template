// src/main.ts
import { initTabButtons, openTab } from './tabs/index';
import { connectionStatusEl } from './dom';

// small initial check (non-blocking)
async function initialCheck() {
  try {
    const resp = await fetch('/api/ping', { method: 'GET' });
    const cs = connectionStatusEl;
    if (cs) {
      if (resp.ok) cs.textContent = '🟢 Local API OK';
      else cs.textContent = `🔴 API ${resp.status}`;
      cs.classList.toggle('connected', resp.ok);
      cs.classList.toggle('disconnected', !resp.ok);
    }
  } catch {
    const cs = connectionStatusEl;
    if (cs) { cs.textContent = '🔴 No local API'; cs.classList.add('disconnected'); }
  }
}

initTabButtons();
initialCheck().finally(() => openTab('designPage'));
