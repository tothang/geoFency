const geoFence = require('./geoFence.js');

// ******************************************
//      test code for lskGeoFence.js
//
// ******************************************

//
// set up the locations arrary
//
let loc = {
  //location info
  locID:"psa_1",
  label: "name",
  //reference pt
  //lon : 0.0,
  //lat : 0.0,
  lon: -0.127758,
  lat: 51.507351,
  rad : 5000,         //in meters, if within this radius means nearby
  tolerance: 50,      //in meters, hysteresis margin from fence, for checking if a pt is inside or outside
  tolerance2: -20,
  fenceArrIdx: -1,
};

let geofence = new geoFence();

let locArr=geofence.addLocation(loc);
console.log("location array :", locArr);
console.log("idx = ", geofence.getLocIdx("psa_1"));


//
// create geo fence based on the points in an array
//      pts must be arranged in order in a single direction of rotation from the reference pt
//
let ptArr = [
/*
{lon: 0.004, lat: 0.004},
{lon: -0.005, lat: 0.005},
{lon: -0.004, lat: -0.004},
{lon: 0.003, lat: -0.003},
{lon: 0.004, lat: 0.004},
*/
{ lon: 103.7631237, lat: 1.2943612}, 
{ lon: 103.7582241, lat: 1.2943511},
{ lon: 103.7484394, lat: 1.2807933},
{ lon: 103.7853538, lat: 1.2544169},
{ lon: 103.796898, lat: 1.2742389},
{ lon: 103.7837659, lat: 1.2790013},
{ lon: 103.7817918, lat: 1.2822621},
{ lon: 103.7784873, lat: 1.2862951},
{ lon: 103.7759553, lat: 1.28814},
{ lon: 103.7744104, lat: 1.2866813},
{ lon: 103.7667285, lat: 1.290843},
{ lon: 103.7631237, lat: 1.2943612},
];

console.log("createGeofence :");
let fence = [];
fence = geofence.createGeofence(ptArr, 0);
console.log("num of pts = ", fence.length);
console.log(fence);


//
// check if i am nearby the location
//
let myLon = -0.127758 + 0.005;
let myLat = 51.507351 + 0.005;
let locIdx = 0;

console.log("my location = ", myLon, myLat);
console.log("isNear :");
console.log(geofence.isNear(locIdx, myLon, myLat));


//
// check if i am inside the location
//
console.log("isInside :");
console.log(geofence.isInside(0, fence, myLon, myLat));

