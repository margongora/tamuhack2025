'use client'
import {
  Button,
  DatePicker,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Form,
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react'
import { parseDate } from '@internationalized/date';
import { Map3D, Marker3D, Polyline3D } from "@/components/map-3d";
import { useEffect, useState } from 'react';
import FlightList from '@/components/FlightList';
import { Flight } from './api/getFlights/_schema';

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

  const [airport, setAirport] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [flights, setFlights] = useState<Flight[] | undefined>(undefined);
  const [loaded, setLoaded] = useState<boolean>(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    // Get form data as an object.
    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(data);
    setDate(data['leaveDate'] as string);
    setAirport(data['leaveAirport'] as string)
  };

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
        },
        () => {
          setLocation({ latitude: 37.7749, longitude: -122.4194 });
        }
      );
    }

    if (date !== '') {
      fetch(`https://flight-engine-rp1w.onrender.com/flights?date=${date}&origin=${airport.toUpperCase()}`).then(async (res) => {
        setLoaded(false);
        const flightData = await res.json();
        setFlights(flightData);
        console.log(flightData.length);
        setLoaded(true);
      })
      console.log(date)
    }
  }, [date, airport])

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
                    <DatePicker name='leaveDate' defaultValue={date ? parseDate(date) : null} className='text-black' />
                    <Select name='leaveAirport' items={airportCodes} defaultSelectedKeys={[airport]}>
                      {airportCodes.map((airport) => (
                        <SelectItem key={airport.key}>{airport.label}</SelectItem>
                      ))}
                    </Select>
                    <Button type='submit' onPress={onClose}>Submit</Button>
                  </Form>
                </DrawerBody>
              </>
            )}
          </DrawerContent>
        </Drawer>
        <FlightList airport={airport} date={date} flights={flights} loading={loaded} />
      </div>
      <Map3D />
    </div>
  );
}
