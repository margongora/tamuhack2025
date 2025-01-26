import { Flight } from "@/app/api/getFlights/_schema";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";

const ChosenFlight = ({ flight }: { flight: Flight | undefined }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      {flight && (
        <>
          <Button onPress={onOpen}>Show Chosen Flight</Button>
          <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader>Your chosen flight</ModalHeader>
                  <ModalBody>
                    <span>Flight {flight.flightNumber} from {flight.origin.city} to {flight.destination.city}</span>
                  </ModalBody>
                  <ModalFooter>
                    <Button onPress={onClose}>Close</Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  )
}

export default ChosenFlight