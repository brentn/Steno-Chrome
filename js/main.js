console.log("Initializing IME");


chrome.storage.sync.get({INPUT_DEVICE:'NKRO', TRANSLATOR_TYPE:'DICTIONARY'}, function(items) {
  var output;
  switch(items.TRANSLATOR_TYPE) {
   case 'RAW': output = new StrokeOutput(); break;
   case 'SIMPLE': output = new SimpleOutput(); break;
   case 'FULL': output = new LookupOutput(); break;
  }
  output.initialize();
  
  var input;
  switch(items.INPUT_DEVICE) {
    case 'NKRO': input = new KeyboardInput(); break;
    case 'TXBolt': input = new TXBoltInput(); break;
  }
  input.initialize(output.strokeHandler);  
});
