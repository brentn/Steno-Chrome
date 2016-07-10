var Output = {
  initialize: function(){},
  strokeHandler: function(engine_id, context_id, stroke){
    if (stroke == '[RESET]') {
      translator.reset();
    } else {
      var output = translator.lookup(stroke);
      if (output !== undefined) {
        var i=0;
        var printloop = function() {
          var translation = output[i];
          if (translation.length>0 && translation[0] == '\b') {
            var num = translation.split('\b').length-1;
            console.debug('deleting '+num+' characters');
            chrome.input.ime.deleteSurroundingText({"engineID": engine_id, "contextID": context_id, "offset":-num, "length": num}, function() {
              i++;
              if (i < (output.length)) {
                printloop();
              }
            });
          } else {
            console.debug('printing "'+translation+'"');
            chrome.input.ime.commitText({"contextID": context_id, "text": translation}, function() {
              i++;
              if (i < (output.length)) {
                printloop();
              }
            });
          }
        };
        printloop();
      }
    }
  }
};

var StrokeOutput = function(){};
var SimpleOutput = function(){};
var LookupOutput = function(){};

StrokeOutput.prototype = Object.create(Output);
StrokeOutput.prototype.initialize = function() {
    console.log("Initializing Stroke output");
};
StrokeOutput.prototype.strokeHandler = function(engine_id, context_id, stroke) {
  console.debug("Output: "+stroke+" to context:"+context_id);
  chrome.input.ime.commitText({"contextID": context_id, "text": stroke + '/'});
};

SimpleOutput.prototype = Object.create(Output);
SimpleOutput.prototype.initialize = function(engine_id, context_id, stroke) {
  console.log("Initializing Simple output");
  previewSize=0;
  translator = new SimpleTranslator();
  translator.initialize();
};

LookupOutput.prototype = Object.create(Output);
LookupOutput.prototype.initialize = function() {
  console.log("Initializing Full Dictionary Lookup output");
  previewSize=0;
  translator = new LookupTranslator();
  translator.initialize();
};


