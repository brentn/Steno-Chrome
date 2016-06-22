var dictionaryPluginID = 'calecfmgglplmbamkalpndodmpomgnll';

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
    chrome.storage.sync.get({DEFAULT_DICTIONARY:true, UNDO_SIZE:20}, function(items) {
      if (items.DEFAULT_DICTIONARY) {
        self.dictionary.load(['assets/dictionary.json'], loadCustomDictionaries);
      } else {
        loadCustomDictionaries();
      }

      self.history = new History(items.UNDO_SIZE);
    });
  } catch(ex) {}
  this.formatter = new SimpleFormatter();
  this.formatter.initialize();
  this.state = new State();
  this.queue = new TranslationResult(this.state);
  
  function loadCustomDictionaries() {
    try {
      chrome.storage.sync.get({CUSTOM_DICTIONARY:true}, function(items) {
        if (items.CUSTOM_DICTIONARY) {
          console.debug("Loading custom dictionaries...");
          chrome.runtime.sendMessage(dictionaryPluginID, {action: "loadDictionaries"}, function(response) {
            if (response!==undefined && response.status=="OK") {
              for (var dict in response.dictionaries) {
                self.dictionary.loadJson(dict.json);
                console.debug("Loaded custom dictionary: "+dict.name);
              }
            } else {
              console.debug("Custom dictionaries NOT found" + response);
            }
          });
        }
      });
    } catch(ex) {}
  }
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
        self.state = new State(self.queue.state);
        result.stroke = fullStroke;
        self.queue.stroke = fullStroke;
        self.queue.text = lookupResult.translation;
        self.formatter.format(self.queue, self.state);
        result.text = self.queue.text;
        if (!lookupResult.ambiguous)
          commitQueue();
      } else {
        commitQueue();
        result = _translate_simple_stroke(stroke);
      }
    }
      
    return result;
  }
  
  function _translate_simple_stroke(stroke) {
    if (!self.queue.isEmpty())
      throw message || "Queue should always be empty here";
    var result;
    var lookupResult;
    var ambiguous=false;

    self.queue.stroke = stroke;
    lookupResult = self.dictionary.lookup(stroke);
    if (lookupResult === undefined) {
      self.queue.text = stroke;
    } else {
      self.queue.text = lookupResult.translation;
      ambiguous = lookupResult.ambiguous;
    }
    self.formatter.format(self.queue, self.state);
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
      self.state = self.queue.state;
      result.undo_chars = self.queue.text.length;
      if (self.queue.isCompoundStroke()) {
        self.queue.stroke = self.queue.stroke.substring(0, self.queue.stroke.lastIndexOf('/'));
        self.queue.text = self.dictionary.lookup(self.queue.stroke).translation;
        self.formatter.format(self.queue, self.state);
      } else {
        self.queue = new TranslationResult(self.state);
      }
      result.stroke = self.queue.stroke;
      result.text = self.queue.text;
    } else {
      //no history to undo
      console.log("no history to undo");
      self.state = new State();
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
  this.state = new State(state);
  this.stroke = '';
  this.text = '';
  this.undo_chars = 0;
  this.isEmpty = function() {return this.stroke.length===0;};
  this.isCompoundStroke = function() {return this.stroke.indexOf('/')>=0;};
};

State = function(stateToClone) {
  var _capitalization=0;
  var _space_suppression=0;
  var _glue=false;
  var _terminal_space=false;
  if (stateToClone!==undefined && stateToClone!==null) {
    if (stateToClone.isCapitalized()) _capitalization=1;
    if (stateToClone.isLowercase()) _capitalization=2;
    if (stateToClone.isInitialSpaceSuppressed()) _space_suppression|=1;
    if (stateToClone.isFinalSpaceSuppressed()) _space_suppression|=2;
    _glue = stateToClone.hasGlue();
    _terminal_space = stateToClone.hasTerminalSpace();
  }

  this.capitalize = function() {_capitalization=1;};
  this.lowercase = function() {_capitalization=2;};
  this.clearCapitalization = function() {_capitalization=0;};
  this.suppressInitialSpace = function() {_space_suppression|=1;};
  this.suppressFinalSpace = function() {_space_suppression|=2;};
  this.clearInitialSpaceSuppression = function() {_space_suppression &= ~1;};
  this.clearFinalSpaceSuppression = function() {_space_suppression &= ~2;};
  this.clearGlue = function() {_glue=false;};
  this.addGlue = function() {_glue=true;};
  this.setTerminalSpace = function(hasSpace) {_terminal_space = hasSpace;};

  this.isCapitalized = function() {return _capitalization===1;};
  this.isLowercase = function() {return _capitalization===2;};
  this.isInitialSpaceSuppressed = function() {return (_space_suppression&1)!==0;};
  this.isFinalSpaceSuppressed = function() {return (_space_suppression&2)!==0;};
  this.hasGlue = function() {return _glue;};
  this.hasTerminalSpace = function() {return _terminal_space;};
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