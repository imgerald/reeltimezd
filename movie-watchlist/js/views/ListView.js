/* ==========================================================================
   ListView — the watchlist itself: one card per title with inline status,
   rating, edit and delete controls.
   ========================================================================== */

import View from './View.js';

const STATUS_LABELS = { planned: 'Planned', watching: 'Watching', watched: 'Watched' };

export default class ListView extends View { 
  selectedId = null;
  /** data = { movies, totalCount, editingId } */
  template({ movies, totalCount, editingId }) {
    if (movies.length === 0) {
      return totalCount === 0
        ? `<div class="empty"><p class="empty-title">Your watchlist is empty.</p><p>Add your first movie or series using the form.</p></div>`
        : `<div class="empty"><p class="empty-title">No titles match.</p><p>Try another filter or search term.</p></div>`;
    }
    return `<ul class="cards">${movies.map((m) => this.card(m, editingId)).join('')}</ul>`;
  }

  card(movie, editingId) {
    const esc = View.escape;
    const id = esc(movie.id);
    const detail =
      movie.type === 'series'
        ? `${movie.episodes} × ${View.formatMinutes(movie.runtime)} = ${View.formatMinutes(movie.totalMinutes)}`
        : View.formatMinutes(movie.totalMinutes);

    const statusOptions = Object.entries(STATUS_LABELS)
      .map(([value, label]) => `<option value="${value}"${movie.status === value ? ' selected' : ''}>${label}</option>`)
      .join('');

    const stars = [1, 2, 3, 4, 5]
      .map(
        (n) =>
          `<button type="button" class="star${n <= movie.rating ? ' on' : ''}" data-action="rate" data-id="${id}" data-rating="${n}" aria-pressed="${n <= movie.rating}" aria-label="Rate ${n} out of 5">★</button>`
      )
      .join('');

    return `
     <li class="card status-${esc(movie.status)}${movie.id === editingId ? ' is-editing' : ''}${movie.id === this.selectedId ? ' is-selected' : ''}"
    data-card-id="${id}"
    tabindex="0"
    aria-selected="${movie.id === this.selectedId}">
        <div class="card-main">
          <h3 class="card-title">${esc(movie.title)}</h3>
          <p class="meta">
            <span class="tag tag-type">${movie.type === 'series' ? 'Series' : 'Movie'}</span>
            <span class="tag">${esc(movie.genre)}</span>
            <span class="runtime">${detail}</span>
          </p>
        </div>
        <div class="card-controls">
          <select class="status-select" data-action="status" data-id="${id}" aria-label="Status of ${esc(movie.title)}">${statusOptions}</select>
          <div class="stars" role="group" aria-label="Rating">${stars}</div>
          <div class="card-buttons">
            <button type="button" class="btn btn-small" data-action="edit" data-id="${id}">Edit</button>
            <button type="button" class="btn btn-small btn-danger" data-action="delete" data-id="${id}" data-title="${esc(movie.title)}">Delete</button>
          </div>
        </div>
      </li>
    `;
  }

  /* ---------- handlers the controller subscribes to ---------- */
onSelect() {
  this.listen('click', '[data-card-id]', (event, card) => {
    if (event.target.closest('button, select, input')) return;

    this.selectedId = card.dataset.cardId;

    this.root.querySelectorAll('[data-card-id]').forEach(item => {
      const selected = item.dataset.cardId === this.selectedId;

      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', String(selected));
    });
  });
}
  onEdit(fn) {
    this.listen('click', '[data-action="edit"]', (event, button) => fn(button.dataset.id));
  }

  onDelete(fn) {
    this.listen('click', '[data-action="delete"]', (event, button) => {
      if (window.confirm(`Delete "${button.dataset.title}" from your watchlist?`)) fn(button.dataset.id);
    });
  }

  onStatusChange(fn) {
    this.listen('change', '[data-action="status"]', (event, select) => fn(select.dataset.id, select.value));
  }

  onRate(fn) {
    this.listen('click', '[data-action="rate"]', (event, button) => fn(button.dataset.id, Number(button.dataset.rating)));
  }
}
