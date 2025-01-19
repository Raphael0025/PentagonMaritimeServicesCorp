'use client'

import React, {useState, useRef, useEffect} from 'react'
import { Box, Text, Tooltip, Input, InputLeftAddon, InputGroup, useDisclosure, Button, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, AlertDialog, AlertDialogCloseButton, AlertDialogBody, AlertDialogHeader, AlertDialogOverlay, AlertDialogFooter, AlertDialogContent, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@chakra-ui/react'

import { useCourses } from '@/context/CourseContext'

import NewPromoForm from '@/Components/Modal/NewPromoForm'

import { formatPromoPeriod, ToastStatus } from '@/types/handling'
import { FORCE_STOP_PROMO, FORCE_STOP_PERIOD } from '@/lib/course_controller'

export default function Page(){
    const toast = useToast()
    const { data: allCourses, coursePromos: promos, periods: promoPeriods } = useCourses()
    
    const { isOpen: isOpenPromo, onOpen: onOpenPromo, onClose: onClosePromo } = useDisclosure()
    const [ idRef, setRef ] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const handleStopPromo = async (id: string) => {
        try{
            setLoading(true)
            const getActor: string | null = localStorage.getItem('customToken')
            await FORCE_STOP_PROMO(id, getActor)
        }catch(error){
            throw error
        }finally{
            setLoading(false)
            setRef('')
        }
    }

    return(
    <> 
        <main className='flex space-x-6'>
            <section className='w-full space-y-2'>
                <header className='space-y-2'>
                    <Box h='30px' className='flex items-center'>
                        <Button onClick={onOpenPromo} colorScheme='blue' size='sm'>Create Promo</Button>
                    </Box>
                    <Box className='flex items-center justify-center bg-sky-700 rounded p-3 px-6 shadow-md text-white uppercase'>
                        <Text className='w-2/5'>Course Code</Text>
                        <Text className='w-full'>Course</Text>
                        <Text className='w-1/2 text-center'>Original Fee</Text>
                        <Text className='w-1/2 text-center'>Promo Fee</Text>
                        <Text className='w-1/2 text-center'>{`Promo (%)`}</Text>
                        <Text className='w-2/5 text-center'>{`Action`}</Text>
                    </Box>
                </header>
                <section className='space-y-2'>
                {promos && promos.map((promo) => {
                    const course = allCourses?.find((course) => course.id === promo.course_ref)
                    return(
                        <Box key={promo.id} className='flex items-center justify-center rounded px-6 p-3 shadow-md uppercase border'>
                            {course ? (
                                <>
                                <Text className="w-2/5">{course.course_code}</Text>
                                <Text className="w-full">{course.course_name}</Text>
                                <Text className="w-1/2 text-center">{`Php ${course.course_fee}`}</Text>
                                <Text className="w-1/2 text-center">{`Php ${(
                                    course.course_fee -
                                    (course.course_fee * promo.rate) / 100
                                ).toFixed(0)}`}</Text>
                                <Text className="w-1/2 text-center">{promo.rate}%</Text>
                                </>
                            ) : (
                                <Text className="text-red-500">Course data unavailable</Text>
                            )}
                            <Box className='w-2/5 text-center'>
                            {!promo.forceToEnd && (
                                <Button onClick={() => setRef(promo.id)} size='sm' colorScheme='blue' mr={3} >View</Button>
                            )}
                                <Button isLoading={loading} variant={promo.forceToEnd ? 'ghost' : 'solid'} loadingText='Stopping...' onClick={() => {handleStopPromo(promo.id)}} size='sm' colorScheme='red'>{promo.forceToEnd ? 'Stopped' : 'Stop'}</Button>
                            </Box>
                        </Box>
                    )
                })}
                </section>
            </section>
            <section className='w-1/4 space-y-2'>
                <header className='space-y-2'>
                    <Box h='30px' className='flex items-center'>
                        <Text fontSize='lg' className='text-sky-700 font-bold'>Promo Dates</Text>
                    </Box>
                    <Box className='flex items-center justify-between bg-sky-700 rounded p-3 px-6 shadow-md text-white uppercase'>
                        <Text w='100%'>Promo Period</Text>
                        <Text w='50%' className='text-center'>Days</Text>
                        <Text w='50%' className='text-center'>Action</Text>
                    </Box>
                </header>
                <section className='space-y-2'>
                {promoPeriods && promoPeriods.filter((period) => period.course_promo_ref === idRef).map((period) => (
                    <Box key={period.id} className='flex items-center justify-between rounded px-6 p-3 shadow-md uppercase border'>
                        <Text fontSize='11px' className='w-full font-bold'>{formatPromoPeriod(period.start_date, period.end_date, period.numOfPromoDays)}</Text>
                        <Text w='50%' className='text-center'>{period.numOfPromoDays}</Text>
                        <Box className='w-1/2 text-center'>
                            <Button size='sm' colorScheme='red'>{period.forceToEnd ? 'Stopped' : 'Stop'}</Button>
                        </Box>
                    </Box>
                ))}
                </section>
            </section>
        </main>
        <Modal isOpen={isOpenPromo} onClose={onClosePromo} scrollBehavior='outside' motionPreset='slideInTop' size='xl' >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader className='font-bold text-sky-700'>Create Course Promo</ModalHeader>
                <ModalBody>
                    <NewPromoForm onClose={onClosePromo} />
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
    )
}