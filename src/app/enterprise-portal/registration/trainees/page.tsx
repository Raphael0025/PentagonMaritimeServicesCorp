'use client'

import Image from 'next/image'
import { useState, useEffect, useRef} from 'react';
import { useRouter } from 'next/navigation'

import { Box, Text, Tooltip, Input, InputLeftAddon, InputGroup, useDisclosure, Select, Button, useToast, Menu, MenuButton, MenuGroup, MenuDivider, MenuList, IconButton, MenuItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, AlertDialog, AlertDialogCloseButton, AlertDialogBody, AlertDialogHeader, AlertDialogOverlay, AlertDialogFooter, AlertDialogContent} from '@chakra-ui/react'
import 'animate.css'
import { useReactToPrint } from 'react-to-print'
import { parse } from 'date-fns'
import html2canvas from 'html2canvas'
import { getDownloadURL, ref, getStorage  } from "firebase/storage";

import {DotsIcon, Loading, EditIcon, UploadIcon, ViewDocIcon, DownloadIcon, VerifyIcon, TrashIcon, PinIcon, MailIcon, PhoneIcon, FilterIcon, FacebookIcon, SearchIcon } from '@/Components/Icons'
import {HistoryIcon} from '@/Components/SideIcons'

import { changeImg,} from '@/lib/trainee_controller'

import { HistoryLog, FilterState, UpdateFilter } from '@/types/utils'

import { parsingTimestamp, formatTime, formatDateToWords, getStatusStyles, showTitleTextIcon, ToastStatus, handleMarketing, generateSlug} from '@/types/handling'

import { useTrainees } from '@/context/TraineeContext'
import { useHistoryLogs } from '@/context/HistoryLogContext'
import { useClients } from '@/context/ClientCompanyContext'

