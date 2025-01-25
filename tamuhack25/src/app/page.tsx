import AirportForm from "@/components/AirportForm";
import { Map3D, Marker3D, Polyline3D } from "@/components/map-3d";

export default function Home() {
  return (
    <div className="w-screen h-screen dark">
      <AirportForm />
      <Map3D center={{ lat: 30.267, lng: -97.7431, altitude: 5000 }}>
        <Polyline3D altitudeMode={'RELATIVE_TO_GROUND'} coordinates={[
            {lat: 32.7767, lng: -96.7970, altitude: 30000},
            {lat: 40.7555, lng:  -73.9739, altitude: 30000},
          ]}
          strokeColor="#500000" strokeWidth={10}
          geodesic
          drawsOccludedSegments
          ></Polyline3D>
          <Marker3D position={{lat: 32.7767, lng: -96}}></Marker3D>
      </Map3D>
    </div>
  );
}
