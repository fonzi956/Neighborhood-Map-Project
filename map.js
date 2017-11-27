var places = [];
var infow = [];
var placesCat = [];
var listPlaces = [];
var placesNewCat = ["All"];
var placesId = [];

//getting the ids APIs near my location using ajax and storing it inside the placesId array
$.ajax({
   'async': false,
   'global': false,
   'url': "https://api.foursquare.com/v2/venues/search?ll=29.398291,-98.642307&limit=10&client_id=NBWI0IIHZHJ2LLWCO4OHTWWXNEJZR103GBAJJN5STDBCCRK4&client_secret=1RHNOHBM0U0GFMLH1T1BNJSDUWWN4BAMESN1VSMX4RCR3VLA&v=20161016",
   'dataType': "json",
   'success': function(data){
     for ( i = 0; i< 10; i++) {
      placesId.push(data.response.venues[i].id);
   }
 }
});

//getting the venues details APIs placesId using ajax again
for (var i = 0; i < placesId.length; i++) {
  getdata(i);
}
function getdata(i){
  $.ajax({
     'async': false,
     'global': false,
     'url': "https://api.foursquare.com/v2/venues/"+ placesId[i] +"?client_id=NBWI0IIHZHJ2LLWCO4OHTWWXNEJZR103GBAJJN5STDBCCRK4&client_secret=1RHNOHBM0U0GFMLH1T1BNJSDUWWN4BAMESN1VSMX4RCR3VLA&v=20161016",
     'dataType': "json",
     'success': function(data){
        var json = data.response.venue;
        if(typeof json.categories[0] === 'undefined' ) {
            // does not exist
        }
        else {
            // does exist
            places.push(json);
            placesNewCat.push(json.categories[0].name);

        }

     }
  });
}

//checking if placesNewCat has any same value to use dropdown
placesNewCat = placesNewCat.filter(function(item, pos) {
    return placesNewCat.indexOf(item) == pos;
});


var map;

// Create a new blank array for all the listing markers.
var markers = [];


function initMap() {

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 29.398291, lng: -98.642307},
    zoom: 13
  });

  // These are the real estate listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  var largeInfowindow = new google.maps.InfoWindow();


  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');

  // Create the DIV to hold the control and call the CenterControl()
  // constructor passing in this DIV.
  var ControlDiv = document.createElement('div');
  var centerControl = new CenterControl(ControlDiv, map);

  ControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(ControlDiv);

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < places.length; i++) {
    // Get the position from the location array.
    var position = places[i].location;
    var title = places[i].name;
    var cat = places[i].categories[0].name;
    var canonicalUrl = places[i].canonicalUrl;

    var showIn = true;
    var pic = null;
    if (places[i].photos.count !== 0) {
      pic = places[i].bestPhoto.prefix + "width240"+places[i].bestPhoto.suffix;
    }else {
      pic = 0;
    }

    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      pic: pic,
      cat: cat,
      canonicalUrl: canonicalUrl,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i,
      showIn: showIn
    });
    // Push the marker to our array of markers.
    markers.push(marker);

    // Create an onclick event to open the large infowindow at each marker.
    infow.push(largeInfowindow);

    marker.addListener('click', function() {
      InfoWindow(this, largeInfowindow);
    });
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
}

  showListings();

}

function CenterControl(controlDiv, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Hide left area';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '32px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Open';
    controlUI.appendChild(controlText);

    var x = document.getElementById("map");

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', function() {
      //map.setCenter(chicago);
      //var y = document.getElementById("options-box");
      if (x.style.left === "362px") {
          //y.style.display = "block";
          controlText.innerHTML = "Open";
          x.style.left = "0px";

      } else {
          //y.style.display = "none";
          controlText.innerHTML = "Hide";
          x.style.left = "362px";
          map.zoom = 8;
      }
    });

  }

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function InfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK && marker.pic === 0) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);

          infowindow.setContent('<div><a target="_blank" href="' + marker.canonicalUrl +'">' + marker.title + '</a></div><div id="pano"></div>');
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div><a target="_blank" href="' + marker.canonicalUrl +'">' + marker.title + '</a></div>' +
          '<div> <a target="_blank" href="' + marker.canonicalUrl +'"><img src="'+ marker.pic +'" alt=""></a> </div>');
      }
    }
    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
  }
}


// This function will loop through the markers array and display them all.
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}


// This function will loop through the listings and hide them all.
function hideListings() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}
//This function will show what to display from selectedItem to the map
function showonly(data) {
  hideListings();

  listPlaces = [];

  for (var i = 0; i < markers.length; i++) {
    var bounds = new google.maps.LatLngBounds();
    if (data != "All" ) {
      if (markers[i].cat == data ) {
        listPlaces.push(markers[i].title);
        markers[i].setMap(map);
        bounds.extend(markers[i].position);

      }
    }
    if (data == "All" ){
      listPlaces = places.slice();
      showListings();
    }
  }
}


// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

//Function for getting the value from array and writes back modified vaule
var SpacePpl = function(data) {
    this.name = ko.observable(data.name);
    this.location = ko.observable(data.location);
    this.cat = ko.observable(data.categories[0].name);
    this.showIn = ko.observable(false);
};

//ViewModel defines the data and behavior of your UI
function ViewModel() {
  this.catList = ko.observableArray();

  var self = this;
  places.forEach(function(buzz) {
    self.catList.push(new SpacePpl(buzz));
  });

  this.clickbtn = function(data) {
    var a = self.catList.indexOf(data);
    InfoWindow(markers[a], infow[a]);
  };

  this.selectedItem = ko.observable();

  this.selectedItem.subscribe(function(latest) {
    for (var i = 0; i < this.catList().length; i++) {
      if(latest == "All"){
      this.catList()[i].showIn(true);
    }else {
      if(this.catList()[i].cat() != latest)
      this.catList()[i].showIn(false);

      if(this.catList()[i].cat() == latest)
      this.catList()[i].showIn(true);
      }
    }

      showonly(latest);

  }, this);

}

// Activates knockout.js
ko.applyBindings(new ViewModel());
