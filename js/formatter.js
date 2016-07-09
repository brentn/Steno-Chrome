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
  if (translation === undefined || translation.output === undefined) return;
  var self=this;
  var result = {
    output:[], 
    undo:[]
  };
  while (translation.output.length > 0) {
    var text = translation.output.shift();
    var output = processAtoms(text);
    var undo = generateUndo(output);
    result.output = result.output.concat(output);
    result.undo = undo.concat(result.undo); //build the undo string in reverse
  }
  translation.output = result.output;
  translation.undo = result.undo;

  function processAtoms(text) {
    var vars = {
      hadGlue:state.hasGlue(),
      backspaces:0,
      prefix:(self.spaces_before && !state.isFinalSpaceSuppressed()?' ':''),
      text:'',
      suffix:(!self.spaces_before?' ':'')
    };
    initializeState();
    ('{}'+text).split('{').forEach(function(item) {
      var atoms = item.split('}');
      if (atoms[0].length>0) {
        vars.text += processCommand(atoms[0]);
      }
      if (atoms.length>1 && atoms[1].length>0) {
        vars.text += processText(atoms[1]);
      }
    });
    backspaces = getBackspaces(vars);
    removeSpacesIfNoText(vars);
    stickWordsTogether(vars);
    return generateResult(vars);
  }
  
  function initializeState() {
    if (self.spaces_before) state.clearFinalSpaceSuppression();
    else state.clearInitialSpaceSuppression();
    state.clearGlue();
  }
  
  function processCommand(atom) {
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

  function processText(atom) {
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
  
  function getBackspaces(parameters) {
    if (parameters.text.indexOf('\b')>=0) {
      parameters.backspaces = parameters.text.split('\b').length-1;
      parameters.text = parameters.text.split('\b').join('');
    } else {
      parameters.backspaces = 0;
    }
  }
  
  function removeSpacesIfNoText(parameters) {
    if (parameters.text.replace('\n','').replace('\t','').length===0) {
      parameters.prefix='';
      parameters.suffix='';
    }
  }
  
  function stickWordsTogether(parameters) {
    if (self.spaces_before) {
      if (state.isInitialSpaceSuppressed()) {
        parameters.prefix = '';
        state.clearInitialSpaceSuppression();
      } 
      if (parameters.hadGlue && state.hasGlue()) {
        parameters.prefix = '';
      }
    } else { // spaces after
      if (state.isFinalSpaceSuppressed()) {
        parameters.suffix = '';
        state.clearFinalSpaceSuppression();
      }
    }
    if (state.hasTerminalSpace() && state.isInitialSpaceSuppressed()) {
      parameters.backspaces += 1;
    }
    if (state.hasTerminalSpace() && parameters.hadGlue && state.hasGlue()) {
      parameters.backspaces += 1;
    }
  }

  function generateResult(parameters) {
    var result=[];
    out = parameters.prefix+parameters.text+parameters.suffix;
    if ((out).length===0) 
      result = [];
    else 
      result = [out];
    if (parameters.backspaces>0) 
    result.unshift(Array(parameters.backspaces+1).join('\b'));
    return result;
  }
  
  function generateUndo(textList) {
    var result = [];
    for(var i=0; i<textList.length; i++) {
      var item = textList[i];
      if (item.indexOf('\b')>=0) {
        result.unshift(state.getOutput(item.length));
      } else {
        result.unshift(Array(item.length+1).join('\b'));
      }
    }
    return result;
  }

};






