chrome.pageAction.onClicked.addListener(function(tab) { // show the popup when the user clicks on the page action.
  chrome.pageAction.show(tab.id);
});

var bingApiCreds = "AkF0mEyG789RQA6CcLimWZMzrDNF6MNSwRJOmNWb9gK_JGiwOBeMoQUoY1MFqksg";
//var bingApiCreds = "AmRUB725HnS9MWyqAe-g28l2n-VjCkXhbhWyDUlYFgSaMSZ77pBEHAgAAzACvYxi";

// listener for the content script, see https://developer.chrome.com/extensions/messaging
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // do something with the request
    var mapDiv = $('#mapDiv');
    var mapOptions = {
      credentials: bingApiCreds,
      center: new Microsoft.Maps.Location(45.5, -122.5),
      mapTypeId: Microsoft.Maps.MapTypeId.road,
      zoom: 7
    };
    var map = new Microsoft.Maps.Map(mapDiv, mapOptions);

    sendResponse({map: mapDiv}); // send the response
  }
);

document.addEventListener('DOMContentLoaded', loadMap, false);


/* This function should take:
 * 1) the size of the map div (width, height)
 * 2) a list of including name, size (#checkins), and lat-longs
 * We can assume that the first point is the "place" and that it
 * needs to have a marker rather than a size
 */
function loadMap(){
  var mapDiv = document.getElementById("mapDiv");
  var mapOptions = {
    credentials: bingApiCreds,
    center: new Microsoft.Maps.Location(45.5, -122.5),
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    zoom: 7
  };
  var map = new Microsoft.Maps.Map(mapDiv, mapOptions);
}
