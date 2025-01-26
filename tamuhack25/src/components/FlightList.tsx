'use client'
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
  useDisclosure
} from '@heroui/react'

const FlightList = ({ flights }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(flights.filter((flight) => flight['flightNumber'] == data['chosenFlight']))
  }

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
                  <Form onSubmit={handleSubmit} id='selectFlight'>
                    <RadioGroup label='Please select a flight.' name='chosenFlight'>
                      {flights.map((flight, idx: number) => {
                        const flightNumber = flight["flightNumber"] as string;
                        return (<Radio key={idx} value={flightNumber}>Flight {flightNumber} to {flight["destination"]["city"]}</Radio>)
                      })}
                    </RadioGroup>

                  </Form>
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