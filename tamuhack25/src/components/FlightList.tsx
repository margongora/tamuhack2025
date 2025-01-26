'use client'
import { Airport } from '@/app/api/getAirports/_schema';
import { Flight } from '@/app/api/getFlights/_schema';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Form,
  Radio,
  RadioGroup,
  Skeleton,
  useDisclosure
} from '@heroui/react'

import { DateTime, DateTimeFormatOptions } from "luxon";

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
          <Radio key={flightNumber} value={flightNumber}
            description={`Flight no. ${flightNumber} - ${flight.duration.locale}`}>
            <strong>{departureTime}</strong> to <strong>{arrivalTime}</strong>
          </Radio>);
      })}
    </details>
  </div >
}

const FlightList = ({ airport, date, flights, loading }: { airport: string, date: string, flights?: Flight[], loading: boolean }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(flights?.filter((flight) => flight['flightNumber'] == data['chosenFlight']))
  }

  const destinations = Object.groupBy(flights ? flights : [], (item) => item["destination"]["code"]);

  return (
    <div>
      <Button onPress={onOpen}>See Flights</Button>
      <Drawer isOpen={isOpen} classNames={{
          backdrop: 'backdrop-blur-md',
        }} onOpenChange={onOpenChange}>
        <DrawerContent className='bg-gray-400/90'>
          {(onClose) => (
            <>
              <DrawerHeader>List of flights outgoing from your closest airport.</DrawerHeader>
              <DrawerBody>
                {flights ? (
                  <Skeleton isLoaded={loading}>
                    <Form onSubmit={handleSubmit} id='selectFlight'>
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
                {flights && <Button color='success' type='submit' onPress={onClose} form='selectFlight'>Select flight</Button>}
                <Button onPress={onClose}>Close list</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default FlightList