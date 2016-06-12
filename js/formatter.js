var Formatter = {
  initialize: function() {},
  format: function(translation) {}
};

var SimpleFormatter = function() {};

SimpleFormatter.prototype = Object.create(Formatter);
SimpleFormatter.prototype.initialize = function() {
  console.log("Initializing formatter");
  var self=this;
  chrome.storage.sync.get({SPACES_BEFORE: false}, function(items) {
    self.spaces_before = items.SPACES_BEFORE;
  });
};

SimpleFormatter.prototype.format = function(translationResult) {
  // Modifies the provided translationResult 
  // Returns a new state object
  if (translationResult === undefined || translationResult.length===0) return new State();
  return new State();
  
  var output = "";
  var newState=new State();
  if (priorState===null) {priorState = new State();}
  if (translation.indexOf("{")>=0) {translation = "{}"+translation;} //this forces the non-atom part to be at atoms[1] below
  if (this.spaces_before && !priorState.end) {translation = "{ }" + translation;}
  
  translation.split("{").forEach(function(item) {
    var atoms = item.split('}');
    if (atoms[0].length>0) {
      output += processCommand(atoms[0], newState);
    }
    if (atoms.length>1 && atoms[1].length>0) {
      output += processText(atoms[1], priorState);
    }
  }); 
  
  if (!this.spaces_before && !newState.start) {output += " ";}
};

function processText(text, priorState) {
  if (atom.indexOf('{')==-1 && atom.indexOf('}')==-1) {
    atom = atom.replace(' ','');
    if (priorState.capitalize && text.length>1) {atom = atom.charAt(0).toUpperCase() + this.slice(1);}
    if (priorState.lowercase && text.length>1) {atom = atom.charAt(0).toLowerCase() + this.slice(1);}
  } else {
    log.error('ERROR: text shouldnt contain { or } here.');
  }
}

function processCommand(atom, state) {
  switch(atom) {
    case '{.}': state.capitalize=true; return '. ';
    case '{?}': state.capitalize=true; return '? ';
    case '{!}': state.capitalize=true; return '! ';
  }
  if (atom.indexOf('{^')>=0) {state.start=true;}
  if (atom.indexOf('^}')>=0) {state.end=true; atom = atom.replace('^}', '');}
  if (atom.indexOf('{^')>=0) {atom = atom.replace('{^','');}
  if (atom.indexOf('{')>=0) {
    if (atom.indexOf('-|')>=0) {state.capitalize=true; atom = atom.replace('-|','');}
    if (atom.indexOf('>')>=0) {state.lowercase=true; atom = atom.replace('>','');}
    if (atom.indexOf('&')>=0) {state.glue=true; atom=atom.replace('&','');}
    atom = atom.replace('{','').replace('}','');
  }
  return atom;
}

//process literals

