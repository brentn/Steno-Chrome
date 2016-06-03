console.log("Initializing IME");

var input = new KeyboardInput();
//var input = new TXBoltInput();

var output = new StrokeOutput();

output.initialize();
input.initialize(output.print);