// src/tabs/designPage.ts
import { loadFragment } from '../loader';
import { generateDesignHTML } from '../shared/designService';
import * as state from '../state';
import { showStatus, setConnection,getEl } from '../util'; // small helpers below

// small inline helpers to avoid circular imports - you can move to util.ts if you prefer
 

export async function mount(tabContent: HTMLElement): Promise<void> {
  const html = await loadFragment('design-body');
  tabContent.innerHTML = html;

  const form = getEl<HTMLFormElement>('designForm');
  const generateBtn = getEl<HTMLButtonElement>('generateBtn');
  const examplesRoot = getEl<HTMLElement>('examples');

  if (!form) return;

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const designType = (fd.get('designType') as string) || 'custom';
    const prompt = (fd.get('prompt') as string) || '';

    if (generateBtn) generateBtn.classList.add('loading');
    showStatus('Generating…');

    try {
      const html = await generateDesignHTML({ designType, prompt });
      state.setLastOutput(html);
      showStatus('Design generated', 'success');
      setConnection(true, 'Local model reachable');
    } catch (err) {
      console.error(err);
      showStatus(`Generate failed: ${String(err)}`, 'error');
      setConnection(false, 'Model unavailable');
    } finally {
      if (generateBtn) generateBtn.classList.remove('loading');
    }
  });

  if (examplesRoot) {
    examplesRoot.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.example-item') as HTMLElement | null;
      if (!target) return;
      const type = target.getAttribute('data-type') ?? 'custom';
      const prompt = target.textContent?.trim() ?? '';
      (getEl<HTMLSelectElement>('designType'))!.value = type;
      (getEl<HTMLTextAreaElement>('prompt'))!.value = prompt;
      form.requestSubmit();
    });
  }
}
 