describe('translator.js', function() {
  describe('LookupTranslator', function() {
    var translator;
    beforeEach(function() {
      translator = new LookupTranslator();
      translator.initialize();
      translator.history = new History(5);
      translator.dictionary.add('PROB', 'probable');
      translator.dictionary.add('PROB/HREPL', 'problem');
      translator.dictionary.add('PW', 'about');
      translator.dictionary.add('PW*', '{about^}');
      translator.dictionary.add('STAPBD', 'stand');
      translator.dictionary.add('STAPBD/-G', 'standing');
      translator.dictionary.add('S-P', '{^ ^}');
      translator.dictionary.add('TH-PL', '{.}');
      translator.dictionary.add('KPA', '{-|}');
      translator.dictionary.add('-S', '{^s}');
      translator.dictionary.add('-G', '{^ing}');
      translator.dictionary.add('R-R', '{^}{#Return}{^}{-|}');
    });
    describe('with following spaces', function() {
      beforeEach(function() {
        translator.formatter.spaces_before=false;
      });
      it('should translate simple strokes', function() {
        expect(translator.lookup('PW').text).toEqual('about ');
        expect(translator.lookup('PROB').text).toEqual('probable ');
        expect(translator.lookup('STAPBD').text).toEqual('stand ');
      });
      it('should translate command strokes', function() {
        expect(translator.lookup('PW*').text).toEqual('about');
      });
      it('should translate compound strokes', function() {
        translator.lookup('PROB');
        var result = translator.lookup('HREPL');
        expect(result.text).toEqual('problem ');
        expect(result.stroke).toEqual('PROB/HREPL');
        expect(result.undo_chars).toBe(9);
        translator.lookup('STAPBD');
        result = translator.lookup('-G');
        expect(result.text).toEqual('standing ');
        expect(result.stroke).toEqual('STAPBD/-G');
        expect(result.undo_chars).toBe(6);
        
      });
      it('should append ending strokes', function() {
        translator.lookup('PW');
        var result = translator.lookup("-S");
        expect(result.text).toEqual('s ');
        expect(result.stroke).toEqual('-S');
        expect(result.undo_chars).toBe(1);
        translator.lookup('PW');
        result = translator.lookup('-G');
        expect(result.text).toEqual('ing ');
        expect(result.stroke).toEqual('-G');
        expect(result.undo_chars).toBe(1);
      });
      it('should capitalize', function() {
        translator.lookup("KPA");
        expect(translator.lookup('PW').text).toEqual('About ');
        translator.lookup("KPA");
        expect(translator.lookup('STAPBD').text).toEqual('Stand ');
      });
      it('should only delete prior space when joining words if necessary', function() {
        translator.lookup('PW');
        var result = translator.lookup('S-P');
        expect(result.text).toEqual(' ');
        expect(result.undo_chars).toBe(1);
        translator.lookup('PW*');
        result = translator.lookup('S-P');
        expect(result.text).toEqual(' ');
        expect(result.undo_chars).toBe(0);
      });
      it('capitalize persists through undo', function() {
        translator.lookup('KPA');
        var result = translator.lookup('STAPBD');
        expect(result.text).toEqual('Stand ');
        result = translator.lookup('*');
        expect(result.undo_chars).toBe(6);
        expect(translator.state.capitalize).toBe(true);
        result = translator.lookup('PW');
        expect(result.text).toEqual('About ');
      });
      it('capitalize works for multistroke words', function() {
        translator.lookup('KPA');
        var result = translator.lookup('STAPBD');
        expect(result.text).toEqual('Stand ');
        result = translator.lookup('-G');
        expect(result.undo_chars).toBe(6);
        expect(result.text).toBe('Standing ');
      });
      it('undo works for multistroke words', function() {
        var result = translator.lookup('PROB');
        expect(result.text).toEqual('probable ');
        result = translator.lookup('HREPL');
        expect(result.undo_chars).toBe(9);
        expect(result.text).toEqual('problem ');
        result = translator.lookup('*');
        expect(result.undo_chars).toBe(8);
        expect(result.text).toEqual('probable ');
        result = translator.lookup('*');
        expect(result.undo_chars).toBe(9);
        expect(result.text).toEqual('');
      });
      it('can undo past a #Return', function() {
        translator.lookup('PW');
        var result = translator.lookup('R-R');
        expect(result.text).toEqual('\n');
        result = translator.lookup('*');
        expect(result.undo_chars).toBe(1);
        result = translator.lookup('*');
        expect(result.undo_chars).toBe(6);
      });
    });
    describe('with preceeding spaces', function() {
      beforeEach(function() {
        translator.formatter.spaces_before=true;
      });
    });
  });
});