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
 * ._54ni                     holds the "edit" and "report" links.
 * input[name=page_id]        the graph node id
 * input[name=seed]           the city id (although it's called a seed in one place, a cityId elsewhere)
 * .fwn.fcw                   the address and city in text
 * a[title='Bing Maps']")     the anchor that references the map coordinates of the graph node
 *
 * See https://github.com/CombatChihuahua/fb-places-pro
 */

console.log("fbpp.js");

// Initialize various variables
var editBox = "";
var container= "";
var map = "";
var mapButtons = "";
var fbppContent = "";
var pageName = "";
var pageAddress = "";

/*

*/

$(document).ready(function(){ // load the extension objects once the page has finished loading
  console.log("fbpp document ready!");
  findElements();
  modifyDOM();
  resizeElements();

  $("#fbpp_showMap").click(function(){ // show the map
    mapButtons.css("display","block");
  })

  $("#fbpp_showBing").click(function(){ // show the bing search, but include the city
    mapButtons.css("display","none");
    $("#fbppContent").html("<iframe id='fbpp_iFrame' frameborder='0'></iframe>");
    $("#fbpp_iFrame").css("height",editBox[0].getBoundingClientRect().height-40);
    $("#fbpp_iFrame").css("width",rightOfContainer-rightOfEditor-25);
    var addressParts = $(".fwn.fcw").text().split("·");
    if ( addressParts ){
      var pageName = encodeURIComponent($("._4c0z").find("a").text().trim() +
        " " + addressParts[addressParts.length-1].trim());
      $("#fbpp_iFrame").attr('src',"https://www.bing.com/search?q="+pageName);
    }
  })

  $("#fbpp_reportButton").click(function(){ // this will bring up the report dialog box
    var pageId = $("input[name=page_id]").attr("value");
    var cityId = $("input[name=seed]").attr("value");

    $("#fbpp_report").attr('ajaxify',"/ajax/report.php?content_type=64&cid="+pageId+"&city_id="+cityId);
    $("#fbpp_report")[0].click();
  })

  $("#places_editor_save").click(function(){
    showMap();
  })

  $("#fbpp_showSimilarNearby").click(function(){
    mapButtons.css("display","none");
    showSimilarNearby();
  })

  $("fbpp_reverseGeocode").click(function(){ // work in progress on reverse geocoding
  })
});


  $("#fbpp_iFrame").css("display","none");
}

function showSimilarNearby(){
  var pageId = $("input[name=page_id]")[0].value;
  var pageObj = $.get("https://graph.facebook.com/"+pageId,function(data){
    var latitude = data.location.latitude;
    var longitude = data.location.longitude;
    var pageName = $("._4c0z").find("a").text().trim().split(" ").slice(0,2).join("+"); //first 3 words of place name
    var access_token ="CAACEdEose0cBAECbT0wFDpC3OSuGW5zKByQWs4QSfNoNgyhGOVY6BuMTp4L0RYza5fcFEBFJbqiD8mSpU3fC1yEn97gZBYMJqfui1PXp5l3fm4Pn1Bm4eWHqmLxTwMrdFCUqm5i2OnpC68ihKtHByFzZAvz6YznDfrYq2udGrBqFQtrJ3N6Q2qMcJiIZCDayFq5wzAm1HhbaHJLmVYv"
    var url = "https://graph.facebook.com/search?q="+pageName+"&type=place&center="+latitude+","+longitude+"&distance=30000&access_token="+access_token;
    $("#fbppContent").load(url);
  })
}

$(window).resize(function(){ // resize the fbpp box when the window resizes
  resizeElements("fbpp document resize!");
});

function findElements(){ // these are used a lot
  editBox = $("._5w0h");
  container= $("._4ph-");
  map =  $(".fbAggregatedMapContainer");
  mapButtons = $(".fbMapsButtonStack");
}

function modifyDOM(){ // modify the DOM to add the fbpp elements
  var fbppMenuBar = $("#fbpp");
  if (fbppMenuBar[0]) return;

  map.wrap("<div id='fbppContent'></div>"); // the content area for our new UI widget
  $("#fbppContent").wrap("<div id='fbppBox'></div>");
  var fbppDivStyle = "'background-color: rgb(55, 62, 77); color:#fff; width:100%; height:40px;'";
  var fbppButtonStyle ="'font-size: 14px; background-color: rgb(55,62,77); color: #fff; border:0; padding-top: 12px; padding-left: 20px; outline: none;'";
  var fbppHTML = "<div id='fbpp' style="+fbppDivStyle+"></div>";

  $("#fbppBox").prepend(fbppHTML); // the overall box
  $("#fbpp").append("<button id='fbpp_showMap' style="+fbppButtonStyle+">Map</button>");
  $("#fbpp").append("<button id='fbpp_showBing' style="+fbppButtonStyle+">Bing</button>");
  $("#fbpp").append("<button id='fbpp_reportButton' style="+fbppButtonStyle+">Report</button>");
  $("#fbpp").append("<button id='fbpp_showSimilarNearby' style="+fbppButtonStyle+">Similar Nearby</button>");
  $("#fbpp").append("<a id='fbpp_report' class='_54nc' href='#' rel='dialog' role='menuitem'></a>");
}

// pattern for finding nearby places:
// https://www.facebook.com/search/$PLACE_ID/places-near/str/$NAME/places-named/intersect

function resizeElements(){ // handle resize events (the editor box has a fixed width, so use the rest of the page)
  if ( editBox) {
    topOfEditor = editBox.position().top;
    rightOfEditor = editBox[0].getBoundingClientRect().right;
    rightOfContainer = container[0].getBoundingClientRect().right;
    fbppBox=$("#fbppBox");

    fbppBox.css("top",topOfEditor);
    fbppBox.css("width",rightOfContainer-rightOfEditor-22);
    fbppBox.css("left",rightOfEditor+10);
    fbppBox.css("height",editBox[0].getBoundingClientRect().height);
    fbppBox.css("position","absolute");

    map.css("height",editBox[0].getBoundingClientRect().height-40);

    mapButtons.css("top",topOfEditor+50);
    mapButtons.css("left",rightOfEditor-30);

    $("#fbpp_iFrame").css("height",editBox[0].getBoundingClientRect().height-40);
    $("#fbpp_iFrame").css("width",rightOfContainer-rightOfEditor-25);
  }
}
