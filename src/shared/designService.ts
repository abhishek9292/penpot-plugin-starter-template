// src/shared/designService.ts
export interface GenerateRequest { designType: string; prompt: string; }

export async function generateDesignHTML(req: GenerateRequest): Promise<string> {
  try {
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (resp.ok) {
      const text = await resp.text();
      try {
        const j = JSON.parse(text);
        if (j && typeof j.html === 'string') return j.html;
      } catch { /* not JSON */ }
      return text;
    }
  } catch (err) {
    console.warn('remote generate failed', err);
  }
  // fallback
  return fallbackRenderer(req);
}

function fallbackRenderer({ designType, prompt }: GenerateRequest) {
  const esc = (s:string)=> s.replace ('&','&amp;').replace ('<','&lt;').replace ('>','&gt;');
  return `
  <div>
    <h3>Preview — ${esc(designType)}</h3>
    <div style="padding:10px;border-radius:6px;border:1px solid #e8e8e8;background:var(--bg)">
      <p style="color:var(--muted)">${esc(prompt)}</p>
      <div style="height:120px;border-radius:6px;background:linear-gradient(90deg,var(--primary),var(--primary-2))"></div>
    </div>
  </div>`;
}
