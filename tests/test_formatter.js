describe("formatter.js tests", function() {
  var formatter;
  var state;
  var translation;
  beforeEach(function() {
    formatter = new SimpleFormatter();
    formatter.initialize();
    formatter.spaces_before=false;
    state = new State();
    translation = new TranslationResult(null);
  });
  it('puts spaces before words if required', function() {
    formatter.spaces_before = true;
    translation.output = ["test"];
    formatter.format(translation, state);
    expect(translation.output).toEqual([' test']);
    translation.output=["{ }boat and{ }"];
    formatter.format(translation, state);
    expect(translation.output).toEqual(['  boat and ']);
  });
  it('puts spaces after words if required', function() {
    formatter.spaces_before=false;
    translation.output = ["test"];
    formatter.format(translation, state);
    expect(translation.output).toEqual(['test ']);
    translation.output = ["{ }boat and{ }"];
    formatter.format(translation, state);
    expect(translation.output).toEqual([' boat and  ']);
  });
  it('formats punctuation correctly', function() {
    state.appendOutput([' ']);
    expect(state.isCapitalized()).toBe(false);
    expect(state.isInitialSpaceSuppressed()).toBe(false);
    translation.output = ["{.}"];
    formatter.format(translation, state);
    expect(translation.output).toEqual(['\b', '.  ']);
    expect(state.isCapitalized()).toBe(true);
    expect(state.isInitialSpaceSuppressed()).toBe(true);
    translation.output = ["{?}"];
    state.clearCapitalization();
    state.clearInitialSpaceSuppression();
    state.clearFinalSpaceSuppression();
    formatter.format(translation, state);
    expect(translation.output).toEqual(['\b', '?  ']);
    expect(state.isCapitalized()).toBe(true);
    expect(state.isInitialSpaceSuppressed()).toBe(true);
    translation.output = ["{!}"];
    state.clearCapitalization();
    state.clearInitialSpaceSuppression();
    state.clearFinalSpaceSuppression();
    formatter.format(translation, state);
    expect(translation.output).toEqual(['\b', '!  ']);
    expect(state.isCapitalized()).toBe(true);
    expect(state.isInitialSpaceSuppressed()).toBe(true);
  });
  it('capitalizes correctly', function() {
    translation.output = ["this is it"];
    formatter.format(translation, state);
    expect(translation.output).toEqual(['this is it ']);
    state.capitalize();
    formatter.format(translation, state);
    expect(translation.output).toEqual(['This is it ']);
    expect(state.isCapitalized()).toBe(false);
  });
  it('lowercases correctly', function() {
    translation.output = ["This Is It"];
    formatter.format(translation, state);
    expect(translation.output).toEqual(['This Is It ']);
    state.lowercase();
    formatter.format(translation, state);
    expect(translation.output).toEqual(['this Is It ']);
    expect(state.isLowercase()).toBe(false);
  });
  it('removes start space correctly', function() {
    formatter.spaces_before = false;
    translation.output = ["our Provider"];
    state.start = false;
    formatter.format(translation, state);
    expect(translation.output[0]).toEqual('our Provider ');
    expect(translation.undo[0]).toEqual('\b\b\b\b\b\b\b\b\b\b\b\b\b');
    expect(state.isInitialSpaceSuppressed()).toBe(false);
    translation.output = ["{our Provider^}"];
    translation.undo = [];
    formatter.format(translation, state);
    expect(translation.output[0]).toEqual('our Provider');
    expect(translation.undo[0]).toEqual('\b\b\b\b\b\b\b\b\b\b\b\b');
    expect(state.isFinalSpaceSuppressed()).toBe(false);

    formatter.spaces_before = true;
    state = new State();
    translation.output = ['our Provider'];
    translation.undo = [];
    formatter.format(translation, state);
    expect(translation.output[0]).toEqual(' our Provider');
    expect(translation.undo[0]).toEqual('\b\b\b\b\b\b\b\b\b\b\b\b\b');
    expect(state.isInitialSpaceSuppressed()).toBe(false);
    translation.output=['{^our Provider}'];
    translation.undo = [];
    formatter.format(translation, state);
    expect(translation.output[0]).toEqual('our Provider');
    expect(translation.undo[0]).toEqual('\b\b\b\b\b\b\b\b\b\b\b\b');
    expect(state.isInitialSpaceSuppressed()).toBe(false);
  });  
  it('removes end space correctly', function() {
    formatter.spaces_before = false;
    translation.output = ["Jehoveh Jireh"];
    state.end = false;
    formatter.format(translation, state);
    expect(translation.output).toEqual(['Jehoveh Jireh ']);
    expect(state.isFinalSpaceSuppressed()).toBe(false);
    translation.output = ["{Jehoveh Jireh^}"];
    formatter.format(translation, state);
    expect(translation.output).toEqual(['Jehoveh Jireh']);
    expect(state.isFinalSpaceSuppressed()).toBe(false);

    formatter.spaces_before = true;
    translation.output = ["Jehoveh Jireh"];
    state = new State();
    formatter.format(translation, state);
    expect(translation.output).toEqual([' Jehoveh Jireh']);
    expect(state.isFinalSpaceSuppressed()).toBe(false);
    translation.output = ["{Jehoveh Jireh^}"];
    formatter.format(translation, state);
    expect(translation.output).toEqual([' Jehoveh Jireh']);
    expect(state.isFinalSpaceSuppressed()).toBe(true);
  });
  it('sets capitalization flag', function() {
    translation.output = ["Jesus"];
    formatter.format(translation, state);
    expect(state.isCapitalized()).toBe(false);
    translation.output = ["{-|}"];
    formatter.format(translation, state);
    expect(state.isCapitalized()).toBe(true);
  });
  it('sets lowercase flag', function() {
    translation.output = ["Jesus"];
    formatter.format(translation, state);
    expect(state.isLowercase()).toBe(false);
    translation.output = ["{>}"];
    formatter.format(translation, state);
    expect(state.isLowercase()).toBe(true);
  });
  it('sets glue flag', function() {
    translation.output = ["Jesus"];
    formatter.format(translation, state);
    expect(state.hasGlue()).toBe(false);
    translation.output = ["{&5}"];
    formatter.format(translation, state);
    expect(state.hasGlue()).toBe(true);
  });
  it('handles glue correctly with preceeding spaces', function() {
    formatter.spaces_before=true;
    translation.output = ["Jody"];
    expect(state.hasGlue()).toBe(false);
    formatter.format(translation, state);
    expect(translation.output).toEqual([' Jody']);
    state.addGlue();
    formatter.format(translation, state);
    expect(translation.output).toEqual([' Jody']);
    expect(state.hasGlue()).toBe(false);
    state.addGlue();
    translation.output = ["{&Jody}"];
    formatter.format(translation, state);
    expect(state.hasGlue()).toBe(true);
    expect(translation.output).toEqual(['Jody']);
  });
  it('handles glue correctly with following spaces', function() {
    formatter.spaces_before=false;
    translation.output = ["Brent"];
    formatter.format(translation, state);
    expect(translation.output).toEqual(['Brent ']);
    state.glue = true;
    formatter.format(translation, state);
    expect(translation.output).toEqual(['Brent ']);
    expect(state.hasGlue()).toBe(false);
    translation.output = ["{&Brent}"];
    formatter.format(translation, state);
    expect(translation.output).toEqual(['Brent ']);
    expect(state.hasGlue()).toBe(true);
    state.appendOutput([' ']);
    translation.output = ["{&Brent}"];
    translation.undo = [];
    formatter.format(translation, state);
    expect(translation.output).toEqual(['\b', 'Brent ']);
    expect(translation.undo).toEqual(['\b\b\b\b\b\b', ' ']);
    expect(state.hasGlue()).toBe(true);
  });
  it('handles Return command', function() {
    translation.output = ["{#Return}"];
    formatter.format(translation, state);
    expect(translation.undo[0]).toEqual('\b');
    expect(translation.output).toEqual(['\n']);
  });
  it('handles BackSpace command', function() {
    translation.output = ["{#BackSpace}"];
    state.appendOutput(['abcde']);
    formatter.format(translation, state);
    expect(translation.output).toEqual(['\b']);
    expect(translation.undo).toEqual(['e']);
  });
  it('handles Tab command', function() {
    translation.output = ["{#Tab}"];
    formatter.format(translation, state);
    expect(translation.undo[0]).toEqual('\b');
    expect(translation.output).toEqual(['\t']);
  });
  it('handles more complex commands', function() {
    translation.output=['{^} {#h i space t h e} {#r e}'];
    formatter.format(translation, state);
    expect(state.isInitialSpaceSuppressed()).toBe(true);
    expect(translation.output).toEqual(['hi there']);
  });
  it('undoes characters correctly', function() {
    translation.output = ['{#BackSpace}{#BackSpace}'];
    state.appendOutput(['sponge']);
    formatter.format(translation, state);
    expect(translation.undo).toEqual(['ge']);
    expect(translation.output).toEqual(['\b\b']);
  });
  it('handles translations that are lists', function() {
    translation.output = ['My', 'name', 'is', 'Brent'];
    formatter.format(translation, state);
    expect(translation.output).toEqual(['My ','name ', 'is ', 'Brent ']);
    expect(translation.undo).toEqual(['\b\b\b\b\b\b','\b\b\b','\b\b\b\b\b','\b\b\b']);
  });
});