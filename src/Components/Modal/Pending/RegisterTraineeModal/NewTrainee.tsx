'use client'

import { Timestamp } from 'firebase/firestore'
import React from 'react'
import { Box, Text, Input, Button, FormLabel, Select, useDisclosure, FormControl, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';

import { NewTraineeProps } from '@/types/trainees';

export default function NewTrainee ({ setTraineeInfo,  traineeInfo, rankRef, selectedRank, 
    setRankRef, vesselRef, selectedVessel, setVesselRef, setCompanyRef, companyRef, 
    selectCompany,  allClients,  allRanks, setSelectCompany, setSelectVessel, 
    setSelectedRank, setCompanyID,}: NewTraineeProps){

    const { isOpen: isOpenRank, onOpen: onOpenRank, onClose: onCloseRank } = useDisclosure()
    const { isOpen: isOpenCompany, onOpen: onOpenCompany, onClose: onCloseCompany } = useDisclosure()
    const { isOpen: isOpenVessel, onOpen: onOpenVessel, onClose: onCloseVessel } = useDisclosure()

    const handleSetInfo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target
        setTraineeInfo((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleSetSelectInfo = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {id, value} = e.target
        setTraineeInfo((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleSelectedCompany = () => {
        let tempCompany: string
        if(selectCompany === ''){
            tempCompany = companyRef
        } else {
            tempCompany = selectCompany
            setCompanyID(selectCompany)
        }
        setTraineeInfo((prev) => ({
            ...prev,
            company: tempCompany
        }))
        onCloseCompany()
    }

    const handleSelectedRank = () => {
        let tempRank: string
        if(selectedRank === ''){
            tempRank = rankRef
        } else {
            tempRank = selectedRank
        }
        setTraineeInfo((prev) => ({
            ...prev,
            rank: tempRank
        }))
        onCloseRank()
    }

    const handleSelectedVessel = () => {
        let tempVessel: string
        if(selectedVessel === ''){
            tempVessel = vesselRef
        } else {
            tempVessel = selectedVessel
        }
        setTraineeInfo((prev) => ({
            ...prev,
            vessel: tempVessel
        }))
        onCloseVessel()
    }

    const handleVessel = (ves: string) => {
        setSelectVessel(ves)
    }

    const handleRank = (rank: string) => {
        setSelectedRank(rank)
    }

    const handleCompany = (id: string) => {
        setSelectCompany(id)
    }

    const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputDate = e.target.value; 
        const birth_date = new Date(inputDate);

        if (isNaN(birth_date.getTime())) {
            console.warn("Invalid date format");
            return;
        }

        setTraineeInfo((prev) => ({
            ...prev,
            birthDate: Timestamp.fromDate(birth_date),
        }));
    }

    return(
    <>
        <Box>
            <Text fontSize='lg' fontWeight='600' color='gray.600'>{`Trainee Information`}</Text>
            <Box mt='2' display='flex' flexDir={{base: 'column', md: 'row'}}>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} >
                        <FormLabel fontWeight='600' color='gray.500'>{`Last Name`}</FormLabel>
                        <Input id='last_name' type='text' onChange={handleSetInfo} value={traineeInfo.last_name} textTransform='uppercase' shadow='md'  />
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>{`First Name`}</FormLabel>
                        <Input id='first_name' type='text' onChange={handleSetInfo} textTransform='uppercase' shadow='md'  />
                    </FormControl>
                </Box>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>{`Middle Name`}</FormLabel>
                        <Input id='middle_name' type='text' onChange={handleSetInfo} textTransform='uppercase' shadow='md'  />
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>{`Suffix`}</FormLabel>
                        <Input id='suffix' type='text' onChange={handleSetInfo} textTransform='uppercase' shadow='md'  />
                    </FormControl>
                </Box>
            </Box>
            <Box display='flex' mt='2' flexDir={{base: 'column', md: 'row'}}>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>SRN</FormLabel>
                        <Input id='srn' type='number' onChange={handleSetInfo} textTransform='uppercase' shadow='md' />
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Rank</FormLabel>
                        <Input id='rank' type='text'
                            value={allRanks?.find((rank) => rank.code === traineeInfo.rank)?.rank || (traineeInfo.rank === '' ? 'SELECT RANK' : traineeInfo.rank)}
                            isReadOnly onClick={() => {onOpenRank(); setRankRef(''); setSelectedRank('');}} textTransform='uppercase' shadow='md' 
                        />
                    </FormControl>
                </Box>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Email</FormLabel>
                        <Input id='email' type='email' onChange={handleSetInfo} shadow='md' />
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Contact No#.</FormLabel>
                        <Input id='contact_no' type='tel' onChange={handleSetInfo} textTransform='uppercase' shadow='md' />
                    </FormControl>
                </Box>
            </Box>
            <Box display='flex' mt='2' flexDir={{base: 'column', md: 'row'}}>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Gender</FormLabel>
                        <Select id='gender' shadow='md' onChange={handleSetSelectInfo} textTransform='uppercase'>
                            <option hidden>Select Gender</option>
                            <option value='male'>Male</option>
                            <option value='female'>Female</option>
                        </Select>
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Nationality</FormLabel>
                        <Input id='nationality' type='text' onChange={handleSetInfo} textTransform='uppercase' shadow='md' />
                    </FormControl>
                </Box>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Birth Date</FormLabel>
                        <Input id='birthDate' type='text' onChange={handleDate} textTransform='uppercase' shadow='md' />
                        <FormLabel fontSize='sm' color='gray.500'>{`Format: yyyy/mm/dd`}</FormLabel>
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Birth Place</FormLabel>
                        <Input id='birthPlace' type='text' onChange={handleSetInfo} textTransform='uppercase' shadow='md' />
                    </FormControl>
                </Box>
            </Box>
            <FormControl mt='2' px={{base: '0', md: '2'}}>
                <FormLabel fontWeight='600' color='gray.500'>Address</FormLabel>
                <Input id='otherAddress' type='text' onChange={handleSetInfo} shadow='md' textTransform='uppercase' />
            </FormControl>
            <Box w='100%' mt='2' display='flex' flexDir={{base: 'column', md: 'row'}}>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Vessel Type</FormLabel>
                    <Input id='vessel' type='text'
                        value={traineeInfo.vessel === '' ? 'ADD VESSEL' : traineeInfo.vessel}
                        isReadOnly onClick={() => {onOpenVessel(); setVesselRef(''); setSelectVessel('');}} textTransform='uppercase' shadow='md' 
                    />
                </FormControl>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Company</FormLabel>
                    <Input id='company' isReadOnly type='text'
                        value={allClients?.find((client) => client.id === traineeInfo.company)?.company || (traineeInfo.company === '' ? 'ADD COMPANY' : traineeInfo.company)} 
                        onClick={() => {onOpenCompany(); setCompanyRef(''); setSelectCompany('');}} textTransform='uppercase' shadow='md' 
                    />
                </FormControl>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Endorser</FormLabel>
                    <Input id='endorser' type='text' onChange={handleSetInfo} textTransform='uppercase' shadow='md' />
                </FormControl>
            </Box>
            <Text mt='2' fontSize='lg' fontWeight='600' color='gray.600'>{`In case of emergency:`}</Text>
            <Box w='100%' mt='2' display='flex' flexDir={{base: 'column', md: 'row'}}>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Emergency Contact Person</FormLabel>
                    <Input id='e_contact_person' type='text' onChange={handleSetInfo} textTransform='uppercase' shadow='md' />
                </FormControl>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Emergency Contact No#.</FormLabel>
                    <Input id='e_contact' type='tel' onChange={handleSetInfo} textTransform='uppercase' shadow='md' />
                </FormControl>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Relationship</FormLabel>
                    <Input id='relationship' type='text' onChange={handleSetInfo} textTransform='uppercase' shadow='md' />
                </FormControl>
            </Box>
        </Box>
        {/** Company-modal */}
        <Modal isOpen={isOpenCompany} onClose={onCloseCompany} size='xl' scrollBehavior='inside' motionPreset='slideInTop'>
            <ModalOverlay/>
            <ModalContent className='px-3'>
                <ModalHeader fontWeight='700px' className='uppercase text-sky-700'>Specify your Company</ModalHeader>
                <ModalBody>
                    <Box className='flex flex-col space-y-2'>
                        <Box>
                            <Input onChange={(e) => setCompanyRef(e.target.value)} className='shadow-md uppercase' placeholder='type your company here...'/>
                        </Box>
                        <Box className='py-2 space-y-2'>
                            <Text className='text-gray-400 text-base'>Select your company below</Text>
                            {allClients && allClients.filter((company) => !companyRef || company.company.toLowerCase().includes(companyRef.toLowerCase())).sort((a, b) => a.company.localeCompare(b.company)).map((company) => (
                                <Text key={company.id} onClick={() => handleCompany(company.id)} className={`${company.id === selectCompany ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{company.company}</Text>
                            ))}
                        </Box>
                        <Text className='text-gray-400 text-center text-base'>{`Tip: If your company is not provided here, you can type it on the text box at the top and click done.`}</Text>
                    </Box>
                </ModalBody>
                <ModalFooter borderTopWidth='1px'>
                    <Button onClick={onCloseCompany} mr={3} >Close</Button>
                    <Button isDisabled={companyRef.trim() === '' && selectCompany.trim() === ''} onClick={handleSelectedCompany} colorScheme='blue'>Done</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Vessel Modal */}
        <Modal isOpen={isOpenVessel} onClose={onCloseVessel} size='xl' scrollBehavior='inside' motionPreset='scale'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontWeight='700' className='text-sky-700'>Vessels</ModalHeader>
                <ModalBody>
                    <Box className='flex flex-col space-y-2'>
                        <Box>
                            <Input onChange={(e) => setVesselRef(e.target.value)} className='shadow-md uppercase' placeholder='type your vessel here...'/>
                        </Box>
                        <Box className='py-2 space-y-2'>
                            <Text className='text-gray-400 text-base'>Select your company below</Text>
                            <Text onClick={() => handleVessel('container')} className={`${'container' === selectedVessel ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{'Container'}</Text>
                            <Text onClick={() => handleVessel('bulk')} className={`${'bulk' === selectedVessel ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{'Bulk'}</Text>
                            <Text onClick={() => handleVessel('tanker')} className={`${'tanker' === selectedVessel ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{'Tanker'}</Text>
                            <Text onClick={() => handleVessel('passenger')} className={`${'passenger' === selectedVessel ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{'Passenger'}</Text>
                        </Box>
                        <Text className='text-gray-400 text-center text-base'>{`Tip: If your vessel is not provided here, you can type it on the text box at the top and click done.`}</Text>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onCloseVessel} mr={3}>Close</Button>
                    <Button isDisabled={vesselRef.trim() === '' && selectedVessel.trim() === ''} onClick={handleSelectedVessel} colorScheme='blue'>Done</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Rank Modal */}
        <Modal isOpen={isOpenRank} onClose={onCloseRank} size='xl' scrollBehavior='inside' motionPreset='scale'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontWeight='700' className='text-sky-700'>Rank Type</ModalHeader>
                <ModalBody>
                    <Box className='flex flex-col space-y-2'>
                        <Box>
                            <Input onChange={(e) => setRankRef(e.target.value)} className='shadow-md uppercase' placeholder='type your rank here...'/>
                        </Box>
                        <Box className='py-2 space-y-2'>
                            <Text className='text-gray-400 text-base'>Select your Rank below</Text>
                            {allRanks && allRanks.sort((a, b) => a.code.localeCompare(b.code)).map((rank) =>(
                                <Text key={rank.id} onClick={() => handleRank(rank.code)} className={`${rank.id === selectedRank ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{rank.code}</Text>
                            ))}
                        </Box>
                        <Text className='text-gray-400 text-center text-base'>{`Tip: If your rank is not provided here, you can type it on the text box at the top and click done.`}</Text>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onCloseRank} mr={3}>Close</Button>
                    <Button isDisabled={rankRef.trim() === '' && selectedRank.trim() === ''} onClick={handleSelectedRank} colorScheme='blue'>Done</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
} 