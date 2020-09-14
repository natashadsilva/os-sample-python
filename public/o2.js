<!DOCTYPE html>
<!-- Copyright (C) 2015, International Business Machines Corporation  -->
<!-- All Rights Reserved                                            -->
<html>
<head>
<title>Simple Map</title>
<meta name="viewport" content="initial-scale=1.0, user-scalable=no">
<meta charset="utf-8">

<script src="../../streamsx.inet.dojo/dojo/dojo.js"></script>
<script src="../utils.js"></script>
<script src="../dojo/dojoutils.js"></script>
<script src="openlayersutils.js"></script>

<style>
html,body,#map-canvas {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
</head>
<body>
  <div id="test"></div>
  <div id="map-canvas"></div>
  <script src="https://www.openlayers.org/api/OpenLayers.js"></script>
  <script>
      
    var qp = getQueryParameters();
    
    var urldata = '../..' + qp["json"];
    var updatePeriod = 1;
    if ("period" in qp) {
        updatePeriod = qp["period"];
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

      // create marker layer
      var markerLayers = {};
      markerLayers["Markers"] = createMarkerLayer(map, "Markers");
      
      if ("geofences" in qp) {
        var file = qp["geofences"];
        var geofenceLayer = new OpenLayers.Layer.Vector("Geofences", {
          styleMap: new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                fillColor: "#33CC00",
                strokeColor: "#000000",
                strokeWidth: 1
            })
          })
        });
        map.addLayer(geofenceLayer);
        
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
          if (request.readyState == 4 && request.status == 200) {
            addGeofences(request.responseText);
          }
        }
        request.open("GET", file, true);
        request.send(null);
      }

      addGeofences = function(contents) {
        var records = contents.split('\n');
        var wktParser = new OpenLayers.Format.WKT;
        var epsg4326 = new OpenLayers.Projection("EPSG:4326");   
        var mapProjection = geofenceLayer.map.getProjectionObject();
        var colors = ["Green", "Yellow", "Red"];
        var polygons = [];
        for (var i = 0; i < records.length; i++) {
          var fields = records[i].split('","');     // This strips off the middle quotes
          if (fields.length == 2) {
            var fenceId = fields[0].substr(1, fields[0].length-1);  // strip begin quote
            var polygon = wktParser.read(fields[1].substr(0, fields[1].length-2));   // strip end quote
            polygon.geometry.transform(epsg4326, mapProjection);
            polygon.fid = fenceId;
            polygon.style = {strokeColor: colors[i%3],strokeOpacity: 1,strokeWidth: 3,fillColor: "#FF9966",fillOpacity: 0.2};
            polygons.push(polygon);
          }
        }
        geofenceLayer.addFeatures(polygons);
        geofenceLayer.map.zoomToExtent(geofenceLayer.getDataExtent());
      }

      var markers = {};
      
      function _addMarkersToMap(response) {
           addMarkersToLayer(markerLayers, markers, response);
      }      
      
      // retrieve data from HTTPTupleView
      periodicUpdateJSON(urldata, updatePeriod, _addMarkersToMap);
    }

    initialize();
  </script>
</body>
</html>
