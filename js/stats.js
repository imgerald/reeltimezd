/* ==========================================================================
   Derived values (totals, progress, average rating, binge plan, genre share).
   Pure functions: given the data, they return numbers — nothing is stored.
   ========================================================================== */

import { isoDate, totalMinutesOf } from './helpers.js';

/** Days needed = remaining time / time available per day. */
export function planBinge(remainingMinutes, hoursInput) {
  const text = String(hoursInput).trim();
  const hours = Number(text);

  const invalid = (hoursError) => ({ hoursError, daysToFinish: null, finishDate: null });

  if (text === '') return invalid('Enter how many hours you can watch per day.');
  if (!Number.isFinite(hours) || hours < 0.25 || hours > 24) {
    return invalid('Use a number between 0.25 and 24.');
  }

  const daysToFinish = remainingMinutes === 0 ? 0 : Math.ceil(remainingMinutes / (hours * 60));
  let finishDate = null;
  if (daysToFinish > 0) {
    const finish = new Date();
    finish.setDate(finish.getDate() + daysToFinish - 1); // day 1 is today
    finishDate = isoDate(finish);
  }
  return { hoursError: '', daysToFinish, finishDate };
}

export function computeStats(movies, hoursInput) {
  const sum = (list) => list.reduce((total, m) => total + totalMinutesOf(m), 0);
  const watched = movies.filter((m) => m.status === 'watched');
  const rated = movies.filter((m) => m.rating > 0);

  const totalMinutes = sum(movies);
  const watchedMinutes = sum(watched);
  const remainingMinutes = totalMinutes - watchedMinutes;

  const minutesByGenre = new Map();
  movies.forEach((m) => minutesByGenre.set(m.genre, (minutesByGenre.get(m.genre) ?? 0) + totalMinutesOf(m)));
  const genres = [...minutesByGenre]
    .map(([name, minutes]) => ({ name, minutes, sharePct: Math.round((minutes / totalMinutes) * 100) }))
    .sort((a, b) => b.minutes - a.minutes);

  return {
    count: movies.length,
    watchedCount: watched.length,
    totalMinutes,
    watchedMinutes,
    remainingMinutes,
    completionPct: totalMinutes ? Math.round((watchedMinutes / totalMinutes) * 100) : 0,
    avgRating: rated.length ? rated.reduce((s, m) => s + m.rating, 0) / rated.length : null,
    ratedCount: rated.length,
    hoursInput,
    genres,
    ...planBinge(remainingMinutes, hoursInput),
  };
}
