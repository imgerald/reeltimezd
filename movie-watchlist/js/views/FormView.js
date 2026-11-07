/* ==========================================================================
   FormView — the add / edit form. Shows validation errors it is given.
   ========================================================================== */

import View from './View.js';

const DEFAULTS = {
  title: '',
  type: 'movie',
  genre: '',
  runtime: '',
  episodes: '1',
  status: 'planned',
  rating: '0',
};

const TYPE_OPTIONS = [
  ['movie', 'Movie'],
  ['series', 'Series'],
];
const STATUS_OPTIONS = [
  ['planned', 'Planned'],
  ['watching', 'Watching'],
  ['watched', 'Watched'],
];
const RATING_OPTIONS = [
  ['0', 'Not rated'],
  ['1', '1 ★'],
  ['2', '2 ★★'],
  ['3', '3 ★★★'],
  ['4', '4 ★★★★'],
  ['5', '5 ★★★★★'],
];

export default class FormView extends View {
  constructor(root) {
    super(root);
    // Local UI behaviour only: episodes only apply to series.
    this.listen('change', '#f-type', (event, select) => this.syncEpisodes(select.value));
  }

  /** data = { values, errors, editing } */
  template({ values = {}, errors = {}, editing = false }) {
    const v = { ...DEFAULTS, ...values };
    const esc = View.escape;
    const errorCount = Object.keys(errors).length;

    const options = (list, selected) =>
      list
        .map(([value, label]) => `<option value="${value}"${String(selected) === value ? ' selected' : ''}>${label}</option>`)
        .join('');
    const invalid = (name) => (errors[name] ? ` aria-invalid="true" aria-describedby="err-${name}"` : '');
    const message = (name) =>
      errors[name] ? `<p class="field-error" id="err-${name}" role="alert">${esc(errors[name])}</p>` : '';

    const summary = errorCount
      ? `<div class="form-alert" role="alert">${
          errors.form
            ? esc(errors.form)
            : `Please fix ${errorCount === 1 ? '1 field' : `${errorCount} fields`} before saving.`
        }</div>`
      : '';

    return `
      <h2 class="panel-title">${editing ? 'Edit title' : 'Add a title'}</h2>
      ${summary}
      <form id="movie-form" novalidate>
        <div class="field">
          <label for="f-title">Title</label>
          <input id="f-title" name="title" type="text" value="${esc(v.title)}" placeholder="e.g. Inception"${invalid('title')}>
          ${message('title')}
        </div>

        <div class="field-row">
          <div class="field">
            <label for="f-type">Type</label>
            <select id="f-type" name="type"${invalid('type')}>${options(TYPE_OPTIONS, v.type)}</select>
            ${message('type')}
          </div>
          <div class="field">
            <label for="f-genre">Genre</label>
            <input id="f-genre" name="genre" type="text" value="${esc(v.genre)}" placeholder="e.g. Sci-Fi"${invalid('genre')}>
            ${message('genre')}
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="f-runtime">Minutes (per movie / episode)</label>
            <input id="f-runtime" name="runtime" type="number" min="1" step="1" value="${esc(v.runtime)}" placeholder="120"${invalid('runtime')}>
            ${message('runtime')}
          </div>
          <div class="field">
            <label for="f-episodes">Episodes</label>
            <input id="f-episodes" name="episodes" type="number" min="1" step="1" value="${esc(v.type === 'series' ? v.episodes : 1)}"${v.type === 'series' ? '' : ' disabled'}${invalid('episodes')}>
            ${message('episodes')}
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="f-status">Status</label>
            <select id="f-status" name="status"${invalid('status')}>${options(STATUS_OPTIONS, v.status)}</select>
            ${message('status')}
          </div>
          <div class="field">
            <label for="f-rating">Rating</label>
            <select id="f-rating" name="rating"${invalid('rating')}>${options(RATING_OPTIONS, v.rating)}</select>
            ${message('rating')}
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${editing ? 'Save changes' : 'Add to watchlist'}</button>
          ${editing ? '<button type="button" class="btn" data-action="cancel">Cancel</button>' : ''}
        </div>
      </form>
    `;
  }

  render(data) {
    super.render(data);
    if (data.errors && Object.keys(data.errors).length) {
      const firstBad = this.root.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
    }
  }

  /* ---------- handlers the controller subscribes to ---------- */

  /** fn(formData) — receives the raw field values as an object. */
  onSubmit(fn) {
    this.listen('submit', '#movie-form', (event, form) => {
      event.preventDefault();
      fn(Object.fromEntries(new FormData(form)));
    });
  }

  onCancel(fn) {
    this.listen('click', '[data-action="cancel"]', () => fn());
  }

  /* ---------- small UI helpers ---------- */

  syncEpisodes(type) {
    const episodes = this.root.querySelector('#f-episodes');
    if (!episodes) return;
    episodes.disabled = type !== 'series';
    if (type !== 'series') episodes.value = '1';
  }

  /** Scrolls the form into view and focuses the title (used when editing). */
  reveal() {
    this.root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const title = this.root.querySelector('#f-title');
    if (title) title.focus({ preventScroll: true });
  }
}
