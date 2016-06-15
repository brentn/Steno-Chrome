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
        keyData.push(new KeyboardEvent("keydown", {bubbles:true, cancellable:true, key:translation.commands[i]}));
        keyData.push(new KeyboardEvent("keyup", {bubbles:true, cancellable:true, key:translation.commands[i]}));
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
};

