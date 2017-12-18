var infow = [];
var listPlaces = [];

//if there is a error in google maps
function googleError() {
  alert("Something went wrong with google maps");
}

//getting the ids APIs near my location using ajax and storing it inside the placesId array
function myOtherFunction(callback) {
    var data;
    $.ajax({
        'url': "https://api.foursquare.com/v2/venues/search?ll=29.486772,-98.592188&limit=10&client_id=NBWI0IIHZHJ2LLWCO4OHTWWXNEJZR103GBAJJN5STDBCCRK4&client_secret=1RHNOHBM0U0GFMLH1T1BNJSDUWWN4BAMESN1VSMX4RCR3VLA&v=20161016",
        'dataType': "json",
        success: function (resp) {
            callback(resp);
        },
        error: function (jqXHR, exception) {

          var msg = '';
          if (jqXHR.status === 0) {
              msg = 'Not connect.\n Verify Network.';
          } else if (jqXHR.status == 404) {
              msg = 'Requested page not found. [404]';
          } else if (jqXHR.status == 500) {
              msg = 'Internal Server Error [500].';
          } else if (exception === 'parsererror') {
              msg = 'Requested JSON parse failed.';
          } else if (exception === 'timeout') {
              msg = 'Time out error.';
          } else if (exception === 'abort') {
              msg = 'Ajax request aborted.';
          } else {
              msg = 'Uncaught Error.\n' + jqXHR.responseText;
          }
          alert("Something went wrong: \n" + msg);
          console.log(exception +" "+ msg);

        }
    });
}
var map;

// Create a new blank array for all the listing markers.
var markers = [];


function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 29.486772, lng: -98.592188},
    zoom: 13
  });

  // These are the real estate listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  var largeInfowindow = new google.maps.InfoWindow();

  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');

  //marker color is red when clicked
  var clicIcon = makeMarkerIcon('ff0000');


  // Create the DIV to hold the control and call the CenterControl()
  // constructor passing in this DIV.
  var ControlDiv = document.createElement('div');
  var centerControl = new CenterControl(ControlDiv, map);

  ControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(ControlDiv);

  myOtherFunction(function(d) {

    var j = d.response.venues;

    for (var i = 0; i < j.length; i++) {

      //right here
      // The following group uses the location array to create an array of markers on initialize.

      // Get the position from the location array.
      var position = j[i].location;
      var cat;
      var canonicalUrl = "https://foursquare.com/v/" + j[i].id;
      var title = j[i].name;
      var checkinsCount = j[i].stats.checkinsCount;
      var usersCount = j[i].stats.checkinsCount;
      var tipCount = j[i].stats.tipCount;
      var address = j[i].location.address +" " + j[i].location.formattedAddress[1];
      if(typeof j[i].categories[0] === 'undefined'){
        cat = "Other";
      }
      else {
        cat = j[i].categories[0].name;
      }
      //var canonicalUrl = self.dataid()[i].canonicalUrl;

      var showIn = true;

      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
        cat: cat,
        checkinsCount: checkinsCount,
        usersCount: usersCount,
        tipCount: tipCount,
        address: address,
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
      // Two event listeners - one for mouseover, one for mouseout,
      // to change the colors back and forth.
      fclick(marker, largeInfowindow, clicIcon);

}

function fclick(marker){
  marker.addListener('click', function() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setIcon(makeMarkerIcon('0091ff')); // set back to default
    }
    InfoWindow(this, largeInfowindow);
    map.setCenter(marker.getPosition());
    this.setIcon(clicIcon);
  });
}



  showListings();
  });

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

      if (x.style.left === "364px") {
          controlText.innerHTML = "Open";
          x.style.left = "0px";

      } else {
          controlText.innerHTML = "Hide";
          x.style.left = "364px";
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
    //infowindow.marker.setIcon('https://www.google.com/mapfiles/marker_green.png');

    //mouclick(marker, 'https://www.google.com/mapfiles/marker_green.png')
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      marker.setIcon(makeMarkerIcon('0091ff'));
      //this.setIcon(makeMarkerIcon('0091ff'));
      infowindow.marker = null;
    });



    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;

    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);

    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
  }

  // In case the status is OK, which means the pano was found, compute the
  // position of the streetview image, then calculate the heading, then get a
  // panorama from that and set the options
  function getStreetView(data, status) {
    if (status == google.maps.StreetViewStatus.OK) {
      var nearStreetViewLocation = data.location.latLng;
      var heading = google.maps.geometry.spherical.computeHeading(
        nearStreetViewLocation, marker.position);

        infowindow.setContent('<div><a target="_blank" href="' + marker.canonicalUrl +'">' + marker.title + '</a></div> Check-ins Counts: ' + marker.checkinsCount + ' <br> Users Count: ' + marker.usersCount + ' <br> Tip Count: ' + marker.tipCount + '  <div id="pano"></div>');
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
      infowindow.setContent('<div><a target="_blank" href="' + marker.canonicalUrl +'">' + marker.title + '</a>  <br><br> Check-ins Counts: ' + marker.checkinsCount + ' <br> Users Count: ' + marker.usersCount + ' <br> Tip Count: ' + marker.tipCount + '<br><br>'  + marker.address + ' </div>');

    }

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
        markers[i].setMap(map);
        bounds.extend(markers[i].position);

      }
    }
    if (data == "All" ){
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
    this.id = data.id;
    this.name = data.name;
    this.location = data.location;
    if(typeof data.categories[0] === 'undefined' ) {
      this.cat = "Other";
    }
    else {
        // does exist
        this.cat = data.categories[0].name;

    }
    this.showIn = ko.observable(true);
};

//ViewModel defines the data and behavior of your UI
function ViewModel() {

  this.catList = ko.observableArray();
  this.lis = ko.observableArray(['All']);

  var self = this;



  myOtherFunction(function(d) {
      //processing the data

      var j = d.response.venues;

      j.forEach(function(catItem) {

        self.catList.push(new SpacePpl(catItem));

        if(typeof catItem.categories[0] === 'undefined' ) {
        }
        else {

          // does exist
          if ((self.lis.indexOf(catItem.categories[0].name) < 0)) //duplicates
              self.lis.push(catItem.categories[0].name);
        }

      });

  });

  this.clickbtn = function(data) {
    var a = self.catList.indexOf(data);
    for (var i = 0; i < markers.length; i++) {
      markers[i].setIcon(makeMarkerIcon('0091ff')); // set back to default
    }
    markers[a].setIcon(makeMarkerIcon('ff0000'));
    InfoWindow(markers[a], infow[a]);
  };

  this.selectedItem = ko.observable();

  this.selectedItem.subscribe(function(latest) {
    for (var i = 0; i < this.catList().length; i++) {
      if(latest == "All"){
      this.catList()[i].showIn(true);
    }else {
      if(this.catList()[i].cat != latest)
      this.catList()[i].showIn(false);

      if(this.catList()[i].cat == latest)
      this.catList()[i].showIn(true);
      }
    }
      showonly(latest);

  }, this);

}

// Activates knockout.js
ko.applyBindings(new ViewModel());
