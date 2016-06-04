var Output = {
  translator:null,
  initialize: function(){},
  print: function(context, stroke){}
};


var StrokeOutput = function(){};
var LookupOutput = function(){};

StrokeOutput.prototype = Object.create(Output);
StrokeOutput.prototype.initialize = function() {
    console.log("Initializing Stroke output");
    translator=null;
};

StrokeOutput.prototype.print = function(context_id, stroke) {
  console.debug("Output: "+stroke+" to context:"+context_id);
  chrome.input.ime.commitText({"contextID": context_id, "text": stroke + '/'});
};


LookupOutput.prototype = Object.create(Output);
LookupOutput.prototype.initialize = function() {
  console.log("Initializing Dictionary Lookup output");
  translator = new LookupTranslator();
  translator.initialize();
};

LookupOutput.prototype.print = function(context_id, stroke) {
  var translation = translator.lookup(stroke);
  if (translation !== undefined) {
    chrome.input.ime.commitText({"contextID": context_id, "text": translation});
  }
};

