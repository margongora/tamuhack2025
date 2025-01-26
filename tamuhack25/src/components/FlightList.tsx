'use client'
import {
  Accordion,
  AccordionItem,
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

const Destination = ({ destination, flights }) => {
  const cityName = flights[0]["destination"]["city"];
  const numFlights = flights.length;

  return <div className="p-2 bg-gray-300 rounded-md w-full flex flex-col">
    <span><strong>{cityName}</strong> ({destination})</span>
    <details>
      <summary>{numFlights} flights available</summary>
      <RadioGroup label='Please select a flight.' name='chosenFlight'>
        {flights.map((flight, idx: number) => {
          const flightNumber = flight["flightNumber"] as string;

          const timeFormat: DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'shortGeneric'
          }

          const departureTime = DateTime.fromISO(flight["departureTime"]);
          const arrivalTime = DateTime.fromISO(flight["arrivalTime"]);


          return (
            <Radio key={idx} value={flightNumber}>
              <strong>{departureTime.toLocaleString({ timeZone: flight["origin"]["timezone"], ...timeFormat })}</strong> to <strong>{arrivalTime.toLocaleString({ timeZone: flight["destination"]["timezone"], ...timeFormat })}</strong>
            </Radio>);
        })}
      </RadioGroup>
    </details>
  </div>
}

const FlightList = ({ airport, date, flights, loading }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(flights.filter((flight) => flight['flightNumber'] == data['chosenFlight']))
  }

  const destinations: Record<any, any> = Object.groupBy(flights, (item: any) => item["destination"]["code"]);

  return (
    <div>
      <Button onPress={onOpen}>See Flights</Button>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className='bg-gray-400'>
          {(onClose) => (
            <>
              <DrawerHeader>List of flights outgoing from your closest airport.</DrawerHeader>
              <DrawerBody>
                {flights.length === 0 ? (<p>Please select a date to leave first.</p>) : (
                  <Skeleton isLoaded={loading}>
                    <Form onSubmit={handleSubmit} id='selectFlight'>
                      <span>Leaving from {airport.toUpperCase()} on {date}</span>
                      {/*<RadioGroup label='Please select a flight.' name='chosenFlight'>
                        {flights.map((flight, idx: number) => {
                          const flightNumber = flight["flightNumber"] as string;
                          return (<Radio key={idx} value={flightNumber}>Flight {flightNumber} to {flight["destination"]["city"]}</Radio>)
                        })}
                      </RadioGroup>*/}
                      {

                        Object.entries(destinations).map((entry, idx) => {
                          return <Destination destination={entry[0]} flights={entry[1]} key={idx} />;
                        })
                      }
                    </Form>
                  </Skeleton>
                )}
              </DrawerBody>
              <DrawerFooter>
                {flights.length !== 0 && <Button color='success' type='submit' onPress={onClose} form='selectFlight'>Select flight</Button>}
                <Button onPress={onClose}>Close list</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* {flights.map((flight, idx) => {
                console.log(flight);
                return (
                    <p key={idx}>{flight["distance"]}</p>
                )
            })} */}
    </div>
  )
}

export default FlightList