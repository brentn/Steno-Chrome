var Translator = {
  initialize : function(){},
  lookup : function(stroke){},
  reset : function() {}
};

var LookupTranslator = function(){};

LookupTranslator.prototype = Object.create(Translator);
LookupTranslator.prototype.initialize = function(){
  console.log("Initializing Lookup translator");
  var self=this;
  this.dictionary = new Dictionary();
  try {
    chrome.storage.sync.get({DICTIONARIES:['assets/main.json'], UNDO_SIZE:20}, function(items) {
      self.dictionary.load(items.DICTIONARIES, null);
      self.history = new History(items.UNDO_SIZE);
    });
  } catch(ex) {}
  this.formatter = new SimpleFormatter();
  this.formatter.initialize();
  this.state = new State();
  this.queue = new TranslationResult(this.state);
};

LookupTranslator.prototype.lookup = function(stroke) {
  if (! this.dictionary.loaded) {
    console.warn("The dictionary has not been fully loaded");
    return undefined;
  }
  var self=this;
  if (stroke=="*") { 
    return undoStroke();
  } else { 
    return translate(stroke);
  }

  function translate(stroke) {
    var result;
    if (self.queue.isEmpty()) {
      result = _translate_simple_stroke(stroke);
    } else {
      var fullStroke = self.queue.stroke + '/' + stroke;
      var lookupResult = self.dictionary.lookup(fullStroke);
      if (lookupResult !== undefined) {
        result = new TranslationResult();
        result.undo_chars = self.queue.text.length;
        result.stroke = fullStroke;
        result.text = lookupResult.translation;
        result.state = self.state;
        self.formatter.format(result);
        self.queue.state = result.state;
        self.queue.stroke = result.stroke;
        self.queue.text = result.text;
        self.formatter.format(self.queue);
        if (!lookupResult.ambiguous)
          commitQueue();
      } else {
        commitQueue();
        result = _translate_simple_stroke(stroke);
      }
    }
    self.state = result.state;
    return result;
  }
  
  function _translate_simple_stroke(stroke) {
    if (!self.queue.isEmpty())
      throw message || "Queue should always be empty here";
    var result;
    var lookupResult;
    var ambiguous=false;

    self.queue.state = self.state;
    self.queue.stroke = stroke;
    lookupResult = self.dictionary.lookup(stroke);
    if (lookupResult === undefined) {
      self.queue.text = stroke;
    } else {
      self.queue.text = lookupResult.translation;
      self.formatter.format(self.queue);
      ambiguous = lookupResult.ambiguous;
    }
    result = self.queue;
    if (!ambiguous)
      commitQueue();
    return result;
  }
  
  function undoStroke() {
    var result = new TranslationResult(null);
    if (self.queue.isEmpty()) {
      self.queue = self.history.undo();
    }
    if (!self.queue.isEmpty()) {
      if (self.queue.isCompoundStroke()) {
        result.undo_chars = self.queue.text.length;
        self.queue.stroke = self.queue.stroke.substring(0, self.queue.stroke.lastIndexOf('/'));
        self.queue.translation = self.dictionary.lookup(self.queue.stroke);
      } else {
        result.undo_chars = self.queue.text.length;
        self.queue = new TranslationResult(self.state);
      }
      result.state = self.queue.state;
      result.stroke = self.queue.stroke;
      result.text = self.queue.text;
    } else {
      //no history to undo
      console.log("no history to undo");
    }
    return result;
  }
  
  function commitQueue() {
    self.history.add(self.queue);
    self.queue = new TranslationResult(self.state);
  }
};

LookupTranslator.prototype.reset = function() {
  this.queue = new TranslationResult(null);
  this.history.clear();
};


TranslationResult = function(state) {
  this.state = new State();
  if (state!==undefined  && state !== null) {
    this.state.capitalize = state.capitalize;
    this.state.lowercase = state.lowercase;
    this.state.start = state.start;
    this.state.end = state.end;
    this.state.glue = state.glue;
  }
  this.stroke = '';
  this.text = '';
  this.undo_chars = 0;
  this.isEmpty = function() {return this.stroke.length===0;};
  this.isCompoundStroke = function() {return this.stroke.indexOf('/')>=0;};
};

State = function() {
  this.capitalize=false;
  this.lowercase=false;
  this.start=false;
  this.end=false;
  this.glue=false;
};

History = function(size) {
  this.maxSize = size;
  this.size = 0;
  this.position = -1;
  this.translations = new Array(this.size);
  this.add = function(translation) {
    if (this.size<this.maxSize) {this.size++;}
    this.position = ((this.position+1)%this.maxSize);
    this.translations[this.position] = translation;
  };
  this.undo = function() {
    if (this.size>0) {
      var result = this.translations[this.position];
      this.size--;
      if (this.size===0) {this.position=-1;}
      else { 
        this.position--;
        if (this.position<0) 
          { this.position+=this.maxSize; }
      }
      return result;
    } 
    return new TranslationResult(null);
  };
  this.clear = function() {
    this.size=0;
    this.position=-1;
  };
};