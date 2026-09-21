'use client'

import React, { useState } from 'react'
import { Box, Text, Button, Select, FormControl, Textarea, Checkbox, Input, FormLabel, useDisclosure, useToast, Modal, ModalOverlay, ModalCloseButton, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react'
import { getFormatTimeDate, BackgroundTypeColor, FontTypeColor } from '@/handlers/util_handler' 
import { ToastStatus } from '@/types/handling'

import { useCompanyUsers } from '@/context/CompanyUserContext'
import { useComms } from '@/context/CommunicationContext'
import { useRoles } from '@/context/UserRolesContext'

import { CommunicaitonsByID, initCommunicationsByID, Communicaitons, initCommunicaitons } from '@/types/communication'
import { SAVE_NOTIF_MESSAGE, DELETE_MESSAGE } from '@/lib/communications_controller'

export default function Tickets(){
    const toast = useToast()

    const { data: allComms } = useComms()
    const { data: allRoles } = useRoles()
    const {data: allCompanyUsers} = useCompanyUsers()

    const [recipients, setRecipients] = useState<string[]>([])
    const [message, setMessage] = useState<Communicaitons>(initCommunicaitons)
    const [viewMessage, setViewMessage] = useState<CommunicaitonsByID>(initCommunicationsByID)

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const { isOpen: isOpenCompose, onOpen: onOpenCompose, onClose: onCloseCompose } = useDisclosure()
    const { isOpen: isOpenInner, onOpen: onOpenInner, onClose: onCloseInner } = useDisclosure()
    const { isOpen: isOpenViewer, onOpen: onOpenViewer, onClose: onCloseViewer } = useDisclosure()

    const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setMessage((prev) => ({
            ...prev,
            [id]: value
        }))
    }
    
    const handleMessageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target
        setMessage((prev) => ({
            ...prev,
            [id]: value
        }))
    }
    
    const handleMessageTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setMessage((prev) => ({
            ...prev,
            [id]: value
        }))
    }

    const handleSendMessage = async () => {
        setIsLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const oldMessage = message
                    const sender = localStorage.getItem('customToken') || ''
                    recipients.map(async (recipient) => {
                        const newMessage = {
                            ...oldMessage,
                            sender: sender,
                            recipient: recipient,
                        }
                        await SAVE_NOTIF_MESSAGE(newMessage)
                    })
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Sent Successfully!', `Your ${message.type.toUpperCase()} message has been sent to your selected recipients.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setIsLoading(false)
            setRecipients([])
            setMessage(initCommunicaitons)
            onCloseCompose()
        }) 
    }
    
    const handleDeleteMessage = async (comm_id: string) => {
        setIsLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    await DELETE_MESSAGE(comm_id)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Deleted Successfully!', `This message has been deleted permanently.`, 3000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setIsLoading(false)
        }) 
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

    if(!allCompanyUsers) return;
    if(!allComms) return;
    
    return(
    <>
        <Box>
            <Box display='flex' justifyContent='space-between' alignItems='end'>
                <Text color='blue.700' fontSize='2xl' fontWeight='750'>Notification Management</Text>
                <Button onClick={onOpenCompose} colorScheme='blue' bgColor='blue.700' size='sm' shadow='md' >Compose Message</Button>
            </Box>
            <Box>
                <Box p='4' >
                    <Box color='gray.500' display='flex' justifyContent='space-between' borderRadius='10px' borderWidth='2px' borderColor='gray.400' px='6' py='3'>
                        <Text textAlign='start' w='20%'>Created At</Text>
                        <Text w='20%'>Title</Text>
                        <Text w='40%'> Message</Text>
                        <Text textAlign='start' w='20%'>Recipient</Text>
                        <Text textAlign='start' w='20%'>Sender</Text>
                        <Text textAlign='center' w='15%'>Type</Text>
                        <Text textAlign='center' w='15%'>Seen</Text>
                        <Text textAlign='center' w='20%'>Read At</Text>
                        <Text textAlign='center' w='20%'>Action</Text>
                    </Box>
                    <Box maxH='550px' overflowY='auto'>
                    {allComms.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds).map((comm: CommunicaitonsByID, index: number) => {
                        return(
                            <Box key={index} display='flex' gap='2' fontWeight='normal' alignItems='start' justifyContent='space-between' shadow='md' borderRadius='10px' borderWidth='1px' px='6' py='3' mt='2'>
                                <Text textAlign='start' w='20%'>{getFormatTimeDate(comm.createdAt.toDate())}</Text>
                                <Text w='20%' >{comm.title}</Text>
                                <Text w='40%' _hover={{cursor: 'pointer'}} onClick={() => {setViewMessage(comm); onOpenViewer();}} noOfLines={3} >{comm.message}</Text>
                                <Text textAlign='start' w='20%'>
                                    {allCompanyUsers.find((user) => user.id === comm.recipient)?.full_name ?? "Unknown User"}
                                </Text>
                                <Text textAlign='start' w='20%'>
                                    {allCompanyUsers.find((user) => user.full_name === comm.sender)?.full_name ?? "Unknown User"}
                                </Text>
                                <Text borderRadius='full' borderWidth='1px' bgColor={BackgroundTypeColor(comm.type)} borderColor={FontTypeColor(comm.type)} color={FontTypeColor(comm.type)} textAlign='center' w='15%'>{comm.type.toUpperCase()}</Text>
                                <Text textAlign='center' w='15%'>{comm.read ? 'Seen' : 'Delivered'}</Text>
                                <Text textAlign='center' w='20%'>
                                    {comm.read ? getFormatTimeDate(comm.read_at.toDate()) : ''}
                                </Text>
                                <Box w='20%' display='flex' justifyContent={'center'}>
                                    <Button isLoading={isLoading} size='xs' shadow='md' onClick={() => {handleDeleteMessage(comm.id)}} colorScheme='red' >Delete</Button>
                                </Box>
                            </Box>
                        )
                    })}
                    </Box>
                </Box>
            </Box>
        </Box>
        {/** Compose Message Modal */}
        <Modal isOpen={isOpenCompose} onClose={onCloseCompose} size='xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Compose Message</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box>
                        <Box mb='4'>
                            <Box display='flex' justifyContent='end' mb='2'>
                                <Button onClick={onOpenInner} colorScheme='blue' bgColor='blue.700' size='xs' shadow='md'>Select Recipients</Button>
                            </Box>
                            <Box display='flex' flexWrap={'wrap'} gap='1'>
                                { recipients.length > 0 && (
                                    <>
                                    <Text color='gray.700'>Recipients:</Text>
                                    {recipients.map((recipients, index) => {
                                    const user = allCompanyUsers.find((u) => u.id === recipients);
                                    return(
                                        <Text key={index} px='1' borderRadius='5px' bgColor='gray.200' fontSize='9pt' color='gray.600' ml='2'>
                                            {user?.full_name ?? "Unknown User"}
                                        </Text>
                                    )})}
                                    </>
                                )}
                            </Box>
                        </Box>
                        <FormControl mb='2'>
                            <FormLabel color='gray.600' fontSize='xs'>Subject:</FormLabel>
                            <Input id='title' value={message.title} onChange={handleMessageInput} shadow='md' />
                        </FormControl>
                        <FormControl mb='2'>
                            <FormLabel color='gray.600' fontSize='xs'>Type:</FormLabel>
                            <Select id='type' fontWeight='600' fontSize='xs' value={message.type} onChange={handleMessageSelect} shadow='md'>
                                <option hidden>Select Type</option>
                                <option value='announcement'>Announcement</option>
                                <option value='alert'>Alert</option>
                                <option value='info'>Info</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel color='gray.600' fontSize='xs'>Message:</FormLabel>
                            <Textarea id='message' fontWeight='normal' onChange={handleMessageTextArea} value={message.message} minH='150px' shadow='md' ></Textarea>
                        </FormControl>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant='ghost' colorScheme='red' onClick={() => {setRecipients([]); onCloseCompose();}} mr={3}>Cancel</Button>
                    <Button onClick={handleSendMessage} isDisabled={recipients.length === 0} isLoading={isLoading} shadow='md' bgColor='blue.700' colorScheme='blue' mr={3} loadingText='Sending...'>Send</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Select Recipient Modal */}
        <Modal isOpen={isOpenInner} onClose={onCloseInner} size='lg'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color='blue.700'>Select Recipients</ModalHeader>
                <ModalBody>
                    <Box >
                        {/* Select All Checkbox*/}
                        <Box display='flex' alignItems='center' justifyContent='end' mb='4' borderBottomWidth='1px' borderColor='gray.400' py='2' >
                            <Checkbox fontSize='xs' fontWeight='500' onChange={(e) => {
                                if(e.target.checked){
                                    // Select All
                                    setRecipients(allCompanyUsers.map((user) => user.id))
                                } else {
                                    // Deselect All
                                    setRecipients([])
                                }
                            }} colorScheme='blue' isChecked={recipients.length > 0 && recipients.length === allCompanyUsers.length}>
                                Select All
                            </Checkbox>
                        </Box>
                        {/** Recipient List-Individual select */}
                        {allCompanyUsers.map((user, index) => {
                            const isChecked = recipients.includes(user.id);
                            return (
                                <Box key={index} display='flex' alignItems='center' borderBottomWidth='1px' borderColor='gray.200' py='1' >
                                    <Checkbox w='100%' fontWeight='normal' colorScheme='blue' isChecked={isChecked} onChange={(e) => {
                                        const checked = e.target.checked
                                        if(checked){
                                            // Add to recipients
                                            setRecipients((prev) => [...prev, user.id])
                                        } else {
                                            // Remove from recipients
                                            setRecipients((prev) => prev.filter((recipientID) => recipientID !== user.id))
                                        }
                                    }}>
                                        <Text fontSize='11pt'>{user.full_name}</Text>
                                        <Text fontSize='9pt' color="gray.500">
                                            {
                                                allRoles?.find((role) => role.id === user.user_role)
                                                    ?.role_name ?? "No Role Assigned"
                                            }
                                        </Text>
                                    </Checkbox>
                                </Box>
                            )
                        })}
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant='ghost' colorScheme='red' mr={3} onClick={() => { setRecipients([]); onCloseInner(); }}>Cancel</Button>
                    <Button isDisabled={recipients.length === 0} colorScheme='blue' bgColor='blue.700' onClick={ onCloseInner }>Done</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** View Message Modal */}
        <Modal isOpen={isOpenViewer} onClose={() => {setViewMessage(initCommunicationsByID); onCloseViewer();}} size='xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader display={'flex'} alignItems='center' gap='2'>
                    <Text mr={2}> {viewMessage.title} </Text>
                    <Text px='1' borderRadius='full' fontSize='xs' borderWidth='1px' bgColor={BackgroundTypeColor(viewMessage.type)} borderColor={FontTypeColor(viewMessage.type)} color={FontTypeColor(viewMessage.type)} textAlign='center'>{viewMessage.type.toUpperCase()}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box>
                        <Box display='flex' justifyContent='space-between'>
                            <Box display='flex'>
                                <Text textAlign='center' mr={2}>{viewMessage.read ? 'Seen' : ''}</Text>
                                <Text textAlign='center'>
                                    {viewMessage.read ? getFormatTimeDate(viewMessage.read_at.toDate()) : ''}
                                </Text>
                            </Box>
                        </Box>
                        <Box display='flex'>
                            <Text mr={2}>From:</Text>
                            <Text fontWeight='normal'>{viewMessage.sender}</Text>
                        </Box>
                        <Box display='flex'>
                            <Text mr={2}>To:</Text>
                            <Text fontWeight='normal'>{allCompanyUsers.find((user) => user.id === viewMessage.recipient)?.full_name ?? "Unknown User"}</Text>
                        </Box>
                        <Box borderColor='gray.400' borderTopWidth='1px' pt='2' mt='3'>
                            <Text fontWeight='normal'>{viewMessage.message}</Text>
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter display='flex' px='4' borderTopWidth='1px' borderColor='gray.400' justifyContent='space-between'>
                    <Box display='flex'>
                        <Text textAlign='center' mr={2}>Created At:</Text>
                        <Text fontWeight='normal' textAlign='center'>
                            {viewMessage.createdAt ? getFormatTimeDate(viewMessage.createdAt.toDate()) : ''}
                        </Text>
                    </Box>
                    <Button variant='ghost' colorScheme='red' onClick={() => {setViewMessage(initCommunicationsByID); onCloseViewer();}} mr={3}>Close Viewer</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}