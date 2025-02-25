'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef} from 'react'

import { Timestamp } from 'firebase/firestore'
import DatePicker from 'react-datepicker'
import { Box, Text, Heading, Tooltip, Input, useToast, FormControl, Radio, Select, RadioGroup, Switch, VStack, HStack, useDisclosure, Button, Modal, ModalOverlay, ModalHeader, ModalContent, ModalBody, ModalFooter, } from '@chakra-ui/react'
import 'animate.css'

import {DotsIcon, EditIcon, TrashIcon} from '@/Components/Icons'

import { parsingTimestamp, formatTime, formatDateToWords, getStatusStyles, showTitleTextIcon, ToastStatus, handleMarketing, generateSlug} from '@/types/handling'

import { useTrainees } from '@/context/TraineeContext'
import { useRank } from '@/context/RankContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTypes } from '@/context/TypeContext'
import {useCategory} from '@/context/CategoryContext'

import { TRAINEE_BY_ID, initTRAINEE_BY_ID } from '@/types/trainees'

import { UPDATE_TRAINEE } from '@/lib/trainee_controller'

interface PageProps{
    params: { slug: string[] }
}

export default function Page({params}: PageProps){
    const router = useRouter()
    const toast = useToast()
    const { data: allRanks } = useRank()
    const { data: allClients } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allCategories } = useCategory()
    const { area: allAreas, subArea: allSubArea } = useTypes()

    const { isOpen: isOpenAddress, onOpen: onOpenAddress, onClose: onCloseAddress } = useDisclosure()
    const { isOpen: isOpenCompany, onOpen: onOpenCompany, onClose: onCloseCompany } = useDisclosure()
    const {isOpen: isOpenRank, onOpen: onOpenRank, onClose: onCloseRank} = useDisclosure()

    const [traineeInfo, setTraineeInfo] = useState<TRAINEE_BY_ID>(initTRAINEE_BY_ID)

    const [rankRef, setRankRef] = useState<string>('')
    const [selectedRank, setSelectedRank] = useState<string>('')

    const [loading, setLoading] = useState<boolean>(false)
    const [otherAddress, setAddress] = useState<boolean>(false)

    const [companyRef, setCompanyRef] = useState<string>('')
    const [selectCompany, setSelectCompany] = useState<string>('')

    const [birth_date, setBirth_Date] = useState<Date | null>(new Date())

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

    useEffect(() => {
        const fetchData = async () => {
            try{
                const [lastName] = params.slug[0].split('-')
                if(!allTrainee){
                    return
                }    
                let slug_name
                const trainee = allTrainee.find(f => {
                    slug_name = generateSlug(`${f.last_name.toLowerCase().trim().charAt(0)}${f.first_name.toLowerCase().trim().charAt(0)}${f.id.slice(0,2)}`)
                    return slug_name === lastName
                }) 
                if(trainee){
                    setBirth_Date(parsingTimestamp(trainee.birthDate))
                    setAddress(trainee.otherAddress !== '')
                    let newTrainee
                    if(otherAddress){
                        newTrainee = { 
                            ...trainee,
                            house_no: '',
                            street: '',
                            city: '',
                            area: '',
                            brgy: '',
                        }
                    }
                    setTraineeInfo({...trainee, ...newTrainee})
                }
            } catch(error) {
                throw error
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [params.slug, allTrainee])

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target
        
        setTraineeInfo((prev) => ({
            ...prev,
            [id]: value
        }))
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {id, value} = e.target

        setTraineeInfo((prev) => ({
            ...prev,
            [id]: value
        }))
    }

    const handleSaveTraineeDetails = async () => {
        setLoading(true)
        const actor: string | null = localStorage.getItem('customToken')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    if(allTrainee){
                        const newTraineeInfo = { 
                            ...traineeInfo,
                            birthDate: birth_date ? Timestamp.fromDate(birth_date) : Timestamp.now()
                        }
                        await UPDATE_TRAINEE(newTraineeInfo, actor)
                    }
                    res()
                }catch(error){
                    rej(error)
                }
            }, 1500)
        }).then(() => {
            handleToast('Trainee Updated Successfully!', `Trainee details has been successfully updated to the database.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
            router.push('/enterprise-portal/registration/trainees')
        })
    }
    
    const handleCompany = (id: string) => {
        setSelectCompany(id)
    }

    const handleSelectedCompany = () => {
        let tempCompany: string
        if(selectCompany === ''){
            tempCompany = companyRef
        } else {
            tempCompany = selectCompany
        }
        setTraineeInfo((prev) => ({
            ...prev,
            company: tempCompany
        }))
        onCloseCompany()
    }

    const handleRank = (rank: string) => {
        setSelectedRank(rank)
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

    return(
    <>
        <main className='px-2 space-y-2'>
            <Box className='flex items-center justify-between'>
                <Heading color='#a1a1a1' as='h5' size='md'>Trainee Details</Heading>
                <Button colorScheme='blue' isLoading={loading} loadingText='...Updating' onClick={handleSaveTraineeDetails} size='md' leftIcon={<EditIcon color='#fff' size='24' />} >Update Details</Button>
            </Box>
            <Box gridGap={6} display='flex' flexDir='column' className='border outline-0 shadow-md w-full rounded p-3'>
                <Box display='flex' gridGap={4} alignItems='center'>
                    <FormControl className='uppercase w-full'>
                        <label className='text-gray-400'>Last Name</label>
                        <Input id='last_name' onChange={handleOnChange} value={traineeInfo.last_name} className='w-full shadow-md uppercase' placeholder='' />
                    </FormControl>
                    <FormControl className='uppercase w-full'>
                        <label className='text-gray-400'>First Name</label>
                        <Input id='first_name' onChange={handleOnChange} value={traineeInfo.first_name} className='w-full shadow-md uppercase' placeholder='' />
                    </FormControl>
                    <FormControl className='uppercase w-full'>
                        <label className='text-gray-400'>Middle Name</label>
                        <Input id='middle_name' onChange={handleOnChange} value={traineeInfo.middle_name} className='w-full shadow-md uppercase' placeholder='' />
                    </FormControl>
                    <FormControl w='30%' className='uppercase '>
                        <label className='text-gray-400'>Suffix</label>
                        <Input id='suffix' onChange={handleOnChange} value={traineeInfo.suffix} className='shadow-md uppercase' placeholder='' />
                    </FormControl>
                </Box>    
                <Box display='flex' gridGap={4} alignItems='center'>
                    <FormControl className='uppercase w-full'>
                        <label className='text-gray-400'>srn</label>
                        <Input id='srn' onChange={handleOnChange} value={traineeInfo.srn} className='w-full shadow-md' placeholder='' />
                    </FormControl>
                    <FormControl className='flex flex-col items-start border-2 rounded shadow-md p-2' >
                        <label className='text-gray-400'>RANK:<span className='text-red-700'>*</span></label>
                        <Button w='100%' className='uppercase' onClick={() => {onOpenRank(); setRankRef(''); setSelectedRank('');}} variant='ghost' colorScheme='blue'>
                        {allRanks?.find((rank) => rank.code === traineeInfo.rank)?.rank || (traineeInfo.rank === '' ? 'SELECT RANK' : traineeInfo.rank)}
                        </Button>
                    </FormControl>
                    <FormControl className='uppercase w-full'>
                        <label className='text-gray-400'>email</label>
                        <Input id='email' onChange={handleOnChange} value={traineeInfo.email} type='email' className='w-full shadow-md' placeholder='' />
                    </FormControl>
                    <FormControl className='uppercase '>
                        <label className='text-gray-400'>contact no.</label>
                        <Input id='contact_no' onChange={handleOnChange} value={traineeInfo.contact_no} type='tel' className='shadow-md' placeholder='' />
                    </FormControl>
                </Box>    
                <Box display='flex' gridGap={4} alignItems='center'>
                    <FormControl className='uppercase w-full'>
                        <label className='text-gray-400'>gender</label>
                        <Select id='gender' onChange={handleSelect} value={traineeInfo.gender} className='shadow-md uppercase'>
                            <option  hidden>Select Gender</option>
                            <option value={'male'}>Male</option>
                            <option value={'female'}>Female</option>
                        </Select>
                    </FormControl>
                    <FormControl className='uppercase w-full'>
                        <label className='text-gray-400'>nationality</label>
                        <Input id='nationality' onChange={handleOnChange} value={traineeInfo.nationality} type='text' className='w-full shadow-md' placeholder='' />
                    </FormControl>
                    <FormControl display='flex' flexDir='column' className='uppercase w-full'>
                        <label className='text-gray-400'>birth date</label>
                        <DatePicker showPopperArrow={false} selected={birth_date} onChange={(date) => setBirth_Date(date)} showMonthDropdown useShortMonthInDropdown dateFormat='E, MMM. dd, yyyy'
                            customInput={<Input id='birth_date' textAlign='center' className='shadow-md' /> } />
                    </FormControl>
                    <FormControl className='uppercase '>
                        <label className='text-gray-400'>birth place</label>
                        <Input id='birthPlace' onChange={handleOnChange} value={traineeInfo.birthPlace} type='text' className='shadow-md' placeholder='' />
                    </FormControl>
                </Box>    
                <Box display='flex' gridGap={4} flexDir={{md:'row', base:'column'}} >
                    <FormControl className='flex flex-col space-y-2 items-start md:space-y-0 md:flex-row md:space-x-3 md:items-center'>
                        <label className='text-gray-400'>Address:</label>
                        <Button onClick={onOpenAddress} className='uppercase' variant='ghost' colorScheme='blue' >
                        {otherAddress ? traineeInfo.otherAddress !== '' ? traineeInfo.otherAddress : 'Add Address' : traineeInfo.house_no !== '' || traineeInfo.street !== '' || traineeInfo.brgy !== '' || traineeInfo.city !== '' ? `${traineeInfo.house_no} ${traineeInfo.street} ${`Brgy. ${traineeInfo.brgy}`} ${`${traineeInfo.city} City`}` : 'Add Address'}
                        </Button>
                    </FormControl>
                </Box>
                <Box display='flex' alignItems='center' gridGap={4}>
                    <FormControl className='uppercase'>
                        <label>Vessel Type</label>
                        <Select id='vessel' value={traineeInfo.vessel} onChange={handleSelect} className='uppercase'>
                            <option hidden>Select Vessel</option>
                            <option value={'container'}>Container</option>
                            <option value={'bulk'}>Bulk</option>
                            <option value={'tanker'}>Tanker</option>
                            <option value={'passenger'}>Passenger</option>
                        </Select>
                    </FormControl>
                    <FormControl className='uppercase'>
                        <label className='text-gray-400'>Company:</label>
                        <Button className='uppercase' onClick={() => {onOpenCompany(); setCompanyRef(''); setSelectCompany('');}} variant='ghost' colorScheme='blue'>
                        {allClients?.find((client) => client.id === traineeInfo.company)?.company || (traineeInfo.company === '' ? 'ADD COMPANY' : traineeInfo.company)}
                        </Button>
                    </FormControl>
                    <FormControl className='uppercase w-full'>
                        <label className='text-gray-400'>endorser</label>
                        <Input id='endorser' onChange={handleOnChange} value={traineeInfo.endorser} type='text' className='w-full uppercase shadow-md' placeholder='' />
                    </FormControl>
                </Box>
                <Box display='flex' alignItems='center' gridGap={4}>
                    <FormControl className='uppercase w-full'>
                        <label className='text-gray-400'>emergency contact</label>
                        <Input id='e_contact_person' onChange={handleOnChange} value={traineeInfo.e_contact_person} type='text' className='w-full uppercase shadow-md' placeholder='' />
                    </FormControl>
                    <FormControl className='uppercase w-full'>
                        <label className='text-gray-400'>contact</label>
                        <Input id='e_contact' onChange={handleOnChange} value={traineeInfo.e_contact} type='text' className='w-full shadow-md' placeholder='' />
                    </FormControl>
                    <FormControl className='uppercase w-full'>
                        <label className='text-gray-400'>relationship</label>
                        <Input id='relationship' onChange={handleOnChange} value={traineeInfo.relationship} type='text' className='w-full uppercase shadow-md' placeholder='' />
                    </FormControl>
                </Box>
            </Box>
        </main>
        <Modal isOpen={isOpenAddress} onClose={onCloseAddress} size='xl' scrollBehavior='inside' motionPreset='slideInTop' >
            <ModalOverlay/>
            <ModalContent className='px-3'>
                <ModalHeader className='font-bolder text-sky-700 uppercase'>Provide your Address</ModalHeader>
                <ModalBody>
                    <Box className='space-y-3'>
                        <FormControl className='uppercase'>
                            <label className='text-gray-400'>House No./Bldg.</label>
                            <Input id='house_no' onChange={handleOnChange} value={traineeInfo.house_no} isDisabled={otherAddress !== false} className='uppercase shadow-md'/>
                        </FormControl>
                        <FormControl className='uppercase'>
                            <label className='text-gray-400'>Street</label>
                            <Input id='street' onChange={handleOnChange} value={traineeInfo.street} isDisabled={otherAddress !== false} className='uppercase shadow-md'/>
                        </FormControl>
                        <FormControl className='uppercase'>
                            <label className='text-gray-400'>City</label>
                            <Select id='city' isDisabled={otherAddress !== false} value={traineeInfo.city} onChange={handleSelect} className='shadow-md uppercase'>
                                <option hidden>Select City</option>
                                {allCategories && allCategories.filter(category => category.category === 'geographic' && category.selectedType === 'City')
                                .map((natData) => (
                                    <option key={natData.id} value={natData.type}>{natData.type}</option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl className='uppercase'>
                            <label className='text-gray-400'>Area</label>
                            <Select id='area' isDisabled={otherAddress !== false} onChange={handleSelect} className='shadow-md uppercase'>
                                <option hidden>Select Location</option>
                                {allCategories && allCategories.filter(cityData => cityData.type === traineeInfo.city)
                                .map((cityData) => {
                                    const matchingAreas = allAreas?.filter(area => area.ref_city === cityData.id) || []
                                    return matchingAreas.map((area) => (
                                        <option key={area.id} value={area.id}>{`${area.zipCode} - ${area.location}`}</option>
                                    ))
                                })}
                            </Select>
                        </FormControl>
                        <FormControl className='uppercase'>
                            <label className='text-gray-400'>Barangay</label>
                            <Select id='brgy' value={traineeInfo.brgy} isDisabled={otherAddress !== false} onChange={handleSelect} className='shadow-md uppercase'>
                                <option hidden>Select Brgy</option>
                                {allSubArea && allSubArea
                                    .filter(subarea => subarea.location_ref === traineeInfo.area)
                                    .map((subarea) => (
                                        <option key={subarea.id} value={subarea.brgy}>{`Brgy. ${subarea.brgy}`}</option> 
                                    ))
                                }
                            </Select>
                        </FormControl>
                        <Text className='text-gray-400'>
                            {`Note: if you can't select any data from the fields provided, just click the switch to provide your address below.`}
                        </Text>
                        <FormControl className='flex items-center space-x-3'>
                            <label htmlFor='otherAddress'>Provide Address:</label>
                            <Switch id='otherAddress' isChecked={otherAddress} onChange={() => setAddress(!otherAddress)} />
                        </FormControl>
                        <FormControl>
                            <label className='text-gray-400'>Address</label>
                            <Input id='otherAddress' value={traineeInfo.otherAddress} isDisabled={otherAddress === false} onChange={handleOnChange} className='uppercase shadow-md'/>
                        </FormControl>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onCloseAddress} colorScheme='blue'>Done</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
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