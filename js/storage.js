/* ==========================================================================
   LocalStore — a tiny wrapper around localStorage (no DOM, no views).
   Used by model.js so the model stays short and storage is easy to swap.
   ========================================================================== */

export default class LocalStore {
  constructor(key) {
    this.key = key;
  }

  /** Returns the saved object, null if nothing is saved yet, {} if corrupted. */
  load() {
    try {
      const raw = globalThis.localStorage?.getItem(this.key) ?? null;
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return {}; // unreadable data: caller starts clean instead of crashing
    }
  }

  /** Returns true if the data was written. */
  save(data) {
    try {
      globalThis.localStorage.setItem(this.key, JSON.stringify(data));
      return true;
    } catch {
      return false; // storage blocked or full
    }
  }
}
