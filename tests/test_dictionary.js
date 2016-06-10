describe('dictionary.js tests', function() {
  var dictionary;
  beforeEach(function() {
    dictionary = new Dictionary();
  });
  it('defaults to not loaded', function() {
    expect(dictionary.loaded()).toBe(false);
  });
  describe('load(filename)', function() {
    it('handles missing filename', function() {
      dictionary.load('');
      expect(dictionary.size()).toEqual(0);
      expect(dictionary.loaded()).toEqual(false);
    });
    it('handles null filename', function() {
      dictionary.load(null);
      expect(dictionary.size()).toEqual(0);
      expect(dictionary.loaded()).toEqual(false);
    });
    it('empties dictionary if null filename', function() {
      dictionary.add("X", "test");
      expect(dictionary.size()).toEqual(1);
      dictionary.load(null);
      expect(dictionary.size()).toEqual(0);
    });
  });
  describe('size()', function() {
    it('reports the number of entries in the dictionary', function() {
      dictionary.load(null);
      dictionary.add("A", "test1");
      expect(dictionary.size()).toEqual(1);
      dictionary.add("AB", "test2");
      expect(dictionary.size()).toEqual(2);
      dictionary.add("A", "test3");
      expect(dictionary.size()).toEqual(2);
      dictionary.add("AC", "test4");
      expect(dictionary.size()).toEqual(3);
    });
  });
  describe('add(stroke, translation)', function() {
    it('adds the correct stroke', function() {
      var stroke = "ABCD";
      var translation = "XYZ";
      dictionary.add(stroke, translation);
      expect(dictionary.lookup(stroke).translation).toEqual(translation);
      expect(dictionary.lookup(stroke).ambiguous).toBe(false);
    });
    it('replaces an existing stroke', function() {
      var stroke="JDL";
      dictionary.add(stroke, "test1");
      var size = dictionary.size();
      var result = dictionary.lookup(stroke);
      expect(result.translation).toEqual("test1");
      expect(result.ambiguous).toBe(false);
      dictionary.add(stroke, "test2");
      expect(dictionary.size()).toEqual(size);
      result = dictionary.lookup(stroke);
      expect(result.translation).toEqual("test2");
      expect(result.ambiguous).toBe(false);
    });
  });
  describe('lookup(stroke)', function() {
    it('finds the correct stroke', function() {
      dictionary.add('A', "result1");
      dictionary.add("AB", "result2");
      dictionary.add("ABCD", "result3");
      expect(dictionary.lookup("A").translation).toEqual("result1");
      expect(dictionary.lookup("AB").translation).toEqual("result2");
      expect(dictionary.lookup("ABCD").translation).toEqual("result3");
      expect(dictionary.lookup("B")).toBe(undefined);
      expect(dictionary.lookup("ABC")).toBe(undefined);
    });
    it('reports ambiguous if stroke+"/" exists', function() {
      dictionary.add("STROK", "");
      expect(dictionary.lookup("STROK").ambiguous).toBe(false);
      dictionary.add("STROKE", "");
      expect(dictionary.lookup("STROK").ambiguous).toBe(false);
      dictionary.add("STROK/STROK");
      expect(dictionary.lookup("STROK").ambiguous).toBe(true);
      expect(dictionary.lookup("STROK/STROK").ambiguous).toBe(false);
      expect(dictionary.lookup("STROKE").ambiguous).toBe(false);
    });
  });

});