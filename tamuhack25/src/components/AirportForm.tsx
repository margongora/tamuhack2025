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

const AirportForm = () => {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	return (
		<div className='dark'>
			<Button onPress={onOpen}>Input Info</Button>
			<Drawer backdrop='blur' isOpen={isOpen} onOpenChange={onOpenChange} placement="left">
				<DrawerContent className='bg-gray-400'>
					{(onClose) => (
						<>
							<DrawerHeader>Input what date you&apos;d like to leave.</DrawerHeader>
							<DrawerBody>
								<p>FUCK</p>
							</DrawerBody>
							<DrawerFooter>
								<Button color="success" onPress={onClose}>Submit</Button>
							</DrawerFooter>
						</>
					)}
				</DrawerContent>
			</Drawer>
		</div>
	)
}

export default AirportForm