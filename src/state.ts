// src/state.ts
// Minimal shared state for last generated HTML
let lastOutputHtml = '';

export function setLastOutput(html: string) { lastOutputHtml = html; localStorage.setItem('last_output_html', html); }
export function getLastOutput(): string {
  if (!lastOutputHtml) lastOutputHtml = localStorage.getItem('last_output_html') ?? '';
  return lastOutputHtml;
}
