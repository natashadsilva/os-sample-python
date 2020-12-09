var markerLayers = {};
    
function setUpdatePeriod(){
  var qp = getParams();
  if ("period" in qp) {
    updatePeriod = qp["period"];
  }
}

function localTimeString(seconds) { 
  return new Date(seconds*1000).toLocaleTimeString();
 }
  function localTimestampString(seconds) { 
   return new Date(seconds*1000).toLocaleString(); 
  }
  function localTimeMillisString(ms) { 
   return new Date(ms).toLocaleString(); 
  }

function fmtlink (path) {
   return '<a href="' + path + '">' + path + '</a>';
}

function getParams() {
        var url = window.location.search;
        var params = {};
        var pairs = url.substring(url.indexOf('?') + 1).split('&');
        for ( var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return params;
    }


function initialize() {
  var map_options = {
    div : this.mapDiv,
    allOverlays : false,
    maxExtent : this.mapExtent,
    controls : [ new OpenLayers.Control.DragPan(),
                 new OpenLayers.Control.Navigation(),
                 new OpenLayers.Control.PanZoomBar(),
                 new OpenLayers.Control.ScaleLine(),
                 new OpenLayers.Control.MousePosition(),
                 new OpenLayers.Control.LayerSwitcher() ]
  };
  var map = new OpenLayers.Map('map-canvas', map_options);
  // Avoid http cross-origin issues
  // See https://github.com/eclipse/sumo/issues/3991#issue-314263257
  map.addLayer(new OpenLayers.Layer.OSM(
    "OpenStreetMap", 
    // Official OSM tileset as forced HTTPS URLs
    [
        'https://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'https://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'https://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
    ], null));
    return map;
}

function createMap(url, params){
    var map = initialize();
    
  // create marker layer
 
  markerLayers["Markers"] = createMarkerLayer(map, "Markers");

  var markers = {};
  
  function _addMarkersToMap(response) {
       addMarkersToLayer(markerLayers, markers, response);
  }   
  
  
  // retrieve data from HTTPTupleView
  periodicUpdateJSON(url, params, updatePeriod, _addMarkersToMap);  
}