'use client'
import {
  Button,
  DatePicker,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Form,
  Slider,
  useDisclosure
} from '@heroui/react'
import { Map3D, Marker3D, Polyline3D } from "@/components/map-3d";
import { useEffect, useRef, useState } from 'react';
import { getAllAirports, getAllFlights } from '@/lib/client/utils';
import { AllAirportsOutput } from './api/getAirports/_schema';
import { AllFlightsOutput } from './api/getFlights/_schema';
import Airplanes from '@/components/map-stuff/airplanes';
import FlightList from '@/components/FlightList';

export default function Home() {

  // get current date in YYYY-MM-DD format
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);  

  // get current hour
  const [timeOfDay, setTimeOfDay] = useState<number>(new Date().getMinutes() + new Date().getHours() * 60);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    // Get form data as an object.
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setDate(data['leaveDate'] as string);
  };



  

  const [airports, setAirports] = useState<AllAirportsOutput>([]);
  useEffect(() => {
    getAllAirports()
      .then((airports) => {
        if (!airports) return;
        setAirports(airports);
      });
  }, [])

  const [flights, setFlights] = useState<AllFlightsOutput>([]);

  useEffect(() => {
    if (date !== '') {
      console.log(date)
      // fetch(`https://flight-engine-rp1w.onrender.com/flights?date=${date}&origin=DFW`).then(async (res) => {
      //   const flightData = await res.json();
      //   setFlights(flightData)
      //   console.log(flightData.length)
      // })
      // console.log(date)

      getAllFlights(date).then((flights) => {
        if (!flights) return;

        // randomly get 500 flights from the list

        setFlights(flights.slice(0, 500));
      }).catch((err) => {
        console.error(err);
      });
    }
  }, [date])

  useEffect(() => {
    // interval to increment timeOfDay every second
    const interval = setInterval(() => {
      setTimeOfDay((timeOfDay) => {
        return (timeOfDay + 1) % 1440;
      });
    }, 100);
  }, []);

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
                    <Slider
                      name='timeOfDay'
                      minValue={0}
                      maxValue={1440} // in minutes
                      step={1}
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e as number)}
                    />
                  </Form>
                </DrawerBody>
              </>
            )}
          </DrawerContent>
        </Drawer>
        <FlightList flights={flights as []} />
      </div>
      <Map3D>
        {/* <Polyline3D altitudeMode={'RELATIVE_TO_GROUND'} coordinates={[
          { lat: 32.7767, lng: -96.7970, altitude: 30000 },
          { lat: 40.7555, lng: -73.9739, altitude: 30000 },
        ]}
          strokeColor="#500000" strokeWidth={10}
          geodesic
          drawsOccludedSegments
        ></Polyline3D> */}
        {airports.map((airport, i) =>
          <Marker3D key={i} position={{ lat: airport.location.latitude, lng: airport.location.longitude }} onClick={() => {
            console.log('clicked')
          }}></Marker3D>
        )}

        {flights.map((flight, i) =>
        // get date from "date" variable and timeOfDay from "timeOfDay" variable
          <Airplanes time={
            new Date(`${date}T${Math.floor(timeOfDay / 60)}:${timeOfDay % 60}:00`)  
          } key={i} plane={flight}></Airplanes>
        )}
      </Map3D>
    </div>
  );
}
