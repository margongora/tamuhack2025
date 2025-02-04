import { Flight } from "@/app/api/getFlights/_schema";
import { Marker3D, Model3D, Polyline3D } from "../map-3d";
import { use, useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { AdvancedMarker3D } from "./advanced-pin";
import { useMap3D } from "@/context/map-context";
// import { Model3D } from "./model";

export default function Airplanes({
    plane,
    time = new Date(),
    chosen = false
}: {
    plane: Flight,
    time: Date,
    chosen?: boolean
}) {

    useMapsLibrary("marker");
    const {
        camProps,
    } = useMap3D();

    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);

    const minMax = [2, 2000];

    function getScale() {
        // get camera distance from the ground using range and tilt

        if (!camProps) {
            return 1;
        }

        const tilt_rad = camProps.tilt / 2 * Math.PI / 180;

        // if tilt is greater than 45, limit the range
        // const range_tmp = camProps.tilt > 45 ? camProps.range / ((camProps.tilt - 45)/2) : camProps.range;

        // console.log(camProps.range, camProps?.range);


        const distance = camProps.range * Math.cos(tilt_rad);

        // scale the plane based on the distance
        return Math.min(Math.max((distance / 500), minMax[0]), minMax[1]);
    }

    const getHeading = (lat1: number, long1: number, lat2: number, long2: number) => {
        // convert lat and long to radians
        const lat1Rad = lat1 * Math.PI / 180;
        const long1Rad = long1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        const long2Rad = long2 * Math.PI / 180;

        // get the difference in longitudes
        const dLon = (long2Rad - long1Rad);

        // get the y value
        const y = Math.sin(dLon) * Math.cos(lat2Rad);

        // get the x value
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

        // get the angle
        let brng = Math.atan2(y, x);

        // convert to degrees
        brng = brng * 180 / Math.PI;

        // make the angle clockwise
        // brng = (brng + 360) % 360;
        // brng = 360 - brng;

        return brng;
    }

    useEffect(() => {

        // check if ends with alpha 
        // get current time
        const currentTime = time;

        // get departure time
        const departureTime = new Date(plane.departureTime);

        // get arrival time
        const arrivalTime = new Date(plane.arrivalTime);

        // get duration
        const duration = new Date(arrivalTime.getTime() - departureTime.getTime());

        // if the current time is between the departure and arrival time, the plane is in the air
        const isInAir = currentTime.getTime() > departureTime.getTime() && currentTime.getTime() < arrivalTime.getTime();

        if (!isInAir && !chosen) {
            setCurrentLocation(null);
            return;
        }

        // find the percentage of the flight that has been completed
        const percentage = Math.min(Math.max(((currentTime.getTime() - departureTime.getTime()) / duration.getTime()) * 100, 0), 100);

        // if lat or lng is null, return null
        if (plane.origin.location.latitude === null || plane.origin.location.longitude === null || plane.destination.location.latitude === null || plane.destination.location.longitude === null) {
            return;
        }


        // get the current location of the plane
        const currentLocation = {
            lat: plane.origin.location.latitude + ((plane.destination.location.latitude - plane.origin.location.latitude) * (percentage / 100)),
            lng: plane.origin.location.longitude + ((plane.destination.location.longitude - plane.origin.location.longitude) * (percentage / 100)),
        };


        if (isNaN(currentLocation.lat) || isNaN(currentLocation.lng)) {
            return;
        }

        setCurrentLocation(currentLocation);
    }, [plane, time]);

    const getTrailCoordinates = () => {

        if (!currentLocation) {
            return {
                lat: 0,
                lng: 0,
                altitude: 105
            }
        }

        // get the distance between the origin and the destination
        const distance = Math.sqrt(Math.pow(plane.origin.location.latitude - plane.destination.location.latitude, 2) + Math.pow(plane.origin.location.longitude - plane.destination.location.longitude, 2));

        // get the distance between the origin and the current location
        const currentDistance = Math.sqrt(Math.pow(plane.origin.location.latitude - currentLocation.lat, 2) + Math.pow(plane.origin.location.longitude - currentLocation.lng, 2));

        // get the percentage of the distance that has been traveled
        const percentage = currentDistance / distance;

        // get the coordinates of the trail
        const trailCoordinates = {
            lat: plane.origin.location.latitude + ((plane.destination.location.latitude - plane.origin.location.latitude) * percentage),
            lng: plane.origin.location.longitude + ((plane.destination.location.longitude - plane.origin.location.longitude) * percentage),
            altitude: 100
        };

        return trailCoordinates;
    }

    // useEffect(() => {
    //     if (ref.current) {
    //         ref.current.position = { lat: currentLocation?.lat ?? 0, lng: currentLocation?.lng ?? 0, altitude: 100 };
    //     }
    // }, [currentLocation])

    return (<>
        {/* <AdvancedMarker3D
            position={currentLocation}
            title={"Plane"}
            color="#9C27B0"
            elevated={true}
            altitude={30} // Height in meters
            scale={0.01} // Marker size
            glyph={new URL("http://localhost:3000/plane.svg")} // Marker icon
            showAnchorLine={true} // Show/hide the vertical line
            anchorLineWidth={2} // Line thickness
          /> */}

        {/* <gmp-model-3d position="lat,lng,altitude" altitude-mode="string" orientation="heading,tilt,roll" scale="x,y,z|number" src="string"></gmp-model-3d> */}

        {/* <gm-model-3d position={`${currentLocation.lat},${currentLocation.lng},10000`} altitude-mode="RELATIVE_TO_GROUND" orientation="0,0,0" scale="200" src="http://localhost:3000/plane.glb"></gm-model-3d> */}

        <Model3D position={{ lat: currentLocation?.lat ?? 0, lng: currentLocation?.lng ?? 0, altitude: currentLocation ? 100 : -100 }} altitudeMode="RELATIVE_TO_GROUND" orientation={
            {
                heading: 90 + getHeading(plane.origin.location.latitude, plane.origin.location.longitude, plane.destination.location.latitude, plane.destination.location.longitude),
                // heading: 180,
                tilt: -90,
                roll: 90
            }
        }
            onClick={() => {
                console.log('clicked')
            }}

            scale={getScale()} src="plane.glb"></Model3D>

        <Polyline3D altitudeMode={'RELATIVE_TO_GROUND'} coordinates={[
            { lat: plane.origin.location.latitude, lng: plane.origin.location.longitude, altitude: 100 },
            { lat: currentLocation?.lat ?? 0, lng: currentLocation?.lng ?? 0, altitude: 100 },
            { lat: plane.destination.location.latitude, lng: plane.destination.location.longitude, altitude: 100 },
        ]}
            strokeColor={currentLocation ? "#BBBBBB55" : "transparent"} strokeWidth={currentLocation ? 5 : 0}
            // geodesic
            drawsOccludedSegments
        ></Polyline3D>

        {/* Create short trail 10% of the way */}
        <Polyline3D altitudeMode={'RELATIVE_TO_GROUND'} coordinates={[
            { lat: plane.origin.location.latitude, lng: plane.origin.location.longitude, altitude: 100 },
            getTrailCoordinates(),
        ]}
            strokeColor={currentLocation ? "#EEFFFF77" : "transparent"} strokeWidth={currentLocation ? 5 : 0}
            // geodesic
            drawsOccludedSegments
        ></Polyline3D>

    </>
    )



}