var Translator = {
  initialize : function(){},
  lookup : function(stroke){}
};

var DICTIONARY_FILE = 'assets/main.json';

var LookupTranslator = function(){};

LookupTranslator.prototype = Object.create(Translator);
LookupTranslator.prototype.initialize = function(){
  console.log("Initializing Lookup translator");
  this.dictionary = new Dictionary();
  this.dictionary.load(DICTIONARY_FILE);
  this.formatter = new SimpleFormatter();
  this.formatter.initialize();
  this.preview = Object.create(TranslationResult);
  this.history = new History(10);
};

LookupTranslator.prototype.lookup = function(stroke) {
  if (! this.dictionary.loaded) {
    console.warn("The dictionary has not been fully loaded");
    return undefined;
  }
  var result = Object.create(TranslationResult);
  if (stroke=="*") { 
    //undo
    if (this.preview.stroke.length===0) {
      console.debug("UNDO: pop preview from history");
      this.preview = this.history.undo();
    }
    if (this.preview !== undefined) {
      result.undo_chars = this.preview.text.length;
      if (this.preview.stroke.contains("/")) {
        this.preview.stroke = this.preview.stroke.substring(0, this.preview.stroke.lastIndexOf('/'));
        this.preview.text = this.formatter.format(this.dictionary.lookup(this.preview.stroke));
        result.text = this.preview.text;
      } else {
        this.preview.reset();
        result.text='';
      }
    } else {
      //undo by deleting last word
      console.debug("Undo history is empty.  Removing prior word");
    }
  } else { 
    //new translation
    var fullStroke = this.preview.stroke + (this.preview.stroke.length>0?"/":"") + stroke;
    var lookupResult = this.dictionary.lookup(fullStroke);
    if (lookupResult === undefined) {
      //no translation found
      console.debug("No translation found for:"+fullStroke);
      result.stroke = fullStroke;
      result.text = this.formatter.format(fullStroke);
    } else {
      if (lookupResult.indeterminite) {
        //indeterminite lookup
        console.debug("Stroke:"+fullStroke+" (Translation:"+lookupResult.translation+")");
        this.preview.stroke = fullStroke;
        this.preview.text = "<preview>"+this.formatter.format(lookupResult.translation)+"</preview>";
        result = this.preview;
      } else {
        //final result
        console.debug("Stroke:"+fullStroke+"  Translation:"+lookupResult.translation);
        this.preview.reset();
        result.stroke = fullStroke;
        result.text = this.formatter.format(lookupResult.translation);
      }
    }
  }
  return result;
};

function flush() {
  this.history.add(this.preview);
  this.preview.reset();
}

function commit(translation) {

}

var TranslationResult = {
  stroke:'',
  text:'',
  undo_chars:0,
  reset:function() {
    this.stroke='';
    this.text='';
    undo_chars=0;
  }
};


function History(size) {
  this.maxSize = size;
  this.size = 0;
  this.position = -1;
  this.translations = new Array(this.size);
  this.add = function(translation) {
    if (this.size<this.maxSize) {this.size++;}
    this.position = ((this.position++)%this.maxSize);
    this.translations[this.position] = this.translation;
  };
  this.undo = function() {
    if (this.size>0) {
      var result = this.translations[this.position];
      this.size--;
      if (this.size===0) {this.position=-1;}
      else { this.position = (this.position+this.maxSize-1)%this.maxSize; }
      return result;
    } 
    return undefined;
  };
}