/* fb places pro
 * This modifies the fb places editor to add new capabilities which will
 * hopefully boost the productivity of people using the editor
 *
 * Description of patterns in the fb editor:
 *
 * Containing Element
 * ------------------
 * #workarea_box              the container for the main editor box on the left side of the screen
 * ._5w0h                     the div that contains the main editor box
 * .fbAggregatedMapContainer  the div that contains the map
 * ._5w0d                     the parent div of .fbAggregatedMapContainer - this has sizing and positioning
 * .fbMapsButtonStack         map zoom in/out buttons
 * #u_0_6                     the div that holds the map
 * ._4ph-                     the main div that holds both the editor and map
 */

console.log("fbpp.js");

var dbg = false; // debug switch

$(document).ready(function(){
  console.log("fbpp document ready!");
  modifyDOM();
});

$(window).resize(function(){
  resizeElements("fbpp document resize!");
});

function modifyDOM(){
  resizeElements();
};

function resizeElements(){
  var editBox = $("._5w0h");
  var topOfEditor = editBox.position().top;
  var rightOfEditor = editBox[0].getBoundingClientRect().right;
  var container= $("._4ph-");
  var rightOfContainer = container[0].getBoundingClientRect().right;

  var map =  $(".fbAggregatedMapContainer");
  var mapButtons = $(".fbMapsButtonStack");

  map.css("top",topOfEditor);
  map.css("width",rightOfContainer-rightOfEditor-20);
  map.css("left",rightOfEditor+10);
  map.css("height",editBox[0].getBoundingClientRect().height);

  mapButtons.css("top",topOfEditor+20);
  mapButtons.css("left",rightOfEditor+20);
};

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) { // this listener is required to get the Keywords over from
  Keywords = request.Keywords;                                                  // localStorage in the context of the popup and background script 
  if (dbg) {
    console.log("Received keywords from background script.");
    console.log(Keywords);
  }
  if ( typeof(Keywords)=="object" && Keywords.length>0 ){
    deKardashianize();
  }
  else if ( itypeof(Keywords)=="object" && Keywords.length==0 ) {
    console.log("List of Keywords is empty!");
  }
  else {
    console.log("'Keywords' is of type "+typeof(Keywords)+" should be 'object'");
  }
  return;
});

