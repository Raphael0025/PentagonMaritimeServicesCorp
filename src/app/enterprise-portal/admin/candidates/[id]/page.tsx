'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { Tooltip, Box, Button, Center, Input, useToast, FormControl, Select, Heading, Text, useDisclosure, Avatar, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableContainer, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerFooter,} from '@chakra-ui/react'
import DatePicker from 'react-datepicker'
import SignatureCanvas from 'react-signature-canvas'

import { QueryIcon, EditIcon, TrashIcon} from '@/Components/Icons'
import { SignIcon, HistoryIcon, FamilyIcon, EducIcon, EmergencyIcon, GovtIcon, WorkIcon } from '@/Components/SideIcons'

import { editStaffDetails } from '@/lib/company_user_controller'

import { useCompanyUsers } from '@/context/CompanyUserContext'

import { GetAllCompanyUsers, initGetAllCompanyUsers, Role, EducationalAttainment, WorkExperience, ImmediateDependents, TrainingHistory, initWorkExp, initInsertPosition, initEducation, initDependents, initTrainings} from '@/types/company_users'
import { formatDateWithDay, formatDateToWords, formatDateWithDayToWords } from '@/types/handling'

interface PageProps {
    params: { id: string }; // Adjust the type according to your actual data structure
}

export default function Page({params}: PageProps){
    const router = useRouter()
    const toast = useToast()
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const signInputRef = useRef<HTMLInputElement | null>(null);

    const {data: allCompanyUsers} = useCompanyUsers()
    const [loading, setLoading] = useState<boolean>(false)
    const [company_staff, setCompanyStaff] = useState<GetAllCompanyUsers>(initGetAllCompanyUsers)
    
    const [positionArr, setPositionArr] = useState<Role>(initInsertPosition)
    const [positions, setPositions] = useState<Role[]>([])

    const [educationArr, setEducArr] = useState<EducationalAttainment>(initEducation)
    const [educations, setEducations] = useState<EducationalAttainment[]>([])

    const [workArr, setWorkArr] = useState<WorkExperience>(initWorkExp)
    const [workExp, setWorkExp] = useState<WorkExperience[]>([])

    const [trainingArr, setTrainingArr] = useState<TrainingHistory>(initTrainings)
    const [trainings, setTrainings] = useState<TrainingHistory[]>([])

    const [dependentArr, setDependentArr] = useState<ImmediateDependents>(initDependents)
    const [dependents, setDependents] = useState<ImmediateDependents[]>([])

    const [isEmpty, setFields] = useState<boolean>(true)
    const [arr, setArr] = useState<string>('')
    const [actor, setActor] = useState<string | null>('')

    const [customStartDate, setCustomStartDate] = useState<Date | null>(new Date())
    const [customBirthDate, setBirthDate] = useState<Date >(new Date())
    const [customFromDate, setCustomFromDate] = useState<Date >(new Date())
    const [customToDate, setCustomToDate] = useState<Date >(new Date())

    const {isOpen: isPositionOpen, onOpen: onPositionOpen, onClose: onClosePosition} = useDisclosure()
    const {isOpen: isEducOpen, onOpen: onEducOpen, onClose: onCloseEduc} = useDisclosure()
    const {isOpen: isOpenWork, onOpen: onOpenWork, onClose: onCloseWork} = useDisclosure()
    const {isOpen: isTrainingOpen, onOpen: onOpenTraining, onClose: onCloseTraining} = useDisclosure()
    const {isOpen: isDependentOpen, onOpen: onOpenDependent, onClose: onCloseDependent} = useDisclosure()
    const {isOpen: isAlertOpen, onOpen: onOpenAlert, onClose: onCloseAlert} = useDisclosure()
    const {isOpen: isSaveOpen, onOpen: onOpenSave, onClose: onCloseSave} = useDisclosure()
    const {isOpen: isImageOpen, onOpen: onOpenImage, onClose: onCloseImage} = useDisclosure()

    const [sign, setSign] = useState<string>('')
    const [previewImage, setPreviewImage] = useState<string>('')
    const [signImg, setSignImg] = useState<File[]>([])
    const [signImgPreview, setSignImgPreview] = useState<File[]>([])

    const [pfpFileName, setPfpFileName] = useState<string>('')
    const [pfpFile, setPfpFile] = useState<File[]>([])

    const [previewPfp, setPreview] = useState<string>('')
    const [previewSign, setSignPreview] = useState<string>('')

    const [isSignImage, setSignImage] = useState(false)
    const [isSignDigital, setSignDigital] = useState(false)
    const [isSignDig, setSignDig] = useState(false)
    let padRef = useRef<SignatureCanvas>(null)

    const handleGenerate= () =>{
        const url = padRef.current?.getTrimmedCanvas().toDataURL("image/png");
        if (url) {
            setSign(url);
            setSignPreview(url); // Only set if url is defined
            setSignDig(true)
        }
        onCloseImage()
        setSignImage(false)
        setSignDigital(false)
    }
    const handleClear = () =>{
        padRef.current?.clear()
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const getActor: string | null = localStorage.getItem('customToken')
                setActor(getActor)
                if(!allCompanyUsers){return}
                const company_user = allCompanyUsers.find(staff => {
                    setPreview(staff.pfp)
                    setSignPreview(staff.e_sig)
                    return params.id === staff.id
                })
                setCompanyStaff(company_user ?? initGetAllCompanyUsers)
                if(company_user){
                    if (company_user.birthDate) {
                        setCustomStartDate(new Date(company_user.birthDate));
                    } 
                }
            } catch (error) {
                console.error('Error getting employee record:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [params.id, allCompanyUsers])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target
        setCompanyStaff(prev => ({
            ...prev,
            [id]: value
        }))
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {id, value} = e.target
        setCompanyStaff(prev => ({
            ...prev,
            [id]: value
        }))
    }

    const handleNewPosition = () => {
        setPositions(prev => [
            ...prev,
            positionArr,
        ])
        setPositionArr(initInsertPosition)
    }

    const handleNewEducation = () => {
        setEducations(prev => [
            ...prev,
            educationArr,
        ])
        setEducArr(initEducation)
        setCustomFromDate(new Date())
        setCustomToDate(new Date())
    }

    const handleNewTraining = () => {
        setTrainings(prev => [
            ...prev,
            trainingArr,
        ])
        setTrainingArr(initTrainings)
        setCustomFromDate(new Date())
        setCustomToDate(new Date())
    }

    const handleNewWork = () => {
        setWorkExp(prev => [
            ...prev,
            workArr,
        ])
        setWorkArr(initWorkExp)
        setCustomFromDate(new Date())
        setCustomToDate(new Date())
    }

    const handleNewDependents = () => {
        setDependents(prev => [
            ...prev,
            dependentArr,
        ])
        setDependentArr(initDependents)
        setCustomFromDate(new Date())
        setCustomToDate(new Date())
    }

    const SettingData = (name: string, id: string, value: string) => {
        switch(name){
            case 'positions':
                setPositionArr(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'education':
                setEducArr(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'work':
                setWorkArr(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'training':
                setTrainingArr(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'dependents':
                setDependentArr(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            default:
                break;
        }
    }

    const handleInitData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, name, value} = e.target
        SettingData(name, id, value)
    }

    const handleInitDataSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {id, name, value} = e.target
        SettingData(name, id, value) 
    }

    const handleDates = (date: Date | null, name: string, pos: 'from' | 'to' | 'info') => {
        const validDate = date ?? new Date()
        pos === 'from' ? setCustomFromDate(validDate) : setCustomToDate(validDate)
        const formattedDate = validDate.toLocaleDateString('en-CA')
        if(name === 'education'){
            setEducArr(prev => ({
                ...prev,
                inc_dates: {
                    ...prev.inc_dates,
                    [pos]: formattedDate
                }
            }))
        } else if (name === 'work_exp'){
            setWorkArr(prev => ({
                ...prev,
                inc_dates: {
                    ...prev.inc_dates,
                    [pos]: formattedDate
                }
            }))
        } else if (name === 'training'){
            setTrainingArr(prev => ({
                ...prev,
                inc_dates: {
                    ...prev.inc_dates,
                    [pos]: formattedDate
                }
            }))
        } else if (name === 'dependents') {
            setBirthDate(validDate)
            setDependentArr(prev => ({
                ...prev,
                dependent_birth_date: formattedDate
            }))
        } else if (name === 'info'){
            setCustomStartDate(validDate)
            setCompanyStaff(prev => ({
                ...prev,
                birthDate: new Date(validDate)
            }))
        }
    }

    useEffect(() => {
        // Check if all fields are filled
        const allFieldsFilled = Object.values(positionArr).every(value => {
            if (typeof value === 'string') {
                return value.trim() !== ''
            }
            if (typeof value === 'number') {
                return value !== 0
            }
            return false // Add other type checks as needed
        })
        setFields(!allFieldsFilled) // Set isEmpty to false if all fields are filled
    }, [positionArr])

    const handleInsertData = (pos: string) => {
        try{
            setLoading(true)
            let user_object: Record<string, any> = {}
            let key : string = ''
            let existingData

            switch(pos){
                case 'edu':
                    user_object = {...company_staff.educational_attainment}
                    key = 'educational_attainment'
                    existingData = { ...company_staff.educational_attainment }
                    break;
                case 'dependent':
                    user_object = {...company_staff.dependents}
                    key = 'dependents'
                    existingData = { ...company_staff.dependents }
                    break;
                case 'work_exp':
                    user_object = {...company_staff.work_exp}
                    key = pos
                    existingData = { ...company_staff.work_exp }
                    break;
                case 'training_history':
                    user_object = {...company_staff.training_history}
                    key = pos
                    existingData = { ...company_staff.training_history }
                    break;
                case 'roles':
                    user_object = {...company_staff.roles}
                    key = pos
                    existingData = { ...company_staff.roles }
                    break;
                default:
                    break;
            }
            const existingKeys = Object.keys(user_object)
            const existingCount = existingKeys.length
            let startingIndex = 1
            if (existingCount > 0) {
                startingIndex = existingCount + 1
            }
            const newObj: Record<string, any> = { ...existingData }// Convert positions array to a roles object
            if(pos === 'roles'){
                positions.forEach((position, index) => {
                    newObj[`${pos}_${startingIndex + index}`] = position
                })
            } else if (pos === 'training_history'){
                trainings.forEach((training, index) => {
                    newObj[`${pos}_${startingIndex + index}`] = training
                })
            } else if (pos === 'work_exp'){
                workExp.forEach((exp, index) => {
                    newObj[`${pos}_${startingIndex + index}`] = exp
                })
            } else if (pos === 'edu'){
                educations.forEach((education, index) => {
                    newObj[`${pos}_${startingIndex + index}`] = education
                })
            } else if (pos === 'dependent'){
                dependents.forEach((dependent, index) => {
                    newObj[`${pos}_${startingIndex + index}`] = dependent
                })
            }
            setCompanyStaff(prev => ({ // Update company_staff state with the new roles object
                ...prev,
                [key]: newObj
            }))
            switch(pos){
                case 'edu':
                    setEducations([])
                    onCloseEduc()
                    break;
                case 'dependent':
                    setDependents([])
                    onCloseDependent()
                    break;
                case 'work_exp':
                    setWorkExp([])
                    onCloseWork()
                    break;
                case 'training_history':
                    setTrainings([])
                    onCloseTraining()
                    break;
                case 'roles':
                    setPositions([])
                    onClosePosition()
                    break;
                default:
                    break;
            }
        }catch(error){
            throw error
        }finally{
            setLoading(false)
        }
    }

    const handleArrayState = (pos: string) => {
        switch(pos){
            case 'edu':
                setEducArr(initEducation)
                setEducations([])
                onCloseEduc()
                break;
            case 'training':
                setTrainingArr(initTrainings)
                setTrainings([])
                onCloseTraining()
                break;
            case 'work':
                setWorkArr(initWorkExp)
                setWorkExp([])
                onCloseWork()
                break;
            case 'dependent':
                setDependentArr(initDependents)
                setDependents([])
                onCloseDependent()
                break;
            case 'roles':
                setPositionArr(initInsertPosition)
                setPositions([])
                onClosePosition()
                break;
            default:
                break;
        }
    }

    const handleClose = (pos: string) => {
        const arrSize: number = pos === 'edu' ? educations.length : pos === 'training' ? trainings.length : pos === 'work' ? workExp.length : pos === 'dependent' ? dependents.length : pos === 'roles' ? positions.length : 0
        if(arrSize > 0){
            onOpenAlert()
            setArr(pos)
        } else {
            handleArrayState(pos)
        }
    }

    const handleCloseSpecifiedArr = () => {
        handleArrayState(arr)
        onCloseAlert()
    }

    const handleSaveData = async () => {
        setLoading(true)
        onCloseSave()
        new Promise<void>((resolve, reject) => {
            setTimeout(async () => {
                try {
                    await editStaffDetails(company_staff.id, 'Candidate Profile has been updated.', actor, company_staff, company_staff.user_code, sign, signImg, isSignDig, pfpFileName, pfpFile)
                    resolve()
                } catch (error) {
                    reject(error)
                }
            }, 2000) // Adjust the delay time (4000ms = 4 seconds) as needed
        })
        .then(() => {
            toast({
                title: `Candidate Information has been updated successfully by ${actor}`,
                position: 'top-right',
                variant: 'left-accent',
                status: 'success',
            })
        })
        .catch((error) => {
            console.error(error)
        })
        .finally(() => {
            setLoading(false)
            router.push('/enterprise-portal/admin/candidates')
        })
    }

    const handlePfpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files
        if (file && file.length > 0) {
            const proof = file[0];
            setPfpFile(Array.from(file))

            const objectUrl = URL.createObjectURL(proof)
            setPfpFileName(objectUrl)
            setPreview(objectUrl)
            setSignDig(false)
        } else {
            setPfpFileName('')
        }
    }

    const handleSignFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files
        if (file && file.length > 0) {
            const signImage = file[0];
            setSignImgPreview(Array.from(file))

            const objectUrl = URL.createObjectURL(signImage)
            setPreviewImage(objectUrl)
        } else {
            setPreviewImage('')
        }
    }

    const handleTransferImage = () => {
        setSign(previewImage)
        setSignImg(signImgPreview)
        setSignPreview(previewImage)
        onCloseImage()
        setSignImage(false)
        setSignDigital(false)
    }
    const handledeleteObject = (keyVal: string, key: string) => {
        let updatedRoles: Record<string, any>  = {}
        switch(key){
            case 'roles':
                updatedRoles = { ...company_staff.roles }
                break;
            case 'training_history':
                updatedRoles = { ...company_staff.training_history }
                break;
            case 'dependents':
                updatedRoles = { ...company_staff.dependents }
                break;
            case 'work_exp':
                updatedRoles = { ...company_staff.work_exp }
                break;
            case 'educational_attainment':
                updatedRoles = { ...company_staff.educational_attainment }
                break;
            default:
                break;
        }
        delete updatedRoles[keyVal]
        setCompanyStaff(prev => ({
            ...prev,
            [key]: updatedRoles
        }))
    }

    return(
        <>
        <main className='flex flex-col p-6 space-y-5 py-0 h-full'>
            <Box className='flex items-center justify-between'>
                <Heading as='h4' size='md' color='#a1a1a1'>Candidate Details</Heading>
                <Button colorScheme='blue' isLoading={loading} loadingText='Saving...' onClick={onOpenSave} >Save Details</Button>
            </Box>
            <form className='flex space-x-5'>
                { company_staff && 
                (<section className='p-5 w-auto flex flex-col space-y-5 h-fit rounded border border-gray-300' style={{maxWidth: '240px'}}>
                    <Box className='flex flex-col justify-end space-y-5'>
                        <Box className='w-full items-end mb-2 flex flex-col'>
                            <p style={{fontSize: '9px', color: '#a1a1a1'}}>Candidate Added:</p>
                            <p style={{fontSize: '11px'}}>{formatDateWithDay(company_staff.candidate_added.toDate())}</p>
                        </Box>
                        <Box className='drop-shadow-xl items-center justify-center flex-col flex' style={{width: '200px', height: '130px'}}>
                            <Box w='100%' className='flex items-end justify-end'>
                                <Button size='sm' variant='ghost' onClick={() => fileInputRef.current?.click()}><EditIcon size='20' color='#a1a1a1' /></Button>
                                <input ref={fileInputRef} onChange={handlePfpFileChange}  type='file' accept='image/png, image/jpeg' style={{display: 'none'}} />
                            </Box>
                            <Avatar className='drop-shadow-lg' size='2xl' name={company_staff.full_name} src={previewPfp} />
                        </Box>
                        <Box >
                            <Box className='w-100 h-auto relative' style={{ minWidth: '50px', minHeight: '65px' }}>
                                <div className="w-full h-full overflow-hidden">
                                    <Image src={previewSign} layout="fill" objectFit="cover" alt='e-sign' />
                                </div>
                            </Box>
                            <Center className='border-t pt-2 flex border-gray-400'>
                                <Text >E-Signature</Text>
                                <Button ms={2} size='sm' onClick={onOpenImage}  variant='ghost'><EditIcon size='20' color='#a1a1a1' /></Button>
                            </Center>
                        </Box>
                        
                        <Box className='flex flex-col justify-between space-y-5'>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >User Code:</Text>
                                <FormControl>
                                    <Input id='user_code' onChange={handleChange} variant='unstyled' value={company_staff.user_code} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Employee ID:</Text>
                                <FormControl>
                                    <Input id='employee_id' onChange={handleChange} variant='unstyled' value={company_staff.employee_id} />
                                </FormControl>
                            </Box>

                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Name:</Text>
                                <FormControl>
                                    <Input id='full_name' onChange={handleChange} variant='unstyled' value={company_staff.full_name} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Contact:</Text>
                                <FormControl>
                                    <Input id='phone' onChange={handleChange} variant='unstyled' value={company_staff.phone} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Email:</Text>
                                <FormControl>
                                    <Input id='email' onChange={handleChange} variant='unstyled' value={company_staff.email} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Gender:</Text>
                                <Select id='gender' onChange={handleSelectChange} variant='unstyled' textTransform='capitalize' defaultValue={company_staff.gender}>
                                    <option value='male' label='Male' />
                                    <option value='female' label='Female' />
                                </Select>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Date of Birth:</Text>
                                <FormControl >
                                    <DatePicker showPopperArrow={false} selected={customStartDate} onChange={(date) => handleDates(date, 'info', 'info')} dateFormat="E, MMM dd yyy"
                                        customInput={
                                            <Input variant='unstyled' id='birthDate' className=' p-3' type='text' placeholder='' value={formatDateWithDay(company_staff.birthDate)} />
                                        }
                                    />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Age:</Text>
                                <FormControl>
                                    <Input variant='unstyled' id='age' onChange={(e) => {
                                        const age = Number(e.target.value) // Remove 'yrs. old' from the input value
                                        setCompanyStaff(prev => ({ 
                                            ...prev, 
                                            age 
                                        }));
                                    }}  value={company_staff.age} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Place of Birth:</Text>
                                <FormControl>
                                    <Input id='birthPlace' onChange={handleChange} variant='unstyled' value={company_staff.birthPlace} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Marital Status:</Text>
                                <Select id='status' onChange={handleSelectChange} variant='unstyled' textTransform='capitalize' defaultValue={company_staff.status}>
                                    <option value='single' label='Single' />
                                    <option value='married' label='Married' />
                                    <option value='widowed' label='Widowed' />
                                </Select>
                            </Box>

                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Residential Address:</Text>
                                <FormControl>
                                    <Input id='address' onChange={handleChange} variant='unstyled' value={company_staff.address} />
                                </FormControl>
                            </Box>
                            {company_staff.province && (
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1'>Provincial Address:</Text>
                                    <FormControl>
                                        <Input id='province' onChange={handleChange} variant='unstyled' value={company_staff.province} />
                                    </FormControl>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </section>)}
                {company_staff && 
                (<section className='p-5 w-full flex flex-col space-y-8 border rounded border-gray-300'>
                    <Box className='flex justify-between flex-col space-y-5 '>
                        <Box className='flex justify-between items-center  w-full'>
                            <Box className='flex space-x-2  items-start w-full'>
                                <WorkIcon size='24' color='#a1a1a1' />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Position Details`}</Heading>
                            </Box>
                            <Button onClick={onPositionOpen} size='sm' variant='ghost' colorScheme='blue'>Insert Position</Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Employee Type</span></Th>
                                        <Th><span className='text-xs font-medium'>Employee Category</span></Th>
                                        <Th><span className='text-xs font-medium'>Position</span></Th>
                                        <Th><span className='text-xs font-medium'>Department</span></Th>
                                        <Th><span className='text-xs font-medium'>Rank</span></Th>
                                        <Th><span className='text-xs font-medium'>Action</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(company_staff.roles).map(([key, role]) => (
                                    <Tr key={key}>
                                        <Td>{role.emp_type}</Td>
                                        <Td>{role.emp_cat}</Td>
                                        <Td>{role.job_position}</Td>
                                        <Td>{role.department}</Td>
                                        <Td>{role.rank}</Td>
                                        <Td>
                                            <Button colorScheme="red" size='sm' variant='ghost' onClick={() => handledeleteObject(key, 'roles')}>
                                                <TrashIcon color='red' size={'22'} />
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box className='flex flex-col space-y-3'>
                        <Box className='flex space-x-2  items-start w-full'>
                            <GovtIcon size='24' color='#a1a1a1' />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Government Issued ID's`}</Heading>
                        </Box>
                        <Box className='flex justify-between space-x-5'>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >SSS:</Text>
                                <FormControl>
                                    <Input id='sss' onChange={handleChange} variant='unstyled' value={company_staff.sss} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >HDMF:</Text>
                                <FormControl>
                                    <Input id='hdmf' onChange={handleChange} variant='unstyled' value={company_staff.hdmf} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Tin:</Text>
                                <FormControl>
                                    <Input id='tin' onChange={handleChange} variant='unstyled' value={company_staff.tin} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >PhilHealth:</Text>
                                <FormControl>
                                    <Input id='philhealth' onChange={handleChange} variant='unstyled' value={company_staff.philhealth} />
                                </FormControl>
                            </Box>
                        </Box>
                    </Box>
                    <Box className='flex flex-col space-y-3'>
                        <Box className='flex space-x-2  items-start w-full'>
                            <EmergencyIcon size='24' color='#a1a1a1' />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Emergency Contact`}</Heading>
                        </Box>
                        <Box className='flex justify-between space-x-5'>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Contact Person:</Text>
                                <FormControl>
                                    <Input id='contact_person' onChange={handleChange} variant='unstyled' value={company_staff.contact_person} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Contact No.:</Text>
                                <FormControl>
                                    <Input id='emergency_contact' onChange={handleChange} variant='unstyled' value={company_staff.emergency_contact} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Relationship:</Text>
                                <FormControl>
                                    <Input id='relationship' onChange={handleChange} variant='unstyled' value={company_staff.relationship} />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Address:</Text>
                                <FormControl>
                                    <Input id='contact_address' onChange={handleChange} variant='unstyled' value={company_staff.contact_address} />
                                </FormControl>
                            </Box>
                        </Box>
                    </Box>
                    <Box className='flex justify-between flex-col space-y-5 '>
                        <Box className='flex justify-between items-center w-full'>
                            <Box className='flex space-x-2  items-start w-full'>
                                <EducIcon size='24' color='#a1a1a1'/>
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Educational Attainent`}</Heading>
                            </Box>
                            <Button onClick={onEducOpen} size='sm' variant='ghost' colorScheme='blue'>Insert School</Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Educational Attainment</span></Th>
                                        <Th><span className='text-xs font-medium'>School/University</span></Th>
                                        <Th><span className='text-xs font-medium'>Degree</span></Th>
                                        <Th><span className='text-xs font-medium'>Inclusive Dates</span></Th>
                                        <Th><span className='text-xs font-medium'>Action</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(company_staff.educational_attainment).map(([key, attain]) => (
                                    <Tr key={key}>
                                        <Td>{attain.attainment}</Td>
                                        <Td>{attain.school}</Td>
                                        <Td>{attain.degree}</Td>
                                        <Td> {`${formatDateWithDayToWords(attain.inc_dates.from)} to ${formatDateWithDayToWords(attain.inc_dates.to)}`} </Td>
                                        <Td>
                                            <Button colorScheme="red" size='sm' variant='ghost' onClick={() => handledeleteObject(key, 'educational_attainment')}>
                                                <TrashIcon color='red' size={'22'} />
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box className='flex justify-between flex-col space-y-5 '>
                        <Box className='flex justify-between items-center w-full'>
                            <Box className='flex space-x-2  items-start w-full'>
                                <WorkIcon size='24' color='#a1a1a1' />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Work Experience`}</Heading>
                            </Box>
                            <Button onClick={onOpenWork} size='sm' variant='ghost' colorScheme='blue'>Insert Work Exp.</Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Company</span></Th>
                                        <Th><span className='text-xs font-medium'>Address</span></Th>
                                        <Th><span className='text-xs font-medium'>Position</span></Th>
                                        <Th><span className='text-xs font-medium'>Status</span></Th>
                                        <Th><span className='text-xs font-medium'>Reason for Leave</span></Th>
                                        <Th><span className='text-xs font-medium'>Inclusive Dates</span></Th>
                                        <Th><span className='text-xs font-medium'>Action</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(company_staff.work_exp).map(([key, exp]) => (
                                    <Tr key={key}>
                                        <Td>{exp.company}</Td>
                                        <Td>{exp.company_address}</Td>
                                        <Td>{exp.position}</Td>
                                        <Td>{exp.stats}</Td>
                                        <Td>{exp.reason_leave}</Td>
                                        <Td> 
                                            <Tooltip label={`${ formatDateToWords(exp.inc_dates.from)} to ${formatDateToWords(exp.inc_dates.to)}`}>
                                                <span style={{display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '90%'}}>
                                                {`${formatDateToWords(exp.inc_dates.from)} to ${formatDateToWords(exp.inc_dates.to)}`} 
                                                </span>
                                            </Tooltip>
                                        </Td>
                                        <Td>
                                            <Button colorScheme="red" size='sm' variant='ghost' onClick={() => handledeleteObject(key, 'work_exp')}>
                                                <TrashIcon color='red' size={'22'} />
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box className='flex justify-between flex-col space-y-5 '>
                        <Box className='flex justify-between items-center w-full'>
                            <Box className='flex space-x-2  items-start w-full'>
                                <HistoryIcon size='24' color='#a1a1a1' />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Training History`}</Heading>
                            </Box>
                            <Button onClick={onOpenTraining} size='sm' variant='ghost' colorScheme='blue'>Insert Training</Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Title</span></Th>
                                        <Th><span className='text-xs font-medium'>Provider</span></Th>
                                        <Th><span className='text-xs font-medium'>Inclusive Dates</span></Th>
                                        <Th><span className='text-xs font-medium'>Action</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(company_staff.training_history).map(([key, history]) => (
                                    <Tr key={key}>
                                        <Td>{history.training_title}</Td>
                                        <Td>{history.training_provider}</Td>
                                        <Td> {`${formatDateWithDayToWords(history.inc_dates.from)} to ${formatDateWithDayToWords(history.inc_dates.to)}`} </Td>
                                        <Td>
                                            <Button colorScheme="red" size='sm' variant='ghost' onClick={() => handledeleteObject(key, 'training_history')}>
                                                <TrashIcon color='red' size={'22'} />
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box className='flex justify-between flex-col space-y-5 '>
                        <Box className='flex justify-between items-center w-full'>
                            <Box className='flex space-x-2  items-start w-full'>
                                <FamilyIcon size='24' color='#a1a1a1' />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Immediate Dependent's`}</Heading>
                            </Box>
                            <Button onClick={onOpenDependent} size='sm' variant='ghost' colorScheme='blue'>Insert Dependent</Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Immediate Dependent</span></Th>
                                        <Th><span className='text-xs font-medium'>Relationship</span></Th>
                                        <Th><span className='text-xs font-medium'>Gender</span></Th>
                                        <Th><span className='text-xs font-medium'>Date of Birth</span></Th>
                                        <Th><span className='text-xs font-medium'>Action</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(company_staff.dependents).map(([key, dependent]) => (
                                    <Tr key={key}>
                                        <Td>{dependent.name}</Td>
                                        <Td>{dependent.dependent_relationship}</Td>
                                        <Td>{dependent.dependent_gender}</Td>
                                        <Td>{formatDateWithDayToWords(dependent.dependent_birth_date)}</Td>
                                        <Td>
                                            <Button colorScheme="red" size='sm' variant='ghost' onClick={() => handledeleteObject(key, 'dependents')}>
                                                <TrashIcon color='red' size={'22'} />
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                </section>)}
            </form>
        </main>
        <Drawer size='xl' placement='right' isOpen={isPositionOpen} onClose={() => handleArrayState('roles')} >
            <DrawerOverlay />
            <DrawerContent px={6}>
                <DrawerHeader><span className='text-sky-600 font-semibold'>Insert New Position Details</span></DrawerHeader>
                <DrawerBody>
                    <form className='space-y-3'>
                        <Box className='flex items-end space-x-4'>
                            <Select id='emp_type' size='sm' name='positions' value={positionArr.emp_type} onChange={handleInitDataSelect} placeholder='Select Employee Type'>
                                <option label='Full Time' value='Full Time' />
                                <option label='Part Time' value='Part Time' />
                                <option label='Internship' value='Internship' />
                            </Select>
                            <FormControl>
                                <Input id='job_position' name='positions' value={positionArr.job_position} placeholder='Position' onChange={handleInitData} variant='flushed'  />
                            </FormControl>
                            <FormControl>
                                <Input id='rank' name='positions' type='number' value={positionArr.rank === 0 ? 'Rank' : positionArr.rank} placeholder={'Rank'} onChange={(e) => setPositionArr(prev => ({ ...prev, rank: Number(e.target.value)}))} variant='flushed'  />
                            </FormControl>
                        </Box>
                        <Box className='flex space-x-4'>
                            <Select id='emp_cat' name='positions' size='sm' value={positionArr.emp_cat} onChange={handleInitDataSelect} placeholder='Select Category'>
                                <option label='Teaching Staff' value='Teaching Staff' />
                                <option label='Non-Teaching Staff' value='Non-Teaching Staff' />
                            </Select>
                            <Select id='department' name='positions' size='sm' value={positionArr.department} onChange={handleInitDataSelect} placeholder='Select Department'>
                                <option label='Admin' value='Admin' />
                                <option label='Training' value='Training' />
                                <option label='Registration' value='Registration' />
                                <option label='Accounting' value='Accounting' />
                                <option label='Marketing' value='Marketing' />
                                <option label='System Admin' value='System Admin' />
                                <option label='R&D' value='R&D' />
                            </Select>
                            <Button isDisabled={isEmpty} onClick={handleNewPosition} w='100px' size='sm' colorScheme='blue' variant='outline'>Add</Button>
                        </Box>
                        <Box className='flex p-3 px-4 border rounded items-center w-full'>
                            <Text w='60%' textAlign='start' className='text-gray-400'>Employee Type</Text>
                            <Text w='100%' textAlign='center' className='text-gray-400'>Job Position</Text>
                            <Text w='100%' textAlign='center' className='text-gray-400'>Rank</Text>
                            <Text w='100%' textAlign='start' className='text-gray-400'>Category</Text>
                            <Text w='100%' textAlign='start' className='text-gray-400'>Department</Text>
                            <Text w='30%' className='text-gray-400'>Action</Text>
                        </Box>
                        <Box className='space-y-2 px-4'>
                            {positions.map((val, index) => (
                                <Box className='flex border-b items-center space-x-4 w-full' key={index}>
                                    <Text w='60%' textAlign='start' >{val.emp_type}</Text>
                                    <Text w='100%' textAlign='center' >{val.job_position}</Text>
                                    <Text w='100%' textAlign='center' >{val.rank}</Text>
                                    <Text w='100%' textAlign='start' >{val.emp_cat}</Text>
                                    <Text w='100%' textAlign='start' >{val.department}</Text>
                                    <Text w='30%' className='flex justify-center'>
                                        <Button variant='ghost' colorScheme='red' onClick={() => setPositions(prev => prev.filter((_, i) => i !== index))} ><TrashIcon color='red' size={'22'} /></Button>
                                    </Text>
                                </Box>
                            ))}
                        </Box>
                    </form>
                </DrawerBody>
                <DrawerFooter borderTopWidth='2px' px={'3px'}>
                    <Box className='flex justify-start w-full space-x-4'>
                        <Button w='100px' onClick={() => handleClose('roles')} colorScheme='red' variant='outline' >Cancel</Button>
                        <Button w='100px' onClick={() => {handleInsertData('roles')}} isDisabled={positions.length === 0} isLoading={loading} loadingText='Inserting...' colorScheme='blue'>Insert</Button>
                    </Box>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
        <Drawer size='xl' placement='right' isOpen={isEducOpen} onClose={() => handleArrayState('edu')} >
            <DrawerOverlay />
            <DrawerContent px={6}>
                <DrawerHeader><span className='text-sky-600 font-semibold'>Insert New Educational Attainment</span></DrawerHeader>
                <DrawerBody>
                    <form className='space-y-3'>
                        <Box className='flex items-end space-x-4'>
                            <Select id='attainment' name='education' size='sm' value={educationArr.attainment} onChange={handleInitDataSelect} placeholder='Select Educational Attainment'>
                                <option label='College' value='College' />
                                <option label='Senior Highschool' value='Senior Highschool' />
                                <option label='Junior Highschool' value='Junior Highschool' />
                                <option label='Grade School' value='Grade School' />
                            </Select>
                            <FormControl>
                                <Input id='school' name='education' value={educationArr.school} placeholder={'School'} onChange={handleInitData} variant='flushed'  />
                            </FormControl>
                            <FormControl>
                                <Input id='degree' name='education' value={educationArr.degree} placeholder={'Degree'} onChange={handleInitData} variant='flushed'  />
                            </FormControl>
                        </Box>
                        <Box className='flex items-center space-x-2'>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Inclusive Dates From:</Text>
                                <FormControl >
                                    <DatePicker showPopperArrow={false} selected={customFromDate} onChange={(date) => handleDates(date, 'education', 'from')} dateFormat="E, MMM dd yyy"
                                        customInput={
                                            <Input variant='flushed' w='100%' id='from' name='education' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customFromDate)} />
                                        }
                                    />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Inclusive Dates To:</Text>
                                <FormControl >
                                    <DatePicker showPopperArrow={false} selected={customToDate} onChange={(date) => handleDates(date, 'education', 'to')} dateFormat="E, MMM dd yyy"
                                        customInput={
                                            <Input variant='flushed' w='100%' id='to' name='education' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customToDate)} />
                                        }
                                    />
                                </FormControl>
                            </Box>
                            <Button isDisabled={educationArr.attainment === '' || educationArr.school === '' || educationArr.degree === '' || educationArr.inc_dates.from === '' || educationArr.inc_dates.to === ''} onClick={handleNewEducation} w='100px' size='sm' colorScheme='blue' variant='outline'>Add</Button>
                        </Box>
                        <Box className='flex p-3 px-4 border rounded items-center w-full'>
                            <Text w='60%' textAlign='start' className='text-gray-400'>Educ. Attainment</Text>
                            <Text w='100%' textAlign='center' className='text-gray-400'>School/University</Text>
                            <Text w='100%' textAlign='center' className='text-gray-400'>Degree</Text>
                            <Text w='100%' textAlign='start' className='text-gray-400'>Inclusive Dates</Text>
                            <Text w='30%' className='text-gray-400'>Action</Text>
                        </Box>
                        <Box className='space-y-2 px-4'>
                            {educations.map((val, index) => (
                                <Box className='flex border-b items-center space-x-4 w-full' key={index}>
                                    <Text w='60%' textAlign='start' >{val.attainment}</Text>
                                    <Text w='100%' textAlign='center' >{val.school}</Text>
                                    <Text w='100%' textAlign='center' >{val.degree}</Text>
                                    <Text w='100%' textAlign='start' >{`${formatDateToWords(val.inc_dates.from)} to ${formatDateToWords(val.inc_dates.to)}`}</Text>
                                    <Text w='30%' className='flex justify-center'>
                                        <Button variant='ghost' colorScheme='red' onClick={() => setEducations(prev => prev.filter((_, i) => i !== index))} ><TrashIcon color='red' size={'22'} /></Button>
                                    </Text>
                                </Box>
                            ))}
                        </Box>
                    </form>
                </DrawerBody>
                <DrawerFooter borderTopWidth='2px' px={'3px'}>
                    <Box className='flex justify-start w-full space-x-4'>
                        <Button w='100px' onClick={() => handleClose('edu')} colorScheme='red' variant='outline' >Cancel</Button>
                        <Button w='100px' onClick={() => {handleInsertData('edu')}} isDisabled={educations.length === 0} loadingText='Inserting...' colorScheme='blue'>Insert</Button>
                    </Box>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
        <Drawer size='xl' placement='right' isOpen={isOpenWork} onClose={() => handleArrayState('work')} >
            <DrawerOverlay />
            <DrawerContent px={6}>
                <DrawerHeader><span className='text-sky-600 font-semibold'>Insert New Work Experience</span></DrawerHeader>
                <DrawerBody>
                    <form className='space-y-3'>
                        <Box className='flex items-end space-x-4'>
                            <FormControl>
                                <Input id='company' name='work' value={workArr.company} placeholder='Company' onChange={handleInitData} variant='flushed'  />
                            </FormControl>
                            <FormControl>
                                <Input id='company_address' name='work' value={workArr.company_address} placeholder='Address' onChange={handleInitData} variant='flushed'  />
                            </FormControl>
                            <FormControl>
                                <Input id='position' name='work' value={workArr.position} placeholder={'Position'} onChange={handleInitData} variant='flushed'  />
                            </FormControl>
                        </Box>
                        <Box className='flex space-x-4'>
                            <Select id='stats' name='work' size='sm' value={workArr.stats} onChange={handleInitDataSelect} placeholder='Select Status'>
                                <option label='Full Time' value='Full Time' />
                                <option label='Part Time' value='Part Time' />
                                <option label='Internship' value='Internship' />
                            </Select>
                            <FormControl>
                                <Input id='reason_leave' name='work' value={workArr.reason_leave} placeholder={'Reason of Leave'} onChange={handleInitData} variant='flushed'  />
                            </FormControl>
                        </Box>
                        <Box className='flex items-center space-x-2'>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Inclusive Dates From:</Text>
                                <FormControl >
                                    <DatePicker showPopperArrow={false} selected={customFromDate} onChange={(date) => handleDates(date, 'work_exp', 'from')} dateFormat="E, MMM dd yyy"
                                        customInput={
                                            <Input variant='flushed' w='100%' id='from' name='work' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customFromDate)} />
                                        }
                                    />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Inclusive Dates To:</Text>
                                <FormControl >
                                    <DatePicker showPopperArrow={false} selected={customToDate} onChange={(date) => handleDates(date, 'work_exp', 'to')} dateFormat="E, MMM dd yyy"
                                        customInput={
                                            <Input variant='flushed' w='100%' id='to' name='work' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customToDate)} />
                                        }
                                    />
                                </FormControl>
                            </Box>
                            <Button isDisabled={workArr.company === '' || workArr.company_address === '' || workArr.position === '' || workArr.stats === '' || workArr.reason_leave === '' || workArr.inc_dates.from === '' || workArr.inc_dates.to === ''} onClick={handleNewWork} w='100px' size='sm' colorScheme='blue' variant='outline'>Add</Button>
                        </Box>
                        <Box className='flex p-3 px-4 border rounded items-center w-full'>
                            <Text w='60%' textAlign='start' className='text-gray-400'>Company</Text>
                            <Text w='100%' textAlign='center' className='text-gray-400'>Address</Text>
                            <Text w='100%' textAlign='center' className='text-gray-400'>Position</Text>
                            <Text w='100%' textAlign='center' className='text-gray-400'>Status</Text>
                            <Text w='100%' textAlign='start' className='text-gray-400'>Reason for Leave</Text>
                            <Text w='100%' textAlign='start' className='text-gray-400'>Inclusive Dates</Text>
                            <Text w='30%' className='text-gray-400'>Action</Text>
                        </Box>
                        <Box className='space-y-2 px-4'>
                            {workExp.map((val, index) => (
                                <Box className='flex border-b items-center space-x-4 w-full' key={index}>
                                    <Tooltip aria-label='' label={`${val.company}`}>
                                        <span style={{display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%'}}>{val.company}</span>
                                    </Tooltip>
                                    <Tooltip aria-label='' label={`${val.company_address}`}>
                                        <span style={{display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%'}}>{val.company_address}</span>
                                    </Tooltip>
                                    <Tooltip aria-label='' label={`${val.position}`}>
                                        <span style={{display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%'}}>{val.position}</span>
                                    </Tooltip>
                                    <Text w='100%' textAlign='center' >{val.stats}</Text>
                                    <Text w='100%' textAlign='start' >{val.reason_leave}</Text>
                                    <Text w='100%' textAlign='start' >{`${formatDateToWords(val.inc_dates.from)} to ${formatDateToWords(val.inc_dates.to)}`}</Text>
                                    <Text w='30%' className='flex justify-center'>
                                        <Button variant='ghost' colorScheme='red' onClick={() => setWorkExp(prev => prev.filter((_, i) => i !== index))} ><TrashIcon color='red' size={'22'} /></Button>
                                    </Text>
                                </Box>
                            ))}
                        </Box>
                    </form>
                </DrawerBody>
                <DrawerFooter borderTopWidth='2px' px={'3px'}>
                    <Box className='flex justify-start w-full space-x-4'>
                        <Button w='100px' onClick={() => handleClose('work')} colorScheme='red' variant='outline' >Cancel</Button>
                        <Button w='100px' isDisabled={workExp.length === 0} onClick={() => {handleInsertData('work_exp')}} loadingText='Inserting...' colorScheme='blue'>Insert</Button>
                    </Box>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
        <Drawer size='xl' placement='right' isOpen={isTrainingOpen} onClose={() => handleArrayState('training')} >
            <DrawerOverlay />
            <DrawerContent px={6}>
                <DrawerHeader><span className='text-sky-600 font-semibold'>Insert New Training History</span></DrawerHeader>
                <DrawerBody>
                    <form className='space-y-3'>
                        <Box className='flex items-end space-x-4'>
                            <FormControl>
                                <Input id='training_title' name='training' value={trainingArr.training_title} placeholder='Training Title' onChange={handleInitData} variant='flushed'  />
                            </FormControl>
                            <FormControl>
                                <Input id='training_provider' name='training' value={trainingArr.training_provider} placeholder={'Training Provider'} onChange={handleInitData} variant='flushed'  />
                            </FormControl>
                        </Box>
                        <Box className='flex items-center space-x-2'>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Inclusive Dates From:</Text>
                                <FormControl >
                                    <DatePicker showPopperArrow={false} selected={customFromDate} onChange={(date) => handleDates(date, 'training', 'from')} dateFormat="E, MMM dd yyy"
                                        customInput={
                                            <Input variant='flushed' w='100%' id='from' name='training' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customFromDate)} />
                                        }
                                    />
                                </FormControl>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Inclusive Dates To:</Text>
                                <FormControl >
                                    <DatePicker showPopperArrow={false} selected={customToDate} onChange={(date) => handleDates(date, 'training', 'to')} dateFormat="E, MMM dd yyy"
                                        customInput={
                                            <Input variant='flushed' w='100%' id='to' name='training' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customToDate)} />
                                        }
                                    />
                                </FormControl>
                            </Box>
                            <Button isDisabled={trainingArr.training_title === '' || trainingArr.training_provider === '' || trainingArr.inc_dates.from === '' || trainingArr.inc_dates.to === ''} onClick={handleNewTraining} w='100px' size='sm' colorScheme='blue' variant='outline'>Add</Button>
                        </Box>
                        <Box className='flex p-3 px-4 border rounded items-center w-full'>
                            <Text w='60%' textAlign='start' className='text-gray-400'>Training Title</Text>
                            <Text w='100%' textAlign='center' className='text-gray-400'>Training Provider</Text>
                            <Text w='100%' textAlign='center' className='text-gray-400'>Inclusive Dates</Text>
                            <Text w='30%' className='text-gray-400'>Action</Text>
                        </Box>
                        <Box className='space-y-2 px-4'>
                            {trainings.map((val, index) => (
                                <Box className='flex border-b items-center space-x-4 w-full' key={index}>
                                    <Text w='60%' textAlign='start' >{val.training_title}</Text>
                                    <Text w='100%' textAlign='center' >{val.training_provider}</Text>
                                    <Text w='100%' textAlign='start' >{`${formatDateToWords(val.inc_dates.from)} to ${formatDateToWords(val.inc_dates.to)}`}</Text>
                                    <Text w='30%' className='flex justify-center'>
                                        <Button variant='ghost' colorScheme='red' onClick={() => setTrainings(prev => prev.filter((_, i) => i !== index))} ><TrashIcon color='red' size={'22'} /></Button>
                                    </Text>
                                </Box>
                            ))}
                        </Box>
                    </form>
                </DrawerBody>
                <DrawerFooter borderTopWidth='2px' px={'3px'}>
                    <Box className='flex justify-start w-full space-x-4'>
                        <Button w='100px' onClick={() => handleClose('training')} colorScheme='red' variant='outline' >Cancel</Button>
                        <Button w='100px' isDisabled={trainings.length === 0} onClick={() => {handleInsertData('training_history')}} loadingText='Inserting...' colorScheme='blue'>Insert</Button>
                    </Box>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
        <Drawer size='xl' placement='right' isOpen={isDependentOpen} onClose={() => handleArrayState('dependent')} >
            <DrawerOverlay />
            <DrawerContent px={6}>
                <DrawerHeader><span className='text-sky-600 font-semibold'>Insert New Immediate Dependent</span></DrawerHeader>
                <DrawerBody>
                    <form className='space-y-3'>
                        <Box className='flex items-end space-x-4'>
                            <FormControl>
                                <Input id='name' name='dependents' value={dependentArr.name} placeholder='Dependent Name' onChange={handleInitData} variant='flushed'  />
                            </FormControl>
                            <FormControl>
                                <Input id='dependent_relationship' name='dependents' value={dependentArr.dependent_relationship} placeholder={'Relationship'} onChange={handleInitData} variant='flushed'  />
                            </FormControl>
                        </Box>
                        <Box className='flex items-end space-x-4'>
                            <Select id='dependent_gender' name='dependents' size='sm' value={dependentArr.dependent_gender} onChange={handleInitDataSelect} placeholder='Select Gender'>
                                <option label='Male' value='Male' />
                                <option label='Female' value='Female' />
                            </Select>
                            <Box className='w-full justify-center items-center flex '>
                                <Text fontSize='xs' w='30%' color='#a1a1a1' >Birth Date:</Text>
                                <FormControl >
                                    <DatePicker showPopperArrow={false} selected={customBirthDate} onChange={(date) => handleDates(date, 'dependents', 'to')} dateFormat="E, MMM dd yyy"
                                        customInput={
                                            <Input variant='flushed' w='100%' id='dependent_birth_date' name='dependents' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customBirthDate)} />
                                        }
                                    />
                                </FormControl>
                            </Box>
                            <Button isDisabled={dependentArr.name === '' || dependentArr.dependent_relationship === '' || dependentArr.dependent_gender === '' || dependentArr.dependent_birth_date === ''} onClick={handleNewDependents} w='100px' size='sm' colorScheme='blue' variant='outline'>Add</Button>
                        </Box>
                        <Box className='flex p-3 px-4 border rounded items-center w-full'>
                            <Text w='60%' textAlign='start' className='text-gray-400'>Dependent</Text>
                            <Text w='100%' textAlign='center' className='text-gray-400'>Relationship</Text>
                            <Text w='100%' textAlign='center' className='text-gray-400'>Gender</Text>
                            <Text w='100%' textAlign='start' className='text-gray-400'>Birth Date</Text>
                            <Text w='30%' className='text-gray-400'>Action</Text>
                        </Box>
                        <Box className='space-y-2 px-4'>
                            {dependents.map((val, index) => (
                                <Box className='flex border-b items-center space-x-4 w-full' key={index}>
                                    <Text w='60%' textAlign='start' >{val.name}</Text>
                                    <Text w='100%' textAlign='center' >{val.dependent_relationship}</Text>
                                    <Text w='100%' textAlign='center' >{val.dependent_gender}</Text>
                                    <Text w='100%' textAlign='start' >{formatDateWithDayToWords(val.dependent_birth_date)}</Text>
                                    <Text w='30%' className='flex justify-center'>
                                        <Button variant='ghost' colorScheme='red' onClick={() => setDependents(prev => prev.filter((_, i) => i !== index))} ><TrashIcon color='red' size={'22'} /></Button>
                                    </Text>
                                </Box>
                            ))}
                        </Box>
                    </form>
                </DrawerBody>
                <DrawerFooter borderTopWidth='2px' px={'3px'}>
                    <Box className='flex justify-start w-full space-x-4'>
                        <Button w='100px' onClick={() => handleClose('dependent')} colorScheme='red' variant='outline' >Cancel</Button>
                        <Button w='100px' isDisabled={dependents.length === 0} onClick={() => {handleInsertData('dependent')}} loadingText='Inserting...' colorScheme='blue'>Insert</Button>
                    </Box>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
        <Modal isOpen={isAlertOpen} onClose={onCloseAlert}>
            <ModalOverlay />
            <ModalContent px={4}>
                <ModalHeader w='100%'>
                    <Box className='w-full flex items-center justify-center'>
                        <QueryIcon size={'128px'} color={'#0D70AB'} />
                    </Box>
                </ModalHeader>
                <ModalBody pb={6} px={8} textAlign='center' fontSize='3xl'>Are you sure? Data will not be saved...</ModalBody>
                <ModalFooter borderTopWidth='2px' >
                    <Button w='80px' mr={3}  variant='outline' colorScheme='red' onClick={onCloseAlert} >Cancel</Button>
                    <Button w='120px' colorScheme='blue' onClick={handleCloseSpecifiedArr}>{`Yes, I'm sure!`}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        <Modal isOpen={isImageOpen} size='xl' scrollBehavior='inside' onClose={onCloseImage}>
            <ModalOverlay />
            <ModalContent px={4}>
                <ModalHeader w='100%'> {`Change E-Signature`} </ModalHeader>
                <ModalBody>
                    <Box className='space-y-4'>
                        <Text fontSize='md'>Upload digital signature or upload an image file of your writen signature.</Text>
                        <Box className='flex flex-col w-full items-center'>
                            <Button isDisabled={isSignImage} borderRadius='base' bg='#1C437E' _hover={{ bg: 'blue.600' }} fontSize='xs' color='white' className='w-3/4 space-x-2' onClick={() => {setSignDigital(true); handleClear()}}>
                                <SignIcon size={'24'}/>
                                <span>Create E-Signature</span>
                            </Button>
                            <Text py='2px' fontSize='lg'>or</Text>
                            <label>Please attach your written signature here. <span className='italic' style={{fontSize: '9px'}}>(Note: photo must be clear.)</span></label>
                            <Button borderRadius='base' isDisabled={isSignDigital} onClick={() => {signInputRef.current?.click(); setSignImage(true); }} bg='#1C437E' _hover={{ bg: 'blue.600' }} fontSize='xs' color='white' className='w-3/4 ' >Upload Image</Button>
                            <input ref={signInputRef} type='file' onChange={handleSignFileChange} style={{display: 'none'}} accept='.png, .jpg' />
                        </Box>
                        {isSignDigital && (
                            <Box className='border rounded border-black' style={{ width: '100%' }}>
                                <SignatureCanvas 
                                    canvasProps={{ width: 460, height: 200, className: 'sigCanvas' }} 
                                    ref={padRef} 
                                />
                            </Box>
                        )}
                        {isSignImage && previewImage && (
                            <Box className='w-100 h-auto relative' style={{ minWidth: '50px', minHeight: '150px' }}>
                                <div className='w-full h-full overflow-hidden'>
                                    <Image src={previewImage} layout='fill' objectFit='cover' alt='user-pfp' />
                                </div>
                            </Box>
                        )}
                    </Box>
                </ModalBody>
                <ModalFooter borderTopWidth='2px' >
                    <Button w='80px' mr={3} variant='outline' colorScheme='red' onClick={() => {onCloseImage(); handleClear(); setPreviewImage(''); setSignImage(false); setSignDigital(false); }} >Cancel</Button>
                    {isSignImage && (
                        <Button w='120px' colorScheme='green' onClick={handleTransferImage} >{`Save Changes`}</Button>
                    )}
                    {isSignDigital && (
                    <>
                        <Button w='80px' colorScheme='blue' onClick={handleClear} mr={3} variant='outline' >{`Redo`}</Button>
                        <Button w='120px' colorScheme='green' onClick={handleGenerate}>{`Save Changes`}</Button>
                    </>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
        <Modal isOpen={isSaveOpen} onClose={onCloseSave}>
            <ModalOverlay />
            <ModalContent px={4}>
                <ModalHeader w='100%'>
                    <Box className='w-full flex items-center justify-center'>
                        <QueryIcon size={'128px'} color={'#0D70AB'} />
                    </Box>
                </ModalHeader>
                <ModalBody pb={6} px={8} textAlign='center' fontSize='3xl'>Are you sure all details are correct? Changes will be saved.</ModalBody>
                <ModalFooter borderTopWidth='2px' >
                    <Button w='80px' mr={3}  variant='outline' colorScheme='red' onClick={onCloseSave} >Cancel</Button>
                    <Button w='120px' colorScheme='blue' onClick={handleSaveData}>{`Yes, I'm sure!`}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}