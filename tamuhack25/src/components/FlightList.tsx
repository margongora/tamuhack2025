'use client'
import {
    Button,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    useDisclosure
} from '@heroui/react'
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react';

const FlightList = ({ flights }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <div>
            <Button onPress={onOpen}>See Flights</Button>
            <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
                <DrawerContent className='bg-gray-400'>
                    {(onClose) => (
                        <>
                            <DrawerHeader>List of flights outgoing from your closest airport.</DrawerHeader>
                            <DrawerBody>
                                {flights.length === 0 ? (<p>Please select a date to leave first.</p>) : flights.map((flight: { [x: string]: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, idx: Key | null | undefined) => {
                                    console.log(flight);
                                    return (
                                        <p key={idx}>Flight {flight["flightNumber"]} to {flight["destination"]['city']}</p>
                                    )
                                })}
                            </DrawerBody>
                            <DrawerFooter>
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