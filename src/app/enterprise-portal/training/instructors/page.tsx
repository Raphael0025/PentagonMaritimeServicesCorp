'use client'

import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react'
import { Box, Text, Input, Tooltip, useToast, Button, FormControl, IconButton, HStack, VStack, FormHelperText, Tab, Tabs, TabList, TabPanels, TabPanel, Textarea, FormLabel, Modal, ModalHeader,ModalContent, ModalOverlay, ModalCloseButton, ModalBody, ModalFooter, useDisclosure } from '@chakra-ui/react'
import { FiBold, FiItalic, FiList, FiLink } from "react-icons/fi";
import { MdOutlineFormatListNumbered } from "react-icons/md";

import { AttachmentIcon, CloseIcon } from '@chakra-ui/icons'

import { Instructor, initInstructor } from '@/types/instructor'
import { useInstructors } from '@/context/InstructorContext'
import { ADD_INSTRUCTOR, DELETE_INSTRUCTOR, CHANGE_ATTACHMENTS, UPDATE_INSTRUCTOR } from '@/lib/instructor_controller'
import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { ViewDocIcon, EditIcon, } from '@/Components/Icons'

import { getDownloadURL, ref, getStorage  } from "firebase/storage";

export default function Page() {
    const toast = useToast()
    const { data: allInstructors } = useInstructors()

    const [loading, setLoading] = useState<boolean>(false)
    const [loadingModal, setLoadingModal] = useState<boolean>(false)
    const [toggle, setToggle] = useState<boolean>(false)
    const [instructor, setInstructor] = useState<Instructor>(initInstructor)
    const [e_sign, setESign] = useState<File[]>([])
    const [preview, setPreview] = useState<string | null>(null)
    const [fileName, setFilename] = useState<string>('No file chosen yet...')
    const [insID, setIDIns] = useState<string>('')
    const [attachmentFile, setAttachment] = useState<string>('')
    const [email, setEmail] = useState<string>('')

    const attachment = useRef<HTMLButtonElement>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const editorRef = useRef<HTMLDivElement>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const [subject, setSubject] = useState<string>('')
    const [files, setFiles] = useState<File[]>([])

    const { isOpen: isOpenIns, onOpen: onOpenIns, onClose: onCloseIns } = useDisclosure()
    const { isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()
    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
    const { isOpen: isOpenEmail, onOpen: onOpenEmail, onClose: onCloseEmail } = useDisclosure()

    const [emails, setEmails] = useState<any[]>([])

    useEffect(() => {
        const fetchEmails = async () => {
            const res = await fetch("/api/gmail/sent")
            const data = await res.json()

            if (Array.isArray(data)) {
            setEmails(data)
            } else {
            setEmails([]) // fallback safety
            }
        }

        fetchEmails()
    }, [])

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        setFiles(Array.from(e.target.files))
    }

    // Remove a file from the list
    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }

    // Helper: format file size
    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    // Apply link to selected text
    const insertLink = () => {
        const url = prompt('Enter URL (include https://)')
        if (!url) return

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        const text = range.toString() || url

        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        a.textContent = text

        range.deleteContents()
        range.insertNode(a)
        selection.removeAllRanges()
    }

    const sendEmail = async () => {
        setLoading(true)
        const htmlBody = editorRef.current?.innerHTML || ''
        
        const formData = new FormData()
        formData.append('subject', subject)
        formData.append('to', email)
        formData.append('bodyHtml', htmlBody)

        files.forEach((file) => {
            formData.append('attachments', file)
        })

        const res = await fetch('/api/email-instructor', {
            method: 'POST',
            body: formData
        })

        if (res.ok) {
            alert('Email sent!')
            setFiles([])
            setSubject('')
            setLoading(false)
            if (editorRef.current) editorRef.current.innerHTML = ''
        } else {
            alert('Failed to send email')
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

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target
        setInstructor((prev) => ({
            ...prev,
            [id]: value.toUpperCase()
        }))
    }
    
    const handleESign = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if(files && files.length > 0){
            setESign(Array.from(files))
            const file = files[0].name
            setFilename(file)
            const e_sign = files[0]

            const objectURL = URL.createObjectURL(e_sign)
            setPreview(objectURL)
        } else {
            setFilename('No file chosen yet...')
        }
    }

    const handleSubmit = async () => {
        setLoading(true)

        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    await ADD_INSTRUCTOR(instructor, e_sign, instructor.name, actor ?? null)
                    handleToast('Instructor Created Successfully', ``, 5000, 'success')
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
            setInstructor(initInstructor)
            onCloseIns()
        })
    }

    const handleCloseMod = () => {
        onCloseModal()
        setFilename('No file chosen yet...')
        // setPreview(null)
    }

    const handleUploadImg = async () => {
        try{
            setLoading(true)
            await CHANGE_ATTACHMENTS(insID, instructor.name, fileName, e_sign)
            handleToast(`Successfully changed Trainee's Attachment.`, `Trainee's attachment file has been updated.`, 5000, 'success')
        } catch(error){
            console.error('Error updating trainee image: ', error);
            handleToast(`Failed to change Trainee's Attachment.`, `Trainee's attachment file was not successfully updated. Please issue this to the IT department.`, 5000, 'success')
        } finally {
            setLoading(false)
            setPreview(null)
            setFilename('No file chosen yet...')
            setESign([])
            handleCloseMod()
        }
    }

    const handleUpdate = async () => {
        setLoadingModal(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    await UPDATE_INSTRUCTOR(insID, instructor, actor ?? null)
                    handleToast('Instructor Updated Successfully', ``, 5000, 'success')
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        } ).finally(() => {
            setIDIns('')
            setLoadingModal(false)
            onCloseEdit()
        })
    }
    
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

    const handleDelete = async () => {
        setLoadingModal(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    await DELETE_INSTRUCTOR(insID, actor ?? null)
                    handleToast('Instructor Deleted Successfully', ``, 5000, 'success')
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }
        ).finally(() => {
            setIDIns('')
            setLoadingModal(false)
            onCloseDelete()
        })
    }

    const handleSubmitEmail = () => {

    }

    return(
    <>
        <Box >
            <Box px='4' display='flex' justifyContent='space-between'>
                <Text fontSize='lg'>INSTRUCTORS</Text>
                <Button onClick={onOpenIns} colorScheme='blue' bgColor='blue.700' size='sm' shadow='md' m={2}>Add Instructor</Button>
            </Box>
            <Box px='4'>
                <Box display='flex' justifyContent='space-between' borderRadius='5px' border='1px solid black' p='2'>
                    <Text w='100px' textAlign='center' >Date Added</Text>
                    <Text w='250px' textAlign='center' >Name</Text>
                    <Text w='100px' textAlign='center' >Rank/Position</Text>
                    <Text w='100px' textAlign='center' >Attachments</Text>
                    <Text w='300px' textAlign='center' >Action</Text>
                </Box>
                <Box>
                    {allInstructors && allInstructors.map((ins) => (
                        <Box key={ins.id} p='1' fontWeight='normal' display='flex' alignItems='center' justifyContent='space-between' borderBottom='1px solid black'>
                            <Text w='100px' textAlign='center' >{parsingTimestamp(ins?.date_added).toLocaleDateString('en-US', {  year: 'numeric', month: 'numeric',  day: 'numeric',})}</Text>
                            <Text w='250px' textAlign='center' >{ins.name}</Text>
                            <Text w='100px' textAlign='center' >{ins.rank}</Text>
                            <Button w='100px' className={`rounded p-0 ${ins.e_sign === '' ? `border-2 border-red-200` : ''}`} ref={attachment} onClick={() => { setInstructor(ins); setAttachment(ins.e_sign); onOpenModal();}}>
                                <ViewDocIcon color={'#0D70AB'} size={'32'}/>
                            </Button>
                            <Box w='300px' justifyContent={'center'} alignItems='center' display='flex' gap='2'>
                                <Button w='50%' onClick={() => {setIDIns(ins.id); setInstructor(ins); onOpenEdit();}} size='xs' shadow='md' mb='1' colorScheme='blue' >Edit</Button>
                                <Button w='50%' onClick={() => {setIDIns(ins.id); onOpenDelete();}} size='xs' shadow='md' mb='1' colorScheme='red' >Delete</Button>
                                <Button w='50%' onClick={() => {setIDIns(ins.id); onOpenEmail();}} size='xs' shadow='md' mb='1' colorScheme='teal' >Send Email</Button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
        <Modal isOpen={isOpenEmail} onClose={onCloseEmail} size='xl' scrollBehavior='inside'>
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton />
                <ModalBody>
                    <Tabs mt='6' variant='enclosed' colorScheme='blue'>
                        <TabList>
                            <Tab onClick={() => setToggle(!toggle)}>Compose Email</Tab>
                            <Tab onClick={() => setToggle(!toggle)}>Training Details</Tab>
                            <Tab >test</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Box gap="4" display="flex" flexDirection="column">
                                    <Text fontWeight="bold">Compose Message</Text>
                                    <FormControl isRequired>
                                        <FormLabel>To</FormLabel>
                                        <Input placeholder='Input email here...' onChange={(e) => setEmail(e.target.value)} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Subject</FormLabel>
                                        <Input onChange={(e) => setSubject(e.target.value)} />
                                    </FormControl>
                                    {/* Toolbar */}
                                    <Box display="flex" gap={2} mb={2}>
                                        <Button size="sm" onClick={() => document.execCommand('bold')}><FiBold /></Button>
                                        <Button size="sm" onClick={() => document.execCommand('italic')}><FiItalic /></Button>
                                        <Button size="sm" onClick={() => document.execCommand('insertUnorderedList')}><FiList /></Button>
                                        <Button size="sm" onClick={() => document.execCommand('insertOrderedList')}><MdOutlineFormatListNumbered /></Button>
                                        <Tooltip
                                            label="Insert Link"
                                            hasArrow
                                            placement="right"
                                            // sx={{
                                            //     '.chakra-tooltip__content': {
                                            //     animation: 'slideIn 0.3s ease-in-out',
                                            //     },
                                            //     '@keyframes slideIn': {
                                            //     from: { transform: 'translateX(-10px)', opacity: 0 },
                                            //     to: { transform: 'translateX(0)', opacity: 1 },
                                            //     },
                                            // }}
                                        >
                                            <Button size="sm" onClick={insertLink}><FiLink /></Button>
                                        </Tooltip>
                                        <Button leftIcon={<AttachmentIcon />} size="sm" onClick={() => fileRef.current?.click()}>Attach Files</Button>
                                    </Box>
                                    <Box ref={editorRef} contentEditable minH="200px" border="1px solid #ccc" borderRadius="md" p="3" shadow="md" suppressContentEditableWarning sx={{
                                        '& ul': {
                                        listStyleType: 'disc',
                                        paddingLeft: '1.5rem',
                                        },
                                        '& ol': {
                                        listStyleType: 'decimal',
                                        paddingLeft: '1.5rem',
                                        },
                                        '& li': {
                                        marginBottom: '0.25rem',
                                        },
                                    }} />
                                    {/* Hidden file input */}
                                    <input ref={fileRef} type="file" multiple hidden onChange={handleFiles} />
                                    {/* Attachment preview */}
                                    {files.length > 0 && (
                                        <Box border="1px dashed gray" borderRadius="md" p={2}>
                                            {files.map((file, index) => (
                                            <HStack key={index} justifyContent="space-between" mb={1}>
                                                <Text fontWeight='normal' fontSize="sm">
                                                📎 {file.name} ({formatBytes(file.size)})
                                                </Text>
                                                <IconButton aria-label="Remove file" icon={<CloseIcon />} size="xs" variant="ghost" onClick={() => removeFile(index)} />
                                            </HStack>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>
                            <TabPanel>
                                <Box gap='4' display='flex' flexDirection='column'>
                                    <Box display='flex'>
                                        <Text mr='3' color='gray.500'  fontWeight='bold'>To:</Text>
                                        <Text fontWeight='normal'>{allInstructors && allInstructors.find((f) => f.id === insID)?.name}</Text>
                                    </Box>
                                    <Box display='flex'>
                                        <Text mr='3' color='gray.500'  fontWeight='bold'>Email:</Text>
                                        <Text fontWeight='normal'>{allInstructors && allInstructors.find((f) => f.id === insID)?.name}</Text>
                                    </Box>
                                    <Input size='sm' fontWeight='normal' placeholder='Google Meet Code' 
                                        // onChange={(e) => setGMeet_Code(e.target.value)} mb='2' 
                                    />
                                    <Input size='sm' fontWeight='normal' placeholder='Google Meet Link' 
                                        // onChange={(e) => setGMeet_Link(e.target.value)} mb='2' 
                                    />
                                    <Input size='sm' fontWeight='normal' placeholder='Course Presentation Link' 
                                        // onChange={(e) => setPresentationLink(e.target.value)} mb='2' 
                                    />
                                    <Textarea fontWeight='normal' placeholder='Place your notes here...' mt='4' 
                                        //value={note2} 
                                        // onChange={handleNotes} 
                                    />
                                </Box>
                            </TabPanel>
                            <TabPanel>
                                <Box>
                                    <VStack align="stretch" spacing={3}>
                                    {Array.isArray(emails) && emails.length === 0 && (
                                        <Text color="gray.500">No emails found.</Text>
                                    )}

                                    {Array.isArray(emails) &&
                                        emails.map((mail) => (
                                        <Box
                                            key={mail.id}
                                            p={3}
                                            border="1px solid #ddd"
                                            borderRadius="md"
                                        >
                                            <Text fontWeight="bold">{mail.subject}</Text>
                                            <Text fontSize="sm">From: {mail.from}</Text>
                                            <Text fontSize="xs" color="gray.500">
                                            {mail.date}
                                            </Text>
                                        </Box>
                                        ))}
                                    </VStack>
                                </Box>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
                <ModalFooter>
                    {!toggle ? (
                        <Button onClick={sendEmail} isLoading={loading} size='sm' shadow='md' loadingText='Sending...' bgColor='blue.700' colorScheme='blue'>Send Email</Button>
                    ) : (
                        <Button onClick={handleSubmitEmail} isLoading={loading} size='sm' shadow='md' loadingText='Sending...' bgColor='blue.700' colorScheme='blue'>Send Training Details</Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenIns} onClose={onCloseIns} size='xl' scrollBehavior='inside'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add New Instructor</ModalHeader>   
                <ModalCloseButton />
                <ModalBody>
                    <Box gap='4' display='flex' flexDirection='column'>
                        <FormControl isRequired>
                            <FormLabel>Full Name</FormLabel>
                            <Input id='name' shadow='md' onChange={handleOnChange} type='text' />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Rank</FormLabel>
                            <Input id='rank' shadow='md' onChange={handleOnChange} type='text' />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>E-Signature</FormLabel>
                            <Input id='e_sign' onChange={handleESign} type='file' accept='.png' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            <FormHelperText fontWeight='600' fontSize='10px'>File type shall be *.jpeg, .jpg and maximum upload file size shall be less than 2MB</FormHelperText>
                        </FormControl>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button size='sm' shadow='md' mr={3} onClick={onCloseIns}>
                        Close
                    </Button>
                    <Button onClick={handleSubmit} isLoading={loading} size='sm' shadow='md' loadingText='Creating...' bgColor='blue.700' colorScheme='blue' >Create</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Edit */}
        <Modal isOpen={isOpenEdit} onClose={onCloseEdit} size='xl' scrollBehavior='inside'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Instructor</ModalHeader>   
                <ModalCloseButton />
                <ModalBody>
                    <Box gap='4' display='flex' flexDirection='column'>
                        <FormControl isRequired>
                            <FormLabel>Full Name</FormLabel>
                            <Input id='name' shadow='md' value={instructor.name} onChange={handleOnChange} type='text' />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Rank</FormLabel>
                            <Input id='rank' shadow='md' value={instructor.rank} onChange={handleOnChange} type='text' />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <Input id='email' shadow='md' value={''} onChange={handleOnChange} type='text' />
                        </FormControl>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button size='sm' shadow='md' mr={3} onClick={onCloseEdit}>
                        Close
                    </Button>
                    <Button onClick={handleUpdate} isLoading={loadingModal} size='sm' shadow='md' loadingText='Updating...' bgColor='blue.700' colorScheme='blue' >Update</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Delete */}
        <Modal isOpen={isOpenDelete} onClose={onCloseDelete} size='md' >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Delete Instructor</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>Are you sure you want to delete this instructor?</Text>
                </ModalBody>
                <ModalFooter>
                    <Button size='sm' shadow='md' mr={3} onClick={onCloseDelete}>
                        Close
                    </Button>
                    <Button onClick={handleDelete} isLoading={loadingModal} size='sm' shadow='md' loadingText='Deleting...' bgColor='red.700' colorScheme='red' >Delete</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** View Image */}
        <Modal isOpen={isOpenModal} onClose={handleCloseMod} scrollBehavior='inside' size='xl' motionPreset='slideInTop'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader pb={0} >{`E-Signature`}</ModalHeader>
                <ModalCloseButton />
                <ModalBody pt={0}>
                    <Box className='flex-col p-2 space-y-3 items-center justify-center'>
                        <Box w='100%' className='flex items-end justify-end'>
                            <Button size='sm' variant='ghost' onClick={() => fileInputRef.current?.click()} leftIcon={<EditIcon size='20' color='#a1a1a1' />} >Change Image</Button>
                            <input ref={fileInputRef} onChange={handleESign}  type='file' accept='image/png' style={{display: 'none'}} />
                        </Box>
                        <Box className='image-container w-full p-1 relative flex justify-center items-center rounded border outline-0 shadow-lg'>
                        {attachmentFile !== '' ? (
                            preview === null ? (
                                <Image className='image' src={attachmentFile} layout='fill' objectFit='contain' alt={'e-signature'}/>
                            ) : (
                                <Image className='image' src={preview} layout='fill' objectFit='contain' alt={fileName}/>
                            )
                        ) : (
                            <Text className='text-gray-400 absolute text-lg'>{fileName}</Text>
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