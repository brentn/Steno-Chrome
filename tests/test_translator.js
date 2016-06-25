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
        translator.queue = new TranslationResult(null);
        expect(translator.lookup('STAPBD').text).toEqual('stand ');
      });
      it('should translate command strokes', function() {
        expect(translator.lookup('PW*').text).toEqual('about');
      });
      it('should translate compound strokes', function() {
        translator.lookup('PROB');
        var result = translator.lookup('HREPL');
        expect(translator.state.isFinalSpaceSuppressed()).toBe(false);
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
        expect(translator.state.isCapitalized()).toBe(true);
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
        expect(result.undo_chars).toBe(7);
        expect(result.text).toEqual('about ');
        result = translator.lookup('*');
        expect(result.undo_chars).toBe(6);
      });
      it('resets space suppression', function() {
        expect(translator.state.isInitialSpaceSuppressed()).toBe(false);
        expect(translator.state.isFinalSpaceSuppressed()).toBe(false);
        var result = translator.lookup("{^Love^}");
        expect(result.text).toEqual("Love");
        expect(translator.state.isInitialSpaceSuppressed()).toBe(true);
        expect(translator.state.isFinalSpaceSuppressed()).toBe(false);
        result = translator.lookup("Love");
        expect(result.text).toEqual("Love ");
        expect(translator.state.isInitialSpaceSuppressed()).toBe(false);
        expect(translator.state.isFinalSpaceSuppressed()).toBe(false);
      });
      it('allows mistakes in multi-stroke words', function() {
        var result = translator.lookup('PROB');
        expect(result.text).toEqual('probable ');
        result = translator.lookup('HROPL');
        expect(result.undo_chars).toBe(9);
        expect(result.text).toEqual('probable HROPL ');
        result = translator.lookup('*');
        expect(result.undo_chars).toBe(15);
        expect(result.text).toEqual('probable ');
        result = translator.lookup('HREPL');
        expect(result.undo_chars).toBe(9);
        expect(result.text).toEqual('problem ');
      });
      it('allows mistakes in multi-stroke words with no common root', function() {
        translator.dictionary.add('TAL/BOT', 'talbot');
        translator.dictionary.add('TAL/BET', 'tablet');
        expect(translator.dictionary.lookup('TAL')).not.toBe(undefined);
        var result = translator.lookup('TAL');
        expect(result.text).toEqual('TAL ');
        expect(result.undo_chars).toBe(0);
        result = translator.lookup('BOT');
        expect(result.text).toEqual('talbot ');
        expect(result.undo_chars).toBe(4);
        result = translator.lookup('*');
        expect(result.text).toEqual('TAL ');
        expect(result.undo_chars).toBe(7);
        result = translator.lookup('BAT');
        expect(result.text).toEqual('BAT ');
        expect(result.undo_chars).toBe(0);
        result = translator.lookup('*');
        expect(result.text).toEqual('TAL ');
        expect(result.undo_chars).toBe(8);
        result = translator.lookup('BET');
        expect(result.text).toEqual('tablet ');
        expect(result.undo_chars).toBe(4);
      });
    });
    describe('with preceeding spaces', function() {
      beforeEach(function() {
        translator.formatter.spaces_before=true;
      });
      it('resets space suppression', function() {
        expect(translator.state.isInitialSpaceSuppressed()).toBe(false);
        expect(translator.state.isFinalSpaceSuppressed()).toBe(false);
        var result = translator.lookup("{^Love^}");
        expect(result.text).toEqual("Love");
        expect(translator.state.isInitialSpaceSuppressed()).toBe(false);
        expect(translator.state.isFinalSpaceSuppressed()).toBe(true);
        result = translator.lookup("Love");
        expect(result.text).toEqual("Love");
        expect(translator.state.isInitialSpaceSuppressed()).toBe(false);
        expect(translator.state.isFinalSpaceSuppressed()).toBe(false);
      });
    });
    it('clears the queue on reset', function() {
      expect(translator.queue.stroke).toEqual('');
      translator.lookup("PROB");
      expect(translator.queue.stroke).toEqual('PROB');
      translator.reset();
      expect(translator.queue.stroke).toEqual('');
    });
    it('clears history on reset', function() {
      expect(translator.history.isEmpty()).toBe(true);
      translator.lookup("PW");
      expect(translator.queue.stroke).toEqual('');
      expect(translator.history.isEmpty()).toBe(false);
      translator.reset();
      expect(translator.history.isEmpty()).toBe(true);
    });
  });
});