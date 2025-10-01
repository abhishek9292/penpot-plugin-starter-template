// src/util.ts
// Small UI utility helpers used across tab modules.
// Keeps DOM manipulation centralized and predictable.

import { connectionStatusEl, statusEl } from './dom';

let hideTimer: number | null = null;

/**
 * Update the connection status badge (left top).
 * @param connected - true = connected, false = disconnected
 * @param message - optional short message to display after the icon
 */
export function setConnection(connected: boolean, message?: string): void {
  if (!connectionStatusEl) return;
  connectionStatusEl.classList.toggle('connected', connected);
  connectionStatusEl.classList.toggle('disconnected', !connected);

  // Use explicit text so consumers don't guess semantics
  connectionStatusEl.textContent = connected
    ? `🟢 ${message ?? 'Connected'}`
    : `🔴 ${message ?? 'Disconnected'}`;
}

/**
 * Show a transient status message in the UI.
 * @param msg - text to show
 * @param type - '' | 'success' | 'error' (controls styling)
 * @param autoHideMs - milliseconds to auto-hide; set 0 to keep visible
 */
export function showStatus(msg: string, type: '' | 'success' | 'error' = '', autoHideMs = 2500): void {
  if (!statusEl) return;

  // Clear previous timer if present
  if (hideTimer) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }

  statusEl.style.display = 'block';
  statusEl.className = 'status' + (type ? ` ${type}` : '');
  statusEl.textContent = msg;

  if (autoHideMs > 0) {
    hideTimer = window.setTimeout(() => {
      if (!statusEl) return;
      statusEl.style.display = 'none';
      hideTimer = null;
    }, autoHideMs);
  }
}

/**
 * Safely set innerHTML of an element. Use only when content is trusted.
 * If content might be untrusted, sanitize before calling this.
 * @param el - target element
 * @param html - html string to set
 */
export function setInnerHTML(el: HTMLElement | null, html: string): void {
  if (!el) return;
  el.innerHTML = html;
}



// append to src/util.ts

/** Return element by id typed to T, or null if not found. */
export function getEl<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

/** Return element by id typed to T, or throw if not found (use when element is required). */
export function getElOrThrow<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Required element with id "${id}" not found`);
  return el as T;
}

/** Query selector variant with optional root element. */
export function qs<T extends HTMLElement = HTMLElement>(selector: string, root: ParentNode = document): T | null {
  return root.querySelector(selector) as T | null;
}