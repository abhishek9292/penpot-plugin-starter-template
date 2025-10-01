// src/tabs/config.ts
import { loadFragment } from '../loader';

export async function mount(tabContent: HTMLElement): Promise<void> {
  const html = await loadFragment('config-body');
  tabContent.innerHTML = html;

  const saveBtn = document.getElementById('saveCfg') as HTMLButtonElement | null;
  saveBtn?.addEventListener('click', () => {
    const endpoint = (document.getElementById('cfg-endpoint') as HTMLInputElement | null)?.value ?? '';
    const useGpu = (document.getElementById('cfg-gpu') as HTMLInputElement | null)?.checked ?? false;
    localStorage.setItem('plugin_cfg', JSON.stringify({ endpoint, useGpu }));
    const s = document.getElementById('status') as HTMLDivElement | null;
    if (s) { s.style.display='block'; s.className='status success'; s.textContent='Config saved'; setTimeout(()=> s.style.display='none', 2000); }
  });
}
