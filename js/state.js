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