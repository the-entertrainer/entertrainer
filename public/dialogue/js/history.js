(function (global) {
  function createHistory(limit) {
    const max = limit || 50;
    let stack = [];
    let index = -1;
    let coalescing = null;

    function snapshot(state) {
      return JSON.parse(JSON.stringify(state));
    }

    function push(state, opts) {
      const coalesceKey = opts && opts.coalesceKey;
      if (coalesceKey && coalescing && coalescing.key === coalesceKey && index >= 0) {
        stack[index] = snapshot(state);
        return;
      }
      stack = stack.slice(0, index + 1);
      stack.push(snapshot(state));
      if (stack.length > max) stack.shift();
      index = stack.length - 1;
      coalescing = coalesceKey ? { key: coalesceKey } : null;
    }

    function undo() {
      if (index <= 0) return null;
      index -= 1;
      coalescing = null;
      return snapshot(stack[index]);
    }

    function redo() {
      if (index >= stack.length - 1) return null;
      index += 1;
      coalescing = null;
      return snapshot(stack[index]);
    }

    function canUndo() { return index > 0; }
    function canRedo() { return index < stack.length - 1; }
    function clear() { stack = []; index = -1; coalescing = null; }
    function seed(state) { clear(); push(state); }

    return { push, undo, redo, canUndo, canRedo, clear, seed };
  }
  global.DialogueHistory = { createHistory };
})(typeof window !== 'undefined' ? window : globalThis);