export default function Page(){
    const toast = useToast()
    const {data: allTrainee } = useTrainees()
    const {data: allLogs} = useHistoryLogs()
    const {data: allClients, companyCharge: companyCharges, courseCodes: companyCourseCodes} = useClients()

    const [loading, setLoading] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')

    const { isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()
    const { isOpen: isHistoryLogOpen, onOpen: openHistoryLog, onClose: closeHistoryLog } = useDisclosure()

    const [imgFile, setImgFile] = useState<File[]>([])
    const [filename, setFileName] = useState<string>('No file chosen yet...')
    const [preview, setPreview] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [header, setHeader] = useState<string>('')
    const [traineeDocID, setTraineeDocID] = useState<string>('')
    const [attachmentFile, setAttachment] = useState<string>('')
    const [last_name, setLN] = useState<string>('')
    const [first_name, setFN] = useState<string>('')
    const [cat, setCat] = useState<string>('')
    const [attachmentType, setAT] = useState<string>('')
    const [actor, setActor] = useState<string>('')
    const [rank, setRank] = useState<string>('')

    const [limit, setLimit] = useState(50)
    const [page, setPage] = useState(1)
    
    const attachment = useRef<HTMLButtonElement>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [history, setHistory] = useState<HistoryLog[]>([])

    const [filters, setFilters] = useState([
        {category: 'marketingFilter', value: ''},
        {category: 'sortOption', value: 'Latest Date'}
    ])

    useEffect(() => {
        const fetchData = () => {
            const actorStaff: string | null = localStorage.getItem('customToken')
            const rankArr = (localStorage.getItem('rankToken') || '').split('/')
            const deptArr = (localStorage.getItem('departmentToken') || '').split('/')

            const getIndx = deptArr.indexOf('Registration')
            const getRank = getIndx !== -1 ? rankArr[getIndx] : null

            if(actorStaff && getRank){
                setActor(actorStaff)
                setRank(getRank)
            }
        }
        fetchData()
    },[])

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
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

    const handleCloseMod = () => {
        onCloseModal()
        setFileName('No file chosen yet...')
        setPreview(null)
    }

    const handleImgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0].name
            const signature = files[0];
            setFileName(file);
            setImgFile(Array.from(files))

            const objectUrl = URL.createObjectURL(signature)
            setPreview(objectUrl)
        } else {
            setFileName('No file chosen yet...')
        }
    }

    const handleUploadImg = async () => {
        try{
            setLoading(true)
            await changeImg(traineeDocID, last_name, first_name, cat, attachmentType, imgFile, filename, actor)
            handleCloseMod()
            handleToast(`Successfully changed Trainee's Attachment.`, `Trainee's attachment file has been updated.`, 5000, 'success')
        } catch(error){
            console.error('Error updating trainee image: ', error);
            handleToast(`Failed to change Trainee's Attachment.`, `Trainee's attachment file was not successfully updated. Please issue this to the IT department.`, 5000, 'success')
        } finally {
            setLoading(false)
        }
    }

    const router = useRouter()

    const storage = getStorage();
    const handleDownload = async () => {
        if (attachmentFile) {
            try {
                // Get the download URL for the attachmentFile from Firebase Storage
                const storageRef = ref(storage, attachmentFile); // Assuming 'storage' is your Firebase Storage instance
                const downloadUrl = await getDownloadURL(storageRef);
                // Create a link element and trigger the download
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = downloadUrl;
                link.target = `_blank`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error("Error fetching download URL:", error);
            }
        }
    }

    const updateFilter: UpdateFilter = (category, value) => {
        setFilters(prevFilters => 
            prevFilters.map(filter => 
                filter.category === category ? {...filter, value: filter.value === value ? '' : value } : filter
            )
        )
    }
    
    // Filter the merged data
    const filteredTrainees = allTrainee && allTrainee.filter((trainee) => {
        if (!trainee) return false;
    
        const filterState: FilterState = filters.reduce((acc, filter) => {
            acc[filter.category] = filter.value;
            return acc;
        }, {} as FilterState);
        const { marketingFilter} = filterState;
        return(
            (marketingFilter ? marketingFilter === trainee.marketing : true) &&
            (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trainee.middle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trainee.srn.toLowerCase().includes(searchTerm.toLowerCase()) )
        )
    }).map((trainee, index) => ({
        ...trainee!,
        slug: generateSlug(`${trainee!.last_name.trim().charAt(0)}${trainee!.first_name.trim().charAt(0)}${trainee!.id.slice(0,2)}`)
    })).sort((a,b) => {
        const sortOption = filters.find(f => f.category === 'sortOption')?.value || ''
        switch(sortOption){
            case 'Oldest Date':
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime();
            case 'Latest Date':
                return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
            default:
                return 0;
        }
    })

    const startIndx = (page - 1) * limit
    const displayTrainees = filteredTrainees && filteredTrainees.slice(startIndx, startIndx + limit)

    const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = Number(event.target.value)
        setLimit(newLimit)
        setPage(1)
    }

    const handleNextPage = () => {
        if(!filteredTrainees){
            return
        }
        const maxPage = Math.ceil(filteredTrainees.length /limit)
        if(page < maxPage){
            setPage(page + 1)
        }
    }

    const handlePrevPage = () => {
        if(page > 1){
            setPage(page - 1)
        }
    }
    
    const handleEdit = (slug: string) => {
        router.push(`/enterprise-portal/registration/trainees/${slug}`)
    }

    const handleEditAccess = (slug: string) => {
        router.push(`/enterprise-portal/registration/trainees/${slug}`)
    }

    const handleHistoryLogClick = (trainee_id: string) => {
        if(!allLogs)return
        const dateFormat = "EEEE, MMMM d, yyyy 'at' h:mm a"
        const logsArr: HistoryLog[] = allLogs
        .filter(log => log.id_ref === trainee_id && log.collection_ref === 'trainees')
        .map(log => log as HistoryLog)
        .sort((a, b) => {
            const dateA = parse(a.date_created, dateFormat, new Date())
            const dateB = parse(b.date_created, dateFormat, new Date())
            return dateB.getTime() - dateA.getTime()
        })
        setHistory(logsArr)
        openHistoryLog()
    }

    return(
    <>
        <main className='w-full space-y-3'>
            <Box className='w-full flex'>
                <InputGroup w='30%' className='shadow-md rounded-lg'>
                    <InputLeftAddon>
                        <SearchIcon color='#a1a1a1' size='18'/>
                    </InputLeftAddon>
                    <Input id='search-bar' onChange={handleSearch} value={searchTerm} placeholder='e.g. Juan dela Cruz...' />
                </InputGroup>
            </Box>
            <Box className='w-full '>
                <Box className='flex justify-between bg-sky-700 rounded uppercase shadow-md p-3 px-8 text-white'>
                    <Text w='70%' className='text-center'>{`Trainee's Name`}</Text>
                    <Text w='50%' className='text-center'>rank</Text>
                    <Text w='50%' className='text-center'>srn</Text>
                    <Text w='30%' className='text-center'>gender</Text>
                    <Text w='70%' className='text-center'>company</Text>
                    <Text w='50%' className='text-center'>email</Text>
                    <Text w='50%' className='text-center'>contact #</Text>
                    <Text w='30%' className='text-center'>action</Text>
                    <Text w='5%' className='text-center'>{``}</Text>
                </Box>
                <Box style={{maxHeight:'700px', overflowY: 'auto'}}>
                    <Box className='space-y-5 p-2'>
                        <Accordion allowMultiple className='space-y-5'>
                        {displayTrainees && displayTrainees.map((trainee) => (
                            <AccordionItem key={trainee.id} >
                                <AccordionButton className='flex justify-between rounded shadow-md p-3 px-8 uppercase'>
                                    <Text w='70%' className='text-xs'>{`${trainee.last_name}, ${trainee.first_name} ${trainee.middle_name === '' || trainee.middle_name.toLowerCase() === 'n/a' ? '' : `${trainee.middle_name.charAt(0)}.`} ${trainee.suffix === '' || trainee.suffix.toLowerCase() === 'n/a'  ? '' : trainee.suffix}`}</Text>
                                    <Text w='50%' className='text-xs text-center'>{`${trainee.rank}`}</Text>
                                    <Text w='50%' className='text-xs text-center'>{`${trainee.srn}`}</Text>
                                    <Text w='30%' className='text-xs text-center'>{`${trainee.gender}`}</Text>
                                    <Text w='70%' className='text-xs text-center'>
                                        {allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}
                                    </Text>
                                    <Text w='50%' className='text-xs lowercase text-center'>{`${trainee.email}`}</Text>
                                    <Text w='50%' className='text-xs text-center'>{`${trainee.contact_no}`}</Text>
                                    <Box p={0} style={{width: '30%', textAlign: 'center', fontSize: 12 }}>
                                        <Menu isLazy  >
                                            <MenuButton onClick={(e) => e.stopPropagation()} bg='#FFFFFF00' size='sm' _hover={{bg: '#FFFFFF00'}} as={IconButton} aria-label='Profile' icon={<DotsIcon size={'24'} color={'#a1a1a1'} />} />
                                            <MenuList className='space-y-1 text-start'>
                                                <MenuGroup title='Actions'>
                                                    <MenuItem onClick={(e) => {e.stopPropagation(); handleEditAccess(trainee.slug);}}>
                                                        <span className='ps-2'><EditIcon size={'18'} color={'#0D70AB'} /></span>
                                                        <span className='ps-2'>Edit Trainee Info</span>
                                                    </MenuItem>
                                                </MenuGroup>
                                                <MenuDivider /> 
                                                <MenuGroup title='Timeline'>
                                                    <MenuItem ref={attachment} onClick={(e) => { e.stopPropagation(); handleHistoryLogClick(trainee.id);  }}>
                                                        <span className='ps-2'><HistoryIcon size={'18'} color={'#A1A1A1'} /></span>
                                                        <span className='ps-2'>Activity & Updates Log</span>
                                                    </MenuItem>
                                                </MenuGroup>
                                            </MenuList>
                                        </Menu>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel className='flex justify-around'>
                                    <Box w='400px' className='p-3 py-4 space-y-3 rounded shadow-md uppercase'>
                                        <Box className='space-x-3 flex'>
                                            <Text className='text-gray-400'>Address:</Text>
                                            <Text>
                                                {trainee.otherAddress === '' ? `${trainee.house_no} ${trainee.street} Brgy. ${trainee.brgy}, ${trainee.city} City` : trainee.otherAddress}
                                            </Text>
                                        </Box>
                                        <Box className='space-x-3 flex'>
                                            <Text className='text-gray-400'>Nationality:</Text>
                                            <Text>{trainee.nationality}</Text>
                                        </Box>
                                        <Box className='space-x-3 flex'>
                                            <Text className='text-gray-400'>Birth Date:</Text>
                                            <Text>{parsingTimestamp(trainee.birthDate).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</Text>
                                        </Box>
                                        <Box className='space-x-3 flex'>
                                            <Text className='text-gray-400'>Birth Place:</Text>
                                            <Text>{trainee.birthPlace}</Text>
                                        </Box>
                                        <Box className='space-x-3 flex'>
                                            <Text className='text-gray-400'>Vessel:</Text>
                                            <Text>{trainee.vessel}</Text>
                                        </Box>
                                        <Box className='space-x-3 flex'>
                                            <Text className='text-gray-400'>Endorser:</Text>
                                            <Text>{trainee.endorser}</Text>
                                        </Box>
                                    </Box>
                                    <Box w='400px' className='p-3 py-4 space-y-3 rounded shadow-md uppercase'>
                                        <Box className='space-x-3 flex'>
                                            <Text className='text-gray-400'>Emergency Contact:</Text>
                                            <Text>{trainee.e_contact_person}</Text>
                                        </Box>
                                        <Box className='space-x-3 flex'>
                                            <Text className='text-gray-400'>Contact No.:</Text>
                                            <Text>{trainee.e_contact}</Text>
                                        </Box>
                                        <Box className='space-x-3 flex'>
                                            <Text className='text-gray-400'>Relationship:</Text>
                                            <Text>{trainee.relationship}</Text>
                                        </Box>
                                        <Box className='space-x-3 flex'>
                                            <Text className='text-gray-400'>Marketing:</Text>
                                            <Text>{trainee.marketing}</Text>
                                        </Box>
                                    </Box>
                                    <Box w='400px' className='p-3 py-4 space-y-3 rounded shadow-md uppercase'>
                                        <Box className='flex items-center border-b-2 border-slate-200 space-x-2'>
                                            <p style={{ width: '100%', color: '#a1a1a1', fontSize: 12 }}>Valid ID:</p>
                                            <button className={`rounded p-0 ${trainee.valid_id === '' ? `border-2 border-red-200` : ''}`} ref={attachment} onClick={() => {onOpenModal(); setTraineeDocID(trainee.id); setHeader('Valid ID'); setLN(trainee.last_name); setFN(trainee.first_name); setCat('validID'); setAT('valid_id'); setAttachment(trainee.valid_id)}}>
                                                <ViewDocIcon color={'#0D70AB'} size={'32'}/>
                                            </button>
                                        </Box>
                                        <Box className='flex items-center pt-2 border-b-2 border-slate-200 space-x-2'>
                                            <p style={{ width: '100%', color: '#a1a1a1', fontSize: 12 }}>ID Picture:</p>
                                            <button className={`rounded p-0 ${trainee.photo === '' ? 'border-2 border-red-400' : ''}`} ref={attachment} onClick={() => {onOpenModal(); setTraineeDocID(trainee.id); setHeader('Profile Picture'); setLN(trainee.last_name); setFN(trainee.first_name); setCat('idPic'); setAT('photos'); setAttachment(trainee.photo)}}>
                                                <ViewDocIcon color={'#0D70AB'} size={'32'} />
                                            </button>
                                        </Box>
                                        <Box className='flex items-center pt-2 border-b-2 border-slate-200 space-x-2'>
                                            <p style={{ width: '100%', color: '#a1a1a1', fontSize: 12 }}>Signature:</p>
                                            <button className={`rounded p-0 ${trainee.e_sig === '' ? 'border-2 border-red-200' : ''}`} ref={attachment} onClick={() => {onOpenModal(); setTraineeDocID(trainee.id); setHeader('Signature'); setLN(trainee.last_name); setFN(trainee.first_name); setCat('esign'); setAT('e-signs'); setAttachment(trainee.e_sig)}}>
                                                <ViewDocIcon color={'#0D70AB'} size={'32'}/>
                                            </button>
                                        </Box>
                                    </Box>
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                        </Accordion>
                    </Box>
                </Box>
            </Box>
        </main>
        <Modal isOpen={isOpenModal} onClose={handleCloseMod} scrollBehavior='inside' size='xl' motionPreset='slideInTop'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader pb={0} >{header}</ModalHeader>
                <ModalCloseButton />
                <ModalBody pt={0}>
                    <Box className='flex-col p-2 space-y-3 items-center justify-center'>
                        <Box w='100%' className='flex items-end justify-end'>
                            <Button size='sm' variant='ghost' onClick={() => fileInputRef.current?.click()} leftIcon={<EditIcon size='20' color='#a1a1a1' />} >Change Image</Button>
                            <input ref={fileInputRef} onChange={handleImgFile}  type='file' accept='image/png, image/jpeg' style={{display: 'none'}} />
                        </Box>
                        <Box className='image-container w-full p-1 relative flex justify-center items-center rounded border outline-0 shadow-lg'>
                        {attachmentFile !== '' ? (
                            preview === null ? (
                                <Image className='image' src={attachmentFile} layout='fill' objectFit='contain' alt={header}/>
                            ) : (
                                <Image className='image' src={preview} layout='fill' objectFit='contain' alt={filename}/>
                            )
                        ) : (
                            <Text className='text-gray-400 absolute text-lg'>{filename}</Text>
                        )}
                        </Box>
                        <Box className='flex space-x-4'>
                            <Button onClick={handleUploadImg} isLoading={loading} loadingText='Uploading...' isDisabled={preview === null} colorScheme='green' w='100%'>Upload Image</Button>
                            <Button onClick={handleDownload} isDisabled={preview !== null} colorScheme='blue' w='100%'>Download Image</Button>
                        </Box>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
    )
}