function Dictionary() {
  var _loaded = false;
  var _dictionary = new TernarySearchTrie();

  this.load = function(filename, callback) {
    var json;
    _loaded=false;
    if (filename===null || filename.length===0) {
      console.log("No Dictionary File: Resetting Dictionary");
      _dictionary.empty();
      _loaded=false;
      return;
    }
    console.log("Loading Dictionary: "+filename);
    loadJSON(filename, function(data) {
      try {
        var json = JSON.parse(data);
        for (let stroke in json) {
          if (!json.hasOwnProperty(stroke)) { continue; }
          _dictionary.add(stroke, json[stroke]);
        }
        console.log("Dictionary loaded: "+filename);
      } catch(ex) {
        console.error("Error parsing dictionary file: "+ex);
      }
      _loaded=true;
      if (callback !== null) {
        callback();
      }
    });
  };
  
  this.add = function(stroke, translation) {
    _dictionary.add(stroke, translation);
  };
  
  this.loaded = function() {
    return _loaded;
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