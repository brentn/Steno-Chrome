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
      console.debug("Undo: load preview from history");
      this.preview = this.history.undo();
    }
    if (this.preview !== undefined) {
      console.debug("Undoing "+this.preview.text);
      result.undo_chars = this.preview.text.length;
      if (this.preview.stroke.indexOf("/")>-1) { 
        // preview consists of multiple strokes, so only remove the last stroke
        this.preview.stroke = this.preview.stroke.substring(0, this.preview.stroke.lastIndexOf('/'));
        this.preview.text = this.formatter.format(this.dictionary.lookup(this.preview.stroke).translation);
        result.text = this.preview.text;
      } else {
        // preview is only a single stroke, so remove it
        this.preview = Object.create(TranslationResult);
        result.text='';
      }
    } else {
      //undo by deleting last word
      console.debug("Undo history is empty.  Removing prior word");
    }
  } else { 
    //translate
    var fullStroke = this.preview.stroke + (this.preview.stroke.length>0?"/":"") + stroke;
    var lookupResult = this.dictionary.lookup(fullStroke);
    if (lookupResult !== undefined) {
      this.preview.stroke = fullStroke;
      this.preview.text = this.formatter.format(lookupResult.translation);
      result = this.preview;
      if (! lookupResult.ambiguous) {
        this.history.add(this.preview);
        this.preview = Object.create(TranslationResult);
      }
    } else {
      // full stroke not found in dictionary
      console.debug("No translation found for "+fullStroke);
      if (this.preview.stroke.length === 0) {
        //add raw stroke
        this.preview.stroke=stroke;
        this.preview.text=this.formatter.format(stroke);
        result=this.preview;
      }
      this.history.add(this.preview);
      this.preview = Object.create(TranslationResult);
      if (result.stroke.length===0) {
        result = this.lookup(stroke);
      }
    }
  }
  return result;
};


var TranslationResult = {
  stroke:'',
  text:'',
  undo_chars:0
};


function History(size) {
  this.maxSize = size;
  this.size = 0;
  this.position = -1;
  this.translations = new Array(this.size);
  this.add = function(translation) {
    if (this.size<this.maxSize) {this.size++;}
    this.position = ((this.position+1)%this.maxSize);
    this.translations[this.position] = translation;
    //console.debug("history size:"+this.size+" position:"+this.position+" text:"+this.translations[this.position].text);
  };
  this.undo = function() {
    if (this.size>0) {
      var result = this.translations[this.position];
      this.size--;
      if (this.size===0) {this.position=-1;}
      else { this.position = (this.position+this.maxSize-1)%this.maxSize; }
      //console.debug("undo history size:"+this.size+" position:"+this.position+" text:"+this.translations[0].text);
      return result;
    } 
    return Object.create(TranslationResult);
  };
}