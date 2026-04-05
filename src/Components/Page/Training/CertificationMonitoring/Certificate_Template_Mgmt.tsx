'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
    Box, Image, Text, Input, Button, FormControl, FormLabel,
    Menu, MenuButton, MenuList, MenuItem, Select,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter, ModalCloseButton,
    InputGroup, InputLeftAddon,
    useDisclosure, useToast,
} from '@chakra-ui/react'
import { ArrowBackIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { FiBold, FiItalic, FiList, FiAlignLeft, FiAlignCenter } from 'react-icons/fi'
import { MdOutlineFormatListNumbered } from 'react-icons/md'
import { SearchIcon } from '@/Components/Icons'

import { useCourses } from '@/context/CourseContext'
import { useCertification } from '@/context/CertificationContext'
import { useInstructors } from '@/context/InstructorContext'
import { CoursesById } from '@/types/courses'
import { ToastStatus } from '@/types/handling'

import { CERTIFICATION_BY_ID, CERTIFICATION, certVersion } from '@/types/certification'
import { SAVED_CERT_TEMPLATE, UPDATE_VERSION_FIELDS, DELETE_CERT_VERSION, ADD_CERT_VERSION, ADD_CHANGELOG_ENTRY } from '@/lib/certification_controller'
import { Timestamp } from 'firebase/firestore';

export default function Certificate_Template_Mgmt() {
    const toast = useToast()
    const { data: allCourses } = useCourses()
    const { data: allCertTemplates } = useCertification()
    const { data: allInstructors } = useInstructors()

    const [search, setSearch] = useState<string>('')
    const [closeBlur, setCloseBlur] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [action, setAct] = useState<string>('')
    const [category, setCategory] = useState('')
    const [courseID, setCourseID] = useState<string>('')
    const [courseName, setCourseName] = useState<string>('')
    const [courseCode, setCourseCode] = useState<string>('')
    const [versionNumber, setVersionNumber] = useState<string>('')
    const [companyID, setCompanyID] = useState<string>('')
    const [add_desc, setAdditionalDescription] = useState<string>('')
    const [sub_title, setSubTitle] = useState<string>('')
    const [courseType, setCourseType] = useState<string>('')

    // Editor & Title refs
    const editorRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLDivElement>(null)

    // Controlled states for preview & saving
    const [certTitleHtml, setCertTitleHtml] = useState('')
    const [certContentHtml, setCertContentHtml] = useState('')

    const { isOpen: isOpenCert, onOpen: onOpenCert, onClose: onCloseCert } = useDisclosure()
    const { isOpen: isOpenDCert, onOpen: onOpenDCert, onClose: onCloseDCert } = useDisclosure()

    /* ----------------------------- */
    /* Load Courses */
    /* ----------------------------- */

    const certificates = useMemo(() => {
        return allCertTemplates ?? []
    }, [allCertTemplates])

    const certificateVersions = useMemo(() => {
        if (!courseID) return [];
    
        return certificates
            .filter((c: CERTIFICATION_BY_ID) =>
                c.courseID === courseID &&
                (category ? c.category === category : true)
            )
            .flatMap((c) => c.versions ?? []);
    }, [certificates, courseID, category]);

    const [displayCourses, setDisplayCourses] = useState<CoursesById[]>([]);

    useEffect(() => {
        if (!allCourses || allCourses.length === 0) {
            setDisplayCourses([]);
            return;
        }

        const term = search.toLowerCase();

        const result = allCourses
            .filter((course) => {
                // 1. Search Logic
                const searchMatch = 
                    course.course_code?.toLowerCase().includes(term) ||
                    course.course_name?.toLowerCase().includes(term) ||
                    course.code?.toLowerCase().includes(term);
                return searchMatch;
            })
            .filter((course) => {
                // 2. Updated Type Logic:
                // If courseType is empty string, return true (show all).
                // Otherwise, compare the strings.
                const isFilterEmpty = courseType === "" || !courseType;
                const typeMatch = isFilterEmpty || course.courseType?.toString() === courseType.toString();
                
                return typeMatch;
            })
            .sort((a, b) => (a.course_code || "").localeCompare(b.course_code || ""));

        setDisplayCourses(result);
    }, [allCourses, courseType, search]); // Runs whenever data, type, or search changes

    /* ----------------------------- */
    /* Editor helpers */
    /* ----------------------------- */
    const exec = (cmd: string, ref: React.RefObject<HTMLDivElement>, value?: string) => {
        ref.current?.focus()
        document.execCommand(cmd, false, value)
        
        // Update the correct state
        if (ref === editorRef) {
            setCertContentHtml(editorRef.current?.innerHTML || '')
        } else if (ref === titleRef) {
            setCertTitleHtml(titleRef.current?.innerHTML || '')
        }
    }

    const handleEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
    
            const selection = window.getSelection()
            if (!selection || !selection.rangeCount) return
    
            const range = selection.getRangeAt(0)
    
            // create <br> and insert
            const br = document.createElement('br')
            range.insertNode(br)
    
            // move caret after the <br>
            range.setStartAfter(br)
            range.setEndAfter(br)
            selection.removeAllRanges()
            selection.addRange(range)
    
            setCertContentHtml(editorRef.current?.innerHTML || '')
        }
    }

    const handleDeleteVersion = async () => {
        setLoading(true)
    
        try {
            // 🔥 Find correct certificate document
            const foundCert = certificates.find((c: CERTIFICATION_BY_ID) =>c.courseID === courseID && c.category === category)
        
            if (!foundCert) {
                console.warn('Certificate document not found.')
                return
            }
        
            // 🔥 Verify version exists
            const versionExists = foundCert.versions.some((v: certVersion) => v.version_number === versionNumber)
        
            if (!versionExists) {
                console.warn('Version not found in certificate.')
                return
            }
        
            await DELETE_CERT_VERSION(foundCert.id, versionNumber)
        
            toast({
                title: 'Cert. version successfully deleted.',
                status: 'success',
                duration: 5000,
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
            onCloseDCert()
        }
    }

    const handleSaveTemplate = async () => {
        setLoading(true)
        const author = localStorage.getItem('customToken')
        if (!certContentHtml.trim() || !certTitleHtml.trim()) {
            toast({
                title: 'Please fill in title and content',
                status: 'warning',
                duration: 3000,
            })
            return
        }
        if(action === 'insert'){
            let foundActiveVersion = ''

            const foundCert = certificates.find(
                (c: CERTIFICATION_BY_ID) =>
                c.courseID === courseID && c.category === category
            )

            if (!foundCert) {
                console.warn('No certificate found for this category')
                setLoading(false)
                return
            }

            const activeVersion = foundCert.versions.find(
                (v: certVersion) => v.status === 'active'
            )

            if (activeVersion) {
                foundActiveVersion = activeVersion.version_number
                await UPDATE_VERSION_FIELDS(foundCert.id, foundActiveVersion, {
                    status: 'archived',
                })
            }

            const newVersion: certVersion = {
                version_number: versionNumber,
                certTitleHtml,
                certContentHtml,
                status: 'active',
                additionalDescription: add_desc,
                subTitle: sub_title,
                primary_author: author || 'unknown',
                createdAt: Timestamp.now(),
                changelogArr: [],
            }

            await ADD_CERT_VERSION(foundCert.id, newVersion)

            toast({
                title: 'New Version saved successfully',
                status: 'success',
                duration: 3000,
            })
            // Clear editor after save
            setCertTitleHtml('')
            setCertContentHtml('')
            setLoading(false)
            if (editorRef.current) editorRef.current.innerHTML = ''
            if (titleRef.current) titleRef.current.innerHTML = ''

            onCloseCert()
            return
        } else if (action === 'edit'){
            let foundActiveVersion = ''
            const editedVersion = {
                certTitleHtml: certTitleHtml,
                certContentHtml: certContentHtml,
                changelogArr: [],
            }
            const foundActiveCert = certificates.filter((f: CERTIFICATION_BY_ID) => f.courseID === courseID).map(
                (cv: CERTIFICATION_BY_ID) => {
                    const activeVersion = cv.versions.find((v: certVersion) => v.status === 'active');
                    if (activeVersion) {
                        foundActiveVersion = activeVersion.version_number;
                        return cv;
                    }
                    return
                }
            )

            if (!foundActiveCert) {
                console.warn('No active certificate version found.')
                return
            }
            if (foundActiveCert[0]?.id && foundActiveVersion) {
                await UPDATE_VERSION_FIELDS(foundActiveCert[0].id, foundActiveVersion, editedVersion)
                
                const entry = {certID: foundActiveCert[0].id, v_Number: foundActiveVersion, newEntry: {message: 'Updated Certificate Content', updatedBy: author || 'unknown', updatedAt: Timestamp.now()}}
                await ADD_CHANGELOG_ENTRY(entry)
            } else {
                console.warn('Certificate ID or active version is undefined.')
            }
            toast({
                title: 'Edited Version saved successfully',
                status: 'success',
                duration: 3000,
            })
            // Clear editor after save
            setCertTitleHtml('')
            setCertContentHtml('')
            setLoading(false)
            if (editorRef.current) editorRef.current.innerHTML = ''
            if (titleRef.current) titleRef.current.innerHTML = ''

            onCloseCert()
            return
        }

        const certData = {
            courseID: courseID,
            category: category as 'generic' | 'client',
            companyID: companyID,
        }

        const savedCert: CERTIFICATION = {
            ...certData,
            versions: [
                {
                    version_number: versionNumber,
                    certTitleHtml: certTitleHtml,
                    certContentHtml: certContentHtml,
                    status: 'active',
                    additionalDescription: add_desc,
                    subTitle: sub_title,
                    primary_author: author || 'unknown',
                    createdAt: Timestamp.now(),
                    changelogArr: [],
                },
            ],
        }
        await SAVED_CERT_TEMPLATE({...savedCert}, author || 'unknown')

        toast({
            title: 'Certificate saved successfully',
            status: 'success',
            duration: 3000,
        })

        // Clear editor after save
        setCertTitleHtml('')
        setCertContentHtml('')
        setLoading(false)
        setAdditionalDescription('')
        setSubTitle('')
        if (editorRef.current) editorRef.current.innerHTML = ''
        if (titleRef.current) titleRef.current.innerHTML = ''

        onCloseCert()
    }

    useEffect(() => {
        if (action === 'edit' && (editorRef.current && titleRef.current)) {
            editorRef.current.innerHTML = certContentHtml || ''
            titleRef.current.innerHTML = certTitleHtml || ''
        }
    }, [action])

    return (
    <>
        <Box>
            <Box> 
                <Text className='text-lg text-sky-700'>{'Courses'}</Text> 
            </Box>
            <Box className='flex space-x-4' > 
                <Box className='w-full space-y-3' > 
                    <Box className='flex items-center justify-between'> 
                        <Box display='flex' gap='2' justifyContent='start' alignItems='center'> 
                            <InputGroup w='600px' size='sm'> 
                                <InputLeftAddon >
                                    <SearchIcon size={'20'} color={'#a1a1a1'} /> 
                                </InputLeftAddon> 
                                <Input onChange={(e) => setSearch(e.target.value)} value={search} placeholder='Search by Code, Course Code or Name...' type='text' fontSize='sm' borderRadius='5px' autoComplete='off' _focus={{ boxShadow:'0px 0px 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/> 
                            </InputGroup> 
                            <Select size='sm' w='30%' onChange={(e) => setCourseType(e.target.value)} value={courseType} borderRadius='5px' _focus={{ boxShadow:'0px 0px 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}>
                                <option value="" hidden>Filter by Course Type</option>
                                <option value={"0"}>Marina</option>
                                <option value={"1"}>In-House</option>
                            </Select>
                            {(courseType || search) && (
                                <Button w='20%' mr={4} onClick={() => { setCourseType(''); setSearch(''); }} colorScheme='red' size='sm' shadow='md'>Clear Filter</Button>
                            )}
                        </Box> 
                    </Box> 
                    <Box className='space-y-3 ' style={{height: '650px'}}> 
                        <Box className='h-full space-y-2'> 
                            <Box className='border-b py-2 px-2 bg-sky-700 rounded border-gray-400 flex justify-between'> 
                                <Text w='40%' className='text-center text-white '>Course Code</Text> 
                                <Text w='100%' className='text-center text-white '>Course</Text> 
                                <Text w='50%' className='text-center text-white '>Training Mode</Text> 
                                <Text w='50%' className='text-center text-white '>Course Type</Text> 
                                <Text w='100%' className='text-center text-white '>Certificate Template</Text> 
                            </Box> 
                            <Box className='space-y-2' style={{ height: 'calc(100% - 50px)', overflowY: 'scroll' }}> 
                            {displayCourses.length === 0 ? 
                                ( <Box className='text-center text-lg p-3 text-gray-500 font-semibold'>No Courses Available.</Box> ) 
                                : 
                                ( displayCourses.map((course) => ( 
                                    <Box key={course.id} fontWeight='normal' _hover={{bgColor: 'gray.300', shadow: 'md', cursor: 'default'}} className='flex items-center justify-center w-full bg-gray-rounded p-3 border border-gray-300 shadow-md'> 
                                        <Text w='40%' fontSize='12px' className='text-center uppercase font-semibold w-2/5'>{course.course_code}</Text> 
                                        <Text w='100%' fontSize='12px' className='text-wrap uppercase text-center w-full'>{course.course_name}</Text> 
                                        <Text w='50%' fontSize='12px' className='text-center w-1/2 '>{course.trainingMode === 0 ? 'Non-Simulator' : 'Simulator'}</Text> 
                                        <Text w='50%' fontSize='12px' className='text-center w-1/2 '>{course.courseType === 0 ? 'Marina' : 'In-House'}</Text> 
                                        <Box w='100%' display='flex' justifyContent='center'> 
                                            <Menu closeOnBlur={true} closeOnSelect={closeBlur}> 
                                                <MenuButton as={Button} onClick={() => {setCategory(''); setAct(''); setCourseID(''); setCloseBlur(false);}} size='sm' variant='ghost' colorScheme='blue' transition='all 0.2s'> 
                                                    <Text fontSize='12px'>Manage Certificate <ChevronDownIcon /></Text> 
                                                </MenuButton> 
                                                <MenuList w='250px' px='1'> 
                                                    {category === '' ? (
                                                    <> 
                                                        <MenuItem onClick={() => {setCategory('generic'); setCourseID(course.id); setCourseName(course.course_name.toUpperCase()); setCourseCode(course.course_code.toUpperCase());}}>Generic</MenuItem> 
                                                        <MenuItem onClick={() => {setCategory('client'); setCourseID(course.id); setCourseName(course.course_name.toUpperCase()); setCourseCode(course.course_code.toUpperCase());}}>Client Specific</MenuItem> 
                                                    </>
                                                    ) : (
                                                    <>
                                                        {action === 'preview' ? (
                                                        <>
                                                            <MenuItem icon={<ArrowBackIcon />} onClick={() => {setCategory(''); setAct('');}}>{'Back'}</MenuItem> 
                                                            {certificateVersions.map((v: certVersion) => {
                                                                return(
                                                                    <MenuItem key={v.version_number} display='flex' justifyContent='space-between' borderBottom='1px solid gray' onClick={() => {setSubTitle(v?.subTitle); setAdditionalDescription(v?.additionalDescription); setVersionNumber(v.version_number); setCertTitleHtml(v.certTitleHtml); setCertContentHtml(v.certContentHtml); onOpenCert(); setCloseBlur(true);}}>
                                                                        <Box>
                                                                            {category === 'client' && (
                                                                                <Text>{`${v.subTitle}`}</Text>
                                                                            )}
                                                                            <Text>{`Version ${v.version_number}`}</Text>
                                                                            <Text fontWeight='bold' color={`${(v.status==='active' ? 'green.500' : 'black' )}`}>{`${v.status.toUpperCase()}`}</Text>
                                                                        </Box>
                                                                        <Button onClick={(e) => {e.stopPropagation(); setVersionNumber(v.version_number); onOpenDCert();}} size='xs' colorScheme='red' variant='outline' shadow='md' borderRadius='5px'>Delete</Button>
                                                                    </MenuItem>
                                                                )
                                                            })}
                                                        </>
                                                        ) : (
                                                            <> 
                                                                <MenuItem icon={<ArrowBackIcon />} onClick={() => {setCategory(''); setAct('');}}>{'Back'}</MenuItem> 
                                                                {certificateVersions.length > 0 && <MenuItem onClick={() => {setAct('insert'); onOpenCert();}}>{'Add New Version'}</MenuItem> }
                                                                {certificateVersions.length === 0 && <MenuItem onClick={() => {setAct('create'); onOpenCert();}}>{'Create New'}</MenuItem> }
                                                                <MenuItem onClick={() => {setAct('preview'); }}>{'Preview Cert.'}</MenuItem> 
                                                            </> 
                                                        )}
                                                    </>
                                                    )} 
                                                </MenuList> 
                                            </Menu> 
                                        </Box> 
                                    </Box> 
                                )) )} 
                            </Box> 
                        </Box> 
                    </Box> 
                </Box> 
            </Box>
        </Box>
      {/* ================= MODAL ================= */}
    <Modal isOpen={isOpenCert} onClose={() => { if(editorRef.current){editorRef.current.innerHTML = ''}; if(titleRef.current){titleRef.current.innerHTML = ''}; setCertTitleHtml(''); setCertContentHtml(''); onCloseCert();}} size={action === 'create' || action === 'insert' || action === 'edit' ? '6xl' : '5xl'} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{`Certificate - ${['create', 'insert', 'edit'].includes(action) ? 'Editor' : 'Preview'}`}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                {action === 'create' || action === 'insert' || action === 'edit' ? (
                    <Box display="flex" gap="6">
                        {/* ========== EDITOR ========== */}
                        <Box w='50%'>
                            <Box display='flex' justifyContent='end' mb='2'>
                                {action === 'edit' && <Button onClick={() => setAct('preview')} colorScheme='blue' bgColor='blue.700' shadow='md' size='sm'>Preview Content</Button>}
                            </Box>
                            <FormControl mb="3" display="flex" alignItems="end" justifyContent="space-between">
                                <FormLabel whiteSpace="nowrap">Certificate Version:</FormLabel>
                                <Input value={versionNumber} onChange={(e) => setVersionNumber(e.target.value)} placeholder="v1.0.230207" fontWeight="thin" variant="flushed" />
                            </FormControl>
                            <FormControl mb="3">
                                <FormLabel>Certificate Title:</FormLabel>
                                <Box ref={titleRef} contentEditable minH="40px" border="1px solid #ccc" borderRadius="md" p="2" fontSize="22px" fontWeight="bold" onKeyDown={handleEnter} onInput={() => setCertTitleHtml(titleRef.current?.innerHTML || '')} suppressContentEditableWarning />
                            </FormControl>
                            {category === 'client' && (
                            <>
                                <FormControl mb="3" display="flex" alignItems="end" justifyContent="space-between">
                                    <FormLabel whiteSpace="nowrap">Sub Title:</FormLabel>
                                    <Input value={sub_title} onChange={(e) => setSubTitle(e.target.value)} placeholder="Specific Cert. Version" fontWeight="thin" variant="flushed" />
                                </FormControl>
                                <FormControl mb="3" display="flex" alignItems="end" justifyContent="space-between">
                                    <FormLabel whiteSpace="nowrap">Description:</FormLabel>
                                    <Input value={add_desc} onChange={(e) => setAdditionalDescription(e.target.value)} placeholder="Specific pupose of this version" fontWeight="thin" variant="flushed" />
                                </FormControl>
                            </>
                            )}
                            {/* Toolbar */}
                            <Box display="flex" gap="2" mb="2">
                                <Button size="sm" onClick={() => exec('bold', editorRef)}><FiBold /></Button>
                                <Button size="sm" onClick={() => exec('italic', editorRef)}><FiItalic /></Button>
                                <Button size="sm" onClick={() => exec('justifyLeft', editorRef)}><FiAlignLeft /></Button>
                                <Button size="sm" onClick={() => exec('justifyCenter', editorRef)}><FiAlignCenter /></Button>
                                <Button size="sm" onClick={() => exec('insertUnorderedList', editorRef)}><FiList /></Button>
                                <Button size="sm" onClick={() => exec('insertOrderedList', editorRef)}><MdOutlineFormatListNumbered /></Button>
                                {/* Font Size Selector */}
                                <select onChange={(e) => exec('fontSize', titleRef, e.target.value)} defaultValue="3" style={{ height: '30px' }}>
                                    <option value="1">8pt</option>
                                    <option value="2">10pt</option>
                                    <option value="3">12pt</option>
                                    <option value="4">14pt</option>
                                    <option value="5">18pt</option>
                                    <option value="6">24pt</option>
                                    <option value="7">36pt</option>
                                </select>
                            </Box>
                            <Box ref={editorRef} contentEditable minH="280px" maxH="280px" w="500px" maxW="500px" overflowY="auto" overflowX="auto" whiteSpace="pre-wrap" wordBreak="break-word" border="1px solid #ccc" borderRadius="md" p="4" fontWeight="normal" onKeyDown={handleEnter} onInput={() => setCertContentHtml(editorRef.current?.innerHTML || '')} suppressContentEditableWarning
                                sx={{
                                    '& ul': { listStyleType: 'disc', listStylePosition: 'inside', paddingLeft: '1.5rem', margin: '0.5rem 0' },
                                    '& ol': { listStyleType: 'decimal', listStylePosition: 'inside', paddingLeft: '1.5rem', margin: '0.5rem 0' },
                                    '& li': { marginBottom: '0.25rem' },
                                    '& p': { margin: '12px 0' },
                                }}
                            />
                        </Box>
                        {/* ========== PREVIEW ========== */}
                        <Box w='50%'>
                            <Text fontWeight="bold" mb="2" textAlign='center' fontSize='lg'>Certificate Content Preview</Text>
                            <Box border="1px solid #ccc" borderRadius="md" bg="white" p="6" minH="280px" w="500px" maxW="500px" shadow="sm"
                                sx={{
                                    '& ul': {
                                        listStyleType: 'disc',
                                        listStylePosition: 'inside',
                                        paddingLeft: '1.5rem',
                                        margin: '0.5rem 0',
                                    },
                                    '& ol': {
                                        listStyleType: 'decimal',
                                        listStylePosition: 'inside',
                                        paddingLeft: '1.5rem',
                                        margin: '0.5rem 0',
                                    },
                                    '& li': {
                                        marginBottom: '0.25rem',
                                    },
                                    '& p': {
                                        margin: '12px 0',
                                    },
                                    '& div': {
                                        margin: '12px 0',  // <-- important
                                        whiteSpace: 'pre-wrap', // <-- preserves line breaks
                                    },
                                    '& br': {
                                        display: 'block', // ensures <br> forces line break
                                        content: '""',
                                    },
                                }}
                            >
                                <div dangerouslySetInnerHTML={{ __html: certTitleHtml }} />
                                <div dangerouslySetInnerHTML={{ __html: certContentHtml }} />
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <>
                    <Box display='flex' px='8' alignItems='end' justifyContent='space-between' mb='2'>
                        <Box>
                            {category==='client' && (
                                <Box display='flex' mr='3' fontSize='lg'>
                                    <Text mr='2'>Client Cert. Title.:</Text>
                                    <Text fontWeight='normal'>{sub_title}</Text>
                                </Box>
                            )}
                            <Box display='flex' fontSize='lg'>
                                <Text mr='2'>Version No.:</Text>
                                <Text fontWeight='normal'>{versionNumber}</Text>
                            </Box>
                        </Box>
                        <Button onClick={() => {setAct('edit'); if (editorRef.current) { editorRef.current.innerHTML = certContentHtml; } if(titleRef.current) {titleRef.current.innerHTML = certTitleHtml}}} shadow='md' size='sm' bgColor='blue.700' colorScheme='blue'>Edit Content</Button>
                    </Box>
                    <Box position='relative' display='flex' flexDir='column' justifyContent='center' alignItems='center' >
                        <Box w='90%' border='1px solid gray' position='relative' zIndex={2} display='flex' fontSize='12pt' fontWeight='normal' fontFamily='Arial' flexDir='column' alignItems='center' px='4' pt='8'>
                            <Image src={'/certificateHeader.png'} alt='header image' w='7.25in' h='1.20in'  objectFit='cover'/>
                            <Box pt='12' pr='5' pb='5' display='flex' justifyContent='end' w='85%'>
                                <Box fontWeight='bold' fontSize='12pt' textAlign='start'>
                                    <Text>
                                        Certificate No.: 
                                        <Text as='span' fontWeight={'normal'}>
                                            {`${courseCode}-B00-0001`}
                                        </Text>
                                    </Text>
                                    <Text>
                                        Registration No.: 
                                        <Text as='span' fontWeight={'normal'}>
                                            REG-2026-00-0000
                                        </Text>
                                    </Text>
                                </Box>
                            </Box>
                            <Box w='100%' display='flex' flexDir='column' alignItems='center' justifyContent='center' gap='3'>
                                <Text fontWeight='bold' fontSize='26pt'>Certificate of Completion</Text>
                                <Text >This Certificate is issued to</Text>
                                <Text fontWeight='bold' fontSize='16pt'>NAME</Text>
                                <Text>for having successfully completed the training course in</Text>
                                <Text fontSize='14pt' textAlign='center' fontWeight='bold'>
                                    {/* {certTitleHtml.toUpperCase()} */}
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: `${certTitleHtml.toUpperCase()}`
                                        }}
                                    />
                                </Text>
                                <Box w='85%' textAlign='center' sx={{
                                    '& ul': {
                                        listStyleType: 'disc',
                                        listStylePosition: 'inside',
                                        paddingLeft: '1.5rem',
                                        margin: '0.0055rem 0',
                                    },
                                    '& ol': {
                                        listStyleType: 'decimal',
                                        listStylePosition: 'inside',
                                        paddingLeft: '1.5rem',
                                        margin: '0.0055rem 0',
                                    },
                                    '& li': {
                                        marginBottom: '0.0055rem',
                                    },
                                    '& p, & div': {
                                        display: 'inline',
                                        margin: 0,
                                    },
                                    '& br': {
                                        display: 'inline',
                                    },
                                }}>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: `Conducted on _____________ ${certContentHtml}`
                                        }}
                                    />
                                </Box>
                                <Text>{`Issued this ____ day of __________, 2026 in Manila City, Philippines`}</Text>
                                <Box pt='8' display='flex' gap='4' alignItems='end' justifyContent='space-between' w='100%'>
                                    <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                        {(() => {
                                            const ins = allInstructors?.find((i: { name: string }) => i.name === 'ROGELIO C. MAHINAY')
                                            const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                        
                                            return(
                                                <>
                                                    <Box position='absolute' top='-50px' left='20%' transform="translateX(-10%)" zIndex={2} >
                                                        <Image src={eSignSrc} w='100%' h='100%' alt='signature' />
                                                    </Box>
                                                    <Box borderTop='1px solid black' w='80%' />
                                                    <Text position='relative' textAlign='center' zIndex={1} w='100%' pt='2' fontSize='10pt' fontWeight='bold'>
                                                        {(() => {
                                                            if (!ins) return 'No Instructor';
                    
                                                            return `${ins.rank} ${ins.name}`;
                                                        })()}
                                                    </Text>
                                                    <Text fontSize='10pt'>Training Director</Text>
                                                </>
                                            )
                                        })()}
                                    </Box>
                                    <Box w='50%' pb='9' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center'>
                                        <Box w='1.5in' h='1.5in' border='1px solid black' />
                                    </Box>
                                    <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                        {(() => {
                                            const ins = allInstructors?.find((i: { name: string }) => i.name === 'MA. JOSEFA T. ALONSAGAY')
                                            const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                        
                                            return(
                                                <>
                                                    <Box position='absolute' top='-45px' left='-8%' transform="translateX(5%)" zIndex={2} >
                                                        <Image src={eSignSrc} w='100%' h='100%' alt='signature' />
                                                    </Box>
                                                    <Box borderTop='1px solid black' w='90%' />
                                                    <Text position='relative' textAlign='center' zIndex={1} w='100%' pt='2' fontSize='10pt' fontWeight='bold'>
                                                        {(() => {
                                                            if (!ins) return 'No Instructor';
                    
                                                            return `${ins.rank} ${ins.name}`;
                                                        })()}
                                                    </Text>
                                                    <Text fontSize='10pt'>President</Text>
                                                </>
                                            )
                                        })()}
                                    </Box>
                                </Box>
                                <Box pt='7' pb='10' display='flex' gap='1' justifyContent='center' alignItems='center' w='100%'>
                                    <Image src={'/cert_ISO_Label.png'} alt='header image' w='1.49in'   objectFit='cover'/>
                                    <Box w='0.9in' display='flex' justifyContent='center' alignItems='center' h='1.2in'>
                                        <Box w='0.8in' border='1px solid black' h='0.8in'>
                                            <Text textAlign='center' >QR Code here</Text>
                                        </Box>
                                    </Box>
                                    <Box fontWeight='bold' fontSize='9pt' ps='7' pr='7' py='3' borderLeft='1px solid black'>
                                        <Text>Landline: (02) 8281-8155</Text>
                                        <Text>Email: pentagonmaritimeservices@gmail.com</Text>
                                        <Text>FB: pentagonmaritimeservicescorp</Text>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Box position='absolute' bottom='0' left='0' zIndex='1' w='100%' display='flex' justifyContent='center' alignItems='center'>
                            <Image  src={'/certificateFooter.png'} alt='header image' w='9in' h='2.25in'  objectFit='cover'/>
                        </Box>
                    </Box>
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                {['create', 'insert', 'edit'].includes(action) &&
                    <Button isLoading={loading} loadingText='Saving Template...' bgColor='blue.700' colorScheme="blue" mr={3} onClick={handleSaveTemplate} >
                        Save Content
                    </Button>
                }
            </ModalFooter>
        </ModalContent>
    </Modal>
    {/** Delete Cert Version Modal */}
    <Modal isOpen={isOpenDCert} onClose={() => { setVersionNumber(''); onCloseDCert();}} size={'xl'} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Delete Certificate Version</ModalHeader>
            <ModalCloseButton />
            <ModalBody display='flex' flexDir='column' alignItems='center' fontWeight='normal' fontSize='md' textAlign='center' >
                <Text>Are you sure you want to delete this certificate version?</Text>
                <Text>This action is permanent and will not be able to restore the data once deleted.</Text>
            </ModalBody>
            <ModalFooter display='flex' justifyContent='center'>
                <Button mr='3' shadow='md'>Cancel</Button>
                <Button isLoading={loading} loadingText='Deleting...' onClick={handleDeleteVersion} colorScheme='red' shadow='md'>Yes, I authorize to delete this version.</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    </>
    )
}
