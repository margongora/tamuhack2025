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

      {flights.map((flight, i) => {
        const flightNumber = flight.flightNumber;

        const timeFormat: DateTimeFormatOptions = {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'shortGeneric'
        }

        const departureTime = DateTime.fromISO(flight.departureTime).toLocaleString({ timeZone: flight.origin.timezone, ...timeFormat });
        const arrivalTime = DateTime.fromISO(flight.arrivalTime).toLocaleString({ timeZone: flight.destination.timezone, ...timeFormat });

        return (
          <Radio key={flightNumber + i} value={flightNumber}
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
  const [flightList, setFlightList] = useState<Flight[] | undefined>(undefined);
  const [airports, setAirports] = useState<AllAirportsOutput | undefined>(undefined);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [airportCodes, setAirportCodes] = useState<{ key: string, label: string }[]>([]);
  const [airportCoords, setAirportCoords] = useState<Coords[]>([]);
  const [currLocation, setCurrLocation] = useState<Coords | undefined>(undefined);

  const [timeOfDay, setTimeOfDay] = useState<number>(new Date().getTime() - new Date().setHours(0, 0, 0, 0));

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
    const newFlight = flightList?.filter((flight) => flight['flightNumber'] == data['chosenFlight'])[0];
    setChosenFlight(newFlight);

    // set the timeOfDay to the milliseconds since midnight of the departure time
    setTimeOfDay(new Date(newFlight!.departureTime).getTime() - new Date(newFlight!.departureTime).setHours(0, 0, 0, 0));

    map3DElement?.flyCameraTo({
      endCamera: {
        center: {
          lat: newFlight!.destination.location.latitude,
          lng: newFlight!.destination.location.longitude,
          altitude: 1000
        },
        tilt: 45,
        heading: 0,
        range: 10000
      },
      durationMillis: 2000
    });

  }

  const handleChosenReset = () => {
    setChosenFlight(undefined);
    map3DElement?.flyCameraTo({
      endCamera: {
        center: {
          lat: currLocation!.latitude,
          lng: currLocation!.longitude,
          altitude: 1000
        },
        tilt: 45,
        heading: 0,
        range: 10000
      },
      durationMillis: 2000
    });
  }

  useEffect(() => {
    getAllAirports()
      .then((airports) => {
        if (!airports) return;
        console.log(airports);
        setAirports(airports);
        const updatedCodes = airports.map((airport) => ({
          key: airport.code.toLowerCase(),
          label: airport.code,
        }));
        const updatedCoords = airports.map((airport) => ({
          latitude: airport.location.latitude,
          longitude: airport.location.longitude
        }));
        setAirportCodes(updatedCodes);
        setAirportCoords(updatedCoords);
        //console.log("Airport Codes:", updatedCodes);
        //console.log("Airport Coords:", updatedCoords);
      })
      .catch((err) => console.error(err));
  }, []);


  useEffect(() => {

    if (navigator.geolocation && airport == '') {
      if (airportCoords.length > 0 && airportCodes.length > 0) {
        console.log(airportCoords);
        console.log(airportCodes);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrLocation({ latitude, longitude });
            let closestIndex = 0;
            let distance = Infinity;
            airportCoords.forEach((coords, idx) => {
              const dist = haversine(coords, { latitude, longitude });
              if (dist < distance) {
                distance = dist;
                closestIndex = idx;
              }
            });
            setAirport(airportCodes[closestIndex]?.key || '');
          },
          () => {
            setAirport(airportCodes[0]?.key || '');
          }
        );
      } else {
        const interval = setInterval(() => {
          if (airportCoords.length > 0 && airportCodes.length > 0) {
            clearInterval(interval);
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setCurrLocation({ latitude, longitude });
                let closestIndex = 0;
                let distance = Infinity;

                airportCoords.forEach((coords, idx) => {
                  const dist = haversine(coords, { latitude, longitude });

                  if (dist < distance) {
                    distance = dist;
                    closestIndex = idx;
                  }
                });

                setAirport(airportCodes[closestIndex]?.key || '');
              },
              () => {
                setAirport(airportCodes[0]?.key || '');
              }
            );
          }
        }, 100);
      }
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
  }, [date, airport, airportCodes, airportCoords]);

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


  // function getLeadingZero(num: number) {
  //   if (num < 10) {
  //     return `0${num}`;
  //   }
  //   return num;
  // }

  function getDatePlusMilliseconds(date: string, milliseconds: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    d.setMilliseconds(milliseconds);
    return d;
  }

  // const destinations = Object.groupBy(flightList ? flightList : [], (item) => item["destination"]["code"]);
  const destinations: { [key: string]: Flight[] } = {};
  if (flightList) {
    flightList.forEach((flight) => {
      if (!destinations[flight.destination.code]) {
        destinations[flight.destination.code] = [];
      }
      destinations[flight.destination.code].push(flight);
    });
  }

  return (
    <div className="relative w-screen h-screen flex justify-center items-center dark overflow-hidden">

      {/* {chosenFlight && <div className='absolute top-0 right-0 text-center p-4 z-20 bg-white'>
        {chosenFlight.flightNumber} - {chosenFlight.origin.code} to {chosenFlight.destination.code} <br/>
        {chosenFlight.departureTime} to {chosenFlight.arrivalTime} <br/>
        {new Date(chosenFlight.departureTime).toLocaleTimeString()} to {new Date(chosenFlight.arrivalTime).toLocaleTimeString()} <br />
        {chosenFlight.duration.locale} <br />
        {getDatePlusMilliseconds(date, timeOfDay).toLocaleTimeString()} <br />
        {getDatePlusMilliseconds(date, timeOfDay) < new Date(chosenFlight.departureTime) ? 'Plane has not taken off yet.' : getDatePlusMilliseconds(date, timeOfDay) > new Date(chosenFlight.arrivalTime) ? 'Plane has landed.' : 'Plane is in the air.'}
        {new Date(chosenFlight.departureTime).getTime() - getDatePlusMilliseconds(date, timeOfDay).getTime()} <br />
      </div>} */}

      {/* <div className='absolute bottom-0 bg-white align-middle z-20'>
        Test
      </div> */}

      <div className='dark absolute top-0 left-0 p-4 z-10 flex gap-2'>
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
      <div className='scale-[100.75%] w-full h-full'>
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
                    altitude: 200
                  },
                  tilt: 70,
                  heading: 0,
                  range: 800
                },
                durationMillis: 4000
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
    </div>
  );
}
