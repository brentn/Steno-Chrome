var Translator = {
  initialize : function(){},
  lookup : function(stroke){},
  reset : function() {}
};

var SimpleTranslator = function(){};
var LookupTranslator = function(){};

SimpleTranslator.prototype = Object.create(Translator);
SimpleTranslator.prototype.initialize = function() {
  console.log("Initializing Simple translator");
  var self=this;
  try {
    chrome.storage.sync.get({UNDO_SIZE:20,SPACES_BEFORE:false}, function(items) {
      self._history = new History(items.UNDO_SIZE);
      self._spaces_before = items.SPACES_BEFORE;
    });
  } catch(ex) {}
  this._dictionary = new Dictionary();
  loadDictionaries(this._dictionary);
  this._queue = new TranslationResult();
};

SimpleTranslator.prototype.lookup = function(stroke) {
  // returns a list of either backspaces, or text to be output in sequence
  if (stroke === undefined || stroke === null) return [];
  var self=this;
  var result = [];
  if (stroke == '*') {
    //undo
    console.debug("UNDO");
    if (! this._queue.isEmpty()) {
      commitQueue();
    }
    result = this._history.undo(this);
  } else {
    //translate
    var lookupResult;
    if (this._queue.isEmpty()) {
      console.debug('Q is empty');
      this._queue.stroke = stroke;
      lookupResult = this._dictionary.lookup(stroke);
      if (lookupResult!==undefined) { //lookupresult was found
        console.debug('lookup found: '+lookupResult.translation);
        this._queue.output = [(lookupResult.translation===undefined?stroke:lookupResult.translation)];
        addSpace();
        calculateUndo();
        result = result.concat(this._queue.output);
        if (! lookupResult.ambiguous) { //not ambiguous
          console.debug('lookup not ambiguous');
          commitQueue();
        }
      } else { // (lookupresult not found)
        console.debug('lookup not found');
        this._queue.output = [stroke];
        addSpace();
        calculateUndo();
        result = result.concat(this._queue.output);
        commitQueue();
      }
    } else { // (queue is not empty)
      console.debug('Q is not empty');
      result = result.concat(this._queue.undo); 
      var fullstroke = this._queue.stroke + '/' + stroke;
      lookupResult = this._dictionary.lookup(fullstroke);
      if (lookupResult!==undefined) { //fullstroke was found
        console.debug('fullstroke found: '+lookupResult.translation);
        this._queue.stroke = fullstroke;
        if (lookupResult.translation!==undefined) {
          this._queue.output = [lookupResult.translation];
        } else {
          var lookup2 = this._dictionary.lookup(stroke);
          this._queue.output.push(lookup2===undefined||lookup2.translation===undefined?stroke:lookup2.translation);
        }
        addSpace();
        calculateUndo();
        result = result.concat(this._queue.output);
        if (! lookupResult.ambiguous) { //not ambiguous
          console.debug('fullstroke not ambiguous');
          commitQueue();
        }
      } else { // (fullstroke not found) 
        console.debug('fullstroke not found. Committing '+this._queue.output+', and putting '+stroke+' into the Q');
        result = result.concat(this._queue.output);
        commitQueue();
        result = result.concat(this.lookup(stroke));
      }
    }
  }
  return result;
  
  function addSpace() {
    if (self._spaces_before) self._queue.output[self._queue.output.length-1] = ' ' + self._queue.output[self._queue.output.length-1] ;
    else self._queue.output[self._queue.output.length-1] += ' ';
  }

  function calculateUndo() {
    self._queue.undo = [];
    for (var i=0; i<self._queue.output.length; i++) {
      self._queue.undo.unshift(Array(self._queue.output[i].length+1).join('\b'));
    }
  }

  
  function commitQueue() {
    self._history.push(self._queue);
    self._queue = new TranslationResult();
  }  
};
SimpleTranslator.prototype.reset = function() {
  this._history.clear();
  this._queue = new TranslationResult();
};

LookupTranslator.prototype = Object.create(Translator);
LookupTranslator.prototype.initialize = function(){
  console.log("Initializing Lookup translator");
  var self=this;
  try {
    chrome.storage.sync.get({UNDO_SIZE:20}, function(items) {
      self._history = new History(items.UNDO_SIZE);
    });
  } catch(ex) {}

  this._dictionary = new Dictionary();
  loadDictionaries(this._dictionary);
  this._formatter = new SimpleFormatter();
  this._formatter.initialize();
  this._state = new State();
  this._queue = new TranslationResult();
};

