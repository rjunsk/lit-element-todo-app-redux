import { LitElement, html } from "lit-element";
import { VisibilityFilters } from "./redux/reducers.js";
import { getVisibleTodosSelector } from "./redux/selectors.js";
import { connect } from "pwa-helpers";
import { store } from "./redux/store.js";
import { addTodo, updateTodoStatus, updateFilter } from "./redux/actions.js";

class TodoView extends connect(store)(LitElement) {
  static get properties() {
    return {
      todos: { type: Array },
      filter: { type: String },
      task: { type: String }
    };
  }

  stateChanged(state) {
    this.todos = getVisibleTodosSelector(state);
    this.filter = state.filter;
  }

  addTodo() {
    if (this.task) {
      store.dispatch(addTodo(this.task));
      this.task = "";
    }
  }

  shortcutListener(e) {
    if (e.key === "Enter") {
      this.addTodo();
    }
  }

  updateTask(e) {
    this.task = e.target.value;
  }

  updateTodoStatus(updatedTodo, complete) {
    store.dispatch(updateTodoStatus(updatedTodo, complete));
  }

  filterChanged(e) {
    store.dispatch(updateFilter(e.target.value));
  }

  render() {
    return html`
      <style>
        todo-view {
          display: block;
          max-width: 800px;
          margin: 0 auto;
        }

        todo-view .input-layout {
          width: 100%;
          display: flex;
        }

        todo-view .input-layout vaadin-text-field {
          flex: 1;
          margin-right: var(--spacing);
        }

        todo-view .todos-list {
          margin-top: var(--spacing);
        }

        todo-view .visibility-filters {
          margin-top: calc(4 * var(--spacing));
        }
      </style>
      <div class="input-layout" @keyup="${this.shortcutListener}">
        <input
          type="text"
          .value="${this.task || ""}"
          @change="${this.updateTask}"
        />
        <button @click="${this.addTodo}">Add Todo</button>
      </div>

      <div class="todos-list">
        ${this.todos.map(
          todo => html`
            <div class="todo-item">
              <input
                type="checkbox"
                .checked="${todo.complete}"
                @change="${e => this.updateTodoStatus(todo, e.target.checked)}"
              />
              ${todo.task}
            </div>
          `
        )}
      </div>

      ${Object.values(VisibilityFilters).map(
        filter => html`
          <input
            type="radio"
            name="filter"
            value="${filter}"
            ?checked="${this.filter === filter}"
            @click="${this.filterChanged}"
          />
          ${filter}
        `
      )}
    `;
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define("todo-view", TodoView);
