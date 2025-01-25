// 'use client'
// import {
// 	Button,
// 	DatePicker,
// 	Drawer,
// 	DrawerBody,
// 	DrawerContent,
// 	DrawerHeader,
// 	Form,
// 	useDisclosure
// } from '@heroui/react'

// const AirportForm = () => {
// 	const { isOpen, onOpen, onOpenChange } = useDisclosure();
// 	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
// 		// Prevent default browser page refresh.
// 		e.preventDefault();

// 		// Get form data as an object.
// 		const data = Object.fromEntries(new FormData(e.currentTarget));
// 		console.log(data);
// 	};

// 	return (
// 		<div className='dark'>
// 			<Button onPress={onOpen}>Input Info</Button>
// 			<Drawer backdrop='blur' isOpen={isOpen} onOpenChange={onOpenChange} placement="left">
// 				<DrawerContent className='bg-gray-400'>
// 					{(onClose) => (
// 						<>
// 							<DrawerHeader>Input what date you&apos;d like to leave.</DrawerHeader>
// 							<DrawerBody>
// 								<Form onSubmit={onSubmit}>
// 									<DatePicker name='leaveDate' className='text-black' />
// 									<Button type='submit' onPress={onClose}>Submit</Button>
// 								</Form>
// 							</DrawerBody>
// 						</>
// 					)}
// 				</DrawerContent>
// 			</Drawer>
// 		</div>
// 	)
// }

// export default AirportForm