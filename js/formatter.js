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
  var prefix = (self.spaces_before && !state.end?' ':'');
  var suffix = (!self.spaces_before?' ':'');
  var wasGlue = state.glue;
  state.glue=false;

  translation.text = "{}"+translation.text; //this forces the non-atom part to be at atoms[1] below

  translation.text.split("{").forEach(function(item) {
    var atoms = item.split('}');
    if (atoms[0].length>0) {
      output += processCommand(atoms[0], translation, state);
    }
    if (atoms.length>1 && atoms[1].length>0) {
      output += processText(atoms[1], state);
    }
  }); 
  
  //replace backspaces with undo_chars
  if (output.indexOf('\b')>=0) {
    translation.undo_chars += (output.split('\b').length - 1);
    output = output.replace('\b','');
  }
  //don't add space if text is empty
  if (output.replace('\n','').replace('\t','').length===0) {
    prefix='';
    suffix='';
  }
  
  if (self.spaces_before) {
    if (state.start) {prefix = '';}
    if (wasGlue && state.glue) {prefix = '';}
  } else {
    if (state.start) {translation.undo_chars+=1;}
    if (state.end) {suffix = '';}
    if (wasGlue && state.glue) {translation.undo_chars+=1;}
  }

  translation.text = prefix + output + suffix;
};

function processCommand(atom, translation, state) {
  atom="{"+atom+"}";
  console.log('command:'+atom);
  switch(atom) {
    case '{.}': state.start=true; state.capitalize=true; return '. ';
    case '{?}': state.start=true; state.capitalize=true; return '? ';
    case '{!}': state.start=true; state.capitalize=true; return '! ';
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

function processText(atom, state) {
  console.log('text:'+atom);
  if (atom.indexOf('{')==-1 && atom.indexOf('}')==-1) {
    atom = atom.trim();
    if (state.capitalize && atom.length>1) {atom = atom.charAt(0).toUpperCase() + atom.slice(1); state.capitalize=false;}
    if (state.lowercase && atom.length>1) {atom = atom.charAt(0).toLowerCase() + atom.slice(1); state.lowercase=false;}
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




