/* ==========================================================================
   BASE VIEW  (js/views/View.js)
   Every view extends this class. A view:
     - builds markup from the data it is given (template + render)
     - exposes handler methods the controller subscribes to (onSomething)
   MUST NEVER change state directly or import the model.
   ========================================================================== */

export default class View {
  constructor(root) {
    const element = typeof root === 'string' ? document.querySelector(root) : root;
    if (!element) throw new Error(`View root not found: ${root}`);
    this.root = element;
  }

  /** Subclasses override this and return an HTML string for the given data. */
  template() {
    return '';
  }

  render(data) {
    this.data = data;
    this.update(this.template(data));
  }

  /**
   * Replaces the markup but keeps keyboard focus (and the caret) on the same
   * element when it has an id, so typing in an input survives a re-render.
   */
  update(html) {
    const active = document.activeElement;
    const keepId = active && active !== document.body && this.root.contains(active) ? active.id : '';
    let start = null;
    let end = null;
    if (keepId) {
      try {
        start = active.selectionStart;
        end = active.selectionEnd;
      } catch {
        /* element has no caret */
      }
    }

    this.root.innerHTML = html;

    if (keepId) {
      const next = this.root.querySelector(`#${CSS.escape(keepId)}`);
      if (next) {
        next.focus();
        try {
          if (start !== null && start !== undefined) next.setSelectionRange(start, end);
        } catch {
          /* ignore */
        }
      }
    }
  }

  /**
   * Event delegation: one listener on the root that survives re-renders.
   * handler(event, matchedElement)
   */
  listen(type, selector, handler) {
    this.root.addEventListener(type, (event) => {
      const target = event.target instanceof Element ? event.target.closest(selector) : null;
      if (target && this.root.contains(target)) handler(event, target);
    });
  }

  /* ---------- shared formatting helpers ---------- */

  static escape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** 125 -> "2h 5m", 45 -> "45m", 120 -> "2h" */
  static formatMinutes(total) {
    const minutes = Math.max(0, Math.round(total));
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }

  /** "2026-11-18" -> "Wed, Nov 18" */
  static formatDate(iso) {
    const date = new Date(`${iso}T00:00:00`);
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
}
