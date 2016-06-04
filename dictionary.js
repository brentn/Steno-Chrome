function Dictionary() {
  var loaded = false;
  this.dictionary = {};

  this.load = function(filename) {
    var json;
    loaded=false;
    if (filename===null || filename.length===0) {
      console.log("No Dictionary File: Resetting Dictionary");
      this.dictionary={};
      loaded=true;
      return;
    }
    console.log("Loading Dictionary: "+filename);
    loadJSON(filename, function(data) {
      try {
        var json = JSON.parse(data);
        extend(this.dictionary, json);
        console.log("Dictionary loaded: "+filename);
      } catch(ex) {
        log.error("Error parsing dictionary file: "+ex);
      }
      loaded=true;
    });
  };
  
  this.loaded = function() {
    return loaded;
  };
  
  this.lookup = function(stroke) {
    return dictionary[stroke];
  };
  
  function extend(a, b){
    for(var key in b)
        if(b.hasOwnProperty(key))
            a[key] = b[key];
    return a;
  }
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