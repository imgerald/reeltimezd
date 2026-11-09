/* Sample titles used on the very first run (before anything is saved). */

import { buildMovie, createId } from './helpers.js';

const SAMPLES = [
  { title: 'Dune: Part Two', type: 'movie', genre: 'Sci-Fi', runtime: 166, status: 'watched', rating: 5 },
  { title: 'Arcane', type: 'series', genre: 'Animation', runtime: 40, episodes: 9, status: 'watching' },
  { title: 'The Grand Budapest Hotel', type: 'movie', genre: 'Comedy', runtime: 99, status: 'planned' },
  { title: 'Severance', type: 'series', genre: 'Thriller', runtime: 50, episodes: 9, status: 'planned' },
  { title: 'Spirited Away', type: 'movie', genre: 'Animation', runtime: 125, status: 'planned' },
];

export const seedMovies = () => {
  const now = Date.now();
  return SAMPLES.map((sample, i) => buildMovie(sample, createId(), now - i));
};
