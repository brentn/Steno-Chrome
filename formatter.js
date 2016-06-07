var Formatter = {
  initialize: function() {},
  format: function(translation) {}
};

var SPACE_PLACEMENT='after';

var SimpleFormatter = function() {};

SimpleFormatter.prototype = Object.create(Formatter)
SimpleFormatter.prototype.initialize = function() {
  console.log("Initializing formatter");
};

SimpleFormatter.prototype.format = function(translation) {
  if (SPACE_PLACEMENT=='after') {
    return translation+' ';
  } else {
    return ' '+translation;
  }
};