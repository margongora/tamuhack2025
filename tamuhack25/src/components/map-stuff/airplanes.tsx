import { Flight } from "@/app/api/getFlights/_schema";
import { Marker3D, Model3D, Polyline3D } from "../map-3d";
import { use, useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { AdvancedMarker3D } from "./advanced-pin";
import { useMap3D } from "@/context/map-context";
// import { Model3D } from "./model";

export default function Airplanes({
    plane,
    time = new Date()
}: {
    plane: Flight,
    time: Date
}) {

    useMapsLibrary("marker");
    const {
        camProps,
    } = useMap3D();

    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);

    const minMax = [1, 2000];

    function getScale() {
        // get camera distance from the ground
        const distance = camProps?.range || 0;

        // scale the plane based on the distance
        return Math.min(Math.max((distance / 1000), minMax[0]), minMax[1]);
    }

    /*
    private double angleFromCoordinate(double lat1, double long1, double lat2,
        double long2) {

    double dLon = (long2 - long1);

    double y = Math.sin(dLon) * Math.cos(lat2);
    double x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1)
            * Math.cos(lat2) * Math.cos(dLon);

    double brng = Math.atan2(y, x);

    brng = Math.toDegrees(brng);
    brng = (brng + 360) % 360;
    brng = 360 - brng; // count degrees counter-clockwise - remove to make clockwise

    return brng;
} */

    const getHeading = (lat1: number, long1: number, lat2: number, long2: number) => {
        const dLon = (long2 - long1);

        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

        let brng = Math.atan2(y, x);

        brng = (brng * 180 / Math.PI);
        brng = (brng + 360) % 360;
        brng = 360 - brng;

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

        if (!isInAir) {
            setCurrentLocation(null);
            return;
        }

        // find the percentage of the flight that has been completed
        const percentage = ((currentTime.getTime() - departureTime.getTime()) / duration.getTime()) * 100;

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

        return () => {
            setCurrentLocation(null);
        }
    }, [plane, time]);

    return (<>
        {currentLocation ? <>
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

            <Model3D position={{ lat: currentLocation.lat, lng: currentLocation.lng, altitude: 100 }} altitudeMode="RELATIVE_TO_GROUND" orientation={
                {
                    heading: getHeading(plane.origin.location.latitude, plane.origin.location.longitude, plane.destination.location.latitude, plane.destination.location.longitude),
                    tilt: -90,
                    roll: 90
                }
            } scale={getScale()} src="http://localhost:3000/plane.glb"></Model3D>

            <Polyline3D altitudeMode={'RELATIVE_TO_GROUND'} coordinates={[
                { lat: plane.origin.location.latitude, lng: plane.origin.location.longitude, altitude: 10000 },
                { lat: currentLocation.lat, lng: currentLocation.lng, altitude: 60000 },
                { lat: plane.destination.location.latitude, lng: plane.destination.location.longitude, altitude: 10000 },
            ]}
                strokeColor="#50505099" strokeWidth={5}
                geodesic
                drawsOccludedSegments
            ></Polyline3D>
        </> : null}
    </>
    )



}