chrome.pageAction.onClicked.addListener(function(tab) { // show the popup when the user clicks on the page action.
  chrome.pageAction.show(tab.id);
});
