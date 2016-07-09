describe('state.js tests', function() {
  describe('capitalization', function() {
    var state;
    beforeEach(function() {
      state = new State();
    });
    it('capitalizes', function() {
      expect(state.isCapitalized()).toBe(false);
      state.capitalize();
      expect(state.isCapitalized()).toBe(true);
    });
    it('lowercases', function() {
      expect(state.isLowercase()).toBe(false);
      state.lowercase();
      expect(state.isLowercase()).toBe(true);
    });
    it('lowercase uncapitalizes', function() {
      state.capitalize();
      expect(state.isCapitalized()).toBe(true);
      state.lowercase();
      expect(state.isCapitalized()).toBe(false);
      expect(state.isLowercase()).toBe(true);
    });
    it('capitalize un-lowercases', function() {
      state.lowercase();
      expect(state.isLowercase()).toBe(true);
      state.capitalize();
      expect(state.isCapitalized()).toBe(true);
      expect(state.isLowercase()).toBe(false);
    });
    it('clears capitalization', function() {
      state.capitalize();
      expect(state.isCapitalized()).toBe(true);
      state.clearCapitalization();
      expect(state.isCapitalized()).toBe(false);
      expect(state.isLowercase()).toBe(false);
    });
    it('clears lowercase', function() {
      state.lowercase();
      expect(state.isLowercase()).toBe(true);
      state.clearCapitalization();
      expect(state.isCapitalized()).toBe(false);
      expect(state.isLowercase()).toBe(false);
    });
  });
  describe('space_suppression', function() {
    var state;
    beforeEach(function() {
      state = new State();
    });
    it('sets initial space suppression', function() {
      expect(state.isInitialSpaceSuppressed()).toBe(false);
      state.suppressInitialSpace();
      expect(state.isInitialSpaceSuppressed()).toBe(true);
    });
    it('sets final space suppression', function() {
      expect(state.isFinalSpaceSuppressed()).toBe(false);
      state.suppressFinalSpace();
      expect(state.isFinalSpaceSuppressed()).toBe(true);
    });
    it('clears initial space suppression', function() {
      state.suppressInitialSpace();
      expect(state.isInitialSpaceSuppressed()).toBe(true);
      state.clearInitialSpaceSuppression();
      expect(state.isInitialSpaceSuppressed()).toBe(false);
    });
    it('clears final space suppression', function() {
      state.suppressFinalSpace();
      expect(state.isFinalSpaceSuppressed()).toBe(true);
      state.clearFinalSpaceSuppression();
      expect(state.isFinalSpaceSuppressed()).toBe(false);
    });
    it('setting initial and final space suppression operate independently', function() {
      expect(state.isInitialSpaceSuppressed()).toBe(false);
      expect(state.isFinalSpaceSuppressed()).toBe(false);
      state.suppressFinalSpace();
      expect(state.isInitialSpaceSuppressed()).toBe(false);
      expect(state.isFinalSpaceSuppressed()).toBe(true);
      state.suppressInitialSpace();
      expect(state.isInitialSpaceSuppressed()).toBe(true);
      expect(state.isFinalSpaceSuppressed()).toBe(true);
      state.clearFinalSpaceSuppression();
      expect(state.isInitialSpaceSuppressed()).toBe(true);
      expect(state.isFinalSpaceSuppressed()).toBe(false);
      state.clearInitialSpaceSuppression();
      expect(state.isInitialSpaceSuppressed()).toBe(false);
      expect(state.isFinalSpaceSuppressed()).toBe(false);
    });
  });
  describe('glue', function() {
    var state;
    beforeEach(function() {
      state = new State();
    });
    it('sets glue', function() {
      expect(state.hasGlue()).toBe(false);
      state.addGlue();
      expect(state.hasGlue()).toBe(true);
    });
    it('clears glue', function() {
      state.addGlue();
      expect(state.hasGlue()).toBe(true);
      state.clearGlue();
      expect(state.hasGlue()).toBe(false);
    });
  });
  describe('terminal space', function() {
    var state;
    beforeEach(function() {
      state = new State();
    });
    it('sets terminal space', function() {
      expect(state.hasTerminalSpace()).toBe(false);
      state.appendOutput([' ']);
      expect(state.hasTerminalSpace()).toBe(true);
      state.appendOutput(['abc d']);
      expect(state.hasTerminalSpace()).toBe(false);
      state.appendOutput(['\b']);
      expect(state.hasTerminalSpace()).toBe(true);
    });
  });
  describe('output', function() {
    var state;
    beforeEach(function() {
      state = new State();
    });
    it('saves simple output correctly', function() {
      expect(state.getOutput(1)).toEqual('');
      state.appendOutput(['abc']);
      expect(state.getOutput(1)).toEqual('c');
      expect(state.getOutput(3)).toEqual('abc');
      expect(state.getOutput(10)).toEqual('abc');
      state.appendOutput(['def','ghi','j']);
      expect(state.getOutput(2)).toEqual('ij');
      expect(state.getOutput(10)).toEqual('abcdefghij');
      expect(state.getOutput(11)).toEqual('abcdefghij');
    });
    it('handles backspaces in output', function() {
      expect(state.getOutput(1)).toEqual('');
      state.appendOutput(['zyx']);
      expect(state.getOutput(3)).toEqual('zyx');
      state.appendOutput(['\b\b\b\b\b']);
      expect(state.getOutput(3)).toEqual('');
      state.appendOutput(['wvut', '\b']);
      expect(state.getOutput(1)).toEqual('u');
      expect(state.getOutput(3)).toEqual('wvu');
      state.appendOutput(['tsrq', '\b\b', 'rq']);
      expect(state.getOutput(5)).toEqual('utsrq');
    });
  });
  it('sets correct defaults', function() {
    var state = new State();
    expect(state.isCapitalized()).toBe(false);
    expect(state.isLowercase()).toBe(false);
    expect(state.isInitialSpaceSuppressed()).toBe(false);
    expect(state.isFinalSpaceSuppressed()).toBe(false);
    expect(state.hasGlue()).toBe(false);
    expect(state.hasTerminalSpace()).toBe(false);
  });
  it('clones supplied state', function() {
    var oldState = new State();
    oldState.lowercase();
    oldState.suppressInitialSpace();
    oldState.suppressFinalSpace();
    oldState.addGlue();
    oldState.appendOutput([' ']);
    expect(oldState.isCapitalized()).toBe(false);
    expect(oldState.isLowercase()).toBe(true);
    expect(oldState.isInitialSpaceSuppressed()).toBe(true);
    expect(oldState.isFinalSpaceSuppressed()).toBe(true);
    expect(oldState.hasGlue()).toBe(true);
    expect(oldState.hasTerminalSpace()).toBe(true);
    var state = new State(oldState);
    expect(state.isCapitalized()).toBe(false);
    expect(state.isLowercase()).toBe(true);
    expect(state.isInitialSpaceSuppressed()).toBe(true);
    expect(state.isFinalSpaceSuppressed()).toBe(true);
    expect(state.hasGlue()).toBe(true);
    expect(state.hasTerminalSpace()).toBe(true);
    //ensure state is not pointing directly to oldState
    oldState.capitalize();
    expect(oldState.isCapitalized()).toBe(true);
    expect(state.isCapitalized()).toBe(false);
  });
});