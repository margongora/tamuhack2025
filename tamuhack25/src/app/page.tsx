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

export default function Home() {

  const [airport, setAirport] = useState<string>('dfw');
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
