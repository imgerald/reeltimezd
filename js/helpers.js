/* ==========================================================================
   Pure data helpers shared by the model modules. No state, no DOM.
   ========================================================================== */

export const STATUSES = ['planned', 'watching', 'watched'];
export const TYPES = ['movie', 'series'];

const randomPart = () => Math.random().toString(36).slice(2, 8);

export const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `m_${Date.now().toString(36)}${randomPart()}`;

/** Whole non-negative number from text/number, otherwise NaN. */
export const toInt = (value) => {
  const text = String(value ?? '').trim();
  return /^\d+$/.test(text) ? Number(text) : NaN;
};

/** Trim and collapse whitespace. */
export const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

export const totalMinutesOf = (movie) => movie.runtime * movie.episodes;

/** Local date as "YYYY-MM-DD". */
export const isoDate = (date) => {
  const pad = (n, size = 2) => String(n).padStart(size, '0');
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Raw form data -> a clean movie object. */
export function buildMovie(raw, id, addedAt) {
  const type = raw.type === 'series' ? 'series' : 'movie';
  const rating = toInt(raw.rating === '' ? 0 : raw.rating ?? 0);
  return {
    id,
    title: clean(raw.title),
    type,
    genre: clean(raw.genre),
    runtime: toInt(raw.runtime),
    episodes: type === 'series' ? toInt(raw.episodes) : 1,
    status: raw.status,
    rating: Number.isNaN(rating) ? 0 : rating,
    addedAt,
  };
}

/** Defensive loader for items read back from localStorage (null if unusable). */
export function restoreMovie(item) {
  if (!item || typeof item !== 'object') return null;
  const movie = buildMovie(item, String(item.id || createId()), Number(item.addedAt) || Date.now());
  if (!movie.title || !(movie.runtime >= 1)) return null;
  if (!(movie.episodes >= 1)) movie.episodes = 1;
  if (!STATUSES.includes(movie.status)) movie.status = 'planned';
  if (movie.rating > 5) movie.rating = 0;
  return movie;
}
