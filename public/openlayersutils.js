periodicUpdateJSON = function(url, period, update) {
    getData = function(url, update) {
      makeRequest(url, update)
   };

    getData(url, update);
    return setInterval(function() {getData(url, update);}, period* 1000);
};
function makeRequest(url, update){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        update(JSON.parse(this.responseText));
    }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Accept", "application/json");
    xmlhttp.send();
}

JSONreplacer = function(key, value)
{
   if (value == "" || key == "markerType")
      return undefined;
   
   return value;
}

// If the tuple contains a note attribute
// then use that as the popup text.
//
// otherwise produce a "pretty" version
// of the tuple using JSON.
makePopupText = function(tuple) {
      msg = "<span style='font-weight: bold;'>Bus "+tuple.id+"</span>";
      if (tuple.data != undefined){
         if (tuple.data.isEntry == "1"){
            msg = msg + "<br/>Entered:<br/>";
         } 
         if (tuple.messages.length > 0) {
               if (tuple.data.isEntry == "0" && tuple.markerType == "YELLOW"){
                  msg = msg + "<br/>Alerts:<br/><ul>";
               }
               for (var i =0; i < tuple.messages.length; i++){
                  msg = msg + "<li>" + tuple.messages[i] +"</li>";
               }
              msg = msg +"</ul>";
            } else {
               msg = msg + "<br/>Location:<br/>"+ tuple.latitude + "," + tuple.longitude;
            }
          
      }
      return msg;

}

createPopup = function(feature) {
   feature.popup = new OpenLayers.Popup.FramedCloud("Popup",
                           feature.geometry.getBounds().getCenterLonLat(),
                           new OpenLayers.Size(200, 300),
                           '<p >' + makePopupText(feature.attributes.spltuple) + '</p>',
                           null,
                           false,
                           function() { controls['selector'].unselectAll(); }
                        );
   feature.popup.maxSize = new OpenLayers.Size(250,400);
   feature.layer.map.addPopup(feature.popup);
}

destroyPopup = function(feature) {
   feature.popup.destroy();
   feature.popup = null;
}

createMarkerLayer = function(map, name) {
    var markerLayer = new OpenLayers.Layer.Vector(name);
    map.addLayer(markerLayer);
 
    //Add a selector control to the vectorLayer with popup functions
    var controls = {
         selector: new OpenLayers.Control.SelectFeature(markerLayer, { onSelect: createPopup, onUnselect: destroyPopup })
    };
      
    map.addControl(controls['selector']);
    controls['selector'].activate();
    
    return markerLayer;
}

moveMarker = function(feature, targetLoc) {
   feature.move(targetLoc);
   
   if (feature.popup) {
      feature.popup.setContentHTML('<div>' + makePopupText(feature.attributes.spltuple) + '</div>');
      feature.popup.updateSize();
      feature.popup.lonlat.lon = targetLoc.lon;
      feature.popup.lonlat.lat = targetLoc.lat;
      feature.popup.updatePosition();
   }
}

getMarkerLayer = function(markerLayers, defaultLayer, layer) {
   if (layer == undefined)
      return defaultLayer;

   var markerLayer = markerLayers[layer];
   if (markerLayer == undefined) {
        markerLayer = createMarkerLayer(defaultLayer.map, layer);
        markerLayers[layer] = markerLayer;
   }
   return markerLayer;
      
}

addMarkersToLayer = function(markerLayers, markers, response) {

   var defaultMarkerLayer = markerLayers["Markers"];
   var map = defaultMarkerLayer.map;

   var tuples = response;
   
   var epsg4326 = new OpenLayers.Projection("EPSG:4326");   
   var mapProjection = map.getProjectionObject();
      		
   var updated = [] ;
   			
   for (var i = 0; i < tuples.length; i++) {
      var tuple = tuples[i];
      tuple.markerType = tuple.markerType.trim();
      var markerType = getMarkerGraphic(tuple.markerType);

      var markerLayer = getMarkerLayer(markerLayers, defaultMarkerLayer, tuple.layer);
      var id = markerLayer.name + ":" + tuple.id;
      updated.push(id);

      if (id in markers) {
         if (markers[id].attributes.spltuple.markerType != markerType)
            markers[id].style.externalGraphic = markerType;
         
         markers[id].attributes.spltuple = tuple;
         var point  = new OpenLayers.LonLat(tuple.longitude, tuple.latitude);
         point.transform(epsg4326, mapProjection);
         moveMarker(markers[id], point);
      } else {
         var point = new OpenLayers.Geometry.Point(tuple.longitude, tuple.latitude);
         point.transform(epsg4326, mapProjection);	
         var marker = new OpenLayers.Feature.Vector(point,
                              {spltuple: tuple},
                              {externalGraphic: markerType, 
                               graphicHeight: 25, graphicWidth: 21 /*,
                               graphicXOffset:-12, graphicYOffset:-25 */ 
                              }
                           );
         marker.fid = id;
         markerLayer.addFeatures(marker);
         marker.__splLayer = markerLayer;
         markers[id] = marker;
      
         // First time only: set map viewport if not already set for geofences
         if (i == 0 && map.getCenter() == undefined) {
            map.setCenter(
                     new OpenLayers.LonLat(tuple.longitude, tuple.latitude).transform(epsg4326, mapProjection),
                     12);
         }
      }
   }
   
   // Remove any markers for which there was no new value
   for (var id in markers) {
      if (markers.hasOwnProperty(id) && updated.indexOf(id) == -1) {
         var marker = markers[id];
         if (marker != null) {
            var markerLayer = marker.__splLayer;
            marker.__splLayer == undefined;
            markerLayer.removeMarker(markers[id]);
            markers[id].spltuple = null;
            markers[id].style.icon = null;
            delete markers[id];
         }
      }
   }
}

getMarkerGraphic = function( markerType) {
    if (markerType == undefined)
        return 'marker-blue.png';

    switch (markerType) {
     case 'GREEN':
          return 'marker-green.png';
     case 'YELLOW':
          return 'marker-gold.png';
     case 'RED':
          return 'marker-red.png';
     case 'BLUE':
          return 'marker-blue.png';
     case 'WARNING':
          return 'marker-warning.png';
     case 'AWARD':
          return 'marker-award.png';
     default:
         return markerType;
    }
}
