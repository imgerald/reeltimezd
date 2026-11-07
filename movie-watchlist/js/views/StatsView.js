/* ==========================================================================
   StatsView — derived values: totals, progress, average rating, genre share,
   and the Binge Planner ("how many days until I've watched everything?").
   The planner result recomputes on every keystroke in the hours box.
   ========================================================================== */

import View from './View.js';

const PRESET_HOURS = ['1', '2', '3', '4'];

export default class StatsView extends View {
  /** data = the stats object computed by the model */
  template(stats) {
    const esc = View.escape;
    const fmt = View.formatMinutes;

    const presets = PRESET_HOURS.map(
      (h) =>
        `<button type="button" class="chip${stats.hoursInput.trim() === h ? ' active' : ''}" data-hours="${h}">${h}h</button>`
    ).join('');

    let result;
    if (stats.hoursError) {
      result = `<p class="field-error" id="err-hours" role="alert">${esc(stats.hoursError)}</p>`;
    } else if (stats.remainingMinutes === 0) {
      result = `<p class="planner-result"><strong>All caught up!</strong> Nothing left to watch — add something new.</p>`;
    } else {
      const days = stats.daysToFinish;
      result = `
        <p class="planner-result">
          <span class="big">${days}</span> ${days === 1 ? 'day' : 'days'}
          <span class="muted">to watch ${fmt(stats.remainingMinutes)}</span>
        </p>
        <p class="muted">Finish by <strong>${esc(View.formatDate(stats.finishDate))}</strong> if you start today.</p>`;
    }

    const genres = stats.genres.length
      ? `<ul class="genres">${stats.genres
          .map(
            (g) => `
          <li>
            <span class="genre-name">${esc(g.name)}</span>
            <span class="bar" aria-hidden="true"><span class="bar-fill" style="width:${g.sharePct}%"></span></span>
            <span class="genre-pct">${g.sharePct}%</span>
          </li>`
          )
          .join('')}</ul>`
      : '<p class="muted">Add titles to see your genre mix.</p>';

    return `
      <h2 class="panel-title">Binge stats</h2>

      <div class="progress-head">
        <span>${stats.completionPct}% watched</span>
        <span class="muted">${stats.watchedCount} of ${stats.count} titles</span>
      </div>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${stats.completionPct}">
        <div class="progress-fill" style="width:${stats.completionPct}%"></div>
      </div>

      <dl class="tiles">
        <div class="tile"><dt>Total runtime</dt><dd>${fmt(stats.totalMinutes)}</dd></div>
        <div class="tile"><dt>Watched</dt><dd>${fmt(stats.watchedMinutes)}</dd></div>
        <div class="tile"><dt>Remaining</dt><dd>${fmt(stats.remainingMinutes)}</dd></div>
        <div class="tile"><dt>Avg rating</dt><dd>${
          stats.avgRating === null ? '—' : `${stats.avgRating.toFixed(1)} ★`
        }</dd></div>
      </dl>

      <h3 class="subtitle">Binge planner</h3>
      <div class="planner">
        <label for="hours">Hours you can watch per day</label>
        <div class="planner-input">
          <input id="hours" type="text" inputmode="decimal" autocomplete="off" value="${esc(stats.hoursInput)}"${
      stats.hoursError ? ' aria-invalid="true" aria-describedby="err-hours"' : ''
    }>
          <div class="chips">${presets}</div>
        </div>
        ${result}
      </div>

      <h3 class="subtitle">Genre share of runtime</h3>
      ${genres}
    `;
  }

  /* ---------- handlers the controller subscribes to ---------- */

  /** fn(text) — fires on every keystroke and on preset clicks. */
  onHoursChange(fn) {
    this.listen('input', '#hours', (event, input) => fn(input.value));
    this.listen('click', '[data-hours]', (event, button) => fn(button.dataset.hours));
  }
}