LookupTranslator.prototype.lookup = function(stroke) {
  // returns a list of either backspaces, or text to be output in sequence
  if (stroke === undefined || stroke === null) return [];
  var self=this;
  var result = [];
  if (stroke == '*') {
    //undo
    console.debug("UNDO");
    if (! this._queue.isEmpty()) {
      commitQueue();
    }
    result = this._history.undo(this);
  } else {
    //translate
    var lookupResult;
    if (this._queue.isEmpty()) {
      console.debug('Q is empty');
      this._queue.stroke = stroke;
      lookupResult = this._dictionary.lookup(stroke);
      if (lookupResult!==undefined) { //lookupresult was found
        console.debug('lookup found: '+lookupResult.translation);
        this._queue.output = [(lookupResult.translation===undefined?stroke:lookupResult.translation)];
        this._formatter.format(this._queue, this._state);
        result = result.concat(this._queue.output);
        if (! lookupResult.ambiguous) { //not ambiguous
          console.debug('lookup not ambiguous');
          commitQueue();
        }
      } else { // (lookupresult not found)
        console.debug('lookup not found');
        this._queue.output = [stroke];
        this._formatter.format(this._queue, this._state);
        result = result.concat(this._queue.output);
        commitQueue();
      }
    } else { // (queue is not empty)
      console.debug('Q is not empty');
      result = result.concat(this._queue.undo); 
      var fullstroke = this._queue.stroke + '/' + stroke;
      lookupResult = this._dictionary.lookup(fullstroke);
      if (lookupResult!==undefined) { //fullstroke was found
        console.debug('fullstroke found: '+lookupResult.translation);
        this._state = new State(this._queue.state);
        this._queue.stroke = fullstroke;
        if (lookupResult.translation!==undefined) {
          this._queue.output = [lookupResult.translation];
        } else {
          var lookup2 = this._dictionary.lookup(stroke);
          this._queue.output.push(lookup2===undefined||lookup2.translation===undefined?stroke:lookup2.translation);
        }
        this._queue.undo = [];
        this._formatter.format(this._queue, this._state);
        result = result.concat(this._queue.output);
        if (! lookupResult.ambiguous) { //not ambiguous
          console.debug('fullstroke not ambiguous');
          commitQueue();
        }
      } else { // (fullstroke not found) 
        console.debug('fullstroke not found. Committing '+this._queue.output+', and putting '+stroke+' into the Q');
        result = result.concat(this._queue.output);
        commitQueue();
        var oldState = new State(this._state);
        result = result.concat(this.lookup(stroke));
        this._state = oldState;
      }
    }
  }
  this._state.appendOutput(result);
  return result;
  
  function commitQueue() {
    self._history.push(self._queue);
    self._queue = new TranslationResult(self._state);
  }
};

LookupTranslator.prototype.reset = function(stroke) {
  this._state = new State();
  this._queue = new TranslationResult(this._state);
  this._history.clear();
};

function backspaces(num) {
  return Array(num+1).join('\b');
}

TranslationResult = function(state) {
  this.state = new State(state);
  this.stroke = '';
  this.output = [];
  this.undo = [];
  this.isEmpty = function() {return this.stroke.length===0;};
};


History = function(size) {
  this._maxSize = size;
  this._stack = [];
  this.clear = function() {
    this._stack = [];
  };
  this.push = function(object) {
    if (this._stack.length >= this._maxSize) this._stack.shift();
    this._stack.push(object);
  };
  this.pop = function() {
    if (this._stack.length > 0) return this._stack.pop();
    console.warn('History stack is empty');
    return new TranslationResult();
  };
  this.undo = function(translator) {
    if (this._stack.length <= 0) return [];
    var result = [];
    var strokes = [];
    // push all but the last stroke onto the stack
    var item = this._stack.pop();
    translator._state = new State(item.state);
    result = result.concat(item.undo);
    if (item.stroke.indexOf('/')>=0) {
      strokes.push(item.stroke.substr(0, item.stroke.lastIndexOf('/')));
    }
    // push a (another) stroke onto the stack
    if (this._stack.length > 0) {
      item = this._stack.pop();
      translator._state = new State(item.state);
      result = result.concat(item.undo);
      strokes.push(item.stroke);
    }
    // replay the stack
    while (strokes.length > 0) {
      result = result.concat(translator.lookup(strokes.pop()));
    }
    return result;
  };
};

function loadDictionaries(dictionary) {
  try {
    chrome.storage.sync.get({DEFAULT_DICTIONARY:true}, function(items) {
      if (items.DEFAULT_DICTIONARY) {
        dictionary.load(['assets/dictionary.json'], loadCustomDictionaries);
      } else {
        loadCustomDictionaries();
      }
    });
  } catch(ex) {}

  function loadCustomDictionaries() {
    try {
      chrome.storage.sync.get({CUSTOM_DICTIONARY:true}, function(items) {
        if (items.CUSTOM_DICTIONARY) {
          console.debug("Loading custom dictionaries...");
          chrome.runtime.sendMessage(dictionaryPluginID, {action: "loadDictionaries"}, function(response) {
            if (response!==undefined && response.status=="OK") {
              response.dictionaries.forEach(function(dict) {
                dictionary.loadJson(dict.json);
                console.debug("Loaded custom dictionary: "+dict.name);
              });
            } else {
              console.error("Custom dictionaries NOT found");
            }
          });
        }
      });
    } catch(ex) {}
  }
}