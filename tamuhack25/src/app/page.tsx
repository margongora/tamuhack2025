'use client'
import {
  Button,
  DatePicker,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Form,
  useDisclosure
} from '@heroui/react'
import { Map3D } from "@/components/map-3d";
import { useEffect, useState } from 'react';

export default function Home() {

  const [date, setDate] = useState<string>('');

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page refresh.
    e.preventDefault();

    // Get form data as an object.
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setDate(data['leaveDate'] as string);
  };

  useEffect(() => {
    if (date !== '') {
      console.log('date changed')
    }
  }, [date])

  return (
    <div className="w-screen h-screen dark">
      <div className='dark'>
        <p className='text-white'>{date}</p>
        <Button onPress={onOpen}>Input Info</Button>
        <Drawer backdrop='blur' isOpen={isOpen} onOpenChange={onOpenChange} placement="left">
          <DrawerContent className='bg-gray-400'>
            {(onClose) => (
              <>
                <DrawerHeader>Input what date you&apos;d like to leave.</DrawerHeader>
                <DrawerBody>
                  <Form onSubmit={onSubmit}>
                    <DatePicker name='leaveDate' className='text-black' />
                    <Button type='submit' onPress={onClose}>Submit</Button>
                  </Form>
                </DrawerBody>
              </>
            )}
          </DrawerContent>
        </Drawer>
      </div>
      <Map3D center={{ lat: 30.267, lng: -97.7431, altitude: 5000 }} />
    </div>
  );
}
