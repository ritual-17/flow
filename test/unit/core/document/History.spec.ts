/* eslint-disable @typescript-eslint/no-explicit-any */
import { History, HistoryEntry } from '@renderer/core/document/History';

describe('History', () => {
  let history: History<any>;

  beforeEach(() => {
    history = new History();
  });

  // tests undo stack updates after recording a change
  it('should allow undo after recording change', () => {
    const change1: HistoryEntry = {
      patches: [],
      backwardPatches: [],
    };
    history.record(change1);
    expect(history.canUndo()).toBe(true);
  });

  // tests redo stack cleared after change recorded
  it('should clear redo stack after recording change', () => {
    const change2: HistoryEntry = {
      patches: [],
      backwardPatches: [],
    };
    history.record(change2);
    expect(history.canRedo()).toBe(false);
  });

  // tests undo/redo with no history entries
  it('should not change state when undoing with no history', () => {
    const initialState = { value: 0 };
    const newState = history.undo(initialState);
    expect(newState).toEqual(initialState);
  });

  it('should not change state when redoing with no history', () => {
    const initialState = { value: 0 };
    const newState = history.redo(initialState);
    expect(newState).toEqual(initialState);
  });

  // tests undo applies backward patches
  it('should apply backward patches when undoing', () => {
    const entry: HistoryEntry = {
      patches: [{ op: 'replace', path: ['count'], value: 1 }],
      backwardPatches: [{ op: 'replace', path: ['count'], value: 0 }],
    };
    history.record(entry);
    const currentState = { count: 1 };
    const result = history.undo(currentState);
    expect(result).toEqual({ count: 0 });
  });

  // tests redo applies forward patches
  it('should apply forward patches when redoing', () => {
    const entry: HistoryEntry = {
      patches: [{ op: 'replace', path: ['count'], value: 1 }],
      backwardPatches: [{ op: 'replace', path: ['count'], value: 0 }],
    };
    history.record(entry);
    const stateAfterChange = { count: 1 };
    const undoneState = history.undo(stateAfterChange);
    const redoneState = history.redo(undoneState);
    expect(redoneState).toEqual({ count: 1 });
  });

  // tests clear empties both stacks
  it('should clear both stacks when clear is called', () => {
    const entry: HistoryEntry = {
      patches: [],
      backwardPatches: [],
    };
    history.record(entry);
    history.clear();
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });

  // tests multiple undos and redos
  it('should handle multiple undos and redos', () => {
    const entry1: HistoryEntry = {
      patches: [{ op: 'replace', path: ['count'], value: 1 }],
      backwardPatches: [{ op: 'replace', path: ['count'], value: 0 }],
    };

    const entry2: HistoryEntry = {
      patches: [{ op: 'replace', path: ['count'], value: 2 }],
      backwardPatches: [{ op: 'replace', path: ['count'], value: 1 }],
    };

    history.record(entry1);
    history.record(entry2);

    let state = { count: 2 };

    state = history.undo(state);
    expect(state.count).toBe(1);

    state = history.undo(state);
    expect(state.count).toBe(0);

    state = history.redo(state);
    expect(state.count).toBe(1);
  });
});
