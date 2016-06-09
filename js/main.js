console.log("Initializing IME");

var input = new KeyboardInput();
//var input = new TXBoltInput();

//var output = new StrokeOutput();
var output = new LookupOutput();

output.initialize();
input.initialize(output.strokeHandler);