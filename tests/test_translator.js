describe('translator.js', function() {
  describe('LookupTranslator', function() {
    var translator;
    beforeEach(function() {
      translator = new LookupTranslator();
      translator.initialize();
      translator._formatter = new SimpleFormatter();
      translator._history = new History(5);
      translator._dictionary.add('PROB', 'probable');
      translator._dictionary.add('PROB/HREPL', 'problem');
      translator._dictionary.add('PW', 'about');
      translator._dictionary.add('PW*', '{about^}');
      translator._dictionary.add('STAPBD', 'stand');
      translator._dictionary.add('STAPBD/-G', 'standing');
      translator._dictionary.add('S-P', '{^ ^}');
      translator._dictionary.add('TH-PL', '{.}');
      translator._dictionary.add('KPA', '{-|}');
      translator._dictionary.add('-S', '{^s}');
      translator._dictionary.add('-G', '{^ing}');
      translator._dictionary.add('R-R', '{^}{#Return}{^}{-|}');
    });
    describe('with following spaces', function() {
      beforeEach(function() {
        translator._formatter.spaces_before=false;
      });
      it('should translate simple strokes', function() {
        expect(translator.lookup('PW')).toEqual(['about ']);
        expect(translator.lookup('PROB')).toEqual(['probable ']);
        translator._queue = new TranslationResult(null);
        expect(translator.lookup('STAPBD')).toEqual(['stand ']);
      });
      it('should translate command strokes', function() {
        expect(translator.lookup('PW*')).toEqual(['about']);
      });
      it('should translate compound strokes', function() {
        translator.lookup('PROB');
        var result = translator.lookup('HREPL');
        expect(translator._state.isFinalSpaceSuppressed()).toBe(false);
        expect(result).toEqual(['\b\b\b\b\b\b\b\b\b', 'problem ']);
        translator.lookup('STAPBD');
        result = translator.lookup('-G');
        expect(result).toEqual(['\b\b\b\b\b\b', 'standing ']);

      });
      it('should append ending strokes', function() {
        translator.lookup('PW');
        expect(translator._state.hasTerminalSpace()).toBe(true);
        var result = translator.lookup("-S");
        expect(result).toEqual(['\b', 's ']);
        translator.lookup('PW');
        result = translator.lookup('-G');
        expect(result).toEqual(['\b','ing ']);
      });
      it('should capitalize', function() {
        translator.lookup("KPA");
        expect(translator.lookup('PW')).toEqual(['About ']);
        translator.lookup("KPA");
        expect(translator.lookup('STAPBD')).toEqual(['Stand ']);
      });
      it('should only delete prior space when joining words if necessary', function() {
        translator.lookup('PW');
        var result = translator.lookup('S-P');
        expect(result).toEqual(['\b', ' ']);
        translator.lookup('PW*');
        result = translator.lookup('S-P');
        expect(result).toEqual([' ']);
      });
      it('capitalize persists through undo', function() {
        translator.lookup('KPA');
        var result = translator.lookup('STAPBD');
        expect(result).toEqual(['Stand ']);
        result = translator.lookup('*');
        expect(result).toEqual(['\b\b\b\b\b\b']);
        expect(translator._state.isCapitalized()).toBe(true);
        result = translator.lookup('PW');
        expect(result).toEqual(['About ']);
      });
      it('capitalize works for multistroke words', function() {
        translator.lookup('KPA');
        expect(translator._state.isCapitalized()).toBe(true);
        var result = translator.lookup('STAPBD');
        expect(result).toEqual(['Stand ']);
        expect(translator._state.isCapitalized()).toBe(false);
        expect(translator._queue.state.isCapitalized()).toBe(true);
        result = translator.lookup('-G');
        expect(result).toEqual(['\b\b\b\b\b\b', 'Standing ']);
        expect(translator._state.isCapitalized()).toBe(false);
        result = translator.lookup('PW');
        expect(result).toEqual(['about ']);
      });
      it('undo works for multistroke words', function() {
        var result = translator.lookup('PROB');
        expect(result).toEqual(['probable ']);
        expect(translator._queue.undo).toEqual(['\b\b\b\b\b\b\b\b\b']);
        result = translator.lookup('HREPL');
        expect(result).toEqual(['\b\b\b\b\b\b\b\b\b', 'problem ']);
        expect(translator._history._stack[translator._history._stack.length-1].undo).toEqual(['\b\b\b\b\b\b\b\b']);
        result = translator.lookup('*');
        expect(result).toEqual(['\b\b\b\b\b\b\b\b', 'probable ']);
        result = translator.lookup('*');
        expect(result).toEqual(['\b\b\b\b\b\b\b\b\b']);
      });
      it('can undo past a #Return', function() {
        translator.lookup('PW');
        var result = translator.lookup('R-R');
        expect(result).toEqual(['\b', '\n']);
        result = translator.lookup('*');
        expect(result).toEqual(['\b', ' ', '\b\b\b\b\b\b', 'about ']);
        result = translator.lookup('*');
        expect(result).toEqual(['\b\b\b\b\b\b']);
      });
      it('undoes from history correctly', function() {
        translator._history.clear();
        var result = translator.lookup("PW");
        expect(result).toEqual(['about ']);
        expect(translator._history._stack.length).toBe(1);
        result = translator.lookup("PROB");
        expect(result).toEqual(['probable ']);
        expect(translator._history._stack.length).toBe(1);
        result = translator.lookup("PW");
        expect(result).toEqual(['\b\b\b\b\b\b\b\b\b', 'probable ', 'about ']);
        expect(translator._history._stack.length).toBe(3);
        result = translator.lookup('*');
        expect(result).toEqual(['\b\b\b\b\b\b', '\b\b\b\b\b\b\b\b\b', 'probable ']);
        expect(translator._history._stack.length).toBe(1);
        result = translator.lookup('*');
        expect(result).toEqual(['\b\b\b\b\b\b\b\b\b', '\b\b\b\b\b\b', 'about ']);
        expect(translator._history._stack.length).toBe(1);
        result = translator.lookup('*');
        expect(result).toEqual(['\b\b\b\b\b\b']);
        expect(translator._history._stack.length).toBe(0);
      });
      it('resets space suppression', function() {
        expect(translator._state.isInitialSpaceSuppressed()).toBe(false);
        expect(translator._state.isFinalSpaceSuppressed()).toBe(false);
        var result = translator.lookup("{^Love^}");
        expect(result[0]).toEqual("Love");
        expect(translator._state.isInitialSpaceSuppressed()).toBe(true);
        expect(translator._state.isFinalSpaceSuppressed()).toBe(false);
        result = translator.lookup("Love");
        expect(result[0]).toEqual("Love ");
        expect(translator._state.isInitialSpaceSuppressed()).toBe(false);
        expect(translator._state.isFinalSpaceSuppressed()).toBe(false);
      });
      it('allows mistakes in multi-stroke words', function() {
        var result = translator.lookup('PROB');
        expect(result).toEqual(['probable ']);
        result = translator.lookup('HROPL');
        expect(result).toEqual(['\b\b\b\b\b\b\b\b\b', 'probable ', 'HROPL ']);
        result = translator.lookup('*');
        expect(result).toEqual(['\b\b\b\b\b\b', '\b\b\b\b\b\b\b\b\b', 'probable ']);
        result = translator.lookup('HREPL');
        expect(result).toEqual(['\b\b\b\b\b\b\b\b\b', 'problem ']);
      });
      it('allows mistakes in multi-stroke words with no common root', function() {
        translator._dictionary.add('TAL/BOT', 'talbot');
        translator._dictionary.add('TAL/BET', 'tablet');
        expect(translator._dictionary.lookup('TAL')).not.toBe(undefined);
        var result = translator.lookup('TAL');
        expect(result).toEqual(['TAL ']);
        result = translator.lookup('BOT');
        expect(result).toEqual(['\b\b\b\b', 'talbot ']);
        result = translator.lookup('*');
        expect(result).toEqual(['\b\b\b\b\b\b\b', 'TAL ']);
        result = translator.lookup('BAT');
        expect(result).toEqual(['\b\b\b\b', 'TAL ', 'BAT ']);
        result = translator.lookup('*');
        expect(result).toEqual(['\b\b\b\b', '\b\b\b\b', 'TAL ']);
        result = translator.lookup('BET');
        expect(result).toEqual(['\b\b\b\b', 'tablet ']);
      });
      it('multistroke words with undefined member translations should show split words, but leave the strokes in the queue.', function() {
        translator._dictionary.add('EU', 'I');
        translator._dictionary.add('EU/HROUF', 'I love you');
        translator._dictionary.add('EU/HRUF/TPEUSZ', 'I love fish');
        translator._dictionary.add('HRUF', 'love');
        translator._dictionary.add('U', 'you');
        expect(translator.lookup('EU')).toEqual(['I ']);
        expect(translator._state.getOutput(-1)).toEqual('I ');
        expect(translator._dictionary.lookup('EU').ambiguous).toBe(true);
        expect(translator._queue.stroke).toEqual('EU');
        expect(translator._queue.undo).toEqual(['\b\b']);
        expect(translator._dictionary.lookup('EU/HRUF').ambiguous).toBe(true);
        expect(translator.lookup('HRUF')).toEqual(['\b\b','I ','love ']);
        expect(translator._state.getOutput(-1)).toEqual('I love ');
        expect(translator._queue.stroke).toEqual('EU/HRUF');
        expect(translator._queue.undo).toEqual(['\b\b\b\b\b', '\b\b']);
        expect(translator.lookup('U')).toEqual(['\b\b\b\b\b', '\b\b', 'I ', 'love ', 'you ']);
        expect(translator._state.getOutput(-1)).toEqual('I love you ');
        expect(translator._queue.stroke).toEqual('');
      });
      it('commits the queue at the right time', function() {
        translator._history.clear();
        expect(translator._history._stack.length).toBe(0);
        translator.lookup("PB");
        expect(translator._history._stack.length).toBe(1);
        expect(translator._history._stack[translator._history._stack.length-1].stroke).toEqual('PB');
        translator.lookup("PROB");
        expect(translator._history._stack.length).toBe(1);
        translator.lookup("PB");
        expect(translator._history._stack.length).toBe(3);
      });
      it('handles punctuation correctly', function() {
        var result = translator.lookup("PW");
        expect(result).toEqual(['about ']);
        result = translator.lookup('{.}');
        expect(result).toEqual(['\b', '.  ']);
        expect(translator._state.isCapitalized()).toBe(true);
        result = translator.lookup('{,}');
        expect(result).toEqual(['\b', ', ']);
        expect(translator._state.isCapitalized()).toBe(true);
      });
    });
    describe('with preceeding spaces', function() {
      beforeEach(function() {
        translator._formatter.spaces_before=true;
      });
      it('resets space suppression', function() {
        expect(translator._state.isInitialSpaceSuppressed()).toBe(false);
        expect(translator._state.isFinalSpaceSuppressed()).toBe(false);
        var result = translator.lookup("{^Love^}");
        expect(result[0]).toEqual("Love");
        expect(translator._state.isInitialSpaceSuppressed()).toBe(false);
        expect(translator._state.isFinalSpaceSuppressed()).toBe(true);
        result = translator.lookup("Love");
        expect(result[0]).toEqual("Love");
        expect(translator._state.isInitialSpaceSuppressed()).toBe(false);
        expect(translator._state.isFinalSpaceSuppressed()).toBe(false);
      });
    });
    it('clears the queue on reset', function() {
      expect(translator._queue.stroke).toEqual('');
      translator.lookup("PROB");
      expect(translator._queue.stroke).toEqual('PROB');
      translator.reset();
      expect(translator._queue.stroke).toEqual('');
    });
    it('clears history on reset', function() {
      expect(translator._history._stack.length===0).toBe(true);
      translator.lookup("PW");
      expect(translator._queue.stroke).toEqual('');
      expect(translator._history._stack.length===0).toBe(false);
      translator.reset();
      expect(translator._history._stack.length===0).toBe(true);
    });
  });

});