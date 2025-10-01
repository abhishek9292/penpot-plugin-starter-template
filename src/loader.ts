// src/loader.ts
export async function loadFragment(name: 'design-body' | 'config-body'): Promise<string> {
  const url = `/shared/${name}.html`;
  const resp = await fetch(url, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
  return resp.text();
}
