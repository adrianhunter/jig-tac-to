import { writable, derived } from "svelte/store";
import { calculateWinner } from "../lib/helpers.js";

class History {
  constructor() {
    this.history = new Array();
    this.current = -1;
  }

  currentState() {
    return this.history[this.current];
  }

  push(state) {
    // remove all redo states
    if (this.canRedo()) this.history.splice(this.current + 1);

    // add a new state
    this.current++;
    this.history.push(state);
  }

  canUndo() {
    return this.current > 0;
  }

  canRedo() {
    return this.current < this.history.length - 1;
  }

  undo() {
    if (this.canUndo()) this.current--;
  }

  redo() {
    if (this.canRedo()) this.current++;
  }

  setCurrent(current) {
    if (current >= 0 && current < this.history.length) this.current = current;
  }
}

function createHistory() {
  const { subscribe, set, update } = writable(new History());

  return {
    subscribe,
    push: state =>
      update(h => {
        h.push(state);
        console.log(h);
        return h;
      }),
    undo: () =>
      update(h => {
        h.undo();
        return h;
      }),
    redo: () =>
      update(h => {
        h.redo();
        return h;
      }),
    setCurrent: current =>
      update(h => {
        h.setCurrent(current);
        return h;
      })
  };
}

export const history = createHistory();

export const status = derived(history, $history => {
  if ($history.currentState()) {
    if (calculateWinner($history.currentState().squares)) return 1;
    else if ($history.current == 9) return 2;
  }
  return 0;
});
