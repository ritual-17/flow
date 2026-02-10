// Undo/redo functionality
// Should store a history of commands executed
// See TA's comments on this:
//
// You may be interested in looking at why using Undo Trees (instead of sequences
// / list) might be more beneficial(I think vim does it this way; emacs certainly
// has "undo-tree" in it).Alternatively, look into this:
// https://en.wikipedia.org/wiki/Memento_pattern

import { applyPatches, Patch } from 'immer';

// object for each entry into history stacks
export type HistoryEntry = {
  patches: Patch[];
  backwardPatches: Patch[];
};

// make class TDocument so it can be used for any document type
// extended from object to ensure it's a non-primitive type, since we need to apply patches to it
export class History<TDocument extends object> {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];

  // functions to record a new entry into the history, and to undo/redo the most recent entry
  record(entry: HistoryEntry) {
    this.undoStack.push(entry);
    this.redoStack = [];
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undo(currentState: TDocument): TDocument {
    if (!this.canUndo()) return currentState;

    const entry = this.undoStack.pop()!;
    const previous = applyPatches(currentState, entry.backwardPatches);
    this.redoStack.push(entry);

    return previous;
  }

  redo(currentState: TDocument): TDocument {
    if (!this.canRedo()) return currentState;

    const entry = this.redoStack.pop()!;
    const next = applyPatches(currentState, entry.patches);
    this.undoStack.push(entry);

    return next;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
