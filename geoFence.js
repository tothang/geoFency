/*

    This module creates a geo-fence based on polar coordiate froma reference pt with the location
    - convert data pts from along the fence to create an array of polar coordinates for each location
    - using great circle on the earth surface to estimate distance between points
    - find the direction and distance of the given pt to the locqation's reference pt first, then use them to check if it is within the fence
    - use 2 tolerances as hysteresis to determine if the given pt is within or outside the location's fence
*/

const VERSION = "0.0.3";

const GEO_TO_M = 1/180*Math.PI*6371*1000;           //conversion ratio from gps coord difference (degree) to meters
const GEO_RES_DEG = 0.002;                          //resolution of distance between dots in degree

class geoFence {
    locations = [];
    /*
    sample location info
    var locationItem = {
        //location info
        locID:"psa_1",
        label: "name",
        //reference pt
        lon : 0.0,
        lat : 0.0,
        rad : 500,            //in meters, if within this radius means nearby
        tolerance: 50,         //in meters, hysteresis margin from fence, for checking if a pt is outside
        tolerance2: 20,        //im meters, hysteresis margin from fence, for checking if a pt is inside
        fenceArrIdx: -1,
    };
    */
    fenceArrList = [];
    /*
    sample fenceArr info
    var fenArrListItem = {
        locID:"psa_1",
        label: "name",
        fenceArr = [];        
    }    
    */

    constructor() {
        this.locations = [];
        /*
        sample location info
        var locationItem = {
            //location info
            locID:"psa_1",
            label: "name",
            //reference pt
            lon : 0.0,
            lat : 0.0,
            rad : 500,            //in meters, if within this radius means nearby
            tolerance: 50,         //in meters, hysteresis margin from fence, for checking if a pt is outside
            tolerance2: 20,        //im meters, hysteresis margin from fence, for checking if a pt is inside
            fenceArrIdx: -1,
        };
        */
        this.fenceArrList = [];
        /*
        sample fenceArr info
        var fenArrListItem = {
            locID:"psa_1",
            label: "name",
            fenceArr = [];        
        }    
        */
    }


    //get distance bwteen two coordinates in meters
    getDist(lon, lat, lon_ref, lat_ref) {
        //get diff in deg from gps
        let lon_delta = lon - lon_ref;  let lat_delta = lat - lat_ref;
        let dist_gps = (lon_delta*lon_delta + lat_delta*lat_delta)**0.5;

        //estimate absolute distance from the reference pt
        let dist = dist_gps*GEO_TO_M;  

        //console.log("in getDist: ", lon, lat, lon_ref, lat_ref, lon_delta, lat_delta, dist_gps, dist)

        return dist;
    }


    //get the direction of current location from reference pt in degrees
    getDeg(lon, lat, lon_ref, lat_ref) {
        //get diff in deg from gps
        let lon_delta = lon - lon_ref;  let lat_delta = lat - lat_ref;

        //compute the angle/direction from reference to the pt
        let deg = 180/Math.PI*Math.atan(lat_delta/lon_delta);

        //console.log("in getDeg: ", lon, lat, lon_ref, lat_ref, lon_delta, deg)

        //correct value based on the quadrant the pt is in from the reference
        if(lon_delta<0) {
            deg = 180 + deg;            //2nd and 3rd 
        }
        else if((lat_delta < 0)){
            deg = 360 + deg;            //4th
        }
        return deg;          

    }


    //
    // check the distance of the fence from the ref pt for the location based on the direction
    //
    getFenceDist(fenArr, deg) {
        let len = fenArr.length;
        let dist = 0;

        //look for first dot that has angle more than deg
        let i = fenArr.findIndex(dot  => dot.deg > deg);
        if (i>0) {                          //found 2 dots, 1 on each side of deg
            //do interpolation to get a better estimation
            let d1 = deg-fenArr[i-1].deg; let d2 = fenArr[i].deg-deg;
            dist =  (fenArr[i-1].dist*d2 + fenArr[i].dist*d1) / (d1+d2);
        }
        else if(i==0) {            
            dist = fenArr[i].dist;          //first dot already at greater angle, based on first dot
        }
        else {
            dist =  fenArr[len-1].dist;     //not found, further than last dot, based on last dot       
        }

        return dist;     

        /* old code
        //look for first dot that has angle more than deg
        for (let i=0; i<len; i++) {
            if(fenArr[i].deg > deg) {
                if (i>0) {      //found 2 dots, 1 on both side of deg
                    //less accurate estimation - take the average of the two data
                    //dist = (fenArr[i-1].dist+fenArr[i].dist)/2;

                    //do interpolation to get a better estimation
                    let d1 = deg-fenArr[i-1].deg; let d2 = fenArr[i].deg-deg;
                    dist =  (fenArr[i-1].dist*d2 + fenArr[i].dist*d1) / (d1+d2);
                }
                else {          //found 1 pt only  
                    dist = fenArr[i].dist;  //first dot already at greater angle, based on first dot
                }
                return dist;            
            }
        }

        // not found
        return fenArr[len-1].dist;      //further than last dot, based on last dot
        */
    }


    //
    // add new location to the this.locations array
    //
    addLocation(loc) {
        this.locations.push(loc);
        return (this.locations);
    }


    //
    // add clear all this.locations in the this.locations array
    //
    clearLocation() {
        this.locations = [];
        return (this.locations.length);
    }


