var Output = {
  initialize: function(){},
  strokeHandler: function(engine, context, stroke){}
};


var StrokeOutput = function(){};
var LookupOutput = function(){};

StrokeOutput.prototype = Object.create(Output);
StrokeOutput.prototype.initialize = function() {
    console.log("Initializing Stroke output");
};

StrokeOutput.prototype.strokeHandler = function(engine_id, context_id, stroke) {
  console.debug("Output: "+stroke+" to context:"+context_id);
  chrome.input.ime.commitText({"contextID": context_id, "text": stroke + '/'});
};


LookupOutput.prototype = Object.create(Output);
LookupOutput.prototype.constructor = function() {
  console.log("constructing");
};
LookupOutput.prototype.initialize = function() {
  console.log("Initializing Dictionary Lookup output");
  previewSize=0;
  translator = new LookupTranslator();
  translator.initialize();
};

LookupOutput.prototype.strokeHandler = function(engine_id, context_id, stroke) {
  var translation = translator.lookup(stroke);
  if (translation !== undefined) {
    if (translation.commands.length>0) {
      var keyData = [];
      for(var i=0; i<translation.commands.length; i++) {
        keyData.push(generateKeyEvent(translation.commands[i]));
        console.log(keyData);
      }
      chrome.input.ime.sendKeyEvents({"contextID":context_id, "keyData":keyData});
    }
    if (translation.undo_chars>0) {
    chrome.input.ime.deleteSurroundingText({"engineID": engine_id, "contextID": context_id, "offset":-translation.undo_chars, "length": translation.undo_chars}, function() {
      chrome.input.ime.commitText({"contextID": context_id, "text": translation.text});
    });
    } else {
      chrome.input.ime.commitText({"contextID": context_id, "text": translation.text});
    }
  }
  
  function generateKeyEvent(command) {
    var evt = document.createEvent("KeyboardEvent");
    (evt.initKeyEvent || evt.initKeyboardEvent)("keypress", true, true, window,
                      0, 0, 0, 0,
                      keyCode(command), 0);
    return evt;
  }
  
  function keyCode(command) {
    var map = {'Return':13,'Left':37,'Up':38,'Right':39,'Down':40};
    if (map.hasOwnProperty(command)) return map[command];
    else return 0;
  }
};

