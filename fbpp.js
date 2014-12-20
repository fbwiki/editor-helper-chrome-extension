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

var editBox = $("._5w0h");
var container= $("._4ph-");
var map =  $(".fbAggregatedMapContainer");
var mapButtons = $(".fbMapsButtonStack");

function modifyDOM(){
  var fbppMenuBar = $("#fbpp");
  if (!fbppMenuBar[0]) {
    var fbppDivStyle = "'background-color: rgb(55, 62, 77); color:#fff; width:100%; height:40px;'";
    var fbppMenuStyle = "'padding-top: 8px; padding-left: 16px; font-size: 20px'";
    var fbppHTML = "<div id='fbpp' style="+fbppDivStyle+"><div style="+fbppMenuStyle+">fbpp menu bar</div></div>";
    map.prepend(fbppHTML);
  }
  resizeElements();

};

function resizeElements(){
  var topOfEditor = editBox.position().top;
  var rightOfEditor = editBox[0].getBoundingClientRect().right;
  var rightOfContainer = container[0].getBoundingClientRect().right;

  map.css("top",topOfEditor);
  map.css("width",rightOfContainer-rightOfEditor-22);
  map.css("left",rightOfEditor+10);
  map.css("height",editBox[0].getBoundingClientRect().height);

  mapButtons.css("top",topOfEditor+50);
  mapButtons.css("left",rightOfEditor-30);
};
