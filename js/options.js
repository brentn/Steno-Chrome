// Saves options to chrome.storage
function save_options() {
  var input = document.getElementById('ddlInput').value;
  var translator = document.getElementById('ddlTranslator').value;
  var dictionaries = [document.getElementById('tbDict0').value, document.getElementById('tbDict1').value, document.getElementById('tbDict2').value, document.getElementById('tbDict3').value];
  var space_placement = document.getElementById('cbSpaces').checked;
  var undo_size = document.getElementById('tbUndo').value;
  
  chrome.storage.sync.set({
    INPUT_DEVICE: input,
    TRANSLATOR_TYPE: translator,
    DICTIONARIES: dictionaries,
    SPACES_BEFORE: space_placement,
    UNDO_SIZE: undo_size 
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    INPUT_DEVICE: 'NKRO',
    TRANSLATOR_TYPE: 'DICTIONARY',
    DICTIONARIES: ['/assets/main.json'],
    SPACES_BEFORE: false,
    UNDO_SIZE: '20'
  }, function(items) {
    document.getElementById('ddlInput').value = items.INPUT_DEVICE;
    document.getElementById('ddlTranslator').value = items.TRANSLATOR_TYPE;
    document.getElementById('tbDict0').value = items.DICTIONARIES[0];
    document.getElementById('tbDict1').value = items.DICTIONARIES[1];
    document.getElementById('tbDict2').value = items.DICTIONARIES[2];
    document.getElementById('tbDict3').value = items.DICTIONARIES[3];
    document.getElementById('cbSpaces').checked = items.SPACES_BEFORE;
    document.getElementById('tbUndo').value = items.UNDO_SIZE;
  });
}

function set_file(picker) {
  console.error(picker.value);
  picker.previousSibling.value = picker.value;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

document.getElementById('tf0').addEventListener('change', function() {document.getElementById('tbDict0').value=this.files[0].name;});
document.getElementById('tf1').addEventListener('change', function() {document.getElementById('tbDict0').value=this.files[1].name;});
document.getElementById('tf2').addEventListener('change', function() {document.getElementById('tbDict0').value=this.files[2].name;});
document.getElementById('tf3').addEventListener('change', function() {document.getElementById('tbDict0').value=this.files[3].name;});
document.getElementById('tbDict0').addEventListener('click', function() {document.getElementById('tf0').click();});
document.getElementById('tbDict1').addEventListener('click', function() {document.getElementById('tf1').click();});
document.getElementById('tbDict2').addEventListener('click', function() {document.getElementById('tf2').click();});
document.getElementById('tbDict3').addEventListener('click', function() {document.getElementById('tf3').click();});