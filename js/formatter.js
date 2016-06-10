var Formatter = {
  initialize: function() {},
  format: function(translation) {}
};

var SimpleFormatter = function() {};

SimpleFormatter.prototype = Object.create(Formatter);
SimpleFormatter.prototype.initialize = function() {
  console.log("Initializing formatter");
  var self=this
  chrome.storage.sync.get({SPACES_BEFORE: false}, function(items) {
    self.spaces_before = items.SPACES_BEFORE;
  });
};

SimpleFormatter.prototype.format = function(translation) {
  if (translation === undefined || translation.length===0) return '';
  if (this.spaces_before) {
    return ' '+translation;
  } else {
    return translation+' ';
  }
};