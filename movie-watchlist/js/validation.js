/* ==========================================================================
   Validation rules for the add/edit form. Pure: gets the data it needs.
   Returns { fieldName: 'message' } — an empty object means valid.
   ========================================================================== */

import { STATUSES, TYPES, clean, toInt } from './helpers.js';

const inRange = (n, min, max) => n >= min && n <= max;

export function validateMovie(raw, movies, ignoreId = null) {
  const errors = {};

  const title = clean(raw.title);
  const isDuplicate = movies.some(
    (m) => m.id !== ignoreId && m.title.toLowerCase() === title.toLowerCase()
  );
  if (!title) errors.title = 'Title is required.';
  else if (title.length < 2) errors.title = 'Title must be at least 2 characters.';
  else if (title.length > 80) errors.title = 'Title must be 80 characters or fewer.';
  else if (isDuplicate) errors.title = 'That title is already on your watchlist.';

  const genre = clean(raw.genre);
  if (!genre) errors.genre = 'Genre is required.';
  else if (genre.length > 30) errors.genre = 'Genre must be 30 characters or fewer.';

  if (!TYPES.includes(raw.type)) errors.type = 'Choose movie or series.';

  if (!inRange(toInt(raw.runtime), 1, 600)) {
    const label = raw.type === 'series' ? 'Episode length' : 'Runtime';
    errors.runtime = `${label} must be a whole number of minutes (1–600).`;
  }

  if (raw.type === 'series' && !inRange(toInt(raw.episodes), 1, 500)) {
    errors.episodes = 'Episodes must be a whole number between 1 and 500.';
  }

  if (!STATUSES.includes(raw.status)) errors.status = 'Choose a status.';

  const rating = toInt(raw.rating === '' ? 0 : raw.rating ?? 0);
  if (!inRange(rating, 0, 5)) errors.rating = 'Rating must be between 0 and 5.';
  else if (raw.status === 'watched' && rating < 1) {
    errors.rating = 'Give a watched title a rating from 1 to 5.';
  }

  return errors;
}
