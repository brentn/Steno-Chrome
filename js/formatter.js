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
  } catch(ex) {
    this.spaces_before=false;
  }
};

SimpleFormatter.prototype.format = function(translation, state) {
  if (translation === undefined || translation.length===0) return;
  var self = this;
  var output = '';
  var prefix = (self.spaces_before && !state.isFinalSpaceSuppressed()?' ':'');
  var suffix = (!self.spaces_before?' ':'');
  var wasGlue = state.hasGlue();
  if (self.spaces_before) 
    state.clearFinalSpaceSuppression();
  else 
    state.clearInitialSpaceSuppression();
  state.clearGlue();

  var backspaces=0;
  ('{}' + translation.output.pop()).split("{").forEach(function(item) {
    var atoms = item.split('}');
    if (atoms[0].length>0) {
      output += processCommand(atoms[0], translation, state);
    }
    if (atoms.length>1 && atoms[1].length>0) {
      output += processText(atoms[1], state);
    }
  }); 
  
  //replace backspaces with backspaces
  if (output.indexOf('\b')>=0) {
    backspaces += (output.split('\b').length - 1);
    output = output.replace('\b','');
  }
  //don't add space if text is empty
  if (output.replace('\n','').replace('\t','').length===0) {
    prefix='';
    suffix='';
  }
  
  //remove spaces if necessary
  if (self.spaces_before) {
    if (state.isInitialSpaceSuppressed()) {prefix = ''; state.clearInitialSpaceSuppression();}
    if (wasGlue && state.hasGlue()) {prefix = '';}
  } else {
    if (state.isFinalSpaceSuppressed()) {suffix = ''; state.clearFinalSpaceSuppression();}
  }
  if (state.hasTerminalSpace() && state.isInitialSpaceSuppressed()) {state.setTerminalSpace(false); backspaces+=1;}
  if (state.hasTerminalSpace() && wasGlue && state.hasGlue()) {state.setTerminalSpace(false); backspaces+=1;}

  translation.undo=[];
  var out = prefix+output+suffix;
  if (backspaces>0) {
    translation.output.push(Array(backspaces+1).join('\b'));
  }
  if (out.length>0) {
    translation.output.push(out);
    translation.undo.push(Array(out.length+1).join('\b')); //TODO: undo should really replace what was there before
  }
  if (backspaces>0) {
    translation.undo.push(Array(backspaces+1).join(' '));
  }
  state.setTerminalSpace(out.length>0 && out.charAt(out.length-1) == ' ');
};


function processCommand(atom, translation, state) {
  atom="{"+atom+"}";
  console.debug('command:'+atom);
  switch(atom) {
    case '{.}': state.suppressInitialSpace(); state.capitalize(); return '. ';
    case '{?}': state.suppressInitialSpace(); state.capitalize(); return '? ';
    case '{!}': state.suppressInitialSpace(); state.capitalize(); return '! ';
  }
  if (atom.indexOf('{^')>=0) {state.suppressInitialSpace();}
  if (atom.indexOf('^}')>=0) {state.suppressFinalSpace(); atom = atom.replace('^}', '');}
  if (atom.indexOf('{^')>=0) {atom = atom.replace('{^','');}
  if (atom.indexOf('{')>=0) {
    if (atom.indexOf('-|')>=0) {state.capitalize(); atom = atom.replace('-|','');}
    if (atom.indexOf('>')>=0) {state.lowercase(); atom = atom.replace('>','');}
    if (atom.indexOf('&')>=0) {state.addGlue(); atom=atom.replace('&','');}
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

function processText(atom, state) {
  console.debug('text:'+atom);
  if (atom.indexOf('{')==-1 && atom.indexOf('}')==-1) {
    atom = atom.trim();
    if (state.isCapitalized() && atom.length>1) {atom = atom.charAt(0).toUpperCase() + atom.slice(1); state.clearCapitalization();}
    if (state.isLowercase() && atom.length>1) {atom = atom.charAt(0).toLowerCase() + atom.slice(1); state.clearCapitalization();}
  } else {
    console.error('ERROR: text shouldnt contain { or } here.');
  }
  return atom;
}


function getLiteral(command) {
  var map = {'BackSpace':'\b','Tab':'\t','Return':'\n', space:' '};
  if (map.hasOwnProperty(command)) return map[command];
  else return '';
}




