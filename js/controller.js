/* ==========================================================================
   CONTROLLER  (js/controller.js)
   The only layer that talks to both the model and the views.
   Wires each user action to a model change and a re-render.
   MUST NEVER build HTML markup itself.
   ========================================================================== */

import * as model from './model.js';
import FormView from './views/FormView.js';
import ListView from './views/ListView.js';
import FilterView from './views/FilterView.js';
import StatsView from './views/StatsView.js';

const formView = new FormView('#form-view');
const filterView = new FilterView('#filter-view');
const listView = new ListView('#list-view');
const statsView = new StatsView('#stats-view');

/* ---------- render functions: model data -> view.render(data) ---------- */

function renderForm(values, errors = {}) {
  const editing = model.getEditingMovie();
  formView.render({ editing: Boolean(editing), values: values ?? editing ?? {}, errors });
}

function renderFilter() {
  filterView.render(model.getFilterInfo());
}

function renderList() {
  listView.render({
    movies: model.getMovies(),
    totalCount: model.state.movies.length,
    editingId: model.state.editingId,
  });
}

function renderStats() {
  statsView.render(model.getStats());
}

function renderAll() {
  renderForm();
  renderFilter();
  renderList();
  renderStats();
}

/* ---------- control functions: user action -> model change -> re-render -- */

// Path from the diagram: form submit -> controlSubmit -> model.addMovie -> render.
function controlSubmit(formData) {
  const editingId = model.state.editingId;
  const result = editingId ? model.updateMovie(editingId, formData) : model.addMovie(formData);

  if (!result.ok) {
    renderForm(formData, result.errors); // show the error message through the view
    return;
  }
  renderAll();
}

function controlEdit(id) {
  if (!model.startEditing(id)) return;
  renderForm();
  renderList();
  formView.reveal();
}

function controlCancelEdit() {
  model.stopEditing();
  renderForm();
  renderList();
}

function controlDelete(id) {
  model.deleteMovie(id);
  renderAll();
}

function controlStatus(id, status) {
  model.setStatus(id, status);
  renderFilter(); // tab counts changed
  renderList();
  renderStats();
}

function controlRate(id, rating) {
  model.setRating(id, rating);
  renderList();
  renderStats();
}

function controlFilter(filter) {
  model.setFilter(filter);
  renderFilter();
  renderList();
}

function controlSearch(query) {
  model.setQuery(query);
  renderList(); // the search box itself is left alone so typing is not interrupted
}

function controlSort(sort) {
  model.setSort(sort);
  renderFilter();
  renderList();
}

function controlHours(text) {
  model.setHoursInput(text);
  renderStats(); // derived values recompute on every keystroke
}

/* ---------- start up ---------- */

function init() {
  formView.onSubmit(controlSubmit);
  formView.onCancel(controlCancelEdit);

  filterView.onFilter(controlFilter);
  filterView.onSearch(controlSearch);
  filterView.onSort(controlSort);
  listView.onSelect();
  listView.onEdit(controlEdit);
  listView.onDelete(controlDelete);
  listView.onStatusChange(controlStatus);
  listView.onRate(controlRate);

  statsView.onHoursChange(controlHours);

  model.loadState();
  renderAll();
}

init();
