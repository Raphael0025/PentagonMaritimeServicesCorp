'use client'

import { useEffect, useState } from 'react';
import { Box, Input, FormControl, FormLabel, Link, Button, Select, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Alert, AlertIcon, AlertTitle, AlertDescription, Text, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, } from '@chakra-ui/react'
import { CloseIcon, ViewIcon, PlusIcon, EditIcon, TrashIcon } from '@/Components/Icons'
//types
import { ToastStatus } from '@/types/handling'
import { ClientCompany, initClientCompany, ClientCompanyByID, ClientLinksByID, ClientContactsByID, initClientCompanyByID } from '@/types/client_company';
import { addClient, addContact, updateClient, addClientLink, DeleteCompanyCharge, DeleteCourseCodes, deleteClient, deleteContacts, deleteLinks } from '@/lib/client-controller'

import { useClients } from '@/context/ClientCompanyContext'
import {useCategory} from '@/context/CategoryContext'
import { useTypes } from '@/context/TypeContext'

import CompanyChargesModal from '@/Components/Modal/CompanyChargesModal'

export default function Page(){
    const toast = useToast()
    const {data: allClients, links: allLinks, contacts: allContacts, companyCharge: companyCharges, courseCodes: companyCourseCodes} = useClients()
    const { data: allCategories } = useCategory()
    const { area: allAreas, subArea: allSubArea } = useTypes()

    const { isOpen: openModal, onOpen: modalOpen, onClose: closeModal } = useDisclosure()
    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
    const { isOpen: isOpenCC, onOpen: onOpenCC, onClose: onCloseCC } = useDisclosure()
    
    const [loading, setLoading] = useState<boolean>(false)
    const [clientInfo, setClientInfo] = useState<ClientCompany>(initClientCompany)

    const [clientUpdate, setClientUpdate] = useState<ClientCompanyByID>(initClientCompanyByID)
    const [linkUpdate, setLinkUpdate] = useState<ClientLinksByID[]>([])
    const [contactUpdate, setContactUpdate] = useState<ClientContactsByID[]>([])
    
    const [deleteLinksID, setLinksDelete] = useState<string[]>([])
    const [deleteContactID, setDeleteContacts] = useState<string[]>([])

    const [idRef, setRef] = useState<string>('')

    const [links, setLinks] = useState<string[]>([])
    const [link, setLink] = useState<string>('')

    const [city, setCity] = useState<string>('')

    const [contacts, setContacts] = useState<{contact_person: string; contact_number: string;}[]>([])
    const [contact_person, setContact] = useState<string>('')
    const [contact_number, setContactNum] = useState<string>('')

    const [showAlert, setShow] = useState<boolean>(false)

    const handleToast = (title: string = '', desc: string = '', timer: number, status: ToastStatus) => {
        toast({
            title: title,
            description: desc,
            position: 'top-right',
            variant: 'left-accent',
            status: status,
            duration: timer,
            isClosable: true,
        })
    }

    const handleCloseModal = () => {
        setClientInfo(initClientCompany)
        closeModal()
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, name } = e.target
        if(name === 'edit'){
            setClientUpdate(prev => ({
                ...prev,
                [id]: value
            }))
        }else{
            setClientInfo(prev => ({
                ...prev,
                [id]: value
            }))
        }
    }
    
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value, name } = e.target
        if(name === 'edit'){
            setClientUpdate(prev => ({
                ...prev,
                [id]: value
            }))
        }else if(name === 'city'){
            setCity(value)
            setClientInfo(prev => ({
                ...prev,
                [id]: value
            }))
        }else{
            setClientInfo(prev => ({
                ...prev,
                [id]: value
            }))
        }
    }

    const handleDelete = async (id: string) => {
        setLoading(true);
    
        const getActor: string | null = localStorage.getItem('customToken');
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try {
                    // Delete all contacts associated with this client
                    const clientContacts = allContacts ? allContacts.filter((contact) => contact.id_ref === id) : []
                    if (clientContacts.length > 0) {
                        for (const contact of clientContacts) {
                            await deleteContacts(contact.id, getActor);
                        }
                    }
                    
                    const companyChargeArr = companyCharges ? companyCharges.filter((charge) => charge.company_ref === id) : []
                    if (companyChargeArr.length > 0) {
                        for (const charge of companyChargeArr) {
                            await DeleteCompanyCharge(charge.id);
                        }
                    }
                    
                    const companyCourseCodeArr = companyCourseCodes ? companyCourseCodes.filter((course) => course.id_company_ref === id) : []
                    if (companyCourseCodeArr.length > 0) {
                        for (const course of companyCourseCodeArr) {
                            await DeleteCourseCodes(course.id);
                        }
                    }
                    // Delete all links associated with this client
                    const clientLinks = allLinks?.filter((link) => link.id_ref === id) || []
                    if (clientLinks.length > 0) {
                        for (const link of clientLinks) {
                            await deleteLinks(link.id, getActor);
                        }
                    }
                    await deleteClient(id, getActor);
                    res(); // Resolve the promise if all deletions were successful
                } catch (error) {
                    rej(error); // Reject the promise if there was an error
                }
            }, 2000);
        })
        .then(() => {
            handleToast('Client Deleted Successfully!', `The client has been successfully removed from the database.`, 5000, 'success')
        })
        .catch((error) => {

            console.log('Error deleting client:', error);
            handleToast('Error', 'Failed to delete client. Please try again.', 4000, 'error');
        })
        .finally(() => {
            setLoading(false)
            onCloseDelete()
            setRef('')
        });
    }

    const handleSaveData = async () => {
        if( clientInfo.company === '' || clientInfo.address === '' || clientInfo.street === '' || clientInfo.brgy === '' || clientInfo.zipCode === '' || clientInfo.city === ''){
            handleToast('Warning', 'Missing fields required...', 4000, 'warning')
            setShow(true)
            return
        }
        setShow(false)
        setLoading(true)

        const getActor: string | null = localStorage.getItem('customToken')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const clientID = await addClient(clientInfo, getActor)
                    if(contacts.length > 0){
                        for (const contact of contacts) {
                            const newContact = {
                                ...contact,
                                id_ref: clientID
                            };
                            await addContact(newContact, getActor);  // Add each contact individually
                        }
                    }

                    if(links.length > 0){
                        for (const link of links) {
                            const newLink = {
                                link,         // Store the link string itself
                                id_ref: clientID
                            };
                            await addClientLink(newLink, getActor);  // Add each link individually
                        }
                    }
                    res()
                }catch(error){
                    rej(error)
                }
            }, 2000)
        }).then(() => {
            handleToast('Client Added Successfully!', `${clientInfo.company} has been successfully added to the database.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
            handleCloseModal()
            setLinks([])
            setContacts([])
        })
    }
    
    const handleUpdateData = async () => {
        setShow(false)
        setLoading(true)
    
        const getActor: string | null = localStorage.getItem('customToken')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const {id, ...newClientUpdate} = clientUpdate
    
                    // Update the client data
                    const clientID = await updateClient(id, newClientUpdate, getActor)
    
                    // Delete the selected contacts
                    if (deleteContactID.length > 0) {
                        for (const contactID of deleteContactID) {
                            await deleteContacts(contactID, getActor)  // Call deleteContact using the contact's ID
                        }
                    }
    
                    // Delete the selected links
                    if (deleteLinksID.length > 0) {
                        for (const linkID of deleteLinksID) {
                            await deleteLinks(linkID, getActor)  // Call deleteClientLink using the link's ID
                        }
                    }
    
                    // Add new contacts if available
                    if (contacts.length > 0) {
                        for (const contact of contacts) {
                            const newContact = {
                                ...contact,
                                id_ref: clientID
                            };
                            await addContact(newContact, getActor);  // Add each contact individually
                        }
                    }
    
                    // Add new links if available
                    if (links.length > 0) {
                        for (const link of links) {
                            const newLink = {
                                link,         // Store the link string itself
                                id_ref: clientID
                            };
                            await addClientLink(newLink, getActor);  // Add each link individually
                        }
                    }
    
                    res()
                } catch (error) {
                    rej(error)
                }
            }, 2000)
        }).then(() => {
            handleToast('Client Updated Successfully!', `${clientUpdate.company} has been successfully updated in the database.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
            onCloseEdit()
            setLinks([])  // Clear the links array
            setContacts([{contact_person: '', contact_number: ''}])  // Clear the contacts array
            setLinksDelete([])  // Clear the deleteLinks array
            setDeleteContacts([])  // Clear the deleteContacts array
        })
    }
    

    const handleContacts = () => {
        const newContact = {
            contact_person,
            contact_number
        }
        setContacts(prev => [
            ...prev,
            newContact,
        ])
        setContact('')
        setContactNum('')
    }

    const handleLink = () => {
        const getLink = link
        setLinks(prev => [
            ...prev,
            getLink,
        ])
        setLink('')
    }

    const handleRemoveLink = (index: number) => {
        setLinks(prev => prev.filter((_, i) => i !== index));
    }
    
    const handleRemoveContact = (index: number) => {
        setContacts((prev) => prev.filter((_, i) => i !== index))
    }

    const handleRemoveUpdateLink = (index: number, id: string) => {
        setLinkUpdate(prev => prev.filter((_, i) => i !== index))
        setLinksDelete(prev => [
            ...prev,
            id,
        ])
    }
    
    const handleRemoveUpdateContact = (index: number, id: string) => {
        setContactUpdate(prev => prev.filter((_, i) => i !== index))
        setDeleteContacts(prev => [
            ...prev,
            id,
        ])
    }

    const handleCompanyInfo = (id: string) => {
        try{
            const client = allClients && allClients.find((company) => company.id === id)
            setClientUpdate((prev) => ({
                ...prev,
                ...client
            }))
            const links = allLinks ? allLinks.filter((link) => link.id_ref === id) : []
            const contacts = allContacts ? allContacts.filter((contact) => contact.id_ref === id) : []

            setLinkUpdate(links)
            setContactUpdate(contacts)
        }catch(error){
            throw error
        }
    }

    return(
    <>
        <main className='flex flex-col space-y-3'>
            <section className='flex items-end justify-between'>
                <header className='text-lg text-sky-700 font-bold'>Client Companies</header>
                <Button size='sm' colorScheme='blue' onClick={modalOpen}>Add Client</Button>
            </section>
            <section className='w-full flex flex-col space-y-2 rounded border p-3'>
                <Box className='text-center rounded bg-sky-700 flex border-b items-center py-2 px-4 uppercase w-full'>
                    <Text w='100%' className='text-white'>Company</Text>
                    <Text w="100%"className="text-white">contacts</Text>
                    <Text w='50%' className='text-white'>company charges</Text>
                    <Text w='50%' className='text-white'>actions</Text>
                    <Text w='10%' className='text-white'>{``}</Text>
                </Box>
                <Accordion allowToggle className="space-y-2">
                    {allClients && allClients.length > 0 ? (
                        allClients
                            .filter((client) => client.company)
                            .map((client) => (
                                <AccordionItem key={client.id} className="shadow-md rounded">
                                    <AccordionButton _expanded={{ bg: "#9CA3AF", color: "white" }}>
                                        <Box className="text-center flex justify-center items-center w-full py-2 uppercase">
                                            <Text w="100%" fontSize="11px">{client.company}</Text>
                                            <Box w="100%">
                                            {allContacts && allContacts.filter((contact) => contact.id_ref === client.id).length > 0 ? (
                                                allContacts.filter((contact) => contact.id_ref === client.id)
                                                    .map((contact) => (
                                                        <Box key={contact.id} className="flex">
                                                            <Text fontSize="11px" w="100%">{contact.contact_person}</Text>
                                                            <Text fontSize="11px" w="50%" className="text-center">{contact.contact_number}</Text>
                                                        </Box>
                                                    ))
                                            ) : (
                                                <Text fontSize="11px" w="100%" className="text-center text-gray-400">
                                                    No contacts available.
                                                </Text>
                                            )}
                                            </Box>
                                            <Box w="55%" className="flex justify-center items-center">
                                                <Button onClick={() => { setRef(client.id); onOpenCC(); }} size="xs" colorScheme="gray">
                                                    <ViewIcon size="18" color="#a9a9a9" />
                                                </Button>
                                            </Box>
                                            <Box w="55%" className="flex justify-center items-center space-x-3">
                                                <Button onClick={() => { onOpenEdit(); handleCompanyInfo(client.id) }} size="xs" colorScheme="blue">
                                                    <EditIcon size="18" color="#fff" />
                                                </Button>
                                                <Button onClick={() => { onOpenDelete(); setRef(client.id); }} size="xs" colorScheme="red">
                                                    <TrashIcon size="18" color="#fff" />
                                                </Button>
                                            </Box>
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel className="rounded border space-y-2 shadow-md">
                                        <Box className="flex items-center w-full border-b text-center uppercase">
                                            <Text w="100%" fontSize="11px" className="text-gray-400">Address</Text>
                                            <Text w="70%" fontSize="11px" className="text-gray-400">street</Text>
                                            <Text w="40%" fontSize="11px" className="text-gray-400">brgy</Text>
                                            <Text w="40%" fontSize="11px" className="text-gray-400">zip code</Text>
                                            <Text w="40%" fontSize="11px" className="text-gray-400">city</Text>
                                            <Text w='100%' fontSize='11px' className='text-gray-400'>Email</Text>
                                            <Text w='100%' fontSize='11px' className='text-gray-400'>links</Text>
                                        </Box>
                                        <Box className="flex items-center w-full text-center uppercase">
                                            <Text w="100%" fontSize="11px">{client.address}</Text>
                                            <Text w="70%" fontSize="11px">{client.street}</Text>
                                            <Text w="40%" fontSize="11px">{client.brgy}</Text>
                                            {allAreas && allAreas.find(area => area.id === client.zipCode) && (
                                                <Text w="40%" fontSize="11px">{allAreas.find(area => area.id === client.zipCode)?.zipCode}</Text>
                                            )}
                                            <Text w="40%" fontSize="11px">{client.city}</Text>
                                            <Text w="100%" fontSize="11px">{client.email ? client.email : <span className='text-gray-400'>No Email Available.</span>}</Text>
                                            <Box w="100%" className="flex flex-col">
                                            {allLinks && allLinks.filter((link) => link.id_ref === client.id).length > 0 ? (
                                                allLinks.filter((link) => link.id_ref === client.id).map((link) => (
                                                    <Link key={link.id} fontSize="11px" href={`https://${link.link}`} isExternal>
                                                        {link.link}
                                                    </Link>
                                                ))
                                            ) : (
                                                <Text fontSize="11px" className="text-center text-gray-400">
                                                    No links available.
                                                </Text>
                                            )}
                                            </Box>
                                        </Box>
                                    </AccordionPanel>
                                </AccordionItem>
                            ))
                    ) : (
                        // Render this when allClients is empty or undefined
                        <Box className="text-center py-8">
                            <Text fontSize="lg" color="gray.500">No client data available</Text>
                        </Box>
                    )}
                </Accordion>
            </section>
        </main>
        {/** Company Charges Modal */}
        <Drawer isOpen={isOpenCC} onClose={onCloseCC} size='xl'>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerHeader>Company Charges</DrawerHeader>
                <DrawerBody>
                    <CompanyChargesModal id={idRef} />
                </DrawerBody>
                <DrawerFooter>
                    <Button onClick={onCloseCC} mr={3}>Close</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
        {/** Edit Modal */}
        <Modal isOpen={isOpenEdit} scrollBehavior='inside' onClose={onCloseEdit} size='xl' motionPreset='slideInTop' >
            <ModalOverlay/>
            <ModalContent px='10px'>
                <ModalHeader ><span className='font-semibold text-gray-600'>Update Client Company</span></ModalHeader>
                <ModalBody>
                    {showAlert && (
                        <Alert status='info' variant='left-accent' className='flex-col mb-4 items-center justify-center'>
                            <Box className='flex w-full items-center justify-center'>
                                <AlertIcon />
                                <AlertTitle fontSize='18px' fontWeight='700'>
                                    <p>Please provide Required Fields</p>
                                </AlertTitle>
                            </Box>
                            <AlertDescription className='flex justify-start items-start w-full'>
                                <Box className='w-full flex px-10'>
                                    {(clientInfo.company === '' || clientInfo.address === '' || clientInfo.street === '' || clientInfo.brgy === '' || clientInfo.zipCode === '' || clientInfo.city === '') && (
                                        <Box className='flex flex-col w-full justify-between'>
                                            <p>{clientInfo.company === '' ? `Company` : ''}</p>
                                            <p>{clientInfo.address === '' ? `Address` : ''}</p>
                                            <p>{clientInfo.street === '' ? `Street` : ''}</p>
                                        </Box>
                                    )}
                                    <Box className='flex flex-col w-full'>
                                        <p>{clientInfo.brgy === '' ? `Barangay` : ''}</p>
                                        <p>{clientInfo.zipCode === '' ? `Zip Code` : ''}</p>
                                        <p>{clientInfo.city === '' ? `City` : ''}</p>
                                    </Box>
                                </Box>
                            </AlertDescription>
                        </Alert>
                    )}
                    <Box px='10px' >
                        <Box className='space-y-4 pb-3' >
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Company Name:</FormLabel>
                                <Input name='edit' className='uppercase' value={clientUpdate.company} id='company' onChange={handleOnChange} type='text' variant='flushed' />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Company Address:</FormLabel>
                                <Input name='edit' className='uppercase' value={clientUpdate.address} id='address' onChange={handleOnChange} type='text' variant='flushed' />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Street:</FormLabel>
                                <Input name='edit' className='uppercase' value={clientUpdate.street} id='street' onChange={handleOnChange} type='text' variant='flushed' />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Email:</FormLabel>
                                <Input name='edit' className='uppercase' value={clientUpdate.email} id='email' onChange={handleOnChange} type='tel' variant='flushed' />
                            </FormControl>
                            <FormControl>
                                <Box className='flex uppercase space-x-4'>
                                    <Text className='text-gray-400'>Old City:</Text>
                                    <Text>{clientUpdate.city}</Text>
                                </Box>
                                <FormLabel fontSize='14' color='#a1a1a1'>City:</FormLabel>
                                <Select id='city' name='city' className='uppercase' onChange={handleSelectChange}>
                                    <option hidden>Select City</option>
                                    {allCategories && allCategories.filter(category => category.category === 'geographic' && category.selectedType === 'City')
                                        .map((natData) => (
                                            <option key={natData.id} value={natData.type}>{natData.type}</option>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            <FormControl>
                                <Box className='flex uppercase space-x-4'>
                                    <Text className='text-gray-400'>Old Zip Code:</Text>
                                    <Text>{allAreas && allAreas.find((area) => area.id === clientUpdate.zipCode)?.zipCode}</Text>
                                </Box>
                                <FormLabel fontSize='14' color='#a1a1a1'>Zip Code:</FormLabel>
                                <Select id='zipCode' className='uppercase' onChange={handleSelectChange}>
                                    <option hidden>Select Zip Code</option>
                                    {allCategories && allCategories.filter(cityData => cityData.type === city)
                                    .map((cityData) => {
                                        const matchingAreas = allAreas?.filter(area => area.ref_city === cityData.id) || []
                                        return matchingAreas.map((area) => (
                                            <option key={area.id} value={area.id}>{`${area.zipCode} - ${area.location}`}</option>
                                        ))
                                    })}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <Box className='flex uppercase space-x-4'>
                                    <Text className='text-gray-400'>Old Brgy:</Text>
                                    <Text>{clientUpdate.brgy}</Text>
                                </Box>
                                <FormLabel fontSize='14' color='#a1a1a1'>Barangay:</FormLabel>
                                <Select id='brgy' className='uppercase' onChange={handleSelectChange}>
                                    <option hidden>Select Barangay</option>
                                    {allSubArea && allSubArea
                                        .filter(subarea => subarea.location_ref === clientInfo.zipCode)
                                        .map((subarea) => (
                                            <option key={subarea.id} value={subarea.brgy}>{`Brgy. ${subarea.brgy}`}</option> 
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            <Box className='space-y-2'>
                                <Text className='text-lg'>Links</Text>
                                <Box className='space-y-2'>
                                {Array.isArray(linkUpdate) && linkUpdate.map((link, index) => (
                                    <Box key={index} className='w-full justify-between flex space-x-4 items-center px-8'>
                                        <Text className='text-gray-500'>Link:</Text>
                                        <Text>{link.link}</Text>
                                        <Button size='xs' colorScheme='red' onClick={() => handleRemoveUpdateLink(index, link.id)} >Remove</Button>
                                    </Box>
                                ))}
                                {links && links.map((link, index) => (
                                    <Box key={index} className='w-full justify-between flex space-x-4 items-center px-8'>
                                        <Text className='text-gray-500'>Link:</Text>
                                        <Text>{link}</Text>
                                        <Button size='xs' colorScheme='red' onClick={() => handleRemoveLink(index)} >Remove</Button>
                                    </Box>
                                ))}
                                </Box>
                                <Box className='flex items-center space-x-4'>
                                    <Input name='edit' variant='flushed' type='text' value={link} onChange={(e) => {setLink(e.target.value)}} />
                                    <Button size='sm' onClick={handleLink} colorScheme='blue'><PlusIcon /></Button>
                                </Box>
                            </Box>
                            <Box className='space-y-2'>
                                <Text className='text-lg'>Contacts</Text>
                                <Box className='space-y-2'>
                                {Array.isArray(contactUpdate) && contactUpdate.map((contact, index) => (
                                    <Box key={index} className='w-full justify-between flex items-center '>
                                        <Box className='flex w-1/2 space-x-4'>
                                            <Text className='text-gray-400'>Contact:</Text>
                                            <Text>{contact.contact_person}</Text>
                                        </Box>
                                        <Box className='flex w-1/3 space-x-4 '>
                                            <Text className='text-gray-400'>Contact#:</Text>
                                            <Text>{contact.contact_number}</Text>
                                        </Box>
                                        <Button size='xs' colorScheme='red' onClick={() => handleRemoveUpdateContact(index, contact.id)} >Remove</Button>
                                    </Box>
                                ))}
                                {contacts && contacts.map((contact, index) => (
                                    <Box key={index} className='w-full justify-between flex items-center '>
                                        <Box className='flex w-1/2 space-x-4'>
                                            <Text className='text-gray-400'>Contact:</Text>
                                            <Text>{contact.contact_person}</Text>
                                        </Box>
                                        <Box className='flex w-1/3 space-x-4 '>
                                            <Text className='text-gray-400'>Contact#:</Text>
                                            <Text>{contact.contact_number}</Text>
                                        </Box>
                                        <Button size='xs' colorScheme='red' onClick={() => handleRemoveContact(index)} >Remove</Button>
                                    </Box>
                                ))}
                                </Box>
                                <Box className='flex items-center space-x-2'>
                                    <FormControl>
                                        <FormLabel fontSize='13' color='#a1a1a1'>Contact Person:</FormLabel>
                                        <Input name='edit' className='uppercase' fontSize='sm' id='contact_person' value={contact_person} onChange={(e) => {setContact(e.target.value)}} type='text' variant='flushed' />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize='13' color='#a1a1a1'>Phone:</FormLabel>
                                        <Input name='edit' className='uppercase' fontSize='sm' id='contact_number' value={contact_number} onChange={(e) => {setContactNum(e.target.value)}} type='tel' variant='flushed' />
                                    </FormControl>
                                    <Button size='sm' width='15%' onClick={handleContacts} colorScheme='blue'><PlusIcon /></Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter borderTopWidth='2px' >
                    <Button onClick={onCloseEdit} boxShadow='md' colorScheme='gray' mr='4'>Cancel</Button>
                    <Button onClick={handleUpdateData} isLoading={loading} loadingText='Saving...' boxShadow='md' colorScheme='blue'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Delete Modal */}
        <Modal isOpen={isOpenDelete} onClose={onCloseDelete} motionPreset='slideInTop'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Delete this Client?</ModalHeader>
                <ModalBody className='text-center'>
                    <Text className='text-base text-gray-400'>Are you sure you want to delete this client?</Text>
                    <Text className='text-base text-gray-400'>You cannot undo this action if you proceed.</Text>
                </ModalBody>
                <ModalFooter borderTopWidth='1px'>
                    <Button mr={3} colorScheme='gray' onClick={onCloseDelete}>Cancel</Button>
                    <Button isLoading={loading} loadingText='Deleting...' colorScheme='red' onClick={() => {handleDelete(idRef)}}>Delete</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Add Modal */}
        <Modal isOpen={openModal} scrollBehavior='inside' onClose={handleCloseModal} size='xl' motionPreset='slideInTop' >
            <ModalOverlay/>
            <ModalContent px='10px'>
                <ModalHeader ><span className='font-semibold text-gray-600'>New Client Company</span></ModalHeader>
                <ModalBody>
                    {showAlert && (
                        <Alert status='info' variant='left-accent' className='flex-col mb-4 items-center justify-center'>
                            <Box className='flex w-full items-center justify-center'>
                                <AlertIcon />
                                <AlertTitle fontSize='18px' fontWeight='700'>
                                    <p>Please provide Required Fields</p>
                                </AlertTitle>
                            </Box>
                            <AlertDescription className='flex justify-start items-start w-full'>
                                <Box className='w-full flex px-10'>
                                    {(clientInfo.company === '' || clientInfo.address === '' || clientInfo.street === '' || clientInfo.brgy === '' || clientInfo.zipCode === '' || clientInfo.city === '') && (
                                        <Box className='flex flex-col w-full justify-between'>
                                            <p>{clientInfo.company === '' ? `Company` : ''}</p>
                                            <p>{clientInfo.address === '' ? `Address` : ''}</p>
                                            <p>{clientInfo.street === '' ? `Street` : ''}</p>
                                        </Box>
                                    )}
                                    <Box className='flex flex-col w-full'>
                                        <p>{clientInfo.brgy === '' ? `Barangay` : ''}</p>
                                        <p>{clientInfo.zipCode === '' ? `Zip Code` : ''}</p>
                                        <p>{clientInfo.city === '' ? `City` : ''}</p>
                                    </Box>
                                </Box>
                            </AlertDescription>
                        </Alert>
                    )}
                    <Box px='10px' >
                        <Box className='space-y-4 pb-3' >
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Company Name:</FormLabel>
                                <Input className='uppercase' id='company' onChange={handleOnChange} type='text' variant='flushed' />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Company Address:</FormLabel>
                                <Input className='uppercase' id='address' onChange={handleOnChange} type='text' variant='flushed' />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Street:</FormLabel>
                                <Input className='uppercase' id='street' onChange={handleOnChange} type='text' variant='flushed' />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Email:</FormLabel>
                                <Input className='uppercase' id='email' onChange={handleOnChange} type='tel' variant='flushed' />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>City:</FormLabel>
                                <Select id='city' name='city' className='uppercase' onChange={handleSelectChange}>
                                        <option hidden>Select City</option>
                                    {allCategories && allCategories.filter(category => category.category === 'geographic' && category.selectedType === 'City')
                                        .map((natData) => (
                                            <option key={natData.id} value={natData.type}>{natData.type}</option>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Zip Code:</FormLabel>
                                <Select id='zipCode' className='uppercase' onChange={handleSelectChange}>
                                    <option hidden>Select Zip Code</option>
                                    {allCategories && allCategories.filter(cityData => cityData.type === city)
                                    .map((cityData) => {
                                        const matchingAreas = allAreas?.filter(area => area.ref_city === cityData.id) || []
                                        return matchingAreas.map((area) => (
                                            <option key={area.id} value={area.id}>{`${area.zipCode} - ${area.location}`}</option>
                                        ))
                                    })}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Barangay:</FormLabel>
                                <Select id='brgy' className='uppercase' onChange={handleSelectChange}>
                                    <option hidden>Select Barangay</option>
                                    {allSubArea && allSubArea
                                        .filter(subarea => subarea.location_ref === clientInfo.zipCode)
                                        .map((subarea) => (
                                            <option key={subarea.id} value={subarea.brgy}>{`Brgy. ${subarea.brgy}`}</option> 
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            <Box className='space-y-2'>
                                <Text className='text-lg'>Links</Text>
                                <Box className='space-y-2'>
                                {links && links.map((link, index) => (
                                    <Box key={index} className='w-full justify-between flex space-x-4 items-center px-8'>
                                        <Text className='text-gray-500'>Link:</Text>
                                        <Text>{link}</Text>
                                        <Button size='xs' colorScheme='red' onClick={() => handleRemoveLink(index)} >Remove</Button>
                                    </Box>
                                ))}
                                </Box>
                                <Box className='flex items-center space-x-4'>
                                    <Input variant='flushed' type='text' value={link} onChange={(e) => {setLink(e.target.value)}} />
                                    <Button size='sm' onClick={handleLink} colorScheme='blue'><PlusIcon /></Button>
                                </Box>
                            </Box>
                            <Box className='space-y-2'>
                                <Text className='text-lg'>Contacts</Text>
                                <Box className='space-y-2'>
                                {contacts && contacts.map((contact, index) => (
                                    <Box key={index} className='w-full justify-between flex items-center '>
                                        <Box className='flex w-1/2 space-x-4'>
                                            <Text className='text-gray-400'>Contact:</Text>
                                            <Text>{contact.contact_person}</Text>
                                        </Box>
                                        <Box className='flex w-1/3 space-x-4 '>
                                            <Text className='text-gray-400'>Contact#:</Text>
                                            <Text>{contact.contact_number}</Text>
                                        </Box>
                                        <Button size='xs' colorScheme='red' onClick={() => handleRemoveContact(index)} >Remove</Button>
                                    </Box>
                                ))}
                                </Box>
                                <Box className='flex items-center space-x-2'>
                                    <FormControl>
                                        <FormLabel fontSize='13' color='#a1a1a1'>Contact Person:</FormLabel>
                                        <Input className='uppercase' fontSize='sm' id='contact_person' value={contact_person} onChange={(e) => {setContact(e.target.value)}} type='text' variant='flushed' />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize='13' color='#a1a1a1'>Phone:</FormLabel>
                                        <Input className='uppercase' fontSize='sm' id='contact_number' value={contact_number} onChange={(e) => {setContactNum(e.target.value)}} type='tel' variant='flushed' />
                                    </FormControl>
                                    <Button size='sm' width='15%' onClick={handleContacts} colorScheme='blue'><PlusIcon /></Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter borderTopWidth='2px' >
                    <Button onClick={handleCloseModal} boxShadow='md' colorScheme='gray' mr='4'>Cancel</Button>
                    <Button onClick={handleSaveData} isLoading={loading} loadingText='Creating...' boxShadow='md' colorScheme='blue'>Create</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}