State = function(stateToClone) {
  var _capitalization=0;
  var _space_suppression=0;
  var _glue=false;
  var _terminal_space=false;
  var _recent_output='';
  if (stateToClone!==undefined && stateToClone!==null) {
    if (stateToClone.isCapitalized()) _capitalization=1;
    if (stateToClone.isLowercase()) _capitalization=2;
    if (stateToClone.isInitialSpaceSuppressed()) _space_suppression|=1;
    if (stateToClone.isFinalSpaceSuppressed()) _space_suppression|=2;
    _glue = stateToClone.hasGlue();
    _recent_output = stateToClone.getOutput(-1);
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
  this.appendOutput = function(outputList) {
    if (outputList===undefined || outputList===null || outputList.length===0) return;
    if (! (outputList instanceof Array)) throw("appendOutput must be called with a list of strings");
    for (var i=0; i<outputList.length; i++) {
      var output = outputList[i];
      if (output.length > 0 && output[0]=='\b') {
        if (_recent_output.length <= output.length) {
          _recent_output='';
        } else {
          _recent_output = _recent_output.substr(0, _recent_output.length-output.length);
        }
      } else {
        _recent_output += output;
      }
      // keep this from getting too long
      if (_recent_output.length > 100) _recent_output = _recent_output.substr(50);
    }
  };

  this.isCapitalized = function() {return _capitalization===1;};
  this.isLowercase = function() {return _capitalization===2;};
  this.isInitialSpaceSuppressed = function() {return (_space_suppression&1)!==0;};
  this.isFinalSpaceSuppressed = function() {return (_space_suppression&2)!==0;};
  this.hasGlue = function() {return _glue;};
  this.hasTerminalSpace = function() {return this.getOutput(1)==' ';};
  this.getOutput = function(len) {
    if (len<0) return _recent_output;
    if (len===0) return '';
    if (len>=_recent_output.length) return _recent_output;
    return _recent_output.substr(_recent_output.length-len);
  };
};