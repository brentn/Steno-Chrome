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
  if (stroke == '[RESET]') {
    translator.reset();
  } else {
    var translation = translator.lookup(stroke);
    if (translation !== undefined) {
      if (translation.undo_chars>0) {
        console.debug("BACKSPACE:"+translation.undo_chars);
        chrome.input.ime.deleteSurroundingText({"engineID": engine_id, "contextID": context_id, "offset":-translation.undo_chars, "length": translation.undo_chars}, function() {
          chrome.input.ime.commitText({"contextID": context_id, "text": translation.text});
        });
      } else {
        chrome.input.ime.commitText({"contextID": context_id, "text": translation.text});
      }
    }
  }
  
};

