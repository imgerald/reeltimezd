/* ==========================================================================
   MODEL  (js/model.js)
   Owns ALL data in one exported `state` object, exposes functions that change
   it, and saves to / loads from localStorage (through LocalStore).
   MUST NEVER touch the DOM or import any view.

   Helper modules (pure, no state of their own):
     storage.js     LocalStore class (localStorage wrapper)
     helpers.js     id / number / movie-building helpers
     validation.js  form validation rules
     stats.js       derived values (totals, binge plan, genre share)
     seed.js        first-run sample data
   ========================================================================== */

import LocalStore from './storage.js';
import { STATUSES, TYPES, buildMovie, createId, restoreMovie, toInt, totalMinutesOf } from './helpers.js';
import { validateMovie as validate } from './validation.js';
import { computeStats } from './stats.js';
import { seedMovies } from './seed.js';

export { STATUSES, TYPES };
export const SORTS = ['added', 'title', 'runtime', 'rating'];

const store = new LocalStore('movieWatchlist.v1');

/** The single source of truth. Views never receive this object directly. */
export const state = {
  movies: [], // { id, title, type, genre, runtime, episodes, status, rating, addedAt }
  filter: 'all', // 'all' | one of STATUSES
  query: '', // search text (not persisted)
  sort: 'added', // one of SORTS
  hoursInput: '2', // raw text typed in the "hours per day" box
  editingId: null, // id of the movie being edited (not persisted)
};

const findMovie = (id) => state.movies.find((m) => m.id === id);

/* ---------- persistence ---------- */

export function saveState() {
  const { movies, filter, sort, hoursInput } = state;
  return store.save({ movies, filter, sort, hoursInput });
}

/** Loads saved data. Returns true if saved data existed, false on first run. */
export function loadState() {
  const saved = store.load();
  if (saved === null) {
    state.movies = seedMovies();
    saveState();
    return false;
  }
  state.movies = Array.isArray(saved.movies) ? saved.movies.map(restoreMovie).filter(Boolean) : [];
  if (saved.filter === 'all' || STATUSES.includes(saved.filter)) state.filter = saved.filter;
  if (SORTS.includes(saved.sort)) state.sort = saved.sort;
  if (typeof saved.hoursInput === 'string') state.hoursInput = saved.hoursInput;
  return true;
}

/* ---------- CRUD ---------- */

export const validateMovie = (raw, ignoreId = null) => validate(raw, state.movies, ignoreId);

/** CREATE. Returns { ok, errors, movie? }. */
export function addMovie(raw) {
  const errors = validateMovie(raw);
  if (Object.keys(errors).length) return { ok: false, errors };
  const movie = buildMovie(raw, createId(), Date.now());
  state.movies.push(movie);
  saveState();
  return { ok: true, errors: {}, movie };
}

/** READ one (a copy, so callers cannot mutate state). */
export function getMovie(id) {
  const movie = findMovie(id);
  return movie ? { ...movie } : null;
}

/** UPDATE. Returns { ok, errors }. */
export function updateMovie(id, raw) {
  const index = state.movies.findIndex((m) => m.id === id);
  if (index === -1) {
    state.editingId = null;
    return { ok: false, errors: { form: 'That title no longer exists.' } };
  }
  const errors = validateMovie(raw, id);
  if (Object.keys(errors).length) return { ok: false, errors };
  state.movies[index] = buildMovie(raw, id, state.movies[index].addedAt);
  state.editingId = null;
  saveState();
  return { ok: true, errors: {} };
}

/** DELETE. Returns true if something was removed. */
export function deleteMovie(id) {
  const before = state.movies.length;
  state.movies = state.movies.filter((m) => m.id !== id);
  if (state.editingId === id) state.editingId = null;
  const removed = state.movies.length < before;
  if (removed) saveState();
  return removed;
}

export function setStatus(id, status) {
  const movie = findMovie(id);
  if (!movie || !STATUSES.includes(status)) return false;
  movie.status = status;
  saveState();
  return true;
}

/** Sets a 1–5 rating; choosing the current rating again clears it (0). */
export function setRating(id, rating) {
  const movie = findMovie(id);
  const value = toInt(rating);
  if (!movie || !(value >= 1 && value <= 5)) return false;
  movie.rating = movie.rating === value ? 0 : value;
  saveState();
  return true;
}

/* ---------- editing / view options ---------- */

export function startEditing(id) {
  if (!findMovie(id)) return false;
  state.editingId = id;
  return true;
}

export const stopEditing = () => {
  state.editingId = null;
};

export const getEditingMovie = () => (state.editingId ? getMovie(state.editingId) : null);

export function setFilter(filter) {
  if (filter !== 'all' && !STATUSES.includes(filter)) return false;
  state.filter = filter;
  saveState();
  return true;
}

export const setQuery = (query) => {
  state.query = String(query ?? '');
};

export function setSort(sort) {
  if (!SORTS.includes(sort)) return false;
  state.sort = sort;
  saveState();
  return true;
}

export function setHoursInput(text) {
  state.hoursInput = String(text ?? '').slice(0, 8);
  saveState();
}

/* ---------- reading / derived values ---------- */

const SORTERS = {
  added: (a, b) => b.addedAt - a.addedAt,
  title: (a, b) => a.title.localeCompare(b.title),
  runtime: (a, b) => b.totalMinutes - a.totalMinutes,
  rating: (a, b) => b.rating - a.rating || a.title.localeCompare(b.title),
};

/** Movies after applying filter, search and sort. Each gets `totalMinutes`. */
export function getMovies() {
  const query = state.query.trim().toLowerCase();
  const matches = (m) =>
    (state.filter === 'all' || m.status === state.filter) &&
    (!query || m.title.toLowerCase().includes(query) || m.genre.toLowerCase().includes(query));

  return state.movies
    .filter(matches)
    .map((m) => ({ ...m, totalMinutes: totalMinutesOf(m) }))
    .sort(SORTERS[state.sort]);
}

export function getFilterInfo() {
  const counts = { all: state.movies.length };
  STATUSES.forEach((s) => {
    counts[s] = state.movies.filter((m) => m.status === s).length;
  });
  return { filter: state.filter, query: state.query, sort: state.sort, counts };
}

/** Derived values, recomputed from scratch on every call (see stats.js). */
export const getStats = () => computeStats(state.movies, state.hoursInput);
