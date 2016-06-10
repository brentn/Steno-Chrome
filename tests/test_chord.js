describe('chord.js tests', function() {
  describe('addKey()', function() {
    beforeEach(function() {
      
    });
    it('adds valid keys', function() {
      var validKeys = ['#','S-','T-','P-','H-','K-','W-','R-','A-','O-','*','-E','-U','-F','-R','-P','-B','-L','-G','-T','-S','-D','-Z'];
      var chord = new Chord();
      var total = 0;
      expect(chord.keys.size).toBe(total);
      for (var key in validKeys) {
        chord.addKey(validKeys[key]);
        total++;
        expect(chord.keys.size).toBe(total);
      }
    });
    it('ignores invalid keys', function() {
      var invalidKeys = ['x','1','Twenty','-'];
      var chord = new Chord();
      var total = 0;
      for (var key in invalidKeys) {
        chord.addKey(invalidKeys[key]);
        expect(chord.keys.size).toBe(0);
      }
    });
    it('only adds keys once', function() {
      var validKeys = ['#','S-','T-','P-','H-','K-','W-','R-','A-','O-','*','-E','-U','-F','-R','-P','-B','-L','-G','-T','-S','-D','-Z'];
      var chord = new Chord();
      for (var key in validKeys) {
        chord.addKey(validKeys[key]);
      }      
      expect(chord.keys.size).toBe(23);
      for (key in validKeys) {
        chord.addKey(validKeys[key]);
        expect(chord.keys.size).toBe(23);
      }      
    });
  });
  describe('clear()', function() {
    it('removes all keys', function() {
      var chord = new Chord();
      chord.keys.add('*');
      chord.keys.add('-D');
      expect(chord.keys.size).not.toBe(0);
      chord.clear();
      expect(chord.keys.size).toBe(0);
    });
  });
  describe('toString()', function() {
    it('outputs keys in order', function() {
      var validKeys = ['#','S-','T-','P-','H-','K-','W-','R-','A-','O-','*','-E','-U','-F','-R','-P','-B','-L','-G','-T','-S','-D','-Z'];
      var chord = new Chord();
      for (var key in validKeys) {
        chord.addKey(validKeys[key]);
      }
      expect(chord.toString()).toBe('#STKPWHRAO*EUFRPBLGTSDZ');
      validKeys = ['-Z','-D','-S','-T','-G','-L','-L','-B','-P','-R','-F','-U','-E','*','O-','A-','R-','W-','K-','H-','P-','T-','S-','#'];
      chord.clear();
      for (key in validKeys) {
        chord.addKey(validKeys[key]);
      }
      expect(chord.toString()).toBe('#STKPWHRAO*EUFRPBLGTSDZ');
    });
    it('removes unnecessary hyphens', function() {
      var chord = new Chord();
      chord.addKey('P-');
      chord.addKey('O-');
      chord.addKey('-S');
      expect(chord.toString()).not.toContain('-');
      chord.clear();
      chord.addKey('R-');
      chord.addKey('A-');
      chord.addKey('-R');
      expect(chord.toString()).not.toContain('-');
      chord.clear();
      chord.addKey('T-');
      chord.addKey('-E');
      chord.addKey('-Z');
      expect(chord.toString()).not.toContain('-');
      chord.clear();
      chord.addKey('S-');
      chord.addKey('-U');
      chord.addKey('-F');
      expect(chord.toString()).not.toContain('-');
      chord.clear();
      chord.addKey('L-');
      chord.addKey('*');
      chord.addKey('-G');
      expect(chord.toString()).not.toContain('-');
      chord.clear();
      //final hyphen
      chord.addKey('R-');
      chord.addKey('P-');
      expect(chord.toString()).not.toContain('-');
    });
  });
});