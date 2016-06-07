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
LookupOutput.prototype.initialize = function() {
  console.log("Initializing Dictionary Lookup output");
  previewSize=0;
  translator = new LookupTranslator();
  translator.initialize();
};

LookupOutput.prototype.strokeHandler = function(engine_id, context_id, stroke) {
  console.log(this.translator);
  var translation = translator.lookup(stroke);
  if (translation !== undefined) {
    
    //undo preview
    chrome.input.ime.deleteSurroundingText({"engineID": engine_id, "contextID": context_id, "offset": -this.previewSize, "length": this.previewSize}, function() {
      // send undo_chars
      chrome.input.ime.deleteSurroundingText({"engineID": engine_id, "contextID": context_id, "offset": -translation.undo_chars, "length": translation.undo_chars, function() {
        // send text + preview
        chrome.input.ime.commitText({"contextID": context_id, "text": translation.text+translation.preview});
        this.previewSize = translation.preview.length;
      }});
    });
  }
};

