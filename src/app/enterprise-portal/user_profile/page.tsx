'use client'
// react components
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react';
// CSS library
import { Input, InputGroup, InputLeftAddon, useToast, FormControl, FormHelperText, FormLabel, Select, Radio, RadioGroup, VStack, Box, Button, Heading, Text, Circle, useDisclosure, Tooltip, Avatar, TableContainer, Table, Th, Thead, Tbody, Tr, Td,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css'
import DatePicker from 'react-datepicker'
import SignatureCanvas from 'react-signature-canvas'
//Components
import { SignIcon, EducIcon, FamilyIcon, GovtIcon, HistoryIcon, WorkIcon, ArrowBack, UserIcon, EmergencyIcon,} from '@/Components/SideIcons'
import { UserInfo, EditIcon, UploadIcon, TrashIcon} from '@/Components/Icons'
import { useCompanyUsers } from '@/context/CompanyUserContext'
//types
import { formatDate, calculateAge, formatDateWithDay, formatDateToWords, ToastStatus, formatDateWithDayToWords } from '@/types/handling'
import { GetAllCompanyUsers, initGetAllCompanyUsers, initPersonalInfo, PersonalInfo, initGovtID, GovtID, WorkExperience, initWorkExp, EducationalAttainment, initEducation, TrainingHistory, initTrainings, ImmediateDependents, initDependents } from '@/types/company_users'
// lib
import { editStaffDetails, reqToUpdateData } from '@/lib/company_user_controller'

export default function Page(){
    const toast = useToast()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const signInputRef = useRef<HTMLInputElement | null>(null)

    const {data: allCompanyUsers} = useCompanyUsers()

    const [company_staff, setCompanyStaff] = useState<GetAllCompanyUsers>(initGetAllCompanyUsers)
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(initPersonalInfo)
    const [govtID, setGovtID] = useState<GovtID>(initGovtID)

    const [work, setWork] = useState<WorkExperience>(initWorkExp)
    const [workArr, setWorkArr] = useState<WorkExperience[]>([])

    const [edu, setEdu] = useState<EducationalAttainment>(initEducation)
    const [eduArr, setEduArr] = useState<EducationalAttainment[]>([])

    const [training, setTraining] = useState<TrainingHistory>(initTrainings)
    const [trainingArr, setTrainingArr] = useState<TrainingHistory[]>([])

    const [dependent, setDependent] = useState<ImmediateDependents>(initDependents)
    const [dependentArr, setDependentArr] = useState<ImmediateDependents[]>([])
    
    const [loading, setLoading] = useState<boolean>(true)
    const [actor, setActor] = useState<string | null>('')
    const [showFeature, setShowFeature] = useState<string>('opt')
    const [animateOpt, setAnimateOpt] = useState<string>('Choose which to update:')
    const [hiddenClass, setHiddenClass] = useState<string>('opt')
    const [iconIndex, setIconIndex] = useState<number>(0)
    
    const [customBirthDate, setBirthDate] = useState<Date >(new Date())
    const [customFromDate, setCustomFromDate] = useState<Date >(new Date())
    const [customToDate, setCustomToDate] = useState<Date >(new Date())
    
    const [signImg, setSignImg] = useState<File[]>([]) // for file type values
    const [previewSign, setPreviewSign] = useState<string>('') // for string type values and to preview image attachments
    const [pfpFile, setPfpFile] = useState<File[]>([]) // for file type values
    const [previewPfp, setPreviewPfp] = useState<string>('') // for string type values and to preview image attachments

    const [isSignDigital, setSignDigital] = useState(false)
    const [isSignDig, setSignDig] = useState(false)
    let padRef = useRef<SignatureCanvas>(null) 

    const {isOpen, onOpen, onClose} = useDisclosure()

    const features = ['Personal Information', 'Government ID', 'Educational Attainment', 'Work Exp.', 'Training History', 'Dependents']
    const icons = [<UserIcon key='user' color={'#444'} size={'28'} />, <GovtIcon key='govt' color={'#444'} size={'28'} />, <EducIcon key='educ' color={'#444'} size={'28'} />, <WorkIcon key='work2' color={'#444'} size={'28'} />, <HistoryIcon key='history' color={'#444'} size={'28'} />, <FamilyIcon key='family' color={'#444'} size={'28'} />]

    useEffect(() => {
        const fetchData = async () => {
            try {
                const getActor: string | null = localStorage.getItem('customToken')
                setActor(getActor)
                if(!allCompanyUsers){return}
                const company_staff = allCompanyUsers.find(staff => {
                    return actor === staff.full_name
                })
                setCompanyStaff(company_staff ?? initGetAllCompanyUsers)
            } catch (error) {
                console.error('Error getting employee record:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData()
    }, [allCompanyUsers, actor])

    const handleChangeFeature = (feature: string, indx: number) => {
        setShowFeature(feature)
        setAnimateOpt(feature)
        setIconIndex(indx)
        prepareDataToUpdate(feature)
        setTimeout(async () => {
            setHiddenClass(feature)
        }, 500)
    }

    const prepareDataToUpdate = (feature: string) => {
        if(!company_staff) return

        switch(feature){
            case 'Personal Information':
                const {id: ref_id, full_name, gender, birthDate, age, pfp, e_sig, status, address, phone, email, birthPlace, province, contact_person, emergency_contact, relationship, contact_address} = company_staff
                setPersonalInfo({ref_id, full_name, gender, birthDate, pfp, e_sig, age, status, address, phone, email, birthPlace, province, contact_person, emergency_contact, relationship, contact_address})
                setBirthDate(birthDate)
                break;
            case 'Government ID':
                const {sss, philhealth, hdmf, tin } = company_staff
                setGovtID({sss, philhealth, hdmf, tin})
                break;
            case 'Dependents':
                const dependentsArray: ImmediateDependents[] = []
                Object.values(company_staff.dependents).forEach(dependent => {
                    dependentsArray.push(dependent)
                })
                setDependentArr(dependentsArray)
                break;
            case 'Work Exp.':
                const worksArray: WorkExperience[] = []
                Object.values(company_staff.work_exp).forEach(work => {
                    worksArray.push(work)
                })
                setWorkArr(worksArray)
                break;
            case 'Training History':
                const trainingArray: TrainingHistory[] = []
                Object.values(company_staff.training_history).forEach(trainingData => {
                    trainingArray.push(trainingData)
                })
                setTrainingArr(trainingArray)
                break;
            case 'Educational Attainment':
                const eduArray: EducationalAttainment[] = []
                Object.values(company_staff.educational_attainment).forEach(edu => {
                    eduArray.push(edu)
                })
                setEduArr(eduArray)
                break;
            default:
                break;
        }
    }

    const handleGenerate= () =>{
        const url = padRef.current?.getTrimmedCanvas().toDataURL("image/png");
        if (url) {
            setPersonalInfo(prev => ({
                ...prev,
                e_sig: url,
            }))
            setPreviewSign(url)
        }
        setSignDigital(false)
        setSignDig(true)
    }

    const handleClear = () =>{
        padRef.current?.clear()
    }

    const handleDates = (date: Date | null, name: string, pos: 'from' | 'to' | 'info') => {
        const validDate = date ?? new Date()
        pos === 'from' ? setCustomFromDate(validDate) : setCustomToDate(validDate)
        const formattedDate = validDate.toLocaleDateString('en-CA')
        if(name === 'info'){
            const ageCalculated = calculateAge(validDate)
            setBirthDate(validDate)
            setPersonalInfo(prev => ({
                ...prev,
                age: ageCalculated,
                birthDate: validDate,
            }))
        } else if (name === 'dependents'){
            setBirthDate(validDate)
            setDependent(prev => ({
                ...prev,
                dependent_birth_date: formattedDate
            }))
        } else if (name === 'exp'){
            setWork(prev => ({
                ...prev,
                inc_dates:{
                    ...prev.inc_dates,
                    [pos]: formattedDate
                }
            }))
        } else if (name === 'training'){
            setTraining(prev => ({
                ...prev,
                inc_dates:{
                    ...prev.inc_dates,
                    [pos]: formattedDate
                }
            }))
        } else if (name === 'edu'){
            setEdu(prev => ({
                ...prev,
                inc_dates:{
                    ...prev.inc_dates,
                    [pos]: formattedDate
                }
            }))
        }
    }

    const handleChangeInfo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, name, value} = e.target
        SettingData(name, id, value)
    }

    const handleChangeInfoSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {id, name, value} = e.target
        SettingData(name, id, value)
    }

    const SettingData = (name: string, id: string, value: string) => {
        switch(name){
            case 'info':
                setPersonalInfo(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'govt_id':
                setGovtID(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'training':
                setTraining(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'dependent':
                setDependent(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'edu':
                setEdu(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'exp':
                setWork(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            default:
                break;
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const file = e.target.files
        if (file && file.length > 0) {
            const imageFile = file[0];

            const objectUrl = URL.createObjectURL(imageFile)
            if(name === 'e_sig'){
                setSignImg(Array.from(file))
                setPreviewSign(objectUrl)
                setPersonalInfo(prev => ({
                    ...prev,
                    e_sig: objectUrl
                }))
                setSignDig(false)
            } else {
                setPfpFile(Array.from(file))
                setPreviewPfp(objectUrl)
                setPersonalInfo(prev => ({
                    ...prev,
                    pfp: objectUrl
                }))
            }
        }
    }

    const handleInsert = () => {
        switch(showFeature){
            case 'Educational Attainment':
                setEduArr(prev => [
                    ...prev,
                    edu,
                ])
                setEdu(initEducation)
                break;
            case 'Work Exp.':
                setWorkArr(prev => [
                    ...prev,
                    work,
                ])
                setWork(initWorkExp)
                break;
            case 'Training History':
                setTrainingArr(prev => [
                    ...prev,
                    training,
                ])
                setTraining(initTrainings)
                break;
            case 'Dependents':
                setDependentArr(prev => [
                    ...prev,
                    dependent,
                ])
                setDependent(initDependents)
                setBirthDate(new Date())
                break;
            default:
                break;
        }
        setCustomFromDate(new Date())
        setCustomToDate(new Date())
    }

    const handleSaveChanges = async () => {
        setLoading(true)
        let newData: GetAllCompanyUsers
        if(showFeature === 'Personal Information'){
            const {ref_id: id, e_sig, pfp, ...restPersonalInfo} = personalInfo
            setCompanyStaff(prev => ({...prev, ...restPersonalInfo}))
            newData = {...company_staff, ...restPersonalInfo}
        
            new Promise<void>((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        const {staff_pfp, staff_name} = await editStaffDetails(company_staff.id, `${personalInfo.full_name} has updated their ${showFeature}`, actor, newData, company_staff.user_code, previewSign, signImg, isSignDig, previewPfp, pfpFile)

                        localStorage.setItem('customToken', staff_name)
                        if(staff_pfp !== ''){
                            localStorage.setItem('pfpToken', staff_pfp ?? '');
                        }
                        setActor(staff_name)
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                }, 2000) // Adjust the delay time 
            })
            .then(() => {
                handleToast('Personal Info Updated.', `You have updated your ${showFeature} successfully.`, 5000, 'success')
            })
            .catch((error) => {
                console.log('Error: ', error)
            })
            .finally(() => {
                onClose()
                setLoading(false)
                setSignDig(false)
                handleChangeFeature('opt', 0);
            })
        } else {
            new Promise<void>((res, rej) => {
                setTimeout(async () => {
                    try{
                        if(showFeature === 'Government ID'){
                            await reqToUpdateData(company_staff.id, govtID, `Employee ${company_staff.full_name} has updated their ${showFeature}.`, actor)
                        } else {
                            const updatedData = handleInsertDataArray()
                            await reqToUpdateData(company_staff.id, updatedData, `Employee ${company_staff.full_name} has updated their ${showFeature}.`, actor)
                        }
                        res()
                    } catch(error){
                        rej(error)
                    }
                }, 2000)
            })
            .then(() => {
                handleToast('Employee Info Updated successfully.', 'Your data has successfully updated. Please be advised that this action will notify your HR.', 5000, 'info')
            })
            .catch((error) => {
                console.log('Error: ', error)
            })
            .finally(() => {
                onClose()
                setLoading(false)
                handleChangeFeature('opt', 0) 
            })
        }
    }

    const handleInsertDataArray = () => {
        try {
            let user_object: Record<string, any> = {};
            let key: string = '';
            let newObj: Record<string, any> = {}; // Initialize the object to hold the new data

            switch (showFeature) {
                case 'Educational Attainment':
                    user_object = { ...company_staff.educational_attainment }
                    key = 'educational_attainment'
                    eduArr.forEach((education, index) => {
                        newObj[`edu_${index + 1}`] = education
                    })
                    setEduArr([])
                    break;
                case 'Dependents':
                    user_object = { ...company_staff.dependents }
                    key = 'dependents'
                    dependentArr.forEach((dependent, index) => {
                        newObj[`dependent_${index + 1}`] = dependent
                    })
                    setDependentArr([])
                    break;
                case 'Work Exp.':
                    user_object = { ...company_staff.work_exp }
                    key = 'work_exp'
                    workArr.forEach((exp, index) => {
                        newObj[`work_exp_${index + 1}`] = exp
                    })
                    setWorkArr([])
                    break;
                case 'Training History':
                    user_object = { ...company_staff.training_history }
                    key = 'training_history'
                    trainingArr.forEach((training, index) => {
                        newObj[`training_history_${index + 1}`] = training
                    })
                    setTrainingArr([]);
                    break
                default:
                    break
            }
            const updatedCompanyStaff = {
                ...company_staff,
                [key]: newObj,
            }
            setCompanyStaff(updatedCompanyStaff); // Update the state
            return updatedCompanyStaff; // Return the updated object for immediate use
        } catch (error) {
            throw error;
        }
    }

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

    return(
        <>
        <main className='grid grid-rows-2 gap-28'>
            <Box className='w-full flex flex-col justify-center row-span-full relative'>
                <Box className='w-full flex justify-center rounded p-3' bgGradient='linear(to-b, #1A2B56, #0D70AB)'>
                    <Image src={'/label_pentagon_banner.png'} width={600} height={200} alt='pentagon' />
                </Box>
                <Box className='flex items-center space-x-6 w-full absolute top-32 ps-8'>
                    <Circle className='drop-shadow-xl outline-4 outline outline-offset-4 outline-white bg-slate-500'>
                        <Avatar src={`${company_staff.pfp}`} size='2xl' name={`${company_staff.full_name}`} />
                    </Circle>
                    <Box className=''>
                        <Heading as='h6' size='lg'>{company_staff.full_name}</Heading>
                        <Text fontSize='xs' color='#a1a1a1'>Employee ID: {`${company_staff.employee_id ?? ''}`}</Text>
                    </Box>
                </Box>
                <Box className='flex items-center justify-end space-x-6 w-full absolute top-28 pe-4'>
                    <Box className=''>
                        <Button fontSize='xs' border='2px' borderColor='#1C437E' bg={'#1C437E'} _hover={{ bg: '#2F67B2', borderColor: '#85C4ED'}} color='#fff' onClick={onOpen}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                                    <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1l1-4Z" />
                                    </g>
                                </svg>
                            </span>
                            <span className='ps-2'>Edit Profile</span>
                        </Button>
                    </Box>
                </Box>
            </Box>
            <section className='flex space-x-5 p-4'>
                {loading && <p>Loading...</p>}
                {!loading && company_staff && 
                (<section className='p-5 w-auto h-fit flex flex-col space-y-5 rounded border border-gray-300' style={{minWidth: '250px'}}>
                    <Box className='flex flex-col justify-end space-y-5'>
                        <Box className='flex flex-col justify-between space-y-5'>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >User Code:</Text>
                                <Text fontSize='sm'>{company_staff.user_code}</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Contact:</Text>
                                <Text fontSize='sm'>{company_staff.phone}</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Email:</Text>
                                <Text fontSize='sm'>{company_staff.email}</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Gender:</Text>
                                <Text fontSize='sm' className='capitalize'>{company_staff.gender}</Text>
                            </Box>
                            
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Date of Birth:</Text>
                                <Text fontSize='sm'>{new Date(company_staff.birthDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Age:</Text>
                                <Text fontSize='sm'>{company_staff.age} yrs. old</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Place of Birth:</Text>
                                <Text fontSize='sm'>{company_staff.birthPlace}</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Marital Status:</Text>
                                <Text fontSize='sm'>{company_staff.status}</Text>
                            </Box>

                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Residential Address:</Text>
                                <p className='text-wrap'>{company_staff.address}</p>
                            </Box>
                            {company_staff.province && (
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1'>Provincial Address:</Text>
                                    <Text fontSize='sm'>{company_staff.province}</Text>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </section>)}
                {!loading && company_staff && 
                (<section className='p-5 w-full flex flex-col space-y-8 border rounded border-gray-300'>
                    <Box className='flex justify-between flex-col space-y-5 '>
                        <Box className='flex space-x-2  items-start w-full'>
                            <WorkIcon size={'24'} color={'#a1a1a1'} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Position Details`}</Heading>
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
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box className='flex flex-col space-y-3'>
                        <Box className='flex space-x-2  items-start w-full'>
                            <GovtIcon size={'24'} color={'#a1a1a1'} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Government Issued ID's`}</Heading>
                        </Box>
                        <Box className='flex justify-between space-x-5'>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >SSS:</Text>
                                <Text fontSize='sm'>{company_staff.sss}</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >HDMF:</Text>
                                <Text fontSize='sm'>{company_staff.hdmf}</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Tin:</Text>
                                <Text fontSize='sm'>{company_staff.tin}</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >PhilHealth:</Text>
                                <Text fontSize='sm'>{company_staff.philhealth}</Text>
                            </Box>
                        </Box>
                    </Box>
                    <Box className='flex flex-col space-y-3'>
                        <Box className='flex space-x-2  items-start w-full'>
                            <EmergencyIcon size={'24'} color={'#a1a1a1'} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Emergency Contact`}</Heading>
                        </Box>
                        <Box className='flex justify-between space-x-5'>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Contact Person:</Text>
                                <Text fontSize='sm'>{company_staff.contact_person}</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Contact No.:</Text>
                                <Text fontSize='sm'>{company_staff.emergency_contact}</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Relationship:</Text>
                                <Text fontSize='sm'>{company_staff.relationship}</Text>
                            </Box>
                            <Box className='w-full justify-center flex flex-col'>
                                <Text fontSize='xs' color='#a1a1a1' >Address:</Text>
                                <Text fontSize='sm'>{company_staff.contact_address}</Text>
                            </Box>
                        </Box>
                    </Box>
                    <Box className='flex justify-between flex-col space-y-5 '>
                        <Box className='flex space-x-2  items-start w-full'>
                            <EducIcon size={'24'} color={'#a1a1a1'} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Educational Attainent`}</Heading>
                        </Box>
                        <TableContainer>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Educational Attainment</span></Th>
                                        <Th><span className='text-xs font-medium'>School/University</span></Th>
                                        <Th><span className='text-xs font-medium'>Degree</span></Th>
                                        <Th><span className='text-xs font-medium'>Inclusive Dates</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(company_staff.educational_attainment).map(([key, attain]) => (
                                    <Tr key={key}>
                                        <Td>{attain.attainment}</Td>
                                        <Td>{attain.school}</Td>
                                        <Td>{attain.degree}</Td>
                                        <Td> {`${new Date(attain.inc_dates.from).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})} to ${new Date(attain.inc_dates.to).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}`} </Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box className='flex justify-between flex-col space-y-5 '>
                        <Box className='flex space-x-2  items-start w-full'>
                            <WorkIcon size={'24'} color={'#a1a1a1'} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Work Experience`}</Heading>
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
                                        <Td> {`${new Date(exp.inc_dates.from).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})} to ${new Date(exp.inc_dates.to).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}`} </Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box className='flex justify-between flex-col space-y-5 '>
                        <Box className='flex space-x-2  items-start w-full'>
                            <HistoryIcon size={'24'} color={'#a1a1a1'} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Training History`}</Heading>
                        </Box>
                        <TableContainer>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Title</span></Th>
                                        <Th><span className='text-xs font-medium'>Provider</span></Th>
                                        <Th><span className='text-xs font-medium'>Inclusive Dates</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(company_staff.training_history).map(([key, history]) => (
                                    <Tr key={key}>
                                        <Td>{history.training_title}</Td>
                                        <Td>{history.training_provider}</Td>
                                        <Td> {`${new Date(history.inc_dates.from).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})} to ${new Date(history.inc_dates.to).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}`} </Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box className='flex justify-between flex-col space-y-5 '>
                        <Box className='flex space-x-2  items-start w-full'>
                            <FamilyIcon size={'24'} color={'#a1a1a1'} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Immediate Dependent's`}</Heading>
                        </Box>
                        <TableContainer>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Immediate Dependent</span></Th>
                                        <Th><span className='text-xs font-medium'>Relationship</span></Th>
                                        <Th><span className='text-xs font-medium'>Gender</span></Th>
                                        <Th><span className='text-xs font-medium'>Date of Birth</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(company_staff.dependents).map(([key, dependent]) => (
                                    <Tr key={key}>
                                        <Td>{dependent.name}</Td>
                                        <Td>{dependent.dependent_relationship}</Td>
                                        <Td>{dependent.dependent_gender}</Td>
                                        <Td>{new Date(dependent.dependent_birth_date).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</Td> {/* Convert to string */}
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                </section>)}
            </section>
        </main>
        <Modal blockScrollOnMount={false} closeOnOverlayClick={false} scrollBehavior={'inside'} isOpen={isOpen} onClose={() => {onClose(); handleChangeFeature('opt', 0);}} size={showFeature === 'Work Exp.' || showFeature === 'Training History' ? '' : showFeature === 'Educational Attainment' ? '' : 'xl'}>
            <ModalOverlay />
            <ModalContent p={4}>
                <ModalHeader className='flex space-x-2 items-center'>
                    <span>
                        {iconIndex === 0 ? (<UserInfo size='30' color='#444' />) : (icons[iconIndex])}
                    </span>
                    <span style={{color: '#444'}}>
                        {animateOpt === 'opt' ? 'Choose which to update:' : animateOpt}
                    </span>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box style={{ overflowX: 'hidden' }}>
                        <Box className={`${showFeature === 'opt' ? 'animate__backInRight' : 'animate__backOutRight'} ${hiddenClass === 'opt' ? '' : 'hidden'} animate__animated `} >
                            <RadioGroup className='w-full' onChange={(value) => {
                                const iconIndx = features.indexOf(value);
                                handleChangeFeature(value, iconIndx); 
                                }} value={showFeature}>
                                <VStack spacing={4}>
                                    {features.map((feat, index) => (
                                        <Box key={index} className='w-full px-3 bg-zinc-100 hover:cursor-pointer w-100' border='1px' borderColor='gray.200' borderRadius='md'>
                                            <Radio w='100%' size={'md'} value={feat}>
                                                <Box className='flex items-center space-x-1'>
                                                    <span>{icons[index]}</span>
                                                    <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='md'><span>{feat}</span></Text>
                                                </Box>
                                            </Radio>
                                        </Box>
                                    ))}
                                </VStack>
                            </RadioGroup>
                        </Box>
                        <Box className={`${showFeature !== 'Personal Information' ? 'animate__backOutRight' : 'animate__backInRight'} ${hiddenClass !== 'Personal Information' ? 'hidden' : ''} animate__animated `} >
                            <form className='space-y-3'>
                                <Box className='flex flex-col justify-center items-center '>
                                    <Box className='flex w-full justify-between items-center'>
                                        <Text w='100%' fontSize='lg'>Profile Photo:</Text>
                                        <Button size='sm' variant='ghost' onClick={() => fileInputRef.current?.click()} leftIcon={<EditIcon size='20' color='#9ca3af' />} >Edit</Button>
                                        <input ref={fileInputRef} onChange={(e) => {handleFileChange(e, 'pfp')}}  type='file' accept='image/png, image/jpeg' style={{display: 'none'}} />
                                    </Box>
                                    <Box>
                                        <Avatar size='2xl' src={personalInfo.pfp} name={personalInfo.full_name} />
                                    </Box>
                                </Box>
                                <FormControl>
                                    <FormLabel fontSize='sm'>Full Name:</FormLabel>
                                    <Input id='full_name' name='info' onChange={handleChangeInfo} value={personalInfo.full_name} variant='flushed'  />
                                </FormControl>
                                <Box className='flex space-x-4 py-2'>
                                    <Box className='w-full flex space-y-2 flex-col'>
                                        <Text fontSize='sm'>Gender:</Text>
                                        <Select id='gender' name='info' onChange={handleChangeInfoSelect} value={personalInfo.gender} size='md' placeholder='Select Gender'>
                                            <option label='Male' value='Male' />
                                            <option label='Female' value='Female' />
                                        </Select>
                                    </Box>
                                    <Box className='w-full flex space-y-2 flex-col'>
                                        <Text fontSize='sm'>Marital Status:</Text>
                                        <Select id='status' name='info' onChange={handleChangeInfoSelect} value={personalInfo.status} size='md' placeholder='Select Marital Status'>
                                            <option label='Single' value='Single' />
                                            <option label='Married' value='Married' />
                                            <option label='Divorced' value='Divorced' />
                                            <option label='Widowed' value='Widowed' />
                                        </Select>
                                    </Box>
                                </Box>
                                <Box className='flex space-x-4 py-2'>
                                    <Box className='w-full flex space-y-2 flex-col'>
                                        <Text fontSize='sm'>Birth Date:</Text>
                                        <FormControl >
                                            <DatePicker dropdownMode='select' showYearDropdown showMonthDropdown popperPlacement='top-end' showPopperArrow={false} selected={customBirthDate} onChange={(date) => handleDates(date, 'info', 'info')} dateFormat="E, MMM dd, yyy"
                                                customInput={
                                                    <Input variant='flushed' w='100%' id='birthDate' name='info' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customBirthDate)} />
                                                }
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box className='w-full justify-between flex pb-2 flex-col'>
                                        <Text fontSize='sm'>Age:</Text>
                                        <Text fontSize='lg'>{personalInfo.age} years old</Text>
                                    </Box>
                                </Box>
                                <FormControl>
                                    <FormLabel fontSize='sm'>Birth Place:</FormLabel>
                                    <Input id='birthPlace' onChange={handleChangeInfo} name='info' value={personalInfo.birthPlace} variant='flushed' />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize='sm'>Residential Address:</FormLabel>
                                    <Input id='address' onChange={handleChangeInfo} name='info' value={personalInfo.address} variant='flushed' />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize='sm'>Provincial Address: </FormLabel>
                                    <Input id='province' onChange={handleChangeInfo} name='info' value={personalInfo.province} variant='flushed' />
                                    <FormHelperText color='gray' fontSize='xs' as='i'>This field is optional.</FormHelperText>
                                </FormControl>
                                <Box className='flex space-x-4'>
                                    <FormControl>
                                        <FormLabel fontSize='sm'>Contact:</FormLabel>
                                        <Input id='phone' onChange={handleChangeInfo} name='info' value={personalInfo.phone} variant='flushed'  />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize='sm'>Email:</FormLabel>
                                        <Input id='email' onChange={handleChangeInfo} name='info' value={personalInfo.email} variant='flushed' />
                                    </FormControl>
                                </Box>
                                <FormControl>
                                    <FormLabel fontSize='sm'>Emergency Contact:</FormLabel>
                                    <Input id='contact_person' onChange={handleChangeInfo} name='info' value={personalInfo.contact_person} variant='flushed' />
                                </FormControl>
                                <Box className='flex space-x-4'>
                                    <FormControl>
                                        <FormLabel fontSize='sm'>Contact:</FormLabel>
                                        <Input id='emergency_contact' onChange={handleChangeInfo} name='info' value={personalInfo.emergency_contact} variant='flushed'  />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize='sm'>Relationship:</FormLabel>
                                        <Input id='relationship' onChange={handleChangeInfo} name='info' value={personalInfo.relationship} variant='flushed' />
                                    </FormControl>
                                </Box>
                                <FormControl>
                                    <FormLabel fontSize='sm'>Contact Address:</FormLabel>
                                    <Input id='contact_address' onChange={handleChangeInfo} name='info' value={personalInfo.contact_address} variant='flushed' />
                                </FormControl>
                                <Box className='flex flex-col space-y-4 w-full items-center justify-center'>
                                    <Box className='w-full justify-between flex'>
                                        <Text> Signature:</Text>
                                        <Button size='sm' variant='ghost' onClick={() => signInputRef.current?.click()} leftIcon={<EditIcon size='20' color='#9ca3af' />} >Edit Attachment</Button>
                                        <input ref={signInputRef} onChange={(e) => {handleFileChange(e, 'e_sig')}}  type='file' accept='image/png, image/jpeg' style={{display: 'none'}} />
                                    </Box>
                                    <Image width={300} height={150} alt='e-signature' src={personalInfo.e_sig} />
                                    {!isSignDigital && (
                                        <Button w='100%' colorScheme='blue' leftIcon={<SignIcon size={'24'} />} onClick={() => {setSignDigital(true);}}>Create E-Signature</Button>
                                    )}
                                    {isSignDigital && (
                                        <Box className='space-y-3'>
                                            <Box className='border rounded border-black' style={{ width: '100%' }}>
                                                <SignatureCanvas 
                                                    canvasProps={{ width: 460, height: 200, className: 'sigCanvas' }} 
                                                    ref={padRef} 
                                                />
                                            </Box>
                                            <Box className='flex items-end justify-end'>
                                                <Button w='80px' colorScheme='red' onClick={() => {handleClear(); setSignDigital(false);}} mr={3} variant='outline' >{`Close`}</Button>
                                                <Button w='80px' colorScheme='blue' onClick={handleClear} mr={3} variant='outline' >{`Redo`}</Button>
                                                <Button w='120px' colorScheme='green' onClick={handleGenerate}>{`Save Signature`}</Button>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </form>
                        </Box>
                        <Box className={`${showFeature !== 'Government ID' ? 'animate__backOutRight' : 'animate__backInRight'} ${hiddenClass !== 'Government ID' ? 'hidden' : ''} animate__animated `} >
                            <form className='space-y-4'>
                                <FormControl>
                                    <InputGroup borderWidth={1} borderRadius={7}>
                                        <InputLeftAddon>SS Number:</InputLeftAddon>
                                        <Input id='sss' name='govt_id' px={3} value={govtID.sss} onChange={handleChangeInfo} variant='flushed' placeholder='SS Number' />
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <InputGroup borderWidth={1} borderRadius={7}>
                                        <InputLeftAddon>TIN Number:</InputLeftAddon>
                                        <Input id='tin' name='govt_id' px={3} value={govtID.tin} onChange={handleChangeInfo} variant='flushed' placeholder='TIN' />
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <InputGroup borderWidth={1} borderRadius={7}>
                                        <InputLeftAddon>Pag-IBIG:</InputLeftAddon>
                                        <Input id='hdmf' name='govt_id' px={3} value={govtID.hdmf} onChange={handleChangeInfo} variant='flushed' placeholder='Pag-IBIG' />
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <InputGroup borderWidth={1} borderRadius={7}>
                                        <InputLeftAddon>PhilHealth:</InputLeftAddon>
                                        <Input id='philhealth' name='govt_id' px={3} value={govtID.philhealth} onChange={handleChangeInfo} variant='flushed' placeholder='PhilHealth' />
                                    </InputGroup>
                                </FormControl>
                            </form>
                        </Box>
                        <Box className={`${showFeature !== 'Educational Attainment' ? 'animate__backOutRight' : 'animate__backInRight'} ${hiddenClass !== 'Educational Attainment' ? 'hidden' : ''} animate__animated `} >
                            <form className='space-y-4' style={{minHeight: '450px'}}>
                                <Box className='flex space-x-4'>
                                    <FormControl w='40%'>
                                        <FormLabel>Degree:</FormLabel>
                                        <Input id='degree' name='edu' px={3} value={edu.degree} onChange={handleChangeInfo} variant='flushed' placeholder='Specify Degree...' />
                                    </FormControl>
                                    <FormControl w='65%'>
                                        <FormLabel>School:</FormLabel>
                                        <Input id='school' name='edu' px={3} value={edu.school} onChange={handleChangeInfo} variant='flushed' placeholder='Specify school...' />
                                    </FormControl>
                                </Box>
                                <Box className='flex items-end space-x-8 justify-between w-full'>
                                    <FormControl w='100%'>
                                        <FormLabel>Attainment:</FormLabel>
                                        <Select id='attainment' name='edu' onChange={handleChangeInfoSelect} value={edu.attainment} size='md' placeholder='Select Attainment'>
                                            <option label='College' value='College' />
                                            <option label='Senior High' value='Senior High' />
                                            <option label='Junior High' value='Junior High' />
                                            <option label='Grade School' value='Grade School' />
                                        </Select>
                                    </FormControl>
                                    <Box className='flex space-x-4 w-full justify-center'>
                                        <Box className='flex space-y-2 flex-col' w='100%'>
                                            <Text fontSize='sm'>From:</Text>
                                            <FormControl w='100%' >
                                                <DatePicker dropdownMode='select' showYearDropdown showMonthDropdown showPopperArrow={false} selected={customFromDate} onChange={(date) => handleDates(date, 'edu', 'from')} dateFormat="E, MMM dd, yyy"
                                                    customInput={
                                                        <Input variant='flushed' w='100%' id='from' name='edu' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customFromDate)} />
                                                    }
                                                />
                                            </FormControl>
                                        </Box>
                                        <Box className='flex space-y-2 flex-col' w='100%'>
                                            <Text fontSize='sm'>To:</Text>
                                            <FormControl w='100%'>
                                                <DatePicker dropdownMode='select' showYearDropdown showMonthDropdown showPopperArrow={false} selected={customToDate} onChange={(date) => handleDates(date, 'edu', 'to')} dateFormat="E, MMM dd, yyy"
                                                    customInput={
                                                        <Input variant='flushed' id='to' name='edu' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customToDate)} />
                                                    }
                                                />
                                            </FormControl>
                                        </Box>
                                    </Box>
                                    <Button w='50%' onClick={() => handleInsert()} isDisabled={edu.attainment === '' || edu.school === '' || edu.degree === '' || edu.inc_dates.from === '' || edu.inc_dates.to === ''} colorScheme='blue' variant='outline' >Insert</Button>
                                </Box>
                                <Box className='pb-6'>
                                    <Text fontSize='lg' className='font-bold mb-3'>Dependents:</Text>
                                    <Box className='flex space-x-4 w-full border rounded p-2 items-center '>
                                        <Text w='100%' className='font-bold'>Attainment</Text>
                                        <Text w='100%' className='font-bold'>School</Text>
                                        <Text w='100%' className='font-bold'>Degree</Text>
                                        <Text w='100%' className='font-bold'>Inclusive Dates</Text>
                                        <Text w='30%' className='font-bold'>Action</Text>
                                    </Box>
                                    <Box className='px-2'>
                                        {eduArr.map((val, index) => (
                                        <Box key={index} className='flex space-x-4 border-b p-2 w-full items-center'>    
                                            <Text w='100%'>{val.attainment}</Text>
                                            <Text w='100%'>{val.school}</Text>
                                            <Text w='100%'>{val.degree}</Text>
                                            <Text w='100%' textAlign='start' >{`${formatDateToWords(val.inc_dates.from)} to ${formatDateToWords(val.inc_dates.to)}`}</Text>
                                            <Box w='30%'>
                                                <Button  onClick={() => setEduArr(prev => prev.filter((_, i) => i !== index))} colorScheme='red' size='sm' variant='ghost' leftIcon={<TrashIcon color='red' size={'22'} />} />
                                            </Box>
                                        </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </form>
                        </Box>
                        <Box className={`${showFeature !== 'Work Exp.' ? 'animate__backOutRight' : 'animate__backInRight'} ${hiddenClass !== 'Work Exp.' ? 'hidden' : ''} animate__animated `} >
                            <form className='space-y-4' style={{minHeight: '450px'}}>
                                <Box className='flex space-x-4'>
                                    <FormControl w='65%'>
                                        <FormLabel>Company</FormLabel>
                                        <Input id='company' name='exp' px={3} value={work.company} onChange={handleChangeInfo} variant='flushed' placeholder='Provide company name...' />
                                    </FormControl>
                                    <FormControl w='65%'>
                                        <FormLabel>Address</FormLabel>
                                        <Input id='company_address' name='exp' px={3} value={work.company_address} onChange={handleChangeInfo} variant='flushed' placeholder={`Provide company's location...`} />
                                    </FormControl>
                                    <FormControl w='65%'>
                                        <FormLabel>Position</FormLabel>
                                        <Input id='position' name='exp' px={3} value={work.position} onChange={handleChangeInfo} variant='flushed' placeholder='Provide your role within the company...' />
                                    </FormControl>
                                </Box>
                                <Box className='flex items-center space-x-4 justify-between w-full'>
                                    <FormControl w='35%'>
                                        <FormLabel>Status</FormLabel>
                                        <Select id='stats' name='exp' onChange={handleChangeInfoSelect} value={work.stats} size='md' placeholder='Select Status'>
                                            <option label='Full Time' value='Full Time' />
                                            <option label='Part Time' value='Part Time' />
                                            <option label='Internship' value='Internship' />
                                        </Select>
                                    </FormControl>
                                    <FormControl w='65%'>
                                        <FormLabel>Reason for Leave</FormLabel>
                                        <Input id='reason_leave' name='exp' px={3} value={work.reason_leave} onChange={handleChangeInfo} variant='flushed' placeholder='Input reason for your leave...' />
                                    </FormControl>
                                    <Box className='flex space-y-2 flex-col' w='40%'>
                                        <Text fontSize='sm'>From:</Text>
                                        <FormControl >
                                            <DatePicker dropdownMode='select' showYearDropdown showMonthDropdown showPopperArrow={false} selected={customFromDate} onChange={(date) => handleDates(date, 'exp', 'from')} dateFormat="E, MMM dd, yyy"
                                                customInput={
                                                    <Input variant='flushed' w='100%' id='from' name='exp' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customFromDate)} />
                                                }
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box className='flex space-y-2 flex-col' w='40%'>
                                        <Text fontSize='sm'>To:</Text>
                                        <FormControl >
                                            <DatePicker dropdownMode='select' showYearDropdown showMonthDropdown showPopperArrow={false} selected={customToDate} onChange={(date) => handleDates(date, 'exp', 'to')} dateFormat="E, MMM dd, yyy"
                                                customInput={
                                                    <Input variant='flushed' w='100%' id='to' name='exp' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customToDate)} />
                                                }
                                            />
                                        </FormControl>
                                    </Box>
                                    <Button onClick={() => handleInsert()} isDisabled={work.company === '' || work.company_address === '' || work.position === '' || work.stats === '' || work.reason_leave === '' || work.inc_dates.from === '' || work.inc_dates.to === ''} colorScheme='blue' variant='outline' >Insert</Button>
                                </Box>
                                <Box className='pb-6'>
                                    <Text fontSize='lg' className='font-bold mb-3'>Work Experiences:</Text>
                                    <Box className='flex space-x-4 w-full border rounded p-2 items-center '>
                                        <Text w='100%' className='font-bold'>Company</Text>
                                        <Text w='100%' className='font-bold'>Address</Text>
                                        <Text w='100%' className='font-bold'>Position</Text>
                                        <Text w='100%' className='font-bold'>Status</Text>
                                        <Text w='100%' className='font-bold'>Reason For Leave</Text>
                                        <Text w='100%' className='font-bold'>Inclusive Dates</Text>
                                        <Text w='30%' className='font-bold'>Action</Text>
                                    </Box>
                                    <Box className='px-2'>
                                        {workArr.map((val, index) => (
                                        <Box key={index} className='flex space-x-4 border-b p-2 w-full items-center'>    
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
                                            <Box w='30%'>
                                                <Button onClick={() => setWorkArr(prev => prev.filter((_, i) => i !== index))} colorScheme='red' size='sm' variant='ghost' leftIcon={<TrashIcon color='red' size={'22'} />} />
                                            </Box>
                                        </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </form>
                        </Box>
                        <Box className={`${showFeature !== 'Training History' ? 'animate__backOutRight' : 'animate__backInRight'} ${hiddenClass !== 'Training History' ? 'hidden' : ''} animate__animated `} >
                            <form className='space-y-4' style={{minHeight: '450px'}}>
                                <Box className='flex space-x-4'>
                                    <FormControl w='65%'>
                                        <FormLabel>Training</FormLabel>
                                        <Input id='training_title' name='training' px={3} value={training.training_title} onChange={handleChangeInfo} variant='flushed' placeholder='Specify training name...' />
                                    </FormControl>
                                    <FormControl w='65%'>
                                        <FormLabel>Provider</FormLabel>
                                        <Input id='training_provider' name='training' px={3} value={training.training_provider} onChange={handleChangeInfo} variant='flushed' placeholder='Specify training provider...' />
                                    </FormControl>
                                </Box>
                                <Box className='flex items-end space-x-4 px-3 justify-between w-full'>
                                    <Box className='flex items-center space-x-4' w='50%'>
                                        <Text w='50%' textAlign='end' fontSize='sm'>Inclusive From:</Text>
                                        <FormControl >
                                            <DatePicker dropdownMode='select' showYearDropdown showMonthDropdown showPopperArrow={false} selected={customFromDate} onChange={(date) => handleDates(date, 'training', 'from')} dateFormat="E, MMM dd, yyy"
                                                customInput={
                                                    <Input variant='flushed' w='100%' id='from' name='training' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customFromDate)} />
                                                }
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box className='flex items-center space-x-4' w='50%'>
                                        <Text w='50%' textAlign='end' fontSize='sm'>Inclusive To:</Text>
                                        <FormControl >
                                            <DatePicker dropdownMode='select' showYearDropdown showMonthDropdown showPopperArrow={false} selected={customToDate} onChange={(date) => handleDates(date, 'training', 'to')} dateFormat="E, MMM dd, yyy"
                                                customInput={
                                                    <Input variant='flushed' w='100%' id='to' name='training' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customToDate)} />
                                                }
                                            />
                                        </FormControl>
                                    </Box>
                                    <Button w='30%' onClick={() => handleInsert()} isDisabled={training.training_title === '' || training.training_provider === '' || training.inc_dates.from === '' || training.inc_dates.to === ''} colorScheme='blue' variant='outline' >Insert</Button>
                                </Box>
                                <Box className='pb-6'>
                                    <Text fontSize='lg' className='font-bold mb-3'>Training History:</Text>
                                    <Box className='flex space-x-4 w-full border rounded p-2 items-center '>
                                        <Text w='100%' className='font-bold'>Training</Text>
                                        <Text w='100%' className='font-bold'>Provider</Text>
                                        <Text w='100%' className='font-bold'>Inclusive Dates</Text>
                                        <Text w='30%' className='font-bold'>Action</Text>
                                    </Box>
                                    <Box className='px-2'>
                                        {trainingArr.map((val, index) => (
                                        <Box key={index} className='flex space-x-4 border-b p-2 w-full items-center'>    
                                            <Text w='100%'>{val.training_title}</Text>
                                            <Text w='100%'>{val.training_provider}</Text>
                                            <Text w='100%' textAlign='start' >{`${formatDateToWords(val.inc_dates.from)} to ${formatDateToWords(val.inc_dates.to)}`}</Text>
                                            <Box w='30%'>
                                                <Button  onClick={() => setTrainingArr(prev => prev.filter((_, i) => i !== index))} colorScheme='red' size='sm' variant='ghost' leftIcon={<TrashIcon color='red' size={'22'} />} />
                                            </Box>
                                        </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </form>
                        </Box>
                        <Box className={`${showFeature !== 'Dependents' ? 'animate__backOutRight' : 'animate__backInRight'} ${hiddenClass !== 'Dependents' ? 'hidden' : ''} animate__animated `} >
                            <form className='space-y-4' style={{minHeight: '450px'}}>
                                <Box className='flex space-x-4'>
                                    <FormControl w='65%'>
                                        <FormLabel>Dependent Name</FormLabel>
                                        <Input id='name' name='dependent' px={3} value={dependent.name} onChange={handleChangeInfo} variant='flushed' placeholder='Dependent Name' />
                                    </FormControl>
                                    <FormControl w='35%'>
                                        <FormLabel>Gender</FormLabel>
                                        <Select id='dependent_gender' name='dependent' onChange={handleChangeInfoSelect} value={dependent.dependent_gender} size='md' placeholder='Select Gender'>
                                            <option label='Male' value='Male' />
                                            <option label='Female' value='Female' />
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box className='flex items-center space-x-4 justify-between w-full'>
                                    <FormControl w='40%'>
                                        <FormLabel>Relationship:</FormLabel>
                                        <Input id='dependent_relationship' name='dependent' px={3} value={dependent.dependent_relationship} onChange={handleChangeInfo} variant='flushed' placeholder='Relationship' />
                                    </FormControl>
                                    <Box className='flex space-y-2 flex-col' w='40%'>
                                        <Text fontSize='sm'>Birth Date:</Text>
                                        <FormControl >
                                            <DatePicker dropdownMode='select' showYearDropdown showMonthDropdown showPopperArrow={false} selected={customBirthDate} onChange={(date) => handleDates(date, 'dependents', 'to')} dateFormat="E, MMM dd, yyy"
                                                customInput={
                                                    <Input variant='flushed' w='100%' id='dependent_birth_date' name='dependent' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customBirthDate)} />
                                                }
                                            />
                                        </FormControl>
                                    </Box>
                                    <Button onClick={() => handleInsert()} isDisabled={dependent.name === '' || dependent.dependent_relationship === '' || dependent.dependent_birth_date === '' || dependent.dependent_gender === ''} colorScheme='blue' variant='outline' >Insert</Button>
                                </Box>
                                <Box className='pb-6'>
                                    <Text fontSize='lg' className='font-bold mb-3'>Dependents:</Text>
                                    <Box className='flex space-x-4 w-full border rounded p-2 items-center '>
                                        <Text w='100%' className='font-bold'>Dependent</Text>
                                        <Text w='100%' className='font-bold'>Relationship</Text>
                                        <Text w='100%' className='font-bold'>Gender</Text>
                                        <Text w='100%' className='font-bold'>Birth Date</Text>
                                        <Text w='30%' className='font-bold'>Action</Text>
                                    </Box>
                                    <Box className='px-2'>
                                        {dependentArr.map((val, index) => (
                                        <Box key={index} className='flex space-x-4 border-b p-2 w-full items-center'>    
                                            <Text w='100%'>{val.name}</Text>
                                            <Text w='100%'>{val.dependent_relationship}</Text>
                                            <Text w='100%'>{val.dependent_gender}</Text>
                                            <Text w='100%'>{val.dependent_birth_date}</Text>
                                            <Box w='30%'>
                                                <Button  onClick={() => setDependentArr(prev => prev.filter((_, i) => i !== index))} colorScheme='red' size='sm' variant='ghost' leftIcon={<TrashIcon color='red' size={'22'} />} />
                                            </Box>
                                        </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </form>
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Box className='w-full flex justify-start items-center' style={{overflowX: 'hidden' }}>
                        <Box className={`${animateOpt !== 'opt' ? 'animate__backInLeft': 'animate__backOutLeft'} ${hiddenClass === 'opt' ? 'hidden' : ''} animate__animated w-full flex justify-between`}>
                            <Button bgColor='gray.400' _hover={{bg: 'gray.500'}} color='white' onClick={() => {handleChangeFeature('opt', 0)}} leftIcon={<ArrowBack color={'#fff'} size={'24'} />}>Back</Button>
                            <Button loadingText='Saving...' isLoading={loading} colorScheme='blue' variant='solid' onClick={() => {handleSaveChanges()}} leftIcon={<UploadIcon color='#fff' size={'24'} />}>Save Changes</Button>
                        </Box>
                    </Box>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}