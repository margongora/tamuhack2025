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

const airportCoords = [
  {
    latitude: 33.6404,
    longitude: -84.4198
  }, {
    latitude: 42.3656,
    longitude: -71.0096
  }, {
    latitude: 39.1774,
    longitude: -76.6684
  }, {
    latitude: 35.2138,
    longitude: -80.943
  }, {
    latitude: 39.8493,
    longitude: -104.6738
  }, {
    latitude: 32.8998,
    longitude: -97.0403
  }, {
    latitude: 36.1043,
    longitude: -79.935
  }, {
    latitude: 40.6895,
    longitude: -74.1745
  }, {
    latitude: 26.0742,
    longitude: -80.1506
  }, {
    latitude: 36.0726,
    longitude: -79.792
  }, {
    latitude: 29.9902,
    longitude: -95.3368
  }, {
    latitude: 40.6413,
    longitude: -73.7781
  }, {
    latitude: 36.08601,
    longitude: -115.1539
  }, {
    latitude: 33.9416,
    longitude: -118.4085
  }, {
    latitude: 28.4179,
    longitude: -81.3041
  }, {
    latitude: 25.7969,
    longitude: -80.2762
  }, {
    latitude: 44.8848,
    longitude: -93.2223
  }, {
    latitude: 41.9742,
    longitude: -87.9073
  }, {
    latitude: 39.8729,
    longitude: -75.2437
  }, {
    latitude: 36.1043,
    longitude: -79.935
  }, {
    latitude: 37.6213,
    longitude: -122.379
  }, {
    latitude: 47.4435,
    longitude: -122.3016
  }, {
    latitude: 37.6213,
    longitude: -122.379
  }, {
    latitude: 40.7899,
    longitude: -111.9791
  }, {
    latitude: 36.1043,
    longitude: -79.935
  }
]

interface Coords {
  longitude: number,
  latitude: number
}

const haversine = (givenLocation: Coords, currLocation: Coords) => {
  const R = 6371;

  const latDiff = (currLocation.latitude - givenLocation.latitude) * (Math.PI / 180);
  const longDiff = (currLocation.longitude - givenLocation.longitude) * (Math.PI / 180);

  return 2 * R * Math.asin(Math.sqrt((1 - Math.cos(latDiff) + Math.cos(currLocation.latitude * (Math.PI / 180)) * Math.cos(givenLocation.latitude * (Math.PI / 180)) * (1 - Math.cos(longDiff))) / 2))
}

export default function Home() {

  const {
    map3DElement
  } = useMap3D();

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [airport, setAirport] = useState<string>('');
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
    setAirport(data['leaveAirport'] as string);
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

    if (navigator.geolocation && airport == '') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          let closestIndex = 0;
          let distance = Infinity;
          airportCoords.forEach((coords, idx) => {
            const dist = haversine(coords, { latitude, longitude });
            console.log(`${idx}: ${dist}`)

            if (dist < distance) {
              distance = dist;
              closestIndex = idx;
            }
          });
          console.log(airportCodes[closestIndex].key)
          setAirport(airportCodes[closestIndex].key);
        }
      );
    }

    if (date !== '') {
      setLoaded(false);
      fetch(`https://flight-engine-rp1w.onrender.com/flights?date=${date}&origin=${airport.toUpperCase()}`).then(async (res) => {
        const flightData = await res.json();
        setFlightList(flightData);
        console.log(airport);
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


  useEffect(() => {

    // interval to increment timeOfDay ever 10 milliseconds
    const timeout = setTimeout(() => {
      setTimeOfDay((timeOfDay) => {
        return timeOfDay + 50;
      });
    }, 50);

    return () => {
      clearTimeout(timeout);
    }

  }, [timeOfDay]);


  function getLeadingZero(num: number) {
    if (num < 10) {
      return `0${num}`;
    }
    return num;
  }

  function getDatePlusMilliseconds(date: string, milliseconds: number) {
    const d = new Date(date);
    d.setMilliseconds(milliseconds);
    return d;
  }

  return (
    <div className="relative w-screen h-screen dark overflow-hidden">
      <div className='dark absolute top-0 left-0 p-4 z-10'>
        <Button onPress={onOpen}>Input Info</Button>
        <Drawer classNames={{
          backdrop: 'backdrop-blur-md',
        }} isOpen={isOpen} onOpenChange={onOpenChange} placement="left">
          <DrawerContent className='bg-gray-400/90'>
            {(onClose) => (
              <>
                <DrawerHeader>Input what date and airport from which you&apos;d like to leave.</DrawerHeader>
                <DrawerBody>
                  <Form onSubmit={onSubmit}>
                    <DatePicker name='leaveDate' defaultValue={parseDate(date)} className='text-black' />
                    <Select name='leaveAirport' items={airportCodes} defaultSelectedKeys={[airport]}>
                      {airportCodes.map((airport) => (
                        <SelectItem key={airport.key}>{airport.label}</SelectItem>
                      ))}
                    </Select>
                    <Button type='submit' onPress={onClose}>Submit</Button>
                    <Slider
                      name='timeOfDay'
                      minValue={0} // milliseconds since midnight
                      maxValue={86400000}
                      step={1000}
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e as number)}
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

        {flightList && flightList.map((flight, i) =>
          // get date from "date" variable and timeOfDay from "timeOfDay" variable
          <Airplanes time={
            // get the date from the date variable and add the timeOfDay variable of milliseconds to it
            getDatePlusMilliseconds(date, timeOfDay)
          } key={i} plane={flight}></Airplanes>
        )}
      </Map3D>
    </div>
  );
}
