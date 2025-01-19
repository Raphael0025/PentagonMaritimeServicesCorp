'use client'

import React, {useState} from 'react'
import Link from 'next/link'
import { Box, Text, Tooltip, Input, InputLeftAddon, InputGroup, useDisclosure, Button, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, AlertDialog, AlertDialogCloseButton, AlertDialogBody, AlertDialogHeader, AlertDialogOverlay, AlertDialogFooter, AlertDialogContent, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Select } from '@chakra-ui/react'
import { ToastStatus, } from '@/types/handling'
import {useCategory} from '@/context/CategoryContext'
import { useTypes } from '@/context/TypeContext'
import { addTypeCatalog, INSERT_AREA, UPDATE_AREA, DELETE_AREA, INSERT_SUB_AREA, UPDATE_SUB_AREA, DELETE_SUB_AREA } from '@/lib/type-controller'
import { AREAS, initAREAS, SUB_AREAS, AREA_BY_ID, SUBAREA_BY_ID, initSUBAREAS, initAREASByID, initSUBAREASByID } from '@/types/type'
import { stringify } from 'querystring'

export default function Page(){
    const toast = useToast()
    const { data: allCategories } = useCategory()
    const { area: allAreas, subArea: allSubArea } = useTypes()

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpenArea, onOpen: onOpenArea, onClose: onCloseArea } = useDisclosure()
    const { isOpen: isOpenSubArea, onOpen: onOpenSubArea, onClose: onCloseSubArea } = useDisclosure()
    
    const { isOpen: isOpenEditSA, onOpen: onOpenEditSA, onClose: onCloseEditSA } = useDisclosure()
    const { isOpen: isOpenEditA, onOpen: onOpenEditA, onClose: onCloseEditA } = useDisclosure()
    
    const { isOpen: isOpenDeleteSA, onOpen: onOpenDeleteSA, onClose: onCloseDeleteSA } = useDisclosure()
    const { isOpen: isOpenDeleteA, onOpen: onOpenDeleteA, onClose: onCloseDeleteA } = useDisclosure()

    const [loading, setLoading] = useState<boolean>(false)
    const [type, setType] = useState<string>('')
    const [data, setData] = useState<string>('')
    const [city, setCity] = useState<string>('')
    const [idRef, setIDRef] = useState<string>('')

    const [area, setArea] = useState<AREAS>(initAREAS)
    const [subArea, setSubArea] = useState<SUB_AREAS>(initSUBAREAS)

    const [areaByID, setAreaByID] = useState<AREA_BY_ID>(initAREASByID)
    const [subAreaByID, setSubAreaByID] = useState<SUBAREA_BY_ID>(initSUBAREASByID)

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

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setData(value)
    }

    const onChangeSelectArea = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value, name } = e.target
        if(name === 'area'){
            setArea(prev => ({
                ...prev,
                [id]: value
            }))
        }else if (name === 'subarea'){
            setSubArea(prev => ({
                ...prev,
                [id]: value,
            }))
        }else if (name === 'city'){
            setCity(value)
        }
        else if (name === 'editarea'){
            setAreaByID(prev => ({
                ...prev,
                [id]: value,
            }))
        }
        else if (name === 'editsubarea'){
            setSubAreaByID(prev => ({
                ...prev,
                [id]: value,
            }))
        }
    } 
    
    const onChangeArea = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, name } = e.target
        if(name === 'area'){
            setArea(prev => ({
                ...prev,
                [id]: value
            }))
        }
        else if (name === 'subarea'){
            setSubArea(prev => ({
                ...prev,
                [id]: value,
            }))
        }
        else if (name === 'editarea'){
            setAreaByID(prev => ({
                ...prev,
                [id]: value,
            }))
        }
        else if (name === 'editsubarea'){
            setSubAreaByID(prev => ({
                ...prev,
                [id]: value,
            }))
        }
    } 

    const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target
        setType(value)
    }

    const handleSaveData = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')
            
            await addTypeCatalog(type, data, 'geographic', actor)
        }catch(error){
            throw error
        } finally{
            setLoading(false)
            setData('')
            setType('')
            handleToast('Save Successfully', 'New Data added...', 4000, 'success')
            onClose()
        }
    }

    const handleSaveArea = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')

            const areaObj = {
                ...area,
                createdBy: actor ?? '',
            }
            await INSERT_AREA(areaObj)
        }catch(error){
            throw error
        }finally{
            setLoading(false)
            handleToast('Save Successfully', 'New Area added...', 4000, 'success')
            onCloseArea()
            setArea(initAREAS)
        }
    }
    
    const handleSaveSubArea = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')

            const subAreaObj: SUB_AREAS = {
                ...subArea,
                createdBy: actor ?? '',
            }
            await INSERT_SUB_AREA(subAreaObj)
        }catch(error){
            throw error
        }finally{
            setLoading(false)
            handleToast('Save Successfully', 'New Sub Area added...', 4000, 'success')
            onCloseSubArea()
            setSubArea(initSUBAREAS)
        }
    }

    const handleDeleteArea = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')
            await DELETE_AREA(idRef, actor)
        }catch(error){
            throw error
        }finally {
            setLoading(false)
            setIDRef('')
            handleToast('Deleted Successfully', 'This Area has been deleted...', 4000, 'success')
            onCloseDeleteA()
        }
    }

    const handleDeleteSubArea = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')
            await DELETE_SUB_AREA(idRef, actor)
        }catch(error){
            throw error
        }finally {
            setLoading(false)
            setIDRef('')
            handleToast('Deleted Successfully', 'This Sub Area has been deleted...', 4000, 'success')
            onCloseDeleteSA()
        }
    }

    const handleInfo = (id: string, name: string) => {
        try{
            if(name==='area'){
                const areaInfo = allAreas?.find((area) => area.id === id)
                
                setAreaByID(areaInfo ?? initAREASByID)
            }else if (name==='subarea'){
                const subAreaInfo = allSubArea?.find((subarea) => subarea.id === id)

                setSubAreaByID(subAreaInfo ?? initSUBAREASByID)
            }
        }catch(error){
            throw error
        }
    }

    const handleEditArea = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')
            const { id, createdAt, ...newAreaObj} = areaByID

            await UPDATE_AREA(id, newAreaObj, actor)
        }catch(error){
            throw error
        } finally{
            setLoading(false)
            handleToast('Updated Successfully', 'This Sub Area has been updated...', 4000, 'success')
            setAreaByID(initAREASByID)
            onCloseEditA()
        }
    } 

    const handleEditSubArea = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')
            const { id, createdAt, ...newSubAreaObj} = subAreaByID

            await UPDATE_SUB_AREA(id, newSubAreaObj, actor)
        }catch(error){
            throw error
        } finally{
            setLoading(false)
            handleToast('Updated Successfully', 'This Sub Area has been updated...', 4000, 'success')
            setSubAreaByID(initSUBAREASByID)
            onCloseEditSA()
        }
    }

    return(
    <>
        <main className='w-full space-y-3'>
            <Box> <Text className='text-lg text-sky-700'>Geographic Data</Text></Box>
            <Box>
                <Button colorScheme='blue' size='sm' onClick={onOpen} >Add Data</Button>
            </Box>
            <Box className='flex h-full space-x-4'>
                <Box style={{width: '350px'}} className='rounded h-full p-3 outline outline-1 outline-gray-400'>
                    <Text>Municipality/City</Text>
                    <Box>
                        <Box className='flex p-3 justify-between border-b border-gray-400'>
                            <Text>City</Text>
                            <Text>Action</Text>
                        </Box>
                        {allCategories && allCategories.filter(category => category.category === 'geographic' && category.selectedType === 'City')
                        .map((natData) => (
                            <Box className='flex justify-between p-2' key={natData.id}>
                                <Text className='uppercase'>{natData.type}</Text>
                                <Text>{``}</Text> {/* Replace with an appropriate action or data */}
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box style={{width: '550px'}} className='border space-y-3 rounded p-3'>
                    <Box className='flex justify-between items-end '>
                        <Text className='text-sky-600 text-base uppercase'>Area</Text>
                        <Button onClick={onOpenArea} colorScheme='blue' size='sm'>Add Area</Button>
                    </Box>
                    <Box className='space-y-3'>
                        <Box className='flex p-3 bg-sky-600 uppercase rounded text-white justify-between border-b border-gray-400'>
                            <Text w='50%' >City</Text>
                            <Text w='60%' >Location</Text>
                            <Text w='50%' className='text-center' >Zip Code</Text>
                            <Text w='60%' className='text-center'>Action</Text>
                        </Box>
                        {allAreas && allAreas.filter(area => area.category === 'geographic')
                            .map((area) => {
                            const matchingCity = allCategories?.find(city => city.id === area.ref_city);
                            return (
                              <Box className="flex items-center shadow-md justify-between border border-gray-400 rounded uppercase p-2" key={area.id}>
                                <Text w='50%' >{matchingCity ? matchingCity.type : 'Unknown City'}</Text>
                                <Text w='60%' >{area.location}</Text>
                                <Text w='50%' className='text-center' >{area.zipCode}</Text>
                                <Box  w='60%' className='flex items-center justify-center'>
                                    <Button onClick={() => {onOpenEditA(); handleInfo(area.id, 'area')}} size='xs' mr={3} colorScheme='blue'>Edit</Button>
                                    <Button onClick={() => {onOpenDeleteA(); setIDRef(area.id)}} size='xs' colorScheme='red'>Delete</Button>
                                </Box>
                              </Box>
                            )
                        })}
                    </Box>
                </Box>
                <Box style={{width: '550px'}} className='border space-y-3 rounded p-3'>
                    <Box className='flex justify-between items-end '>
                        <Text className='text-sky-600 text-base uppercase'>Sub Area</Text>
                        <Button onClick={onOpenSubArea} colorScheme='blue' size='sm'>Add Sub Area</Button>
                    </Box>
                    <Box className='space-y-3'>
                        <Box className='flex p-3 bg-sky-600 uppercase rounded text-white justify-between border-b border-gray-400'>
                            <Text w='60%' >Location</Text>
                            <Text w='50%' >Zip Code</Text>
                            <Text w='60%' className='text-center' >Barangay</Text>
                            <Text w='60%' className='text-center'>Action</Text>
                        </Box>
                        {allSubArea && allSubArea.filter(subarea => subarea.category === 'geographic')
                            .map((subarea) => {
                            const matchLocation = allAreas?.find(area => area.id === subarea.location_ref)
                            return (
                              <Box className="flex items-center shadow-md justify-between border border-gray-400 rounded uppercase p-2" key={subarea.id}>
                                <Text w='60%' >{matchLocation ? matchLocation.location : 'Unknown Location'}</Text>
                                <Text w='50%' >{matchLocation ? matchLocation.zipCode : 'Unknown Zip Code'}</Text>
                                <Text w='60%' className='text-center'>{subarea.brgy}</Text>
                                <Box  w='60%' className='flex items-center justify-center'>
                                    <Button onClick={() => {onOpenEditSA(); handleInfo(subarea.id, 'subarea')}} size='xs' mr={3} colorScheme='blue'>Edit</Button>
                                    <Button onClick={() => {onOpenDeleteSA(); setIDRef(subarea.id)}} size='xs' colorScheme='red'>Delete</Button>
                                </Box>
                              </Box>
                            )
                        })}
                    </Box>
                </Box>
            </Box>
        </main>
        <Modal isOpen={isOpen} closeOnOverlayClick={false} size='xl' onClose={onClose} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text className='text-sky-700'>{`Add Data`}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box className='space-y-3'>
                        <Select onChange={onSelectChange}>
                            <option hidden>Select Type</option>
                            <option value='City'>City</option>
                            <option value='ZipCode'>ZipCode</option>
                            <option value='Barangay'>Barangay</option>
                        </Select>
                        <InputGroup>
                            <InputLeftAddon>Data</InputLeftAddon>
                            <Input id='rankCode' onChange={onChange} value={data.toUpperCase()} />
                        </InputGroup>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={onClose}>Cancel</Button>
                    <Button isDisabled={data === '' && type === ''} onClick={handleSaveData} ml={3} colorScheme='blue' isLoading={loading} loadingText='Saving...'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Add Area */}
        <Modal isOpen={isOpenArea} closeOnOverlayClick={false} size='xl' onClose={onCloseArea} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text className='text-sky-700'>{`Add Data`}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box className='space-y-3'>
                        <Select id='ref_city' name='area' onChange={onChangeSelectArea} className='uppercase'>
                            <option hidden>Select City</option>
                            {allCategories && allCategories.filter(category => category.category === 'geographic' && category.selectedType === 'City')
                            .map((natData) => (
                                <option value={natData.id} key={natData.id} label={natData.type} />
                            ))}
                        </Select>
                        <InputGroup>
                            <InputLeftAddon>Zip Code</InputLeftAddon>
                            <Input id='zipCode' name='area' onChange={onChangeArea} value={area.zipCode.toUpperCase()} />
                        </InputGroup>
                        <InputGroup>
                            <InputLeftAddon>Location</InputLeftAddon>
                            <Input id='location' name='area' onChange={onChangeArea} value={area.location.toUpperCase()} />
                        </InputGroup>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={onCloseArea}>Cancel</Button>
                    <Button onClick={handleSaveArea} ml={3} colorScheme='blue' isLoading={loading} loadingText='Saving...'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Add Sub Area */}
        <Modal isOpen={isOpenSubArea} closeOnOverlayClick={false} size='xl' onClose={onCloseSubArea} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text className='text-sky-700'>{`Add Data`}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box className='space-y-3'>
                        <Select name='city' onChange={onChangeSelectArea} className='uppercase'>
                            <option hidden>Select City</option>
                            {allCategories && allCategories.filter(category => category.category === 'geographic' && category.selectedType === 'City')
                            .map((natData) => (
                                <option value={natData.id} key={natData.id} label={natData.type} />
                            ))}
                        </Select>
                        <Select id='location_ref' name='subarea' onChange={onChangeSelectArea} className='uppercase'>
                            <option hidden>Select Location</option>
                            {allAreas && allAreas.filter(area => area.ref_city === city)
                            .map((area) => (
                                <option value={area.id} key={area.id} label={area.location} />
                            ))}
                        </Select>
                        <InputGroup>
                            <InputLeftAddon>Barangay</InputLeftAddon>
                            <Input id='brgy' name='subarea' onChange={onChangeArea} value={subArea.brgy.toUpperCase()} />
                        </InputGroup>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={onCloseSubArea}>Cancel</Button>
                    <Button onClick={handleSaveSubArea} ml={3} colorScheme='blue' isLoading={loading} loadingText='Saving...'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Edit Sub Area */}
        <Modal isOpen={isOpenEditSA} closeOnOverlayClick={false} size='xl' onClose={onCloseEditSA} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text className='text-sky-700'>{`Add Data`}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box className='space-y-3'>
                        <Select name='city' onChange={onChangeSelectArea} className='uppercase'>
                            <option hidden>Select City</option>
                            {allCategories && allCategories.filter(category => category.category === 'geographic' && category.selectedType === 'City')
                            .map((natData) => (
                                <option value={natData.id} key={natData.id} label={natData.type} />
                            ))}
                        </Select>
                        <Select id='location_ref' value={subAreaByID.location_ref} name='editsubarea' onChange={onChangeSelectArea} className='uppercase'>
                            <option hidden>Select Location</option>
                            {allAreas && allAreas.filter(area => area.ref_city === city)
                            .map((area) => (
                                <option value={area.id} key={area.id} label={area.location} />
                            ))}
                        </Select>
                        <InputGroup>
                            <InputLeftAddon>Barangay</InputLeftAddon>
                            <Input id='brgy' name='editsubarea' onChange={onChangeArea} value={subAreaByID.brgy.toUpperCase()} />
                        </InputGroup>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={onCloseEditSA}>Cancel</Button>
                    <Button onClick={handleEditSubArea} ml={3} colorScheme='blue' isLoading={loading} loadingText='Saving...'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Edit Area */}
        <Modal isOpen={isOpenEditA} closeOnOverlayClick={false} size='xl' onClose={onCloseEditA} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text className='text-sky-700'>{`Add Data`}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box className='space-y-3'>
                        <Select id='ref_city' name='editarea' onChange={onChangeSelectArea} className='uppercase'>
                            <option hidden>Select City</option>
                            {allCategories && allCategories.filter(category => category.category === 'geographic' && category.selectedType === 'City')
                            .map((natData) => (
                                <option value={natData.id} key={natData.id} label={natData.type} />
                            ))}
                        </Select>
                        <InputGroup>
                            <InputLeftAddon>Zip Code</InputLeftAddon>
                            <Input id='zipCode' name='editarea' onChange={onChangeArea} value={areaByID.zipCode.toUpperCase()} />
                        </InputGroup>
                        <InputGroup>
                            <InputLeftAddon>Location</InputLeftAddon>
                            <Input id='location' name='editarea' onChange={onChangeArea} value={areaByID.location.toUpperCase()} />
                        </InputGroup>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={onCloseEditA}>Cancel</Button>
                    <Button onClick={handleEditArea} ml={3} colorScheme='blue' isLoading={loading} loadingText='Saving...'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Delete Area */}
        <Modal isOpen={isOpenDeleteA} closeOnOverlayClick={false} size='xl' onClose={onCloseDeleteA} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text className='text-red-700'>{`Delete this Area?`}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text fontSize='lg' textAlign='center'>{`Are you sure you want to delete this Area? You can't undo this action afterwards.`}</Text>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={onCloseDeleteA}>Cancel</Button>
                    <Button onClick={handleDeleteArea} ml={3} colorScheme='red' isLoading={loading} loadingText='Deleting...'>Delete</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Delete Sub Area */}
        <Modal isOpen={isOpenDeleteSA} closeOnOverlayClick={false} size='xl' onClose={onCloseDeleteSA} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text className='text-red-700'>{`Delete Sub Area?`}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text fontSize='lg' textAlign='center'>{`Are you sure you want to delete this Sub Area? You can't undo this action afterwards.`}</Text>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={onCloseDeleteSA}>Cancel</Button>
                    <Button onClick={handleDeleteSubArea} ml={3} colorScheme='red' isLoading={loading} loadingText='Deleting...'>Delete</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}