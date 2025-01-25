'use client'
import {
  Button,
  DatePicker,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Form,
  useDisclosure
} from '@heroui/react'
import { Map3D, Marker3D, Polyline3D } from "@/components/map-3d";
import { useEffect, useState } from 'react';
import FlightList from '@/components/FlightList';

export default function Home() {

  const [date, setDate] = useState<string>('');
  const [flights, setFlights] = useState([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    // Get form data as an object.
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setDate(data['leaveDate'] as string);
  };

  useEffect(() => {
    if (date !== '') {
      fetch(`https://flight-engine-rp1w.onrender.com/flights?date=${date}&origin=DFW`).then(async (res) => {
        const flightData = await res.json();
        setFlights(flightData)
        console.log(flightData.length)
      })
      console.log(date)
    }
  }, [date])

  return (
    <div className="relative w-screen h-screen dark overflow-hidden">
      <div className='dark absolute top-0 left-0 p-4 z-10'>
        <Button onPress={onOpen}>Input Info</Button>
        <Drawer backdrop='blur' isOpen={isOpen} onOpenChange={onOpenChange} placement="left">
          <DrawerContent className='bg-gray-400'>
            {(onClose) => (
              <>
                <DrawerHeader>Input what date you&apos;d like to leave.</DrawerHeader>
                <DrawerBody>
                  <Form onSubmit={onSubmit}>
                    <DatePicker name='leaveDate' className='text-black' />
                    <Button type='submit' onPress={onClose}>Submit</Button>
                  </Form>
                </DrawerBody>
              </>
            )}
          </DrawerContent>
        </Drawer>
        <FlightList flights={flights as []} />
      </div>
      <Map3D>
        <Polyline3D altitudeMode={'RELATIVE_TO_GROUND'} coordinates={[
          { lat: 32.7767, lng: -96.7970, altitude: 30000 },
          { lat: 40.7555, lng: -73.9739, altitude: 30000 },
        ]}
          strokeColor="#500000" strokeWidth={10}
          geodesic
          drawsOccludedSegments
        ></Polyline3D>
        <Marker3D position={{ lat: 32.7767, lng: -96 }}></Marker3D>
      </Map3D>
    </div>
  );
}
