function Dictionary() {
  var _loaded = false;
  var _dictionary = new TernarySearchTrie();
  var self=this;

  this.load = function(filenames, callback) {
    var json;
    _loaded=false;
    if (filenames===null || filenames.length===0 || filenames[0].trim().length===0) {
      _loaded=true;
      return;
    }
    var filename = filenames[0];
    console.log("Loading Dictionary: "+filename);
    loadJSON(filename, function(data) {
      try {
        self.loadJson(JSON.parse(data));
        console.log("Dictionary loaded: "+filename);
      } catch(ex) {
        console.error("Error parsing dictionary file: "+filename+":"+ex);
      }
      filenames.shift();
      if (filenames.length > 0) {
        self.load(filenames, callback);
      } else {
      _loaded=true;
        if (callback !== null) {
          callback();
        }
      }
    });
  };
  
  this.loadJson = function(json) {
    for (var stroke in json) {
      if (!json.hasOwnProperty(stroke)) { continue; }
      _dictionary.add(stroke, json[stroke]);
    }
  };
  
  this.add = function(stroke, translation) {
    _dictionary.add(stroke, translation);
  };
  
  this.loaded = function() {
    return _loaded;
  };
  
  this.reset = function() {
      _dictionary.empty();
      _loaded=false;
  };
  
  this.size = function() {
    return (_dictionary.length);
  };
  
  this.lookup = function(stroke) {
    var result = new LookupResult();
    var node = _dictionary.search(stroke);
    if (node !== null && node.end) {
      result.translation = node.data;
      result.ambiguous = (_dictionary.search(stroke+'/') !== null);
    } else {
      result = undefined;
    }
    return result;
  };
  
  function loadJSON(filename, callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }
  
}

function LookupResult() {
  ambiguous = false;
  translation = '';
}