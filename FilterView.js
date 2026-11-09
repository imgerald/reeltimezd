/* ==========================================================================
   FilterView — status tabs (with counts), search box and sort menu.
   ========================================================================== */

import View from './View.js';

const TABS = [
  ['all', 'All'],
  ['planned', 'Planned'],
  ['watching', 'Watching'],
  ['watched', 'Watched'],
];

const SORT_OPTIONS = [
  ['added', 'Newest first'],
  ['title', 'Title A–Z'],
  ['runtime', 'Longest first'],
  ['rating', 'Top rated'],
];

export default class FilterView extends View {
  /** data = { filter, query, sort, counts } */
  template({ filter, query, sort, counts }) {
    const tabs = TABS.map(
      ([value, label]) =>
        `<button type="button" class="tab${filter === value ? ' active' : ''}" data-filter="${value}" aria-pressed="${filter === value}">${label} <span class="count">${counts[value] ?? 0}</span></button>`
    ).join('');

    const sortOptions = SORT_OPTIONS.map(
      ([value, label]) => `<option value="${value}"${sort === value ? ' selected' : ''}>${label}</option>`
    ).join('');

    return `
      <div class="tabs" role="group" aria-label="Filter by status">${tabs}</div>
      <div class="toolbar-row">
        <label class="sr-only" for="search">Search titles or genres</label>
        <input id="search" type="search" placeholder="Search title or genre…" value="${View.escape(query)}" autocomplete="off">
        <label class="sr-only" for="sort">Sort by</label>
        <select id="sort">${sortOptions}</select>
      </div>
    `;
  }

  /* ---------- handlers the controller subscribes to ---------- */

  onFilter(fn) {
    this.listen('click', '[data-filter]', (event, button) => fn(button.dataset.filter));
  }

  onSearch(fn) {
    this.listen('input', '#search', (event, input) => fn(input.value));
  }

  onSort(fn) {
    this.listen('change', '#sort', (event, select) => fn(select.value));
  }
}
