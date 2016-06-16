describe("formatter.js tests", function() {
  var formatter;
  var translation;
  beforeEach(function() {
    formatter = new SimpleFormatter();
    formatter.initialize();
    formatter.spaces_before=false;
    translation = new TranslationResult(null);
  });
  it('puts spaces before words if required', function() {
    formatter.spaces_before = true;
    translation.text = "test";
    formatter.format(translation);
    expect(translation.text).toEqual(' test');
    translation.text="{ }boat and{ }";
    formatter.format(translation);
    expect(translation.text).toEqual('  boat and ');
  });
  it('puts spaces after words if required', function() {
    formatter.spaces_before=false;
    translation.text = "test";
    formatter.format(translation);
    expect(translation.text).toEqual('test ');
    translation.text = "{ }boat and{ }";
    formatter.format(translation);
    expect(translation.text).toEqual(' boat and  ');
  });
  it('formats punctuation correctly', function() {
    translation.text = "{.}";
    expect(translation.state.capitalize).toBe(false);
    formatter.format(translation);
    expect(translation.text).toEqual('.  ');
    expect(translation.state.capitalize).toBe(true);
    translation.text = "{?}";
    translation.state.capitalize=false;
    formatter.format(translation);
    expect(translation.text).toEqual('?  ');
    expect(translation.state.capitalize).toBe(true);
    translation.text = "{!}";
    translation.state.capitalize=false;
    formatter.format(translation);
    expect(translation.text).toEqual('!  ');
    expect(translation.state.capitalize).toBe(true);
  });
  it('capitalizes correctly', function() {
    translation.text = "this is it";
    formatter.format(translation);
    expect(translation.text).toEqual('this is it ');
    translation.state.capitalize = true;
    formatter.format(translation);
    expect(translation.text).toEqual('This is it ');
    expect(translation.state.capitalize).toBe(false);
  });
  it('lowercases correctly', function() {
    translation.text = "This Is It";
    formatter.format(translation);
    expect(translation.text).toEqual('This Is It ');
    translation.state.lowercase = true;
    formatter.format(translation);
    expect(translation.text).toEqual('this Is It ');
    expect(translation.state.lowercase).toBe(false);
  });
  it('removes start space correctly', function() {
    formatter.spaces_before = false;
    translation.text = "our Provider";
    translation.state.start = false;
    formatter.format(translation);
    expect(translation.text).toEqual('our Provider ');
    expect(translation.undo_chars).toBe(0);
    expect(translation.state.start).toBe(false);
    translation.text = "{our Provider^}";
    formatter.format(translation);
    expect(translation.text).toEqual('our Provider');
    expect(translation.undo_chars).toBe(0);
    expect(translation.state.end).toBe(true);

    formatter.spaces_before = true;
    translation.state = new State();
    translation.text = 'our Provider';
    formatter.format(translation);
    expect(translation.text).toEqual(' our Provider');
    expect(translation.undo_chars).toBe(0);
    expect(translation.state.start).toBe(false);
    translation.text='{^our Provider}';
    formatter.format(translation);
    expect(translation.text).toEqual('our Provider');
    expect(translation.undo_chars).toBe(0);
    expect(translation.state.start).toBe(true);
  });  
  it('removes end space correctly', function() {
    formatter.spaces_before = false;
    translation.text = "Jehoveh Jireh";
    translation.state.end = false;
    formatter.format(translation);
    expect(translation.text).toEqual('Jehoveh Jireh ');
    expect(translation.state.end).toBe(false);
    translation.text = "{Jehoveh Jireh^}";
    formatter.format(translation);
    expect(translation.text).toEqual('Jehoveh Jireh');
    expect(translation.state.end).toBe(true);

    formatter.spaces_before = true;
    translation.text = "Jehoveh Jireh";
    translation.state = new State();
    formatter.format(translation);
    expect(translation.text).toEqual(' Jehoveh Jireh');
    expect(translation.state.end).toBe(false);
    translation.text = "{Jehoveh Jireh^}";
    formatter.format(translation);
    expect(translation.text).toEqual(' Jehoveh Jireh');
    expect(translation.state.end).toBe(true);
  });
  it('sets capitalization flag', function() {
    translation.text = "Jesus";
    formatter.format(translation);
    expect(translation.state.capitalize).toBe(false);
    translation.text = "{-|}";
    formatter.format(translation);
    expect(translation.state.capitalize).toBe(true);
  });
  it('sets lowercase flag', function() {
    translation.text = "Jesus";
    formatter.format(translation);
    expect(translation.state.lowercase).toBe(false);
    translation.text = "{>}";
    formatter.format(translation);
    expect(translation.state.lowercase).toBe(true);
  });
  it('sets glue flag', function() {
    translation.text = "Jesus";
    formatter.format(translation);
    expect(translation.state.glue).toBe(false);
    translation.text = "{&5}";
    formatter.format(translation);
    expect(translation.state.glue).toBe(true);
  });
  it('handles glue correctly with preceeding spaces', function() {
    formatter.spaces_before=true;
    translation.text = "Jody";
    formatter.format(translation);
    expect(translation.text).toEqual(' Jody');
    translation.state.glue=true;
    formatter.format(translation);
    expect(translation.text).toEqual(' Jody');
    expect(translation.state.glue).toBe(false);
    translation.state.glue=true;
    translation.text = "{&Jody}";
    formatter.format(translation);
    expect(translation.state.glue).toBe(true);
    expect(translation.text).toEqual('Jody');
  });
  it('handles glue correctly with following spaces', function() {
    formatter.spaces_before=false;
    translation.text="Brent";
    formatter.format(translation);
    expect(translation.text).toEqual('Brent ');
    translation.state.glue = true;
    formatter.format(translation);
    expect(translation.text).toEqual('Brent ');
    expect(translation.state.glue).toBe(false);
    translation.text="{&Brent}";
    formatter.format(translation);
    expect(translation.text).toEqual('Brent ');
    expect(translation.state.glue).toBe(true);
    translation.text = "{&Brent}";
    formatter.format(translation);
    expect(translation.text).toEqual('Brent ');
    expect(translation.undo_chars).toBe(1);
    expect(translation.state.glue).toBe(true);
  });
  it('handles Return command', function() {
    translation.text="{#Return}";
    formatter.format(translation);
    expect(translation.undo_chars).toBe(0);
    expect(translation.text).toEqual('\n');
  });
  it('handles BackSpace command', function() {
    translation.text="{#BackSpace}";
    formatter.format(translation);
    expect(translation.undo_chars).toBe(1);
    expect(translation.text.length).toBe(0);
  });
  it('handles Tab command', function() {
    translation.text="{#Tab}";
    formatter.format(translation);
    expect(translation.undo_chars).toBe(0);
    expect(translation.text).toEqual('\t');
  })
  it('handles more complex commands', function() {
    translation.text='{^} {#h i space t h e} {#r e}';
    formatter.format(translation);
    expect(translation.state.start).toBe(true);
    expect(translation.text).toEqual('hi there');
  });
});