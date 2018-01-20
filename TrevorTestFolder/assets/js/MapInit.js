//add map with default parameters to HTML
     var map, infoWindow;
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 33.772, lng: 84.385},
          zoom: 15,
        });
        infoWindow = new google.maps.InfoWindow;

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
      }

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
      }

/*

//working on map text search

var map;
var service;
var infowindow;
var currentpos;

function initMap() {
  var currentpos = new google.maps.LatLng(33,84);

  map = new google.maps.Map(document.getElementById('map'), {
      center: currentpos,
      zoom: 15
    });

  var request = {
    location: currentpos,
    radius: '500',
    type: ['pharmacy'],
    query: 'flu' + 'vaccine' + 'at' + 'pharmacy' + 'near' + 'me',
  };



  service = new google.maps.places.PlacesService(Map);
  service.nearbySearch(request, callback);
 //service.textSearch(request, callback);
  // can service.nearbySearch(request, callback); be used here?


function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(results[i]);
    }
  }
};

*/

