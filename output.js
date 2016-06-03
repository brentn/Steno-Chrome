var Output = {
  initialize: function(){},
  print: function(context, stroke){}
};

var StrokeOutput = function(){};


StrokeOutput.prototype = Object.create(Output);
StrokeOutput.prototype.initialize = function() {
    console.log("Initializing Stroke output");
};

StrokeOutput.prototype.print = function(context_id, stroke) {
  console.debug("Output: "+stroke+" to context:"+context_id);
  chrome.input.ime.commitText({"contextID": context_id, "text": stroke + '/'});
};