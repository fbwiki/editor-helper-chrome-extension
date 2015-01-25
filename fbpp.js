/* fb places pro
 * This modifies the fb places editor to add new capabilities which will
 * hopefully boost the productivity of people using the editor
 *
 * Description of patterns in the fb places editor DOM:
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

$(document).ready(function(){ // load the extension objects once the page has finished loading
  // TBD this doesn't work when coming in from a notification about recent edits
  console.log("fbpp document ready!");
  findElements();
  modifyDOM();
  resizeElements();

  $("#fbpp_showMap").click(function(){ // show the map
    showMap();
  })

  $("#fbpp_showBing").click(function(){ // show the bing search, but include the city
    // TBD we can avoid loading bing repeatedly with the same string if we remember it
    // between invocations
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

function showMap(){
  mapButtons.css("display","block");
  $("#fbppContent").html(map);
}

function showSimilarNearby(){
   /* Tried to use the graph API but it doesn't yet support "graph search" with
   * fuzzy name matching. Basically couldn't be done.
   *
   * By inspecting facebook's ajax calls, discovered the ajax typeahead handler
   * that is used to report dupes: it takes a request like:
   *
   *https://www.facebook.com/ajax/places/typeahead?value=nati&include_address=2&include_subtext=true&exact_match=false&use_unicorn=true&allow_places=true&allow_cities=true&render_map=true&limit=15&latitude=39.207887979133&longitude=-120.09159616732&proximity_boost=true&city_id=2418378&city_bias=false&allow_url=true&map_height=150&map_width=348&ref=PlaceReportDialog%3A%3ArenderDuplicatePlaceTypeahead&sid=60232222786&city_set=false&existing_ids=111507778889067&request_id=8cf4cd3e-eb65-4a13-91c5-674d1382b7d3&__user=569890504&__a=1&__dyn=7nmajEyl35zoSt2u6aOGeFz8C9ACxO4oKAdBGeqrWo8popyUW5ogxd6K59poW8xOdy8-&__req=7p&__rev=1573593
   *
   * But it doesn't seem to require all parameters so a simpler version is:
   *
   * https://www.facebook.com/ajax/places/typeahead?value=native%20landing&include_address=2&include_subtext=true&exact_match=false&use_unicorn=true&allow_places=true&allow_cities=true&render_map=true&limit=15&latitude=39.207887979133&longitude=-120.09159616732&proximity_boost=true&map_height=150&map_width=348&ref=PlaceReportDialog%3A%3ArenderDuplicatePlaceTypeahead&sid=60232222786&existing_ids=111507778889067&__a=1
   * 
   * I really wonder what the "use_unicorn" parameter is for...
   *
   * There doesn't appear to be anyway of restricting the radius of the returned
   * results, facebook is looking all over the world for dupes. It would be good
   * to remove the ones >~100 miles away. Need the formula for great circle
   * distance between two lat-long coordinates */

  var pageId = $("input[name=page_id]")[0].value;
  var pageObj = $.get("https://graph.facebook.com/"+pageId,function(data){ // this call works *without* an access token!
    var latitude = data.location.latitude;
    var longitude = data.location.longitude;
    var pageName = $("._4c0z").find("a").text().trim().split(" ").slice(0,3).join("+"); //first 3 words of place name
    var url = "https://www.facebook.com/ajax/places/typeahead?value=" + 
      pageName+"&latitude="+latitude+"&longitude="+longitude+"&existing_ids="+pageId +
      "&include_address=2&include_subtext=true&exact_match=false&use_unicorn=true&allow_places=true&allow_cities=true&render_map=true&limit=15&proximity_boost=true&map_height=150&map_width=348&ref=PlaceReportDialog%3A%3ArenderDuplicatePlaceTypeahead&__a=1";

    $("#fbppContent").load(url);

    $.ajax({url: url, headers: {method: "GET", scheme: "https", accept: "*/*",
      version: "HTTP/1.1", 'accept-language': "en-US,en;q=0.8,fr;q=0.6" },
      success: function(result){
        console.log("Sample of data "+result.slice(0,100));
      }
    });

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
  }
}

var GreatCircle = {
  /* great circle distance calculator from https://github.com/mwgg/GreatCircle/blob/master/GreatCircle.js
   * usage: GreatCircle::distance(lat1,long1,lat2,long2,{unit}) where unit is one of KM, MI, NM, YD or FT */

  validateRadius: function(unit) {
    var r = {'KM': 6371.009, 'MI': 3958.761, 'NM': 3440.070, 'YD': 6967420, 'FT': 20902260};
    if ( unit in r ) return r[unit];
    else return unit;
  },

  distance: function(lat1, lon1, lat2, lon2, unit) {
    if ( unit === undefined ) unit = 'KM';
    var r = this.validateRadius(unit); 
    lat1 *= Math.PI / 180;
    lon1 *= Math.PI / 180;
    lat2 *= Math.PI / 180;
    lon2 *= Math.PI / 180;
    var lonDelta = lon2 - lon1;
    var a = Math.pow(Math.cos(lat2) * Math.sin(lonDelta) , 2) + Math.pow(Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDelta) , 2);
    var b = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lonDelta);
    var angle = Math.atan2(Math.sqrt(a) , b);
    return angle * r;
  }
}
