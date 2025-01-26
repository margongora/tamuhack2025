import { Flight } from "@/app/api/getFlights/_schema";
import { Marker3D, Polyline3D } from "../map-3d";
import { useEffect, useState } from "react";

export default function Airplanes({
    plane,
    time = new Date()
}: {
    plane: Flight,
    time: Date
}) {

    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {

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

        console.log('currentLocation:', currentLocation);

        if (isNaN(currentLocation.lat) || isNaN(currentLocation.lng)) {
            return;
        }

        setCurrentLocation(currentLocation);
    }, [plane, time]);

    return (<>
        {currentLocation ? <>
            <Marker3D position={{
                lat: currentLocation.lat,
                lng: currentLocation.lng,
            }} label="Plane" onClick={() => {
                console.log('clicked')
            }}></Marker3D>
            <Polyline3D altitudeMode={'RELATIVE_TO_GROUND'} coordinates={[
                { lat: plane.origin.location.latitude, lng: plane.origin.location.longitude, altitude: 10000 },
                { lat: currentLocation.lat, lng: currentLocation.lng, altitude: 60000 },
                { lat: plane.destination.location.latitude, lng: plane.destination.location.longitude, altitude: 10000 },
            ]}
                strokeColor="#500000" strokeWidth={10}
                geodesic
                drawsOccludedSegments
            ></Polyline3D>
        </> : null}
    </>
    )



}