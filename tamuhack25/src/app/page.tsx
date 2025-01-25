import AirportForm from "@/components/AirportForm";
import { Map3D } from "@/components/map-3d";

export default function Home() {



  return (
    <div className="w-screen h-screen dark">
      <AirportForm />
      <Map3D center={{ lat: 30.267, lng: -97.7431, altitude: 5000 }} />
    </div>
  );
}