    //
    // add new fenceArr to the fenceArrList array
    //
    addFenceArr(id, fenceArr) {

        //check for idx for loc in this.locations array
        let loc_idx = this.locations.findIndex(loc => loc.locID == id);

        let fence_idx = fenceArrList.push(fenceArr);

        //put the fenceArr idx in location item
        this.locations[loc_idx].fenceArrIdx = fence_idx;

        return (loc_idx, fence_idx);
    }


    //
    // add clear all fenceArr in the fenceArrList array
    //
    clearFenceArr() {
        fenceArrList = [];
        return (fenceArrList.length);
    }


    //
    // get index for a location from locID
    //  return the index in this.locations array with element that match id with locID
    //  return -1 if not found
    //
    getLocIdx(id) {
        let idx = this.locations.findIndex(loc => loc.locID == id);
        return (idx);
    }


    //
    // check if the pt is within the radius used to defined as nearby
    //  return 0: if iti nearby, -1:if it is not
    //
    isNear(location_idx, lon, lat) {
        let ref = this.locations[location_idx];
        let dist = this.getDist(lon, lat, ref.lon, ref.lat)

        //console.log("dist :", dist, "ref: ", ref);

        if(dist>ref.rad) return -1;
        return 0;
    }


    //
    // create the array (with polar coordinates) of the fence distance from the refernce pt for the location
    //  return an array of polar coordinates for fence from the reference pt, sorted by angle (deg)
    //
    createGeofence(pts, ref) {
        var numPts = pts.length;
        var fenceArr = [];

        //need at least 4 points
        if(numPts<4) {
            console.log("too few pts : ", length);
            return -1;
        }

        //plot the polar coordinate by section and check for folding
        for (let i=0; i<numPts-1; i++) {
            let lon_s = pts[i].lon;     let lat_s = pts[i].lat;         //start pt
            let lon_e = pts[i+1].lon;   let lat_e = pts[i+1].lat;       //end pt

            //estimate num of internal pts
            let numIntPts = (Math.abs(lon_e-lon_s) + Math.abs(lat_e-lat_s))/GEO_RES_DEG;    
            if(numIntPts<2) continue;               //skip if too few dots

            //step size for ploting polar coordinates
            let lon_delta = (lon_e-lon_s)/numIntPts;    let lat_delta = (lat_e-lat_s)/numIntPts;

            //console.log("lon_s = ", lon_s, " lat_s = ", lat_s, " lon_e = ", lon_e, " lat_e = ", lat_e);
            //console.log("numIntPts = ", numIntPts, "lon_delta = ", lon_delta, "lat_delta = ", lat_delta);

            //plot the polar coordinate dot by dot for the section
            let lon = lon_s;    let lat = lat_s;
            for( let j=0; j<Math.trunc(numIntPts); j++) {
                let deg = this.getDeg(lon, lat, this.locations[ref].lon, this.locations[ref].lat);
                let dist = this.getDist(lon, lat, this.locations[ref].lon, this.locations[ref].lat);

                //console.log("dot ", j, " : ", lon, lat);

                //create 1 dot, round deg to 1 decimal pt, dist to nearest m
                let pt = {sect:i, dot:j, deg: Math.round(deg*10)/10, dist: Math.round(dist)};

                fenceArr.push(pt);

                lon += lon_delta;   lat += lat_delta;
            }
        }

        //to check if there is any folding of the fence polar coordinates
        //  the angle deg should always be increasing or decreasing, except at the pts when it cross 360 deg  
        //  where there will be a spike in delta in deg but it is not a change in direction
        let folds = [];
        let direction = 1;      //1 is increasing deg
        let numDot = fenceArr.length;
        if(fenceArr[1]-fenceArr[0]<0) {
            direction = -1;     // -1 is decreasing deg
        }
        for (let i=2; i<numDot-1; i++) {
            let deg_delta = fenceArr[i].deg-fenceArr[i-1].deg;
            if(deg_delta<0) {
                if(direction==1 && deg_delta>-180) {        //make sure it is not due to wrap-around at 360 deg
                    direction = -1;
                    folds.push({sect:fenceArr[i].sect, dot:fenceArr[i].dot, deg:fenceArr[i].deg, deg_delta:deg_delta});
                }
            }
            else if(direction==-1 && deg_delta<180) {       //make sure it is not due to wrap-around at 360 deg
                direction = 1;
                folds.push({sect:fenceArr[i].sect, dot:fenceArr[i].dot, deg:fenceArr[i].deg, deg_delta:deg_delta});
            }
        }

        if(folds.length>0) console.log("\n\n====== ERROR!!! ======\n folding occurs in the fence :", folds, "\n\n");
        //console.log(fenceArr);

        //sort the array based on deg from 0 to 360
        let sortedResult = fenceArr.sort((a, b) => (a.deg>b.deg? 1: -1));

        return sortedResult;
    }


    //
    // check if the given pt is inside the location
    //  return 0:inside, 1:outside, -1:within tolerance, cannot decide
    //
    isInside(locIdx, fenArr, lon, lat) {
        let ref = this.locations[locIdx];
        let deg = this.getDeg(lon, lat, ref.lon, ref.lat);
        let dist = this.getDist(lon, lat, ref.lon, ref.lat);
        let distFromFence = dist - this.getFenceDist(fenArr, deg);

        console.log("deg = ", deg, " distFromFence =", distFromFence, " tolerance =", this.locations[locIdx].tolerance);

        //check if given pt is inside or outside the location
        if(distFromFence>this.locations[locIdx].tolerance) {
            return 1;       //outside
        }
        else if (distFromFence<this.locations[locIdx].tolerance2) {
            return 0;       //inside
        }
        else  return -1;    //not sure, within tolerance
    }

}

module.exports = geoFence;