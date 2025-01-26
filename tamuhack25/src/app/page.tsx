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
  Radio,
  DrawerFooter,
  RadioGroup,
  Skeleton,
} from '@heroui/react'
import { parseDate } from '@internationalized/date';
import { Map3D, Marker3D } from "@/components/map-3d";
import { useEffect, useState } from 'react';
import { getAllAirports, getAllFlights } from '@/lib/client/utils';
import { AllAirportsOutput } from './api/getAirports/_schema';
import Airplanes from '@/components/map-stuff/airplanes';
import { Flight } from './api/getFlights/_schema';
import { useMap3D } from '@/context/map-context';
import { DateTimeFormatOptions, DateTime } from 'luxon';
import ChosenFlight from '@/components/ChosenFlight';

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

const Destination = ({ destination, flights }: { destination: string, flights: Flight[] }) => {
  const cityName = flights[0]["destination"]["city"];
  const numFlights = flights.length;

  return <div className="flex w-full flex-col rounded-md border-1 border-solid border-gray-500 bg-gray-300 p-2 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-100">
    <span><strong>{cityName}</strong> ({destination})</span>
    <details>
      <summary>{numFlights} flights available</summary>

      {flights.map((flight) => {
        const flightNumber = flight.flightNumber;

        const timeFormat: DateTimeFormatOptions = {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'shortGeneric'
        }

        const departureTime = DateTime.fromISO(flight.departureTime).toLocaleString({ timeZone: flight.origin.timezone, ...timeFormat });
        const arrivalTime = DateTime.fromISO(flight.arrivalTime).toLocaleString({ timeZone: flight.destination.timezone, ...timeFormat });

        return (
          <Radio key={flightNumber} value={flightNumber}
            description={`Flight no. ${flightNumber} - ${flight.duration.locale}`}>
            <strong>{departureTime}</strong> to <strong>{arrivalTime}</strong>
          </Radio>);
      })}
    </details>
  </div >
}

export default function Home() {

  const {
    map3DElement,
    map3dRef
  } = useMap3D();

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [airport, setAirport] = useState<string>('');
  const [chosenFlight, setChosenFlight] = useState<Flight | undefined>(undefined);
  const [flights, setFlights] = useState<Flight[] | undefined>(undefined);
  const [flightList, setFlightList] = useState<Flight[] | undefined>(undefined);
  const [airports, setAirports] = useState<AllAirportsOutput | undefined>(undefined);
  const [loaded, setLoaded] = useState<boolean>(false);

  const [timeOfDay, setTimeOfDay] = useState<number>(0);

  const { isOpen: isOpen1, onOpen: onOpen1, onOpenChange: onOpenChange1 } = useDisclosure();
  const { isOpen: isOpen2, onOpen: onOpen2, onOpenChange: onOpenChange2 } = useDisclosure();

  // const [pause, setPause] = useState<boolean>(false);

  const onInSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    // Get form data as an object.
    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(data);
    const newDate = data['leaveDate'] as string;
    const leaveAirport = data['leaveAirport'] as string;
    setDate(newDate);
    setAirport(data['leaveAirport'] as string);

    fetch(`https://flight-engine-rp1w.onrender.com/flights?date=${newDate}&origin=${leaveAirport.toUpperCase()}`).then(async (res) => {
      const flightData = await res.json();
      setFlightList(flightData);
      console.log(airport);
    })
  };

  const onFlightSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));
    setChosenFlight(flightList?.filter((flight) => flight['flightNumber'] == data['chosenFlight'])[0])
  }

  const handleChosenReset = () => {
    setChosenFlight(undefined);
  }

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

      }).catch((err) => {
        console.error(err);
      });
    }
  }, [date, airport])

  useEffect(() => {

    // interval to increment timeOfDay ever 10 milliseconds
    const timeout = setTimeout(() => {
      setTimeOfDay((timeOfDay) => {
        return timeOfDay + 100;
      });
    }, 100);

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

  const destinations = Object.groupBy(flightList ? flightList : [], (item) => item["destination"]["code"]);

  return (
    <div className="relative w-screen h-screen dark overflow-hidden">
      <div className='dark absolute top-0 left-0 p-4 z-10'>
        <Button onPress={onOpen1}>Input Info</Button>
        <Drawer classNames={{
          backdrop: 'backdrop-blur-md',
        }} isOpen={isOpen1} onOpenChange={onOpenChange1} placement="left">
          <DrawerContent className='bg-gray-400/90'>
            {(onClose) => (
              <>
                <DrawerHeader>Input what date and airport from which you&apos;d like to leave.</DrawerHeader>
                <DrawerBody>
                  <Form onSubmit={onInSubmit}>
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
        <Button onPress={onOpen2}>See Flights</Button>
        <Drawer isOpen={isOpen2} classNames={{
          backdrop: 'backdrop-blur-md',
        }} onOpenChange={onOpenChange2}>
          <DrawerContent className='bg-gray-400/90'>
            {(onClose) => (
              <>
                <DrawerHeader>List of flights outgoing from your closest airport.</DrawerHeader>
                <DrawerBody>
                  {flightList ? (
                    <Skeleton isLoaded={loaded}>
                      <Form onSubmit={onFlightSubmit} id='selectFlight'>
                        <span>Leaving from {airport.toUpperCase()} on {date}</span>
                        <RadioGroup label='Please select a flight.' className='w-full' name='chosenFlight'>
                          {
                            Object.entries(destinations).map((entry, idx) => {
                              return entry[1] ? <Destination destination={entry[0]} flights={entry[1]} key={idx} /> : null;
                            })
                          }
                        </RadioGroup>
                      </Form>
                    </Skeleton>
                  ) : (<p>Please select a date to leave first.</p>)}
                </DrawerBody>
                <DrawerFooter>
                  {flightList && <Button color='success' type='submit' onPress={onClose} form='selectFlight'>Select flight</Button>}
                  <Button onPress={onClose}>Close list</Button>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </Drawer>
        <ChosenFlight flight={chosenFlight} />
        {chosenFlight && (
          <Button onPress={handleChosenReset}>Reset Chosen Flight</Button>
        )}
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

        {(chosenFlight) ? (
          // get date from "date" variable and timeOfDay from "timeOfDay" variable
          <Airplanes time={
            // get the date from the date variable and add the timeOfDay variable of milliseconds to it
            getDatePlusMilliseconds(date, timeOfDay)
          } plane={chosenFlight}></Airplanes>
        ) : (flightList) ? flightList.map((flight, i) => {

          const parsedDate = getDatePlusMilliseconds(date, timeOfDay);

          // if the flight is not in the air, don't show it
          if (parsedDate < new Date(flight.departureTime) || parsedDate > new Date(flight.arrivalTime)) {
            return null;
          }

          // get date from "date" variable and timeOfDay from "timeOfDay" variable
          return <Airplanes time={
            // get the date from the date variable and add the timeOfDay variable of milliseconds to it
            getDatePlusMilliseconds(date, timeOfDay)
          } key={i} plane={flight}></Airplanes>
        }) : null}
      </Map3D>
    </div>
  );
}
