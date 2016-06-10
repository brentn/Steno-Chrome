describe('KeyboardInput tests', function() {
  var input;
  var lastStroke;
  var strokeHandler = function(engine, context, stroke) {console.log(stroke); lastStroke=stroke;};
  
  var keyDown = function(key) {
    var event = document.createEvent('Event');
    event.keyCode = key;
    event.initEvent('keydown');
    document.dispatchEvent(event);
  };
  var keyUp = function(key) {
    var event = document.createEvent('Event');
    event.keyCode=key;
    event.initEvent('keyup');
    document.dispatchEvent(event);
  };
  
  beforeEach(function() {
    input = new KeyboardInput();
    //input.initialize(strokeHandler);
  });
  
  it('maps valid keys correctly', function() {
    var map = [{key:'Digit1', code:'#'},
                {key:'KeyQ', code:'S-'},
                {key:'Digit2', code:'#'},
                {key:'KeyW', code:'T-'},
                {key:'Digit3', code:'#'},
                {key:'KeyE', code:'P-'},
                {key:'Digit4', code:'#'},
                {key:'KeyR', code:'H-'},
                {key:'Digit5', code:'#'},
                {key:'KeyT', code:'*'},
                {key:'Digit6', code:'#'},
                {key:'KeyY', code:'*'},
                {key:'Digit7', code:'#'},
                {key:'KeyU', code:'-F'},
                {key:'Digit8', code:'#'},
                {key:'KeyI', code:'-P'},
                {key:'Digit9', code:'#'},
                {key:'KeyO', code:'-L'},
                {key:'Digit0', code:'#'},
                {key:'KeyP', code:'-T'},
                {key:'Minus', code:'#'},
                {key:'BracketLeft', code:'-D'},
                {key:'Equal', code:'#'},
                {key:'KeyA', code:'S-'},
                {key:'KeyS', code:'K-'},
                {key:'KeyD', code:'W-'},
                {key:'KeyF', code:'R-'},
                {key:'KeyG', code:'*'},
                {key:'KeyH', code:'*'},
                {key:'KeyJ', code:'-R'},
                {key:'KeyK', code:'-B'},
                {key:'KeyL', code:'-G'},
                {key:'Semicolon', code:'-S'},
                {key:'Quote', code:'-Z'},
                {key:'KeyC', code:'A-'},
                {key:'KeyV', code:'O-'},
                {key:'KeyN', code:'-E'},
                {key:'KeyM', code:'-U'}
              ];
    for (var item in map) {
      keyDown(map[item].key);
      keyUp(map[item].key);
      //expect(lastStroke).toBe(map[item].code);
    }
  });
  it('ignores invalid keys', function() {
    
  });
  it('doesnt matter what order keys are pressed and released', function() {
    
  });
  it('clears the chord once all keys are released', function() {
    
  });
  it('returns true with valid chord', function() {
    
  });
  it('returns true with invalid chord', function() {
    
  });
  describe('strokeHandler()', function() {
    it('calls strokeHandler with correct chord', function() {
      
    });
    it('doesnt call strokeHandler when chord is empty (invalid keys)', function() {
      
    });
  });
  describe('resetHandler()', function() {
    it('is called on reset', function() {
      
    });
    it('clears the chord and keys', function() {
      
    });
    it('resets the context', function() {
      
    });
  });
});

describe('TXBoltInput tests', function() {
  
});