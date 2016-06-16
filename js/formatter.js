var Formatter = {
  initialize: function() {},
  format: function(translation) {}
};

var SimpleFormatter = function() {};

SimpleFormatter.prototype = Object.create(Formatter);
SimpleFormatter.prototype.initialize = function() {
  console.log("Initializing formatter");
  try {
    chrome.storage.sync.get({SPACES_BEFORE: false}, function(items) {
      this.spaces_before = items.SPACES_BEFORE;
    });
  } catch(ex) {}
};

SimpleFormatter.prototype.format = function(translationResult) {
  if (translationResult === undefined || translationResult.length===0) return;
  var self = this;
  var output = '';
  var endState = new State();
  var prefix = (self.spaces_before && !translationResult.state.end?' ':'');
  var suffix = (!self.spaces_before?' ':'');
  var wasGlue = translationResult.state.glue;

  translationResult.text = "{}"+translationResult.text; //this forces the non-atom part to be at atoms[1] below

  translationResult.text.split("{").forEach(function(item) {
    var atoms = item.split('}');
    if (atoms[0].length>0) {
      output += processCommand(atoms[0], translationResult, endState);
    }
    if (atoms.length>1 && atoms[1].length>0) {
      output += processText(atoms[1], translationResult.state);
    }
  }); 
  if (output.indexOf('\b')>=0) {
    //replace backspaces
    translationResult.undo_chars += (output.split('\b').length - 1);
    output = output.replace('\b','');
  }
  if (output.replace('\n','').replace('\t','').length===0) {
    prefix='';
    suffix='';
  }
  
  if (self.spaces_before) {
    if (endState.start) {prefix = '';}
    if (translationResult.state.glue && endState.glue) {prefix = '';}
  } else {
    if (endState.start) {translationResult.undo_chars+=1;}
    if (endState.end) {suffix = '';}
    if (translationResult.state.glue && endState.glue) {translationResult.undo_chars+=1;}
  }

  translationResult.text = prefix + output + suffix;
  translationResult.state = endState;
};

function processCommand(atom, translationResult, state) {
  atom="{"+atom+"}";
  console.log('command:'+atom);
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
  }
  if (atom.indexOf('{#')>=0) {
    var result = '';
    atom = atom.replace('{#','').replace('}','');
    atom.split(' ').forEach(function(item) {
      if (item.length==1) result += item;
      else result += getLiteral(item);        
    });
    return result;
  }
  atom = atom.replace('{','').replace('}','');
  return atom;
}

function processText(atom, priorState) {
  console.log('text:'+atom);
  if (atom.indexOf('{')==-1 && atom.indexOf('}')==-1) {
    atom = atom.trim();
    if (priorState.capitalize && atom.length>1) {atom = atom.charAt(0).toUpperCase() + atom.slice(1);}
    if (priorState.lowercase && atom.length>1) {atom = atom.charAt(0).toLowerCase() + atom.slice(1);}
  } else {
    log.error('ERROR: text shouldnt contain { or } here.');
  }
  return atom;
}


function getLiteral(command) {
  var map = {'BackSpace':'\b','Tab':'\t','Return':'\n', space:' '};
  if (map.hasOwnProperty(command)) return map[command];
  else return '';
}

//1zwe94109196726810
//ups label
//1.800.742.5877

//order #:201240221


