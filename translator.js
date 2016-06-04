var Translator = {
  dictionary:new Dictionary(null),
  initialize : function(){},
  lookup : function(stroke){}
};

var DICTIONARY_FILE = 'assets/main.json';
var SPACE_PLACEMENT='after';

var LookupTranslator = function(){};

LookupTranslator.prototype = Object.create(Translator);
LookupTranslator.prototype.initialize = function(){
  console.log("Initializing Lookup translator");
  dictionary = new Dictionary();
  dictionary.load(DICTIONARY_FILE);
};

LookupTranslator.prototype.lookup = function(stroke) {
  if (! dictionary.loaded) {
    console.warn("The dictionary has not been fully loaded");
    return undefined;
  }
  var translation = dictionary.lookup(stroke);
  if (translation === undefined) {
    console.debug("Stroke not found in dictionary");
    translation=stroke;
  } 
  var prefix = '';
  var suffix = '';
  if (SPACE_PLACEMENT=='after') {
    suffix=' ';
  } else {
    prefix =' ';
  }
  console.debug("Stroke:"+stroke+" Translation:"+translation);
  return prefix+translation+suffix;
};