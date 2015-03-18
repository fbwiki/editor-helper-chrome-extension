$.getScript("https://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&s=1", function(){ });
$.getScript("https://ecn.dev.virtualearth.net/mapcontrol/v7.0/7.0.20150304115921.67/js/en-us/veapicore.js",function(){ });
$.getScript("https://ecn.dev.virtualearth.net/mapcontrol/v7.0/7.0.20150304115921.67/js/en-us/veapidelay.js",function(){ });

chrome.runtime.onInstalled.addListener(function(details) { // when the extension is first installed
  localStorage.fbpp = JSON.stringify(true); // master on-off switch for the extension
});

chrome.tabs.onUpdated.addListener(function(id, info, tab){ // Listen for any changes to the URL of any tab.
  if ( tab.url.toLowerCase().indexOf("facebook.com/editor")>0 ){ // see: http://developer.chrome.com/extensions/tabs.html#event-onUpdated
    ON = true; //var ON = JSON.parse(localStorage.fbpp);

    chrome.pageAction.show(tab.id); // show the page action
    if ( ON)  chrome.pageAction.setIcon({ tabId: tab.id, path: "fbpp-32.png" });
    else chrome.pageAction.setIcon({tabId: tab.id, path: 'fbpp-off-32.png'});

    if ( tab.status == "complete" ){
      if ( ON ){
        console.log("Preparing to setup fb-places-pro! tab.id="+tab.id);
        chrome.tabs.executeScript(tab.id, { file: "jquery.min.js" }, function(){ // load jquery
          chrome.tabs.executeScript(tab.id, { file: "fbpp.js" });
        });
      } else console.log("fb-places-pro is disabled.");
    }
  }
});

var bingApiCreds = "AkF0mEyG789RQA6CcLimWZMzrDNF6MNSwRJOmNWb9gK_JGiwOBeMoQUoY1MFqksg";
//var bingApiCreds = "AmRUB725HnS9MWyqAe-g28l2n-VjCkXhbhWyDUlYFgSaMSZ77pBEHAgAAzACvYxi";

// listener for the content script, see https://developer.chrome.com/extensions/messaging
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if ( request.type == 'map'){
      loadMap(request.latitude,request.longitude,request.height,request.width); // do something with the request
      window.setTimeout(function(){
        var mapDiv = document.getElementById('mapDiv');
        sendResponse({mapHTML: mapDiv.innerHTML}); // send the response
      },1000);
    }
  }
);

/* This function should take:
 * 1) the size of the map div (width, height)
 * 2) a list of including name, size (#checkins), and lat-longs
 * We can assume that the first point is the "place" and that it
 * needs to have a marker rather than a size
 */
function loadMap(latitude,longitude,h,w){
  
  // turns out we already have a document context here

  // insert a div id=mapDiv

  var mapDiv = document.createElement('div');
  mapDiv.setAttribute('id','mapDiv');

  var mapOptions = {
    credentials: bingApiCreds,
    center: new Microsoft.Maps.Location(latitude, longitude),
    mapTypeId: Microsoft.Maps.MapTypeId.auto,
    height: h,
    width: w,
    showDashboard: true,
    showMapTypeSelector: true,
    showScalebar: true,
  };
  var map = new Microsoft.Maps.Map(mapDiv, mapOptions);
}
