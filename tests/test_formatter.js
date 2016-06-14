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
    translation.state.start = true;
    formatter.format(translation);
    expect(translation.text).toEqual('our Provider ');
    expect(translation.undo_chars).toBe(1);
    expect(translation.state.start).toBe(false);

    formatter.spaces_before = true;
    formatter.format(translation);
    expect(translation.text).toEqual(' our Provider');
    expect(translation.undo_chars).toBe(0);
    expect(translation.state.start).toBe(false);
    translation.state.start = true;
    formatter.format(translation);
    expect(translation.text).toEqual('our Provider');
    expect(translation.undo_chars).toBe(0);
    expect(translation.state.start).toBe(false);
  });  
  it('removes end space correctly', function() {
    formatter.spaces_before = false;
    translation.text = "Jehoveh Jireh";
    translation.state.end = false;
    formatter.format(translation);
    expect(translation.text).toEqual('Jehoveh Jireh ');
    expect(translation.state.end).toBe(false);
    translation.state.end = true;
    formatter.format(translation);
    expect(translation.text).toEqual('Jehoveh Jireh');
    expect(translation.state.end).toBe(false);

    formatter.spaces_before = true;
    formatter.format(translation);
    expect(translation.text).toEqual(' Jehoveh Jireh');
    expect(translation.state.end).toBe(true);
    translation.state.end = true;
    formatter.format(translation);
    expect(translation.text).toEqual('Jehoveh Jireh');
    expect(translation.state.start).toBe(true);
  });
});