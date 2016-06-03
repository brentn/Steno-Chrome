function Chord() {
  this.keys = new Set();
  this.VALID_KEYS = ['#','S-','T-','P-','H-','K-','W-','R-','A-','O-','*','-E','-U','-F','-R','-P','-B','-L','-G','-T','-S','-G','-Z'];
  
  this.addKey = function(key) {
    if (this.VALID_KEYS.indexOf(key) >= 0) {
      this.keys.add(key);
    }
  };
  
  this.clear = function() {
    this.keys.clear();
  };
  
  this.toString = function() {
    var result = "";
    if (this.keys.size > 0) {
      if (this.keys.has('#')) result+='#';
      if (this.keys.has('S-')) result+='S';
      if (this.keys.has('T-')) result+='T';
      if (this.keys.has('K-')) result+='K';
      if (this.keys.has('P-')) result+='P';
      if (this.keys.has('W-')) result+='W';
      if (this.keys.has('H-')) result+='H';
      if (this.keys.has('R-')) result+='R';
      if (this.keys.has('A-')) result+='A';
      if (this.keys.has('O-')) result+='O';
      if (this.keys.has('*')) result+='*';
      if (this.keys.has('-E')) result+='E';
      if (this.keys.has('-U')) result+='U';
      if (needs_hyphen(this.keys)) result += "-";
      if (this.keys.has('-F')) result+='F';
      if (this.keys.has('-R')) result+='R';
      if (this.keys.has('-P')) result+='P';
      if (this.keys.has('-B')) result+='B';
      if (this.keys.has('-L')) result+='L';
      if (this.keys.has('-G')) result+='G';
      if (this.keys.has('-T')) result+='T';
      if (this.keys.has('-S')) result+='S';
      if (this.keys.has('-D')) result+='D';
      if (this.keys.has('-Z')) result+='Z';
    }
    return result;
  };
  
  function needs_hyphen(keys) {
    var IMPLICIT_HYPHENS = ['A-','O-','5-','0-','-E','-U','*'];
    return ! IMPLICIT_HYPHENS.some(function (key) { 
      return keys.has(key);
    });
  }
}

  


