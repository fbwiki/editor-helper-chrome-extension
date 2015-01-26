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
   * Might want to bring back cityId (where defined?) and try cityBias=true
   *
   * I really wonder what the "use_unicorn" parameter is for...
   *
   * There doesn't appear to be anyway of restricting the radius of the returned
   * results, facebook is looking all over the world for dupes. It would be good
   * to remove the ones >~100 miles away. Need the formula for great circle
   * distance between two lat-long coordinates */

  var pageId = $("input[name=page_id]")[0].value;
  var cityId = $("input[name=seed]").attr('value');
  var pageObj = $.get("https://graph.facebook.com/"+pageId,function(data){ // this call works *without* an access token!
    var latitude = data.location.latitude;
    var longitude = data.location.longitude;
    var pageName = encodeURIComponent($("._4c0z").find("a").text().trim().split(" ").slice(0,3).join(" ")); //first 3 words of place name
    var url = "https://www.facebook.com/ajax/places/typeahead?value=" + 
      pageName+"&latitude="+latitude+"&longitude="+longitude+"&existing_ids="+pageId+"&city_id="+cityId+'&city_bias=false' +
      "&include_address=2&include_subtext=true&exact_match=false&use_unicorn=true&allow_places=true&allow_cities=true&render_map=true&limit=30&proximity_boost=true&map_height=150&map_width=348&ref=PlaceReportDialog%3A%3ArenderDuplicatePlaceTypeahead&__a=1";


    $.ajax({url: url, headers: {method: "GET", scheme: "https", accept: "*/*",
      version: "HTTP/1.1", 'accept-language': "en-US,en;q=0.8,fr;q=0.6",
      cache: true, processData: false},
      complete: function(xhr,status){
        var data = xhr.responseText;
        var json = JSON.parse(data.substr(data.indexOf("{")));

        /* the matches are in json.payload.entries, an array of objects of the form:
         *
         *  address: null
            city_id: 2422390
            city_name: "Tahoe City, CA"
            city_page_id: 107885529244686
            latitude: 39.1997079033
            longitude: -120.237929977
            map: Object
            photo: "https://fbcdn-profile-a.akamaihd.net/static-ak/rsrc.php/v2/y5/r/j258ei8TIHu.png"
            place_type: "place"
            subtext: "Tahoe City, California · 14 were here"
            text: "Pain Mcshlonky Gala"
            uid: 177557992363854

         * use these to construct the HTML for the similar places.
         * Remove anything over 100 miles away. Also remove the current place.
         * Optionally order by distance and/or by number of people who've been there.
         *
         * If no similar places are found try reducing the search to the first 2 words
         * or even just the first word in the place name
         *
         * FB lays out the typeahead results in the following format:

            <div class="PlacesTypeaheadViewList">
              <ul class="noTrucating compact" id="typeahead_list_u_2v_a" role="listbox">
                <li class="" title="Wompatuck State Park" aria-label="Wompatuck State Park" role="option">
                  <img alt="" src="https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xap1/v/t1.0-1/c8.0.50.50/p50x50/10175994_722621287782410_8414702203789626750_n.jpg?oh=a10cfb04d83e48d89c63a81ba29548a9&amp;oe=555D949D&amp;__gda__=1428526241_344430b5ebc1a56de6d5009ba4b331e2">
                  <span class="text">Wompatuck State Park</span>
                  <span class="subtext">204 Union St · Hingham, Massachusetts · 3,538 were here</span>
                  </li>

         * which we can mimick for consistency
         */

        var entries = json.payload.entries;
        var html = null;
        if ( entries ){
          var i = 0;

          while ( i < entries.length ){ // eliminate the current node from the results
            if ( entries[i].uid == pageId ) entries.splice(i,1);
            else i++;
          }

          $.each(entries,function(i,entry){ // get the distance to each other node
            var distance = GreatCircle.distance(latitude,longitude,entry.latitude,entry.longitude,'KM');
            entries[i].distance = distance;
          })

          entries.sort(compareDistance); // sort by distance

          var match = entries.length;
          if ( entries.length > 0 ){
            $.each(entries,function(i,entry){ // take the first 15 elements or 100km, which ever comes *first*
              if ( ( i > 14 || entry.distance > 100 ) && match == entries.length ) match = i;
            })
          }
          entries = entries.slice(0,match); 

          var width = rightOfContainer-rightOfEditor-24;
          var height = editBox[0].getBoundingClientRect().height;

          var html = '<div class="uiTypeaheadView PlacesTypeaheadView PlacesTypeaheadViewPopulated" style="position:relative; width:'+width+'px; max-height:'+height+'px;" id="u_9_d"><div class="uiScrollableArea nofade uiScrollableAreaWithShadow contentAfter" style="max-height:'+height+'px" id="u_9_e"><div class="uiScrollableAreaWrap scrollable" style="max-height:'+height+'px;" aria-label="Scrollable region" role="group" tabindex="-1"><div class="uiScrollableAreaBody" style="width:338px;"><div class="uiScrollableAreaContent"><div class="PlacesTypeaheadViewList"><ul class="noTrucating compact" id="typeahead_list_u_9_a" role="listbox">'
          $.each(entries,function(index,entry){
            html += '<li class="" title="'+entry.text+'" aria-label="'+entry.text+'" role="option">'
            html += '<img src='+entry.photo+'>';
            html += '<span class="text">'+entry.text+'</span>';
            html += '<span class="subtext">'+entry.subtext+'</span></li>';
          })

          html += '</ul></div></div></div></div></div>';
        }
        if ( entries.length == 0) html = '<h1 style="padding:30px">No similar nearby entries!</h1>'
        $("#fbppContent").html(html);
      },
      error: function(jqXHR,textStatus,err) { // always get a parseError but don't care
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
  $("#fbpp").append("<button id='fbpp_showSimilarNearby' style="+fbppButtonStyle+">Similar Nearby</button>");
  $("#fbpp").append("<button id='fbpp_reportButton' style="+fbppButtonStyle+">Report</button>");
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
   * usage: GreatCircle.distance(lat1,long1,lat2,long2,{unit}) where unit is one of KM, MI, NM, YD or FT */

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

function compareDistance(a,b){
  if ( a.distance < b.distance ) return -1;
  if ( a.distance > b.distance ) return +1;
  return 0;
}
