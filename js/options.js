// Saves options to chrome.storage
function save_options() {
  var input = document.getElementById('ddlInput').value;
  var translator = document.getElementById('ddlTranslator').value;
  var defaultDictionary = document.getElementById('cbDefaultDictionary').checked;
  var customDictionary = document.getElementById('cbCustomDictionary').checked;
  var space_placement = document.getElementById('cbSpaces').checked;
  var undo_size = document.getElementById('tbUndo').value;

  chrome.storage.sync.set({
    INPUT_DEVICE: input,
    TRANSLATOR_TYPE: translator,
    DEFAULT_DICTIONARY: defaultDictionary,
    CUSTOM_DICTIONARY: customDictionary,
    SPACES_BEFORE: space_placement,
    UNDO_SIZE: undo_size 
  }, function() {
    // reload IME
    chrome.extension.getBackgroundPage().window.location.reload();
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
    window.close();
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    INPUT_DEVICE: 'NKRO',
    TRANSLATOR_TYPE: 'FULL',
    DEFAULT_DICTIONARY: true,
    CUSTOM_DICTIONARY: false,
    DICTIONARIES: [],
    SPACES_BEFORE: false,
    UNDO_SIZE: '20'
  }, function(items) {
    document.getElementById('ddlInput').value = items.INPUT_DEVICE;
    document.getElementById('ddlTranslator').value = items.TRANSLATOR_TYPE;
    document.getElementById('cbDefaultDictionary').checked = items.DEFAULT_DICTIONARY;
    document.getElementById('cbCustomDictionary').checked = items.CUSTOM_DICTIONARY;
    document.getElementById('cbSpaces').checked = items.SPACES_BEFORE;
    document.getElementById('tbUndo').value = items.UNDO_SIZE;
    enable_dictionary_edit();
  });
}

function show_custom_dictionary() {
  document.getElementById('btnInstallDictionaryPlugin').style.display='none';
  document.getElementById('pnlCustomDictionary').style.display='block';
}

function enable_dictionary_edit() {
  var checked = document.getElementById('cbCustomDictionary').checked;
  document.getElementById('btnEditCustomDictionaries').disabled = !checked;
}

chrome.runtime.sendMessage(dictionaryPluginID, {action: "version"}, function(response) {
  if (response!==undefined && response.length > 0) {
    console.debug('Custom dictionary plugin found');
    show_custom_dictionary();
  } else {
    console.debug("Custom dictionary plugin NOT found");
  }
});
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.action == 'reload') {
    chrome.extension.getBackgroundPage().window.location.reload();
  }
});
document.getElementById('btnInstallDictionaryPlugin').addEventListener('click', function() {
  window.open('https://chrome.google.com/webstore/detail/'+dictionaryPluginID);
  show_custom_dictionary();
});
document.getElementById('cbCustomDictionary').addEventListener('click', enable_dictionary_edit);
document.getElementById('btnEditCustomDictionaries').addEventListener('click', function() {
  chrome.runtime.sendMessage(dictionaryPluginID, {action: "launch"});
});

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('lblVersion').innerHTML=chrome.app.getDetails().version_name;




