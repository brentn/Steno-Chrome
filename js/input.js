var Input = {
  initialize: function(strokeHandler){}
};

var KeyboardInput = function(){};
var TXBoltInput = function(){};


KeyboardInput.prototype = Object.create(Input);
KeyboardInput.prototype.initialize = function(strokeHandler) {
  var context_id=-1;
  var keys_pressed = new Set();
  var chord = new Chord();
  
  console.log("Initializing Keyboard input");
  
  chrome.input.ime.onFocus.addListener(function(context) {
    context_id = context.contextID;
  });
  
  chrome.input.ime.onBlur.addListener(function(contextID) {
    context_id = -1;
  });
  
  chrome.input.ime.onKeyEvent.addListener(function(engineID, keyData) {
    if (keyData.type == "keydown") {
      if (! keys_pressed.has(keyData.code)) {
        keys_pressed.add(keyData.code);
        var key = codemap(keyData.code);
        if (key !== undefined) {
          chord.addKey(key);
        }
      }
    }
    if (keyData.type == "keyup") {
      keys_pressed.delete(keyData.code);
      if (keys_pressed.size===0) {
        var stroke = chord.toString();
        if (stroke.length > 0) {
          console.log("Stroke:"+stroke);
          strokeHandler(engineID, context_id, stroke);
        } else {
          console.debug("Null stroke");
        }
        chord.clear();
      }
    }
    return true; // always comsume the keyboard input
  });
  
  // chrome.input.ime.onSurroundingTextChanged.addListener(function(engineID, surroundingInfo) {
  //   //strokeHandler(engineID, context_id, '[RESET]');
  // });
  
  chrome.input.ime.onReset.addListener(function(engineID) {
    strokeHandler(engineID, context_id, '[RESET]');
    context_id=-1;
    keys_pressed.clear();
    chord.clear();
  });
  
  function codemap(code) {
    switch(code) {
      case 'Digit1': return "#";
      case 'Digit2': return "#";
      case 'Digit3': return "#";
      case 'Digit4': return "#";
      case 'Digit5': return "#";
      case 'Digit6': return "#";
      case 'Digit7': return "#";
      case 'Digit8': return "#";
      case 'Digit9': return "#";
      case 'Digit0': return "#";
      case 'Minus': return "#";
      case 'Equal': return "#";
      case 'KeyQ': return "S-";
      case 'KeyW': return "T-";
      case 'KeyE': return "P-";
      case 'KeyR': return "H-";
      case 'KeyA': return "S-";
      case 'KeyS': return "K-";
      case 'KeyD': return "W-";
      case 'KeyF': return "R-";
      case 'KeyC': return "A-";
      case 'KeyV': return "O-";
      case 'KeyT': return "*";
      case 'KeyY': return "*";
      case 'KeyG': return "*";
      case 'KeyH': return "*";
      case 'KeyN': return "-E";
      case 'KeyM': return "-U";
      case 'KeyU': return "-F";
      case 'KeyI': return "-P";
      case 'KeyO': return "-L";
      case 'KeyP': return "-T";
      case 'BracketLeft': return "-D";
      case 'KeyJ': return "-R";
      case 'KeyK': return "-B";
      case 'KeyL': return "-G";
      case 'Semicolon': return "-S";
      case 'Quote': return "-Z";
      default:console.log("Missing code:"+code); return undefined;
    }
  }
};


TXBoltInput.prototype = Object.create(Input);
TXBoltInput.prototype.initialize = function(strokeHandler) {
  var PATH = '/dev/ttyS0';
  var OPTIONS = null;
  
  console.log("Initializing TXBolt input device");
  
  chrome.serial.connect(PATH, OPTIONS, function(connectionInfo) {
    console.log("TXBolt connected");  
  });
  chrome.serial.onReceive.addListener(function(info){
    console.log("data: "+info.data);
  });
  chrome.serial.onReceiveError.addListener(function(info) {
    console.error("TXBolt error: "+info.error);
  });
};



