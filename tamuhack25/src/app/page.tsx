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
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react'
import { parseDate } from '@internationalized/date';
import { Map3D, Map3DCameraProps, Marker3D, Polyline3D } from "@/components/map-3d";
import { useEffect, useRef, useState } from 'react';
import { getAllAirports, getAllFlights } from '@/lib/client/utils';
import { AllAirportsOutput } from './api/getAirports/_schema';
import { AllFlightsOutput } from './api/getFlights/_schema';
import Airplanes from '@/components/map-stuff/airplanes';
import FlightList from '@/components/FlightList';
import { Flight } from './api/getFlights/_schema';
import { useMap3D } from '@/context/map-context';

const airportCodes = [
  { key: 'atl', label: 'ATL' },
  { key: 'bos', label: 'BOS' },
  { key: 'bwi', label: 'BWI' },
  { key: 'clt', label: 'CLT' },
  { key: 'den', label: 'DEN' },
  { key: 'dfw', label: 'DFW' },
  { key: 'dtw', label: 'DTW' },
  { key: 'ewr', label: 'EWR' },
  { key: 'fll', label: 'FLL' },
  { key: 'gso', label: 'GSO' },
  { key: 'iah', label: 'IAH' },
  { key: 'jfk', label: 'JFK' },
  { key: 'las', label: 'LAS' },
  { key: 'lax', label: 'LAX' },
  { key: 'mco', label: 'MCO' },
  { key: 'mia', label: 'MIA' },
  { key: 'msp', label: 'MSP' },
  { key: 'ord', label: 'ORD' },
  { key: 'phl', label: 'PHL' },
  { key: 'phx', label: 'PHX' },
  { key: 'san', label: 'SAN' },
  { key: 'sea', label: 'SEA' },
  { key: 'sfo', label: 'SFO' },
  { key: 'slc', label: 'SLC' },
  { key: 'tpa', label: 'TPA' }
]

export default function Home() {

  const {
    map3DElement
  } = useMap3D();

  const [airport, setAirport] = useState<string>('dfw');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [flights, setFlights] = useState<Flight[] | undefined>(undefined);
  const [flightList, setFlightList] = useState<Flight[] | undefined>(undefined);
  const [airports, setAirports] = useState<AllAirportsOutput | undefined>(undefined);
  const [loaded, setLoaded] = useState<boolean>(false);

  const [timeOfDay, setTimeOfDay] = useState<number>(0);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [pause, setPause] = useState<boolean>(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    // Get form data as an object.
    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(data);
    setDate(data['leaveDate'] as string);
  };

  useEffect(() => {
    getAllAirports()
      .then((airports) => {
        if (!airports) return;
        console.log(airports);
        setAirports(airports);
      });
  }, [])

  useEffect(() => {
    if (date !== '') {
      setLoaded(false);
      fetch(`https://flight-engine-rp1w.onrender.com/flights?date=${date}&origin=${airport.toUpperCase()}`).then(async (res) => {
        const flightData = await res.json();
        setFlightList(flightData);
        console.log(flightData.length);
        setLoaded(true);
      })

      getAllFlights(date).then((flights) => {
        if (!flights) return;

        console.log(flights.length);
        // randomly get 500 flights from the list

        setFlights(flights);
      }).catch((err) => {
        console.error(err);
      });
    }
  }, [date, airport])

  const [manualChange, setManualChange] = useState<boolean>(false);

  useEffect(() => {

    if (manualChange) {
      return;
    }

    // interval to increment timeOfDay every second
    const interval = setInterval(() => {
      setTimeOfDay((timeOfDay) => {
        return (timeOfDay + 0.1) % 86400;
      });
    }, 100);

    return () => {
      clearInterval(interval);
    }

  }, [manualChange]);

  function manualChangeTimeOfDay(time: number) {
    setTimeOfDay(time);
    setManualChange(!manualChange);
  }

  function getLeadingZero(num: number) {
    if (num < 10) {
      return `0${num}`;
    }
    return num;
  }

  return (
    <div className="relative w-screen h-screen dark overflow-hidden">
      <div className='dark absolute top-0 left-0 p-4 z-10'>
        <Button onPress={onOpen}>Input Info</Button>
        <Drawer backdrop='blur' isOpen={isOpen} onOpenChange={onOpenChange} placement="left">
          <DrawerContent className='bg-gray-400'>
            {(onClose) => (
              <>
                <DrawerHeader>Input what date and airport from which you&apos;d like to leave.</DrawerHeader>
                <DrawerBody>
                  <Form onSubmit={onSubmit}>
                    <DatePicker name='leaveDate' defaultValue={null} className='text-black' />
                    <Select name='leaveAirport' items={airportCodes} defaultSelectedKeys={[airport]}>
                      {airportCodes.map((airport) => (
                        <SelectItem key={airport.key}>{airport.label}</SelectItem>
                      ))}
                    </Select>
                    <Button type='submit' onPress={onClose}>Submit</Button>
                    <Slider
                      name='timeOfDay'
                      minValue={0}
                      maxValue={86400}
                      step={1}
                      value={timeOfDay}
                      onChange={(e) => manualChangeTimeOfDay(e as number)}
                    />
                  </Form>
                </DrawerBody>
              </>
            )}
          </DrawerContent>
        </Drawer>
        <FlightList airport={airport} date={date} flights={flightList} loading={loaded} />
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
        {airports && airports.map((airport, i) =>
          <Marker3D key={i} position={{ lat: airport.location.latitude, lng: airport.location.longitude }} onClick={() => {
            console.log('clicked')
            map3DElement?.flyCameraTo({
              endCamera: {
                center: {
                  lat: airport.location.latitude,
                  lng: airport.location.longitude,
                  altitude: 1000
                },
                tilt: 45,
                heading: 0,
                range: 10000
              },
              durationMillis: 2000
            });
          }}></Marker3D>
        )}

        {flights && flights.slice(0,50).map((flight, i) =>
        // get date from "date" variable and timeOfDay from "timeOfDay" variable
          <Airplanes time={
            new Date(`${date}T${getLeadingZero(Math.floor(timeOfDay / 3600))}:${getLeadingZero(Math.floor((timeOfDay % 3600) / 60))}:${getLeadingZero(timeOfDay % 60)}`)
          } key={i} plane={flight}></Airplanes>
        )}
      </Map3D>
    </div>
  );
}
