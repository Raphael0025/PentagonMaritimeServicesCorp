'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Button, Image, Text, Input, FormControl, InputLeftAddon, InputGroup, useDisclosure, Skeleton, Stack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import { ElementView, MapComponent, BannerView, BannerComponent } from '@/Components/SiteComponents'
import { Search2Icon } from '@chakra-ui/icons'
import { useCourses } from '@/context/CourseContext'

export default function CoursesOffered() {
    const { data: allCourses } = useCourses()
    const router = useRouter()

    const initFilter = ['all courses', 'in-house', 'stcw', 'safety courses', 'domestic']
    const [ activeFilter, setActiveFilter ] = useState<string>('all courses')
    const [ search, setSearch ] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    
    const filteredInHouseCourses = (allCourses || [])
        .filter(c => c.courseType === 1)
        .filter(course => 
            course.course_code.toUpperCase().includes(search.toUpperCase()) || 
            course.course_name.toUpperCase().includes(search.toUpperCase())
        )
        .sort((a, b) => a.course_name.toLowerCase().localeCompare(b.course_name.toLowerCase()));

    const filteredMdsCourses = (allCourses || [])
        .filter(c => c.courseType === 0)
        .filter(course => 
            course.course_code.toUpperCase().includes(search.toUpperCase()) || 
            course.course_name.toUpperCase().includes(search.toUpperCase())
        )
        .sort((a, b) => a.course_name.toLowerCase().localeCompare(b.course_name.toLowerCase()));

    const filteredSafetyCourses = (allCourses || [])
        .filter(c => c.courseType === 3)
        .filter(course => 
            course.course_code.toUpperCase().includes(search.toUpperCase()) || 
            course.course_name.toUpperCase().includes(search.toUpperCase())
        )
        .sort((a, b) => a.course_name.toLowerCase().localeCompare(b.course_name.toLowerCase()));

    const filteredStcwCourses = (allCourses || [])
        .filter(c => c.courseType === 2)
        .filter(course => 
            course.course_code.toUpperCase().includes(search.toUpperCase()) || 
            course.course_name.toUpperCase().includes(search.toUpperCase())
        )
        .sort((a, b) => a.course_name.toLowerCase().localeCompare(b.course_name.toLowerCase()));

    return (
        <Box as='main' className='pb-10'>
            <Box mt='-105px'>
                <BannerView 
                    initial={{opacity: 0, x: 100}}
                    animate={{opacity: 1, x: 0}}
                    transition={{ duration: 0.3, delay: 1, ease: 'linear' }}
                >
                    <BannerComponent title='COURSES WE OFFER' content='Pentagon Maritime is committed to providing quality training programs aimed at developing highly skilled and capable seafarers.' image='./Images/ContactUs.jpg' />
                </BannerView>
            </Box>
            {/** Main Form */}
            <Box px={{base: '0%', lg: '20%'}} py='3' bgColor='#fbffff'>
                <Box display={{ base: 'block', md: 'flex' }} px='3' flexWrap='wrap' alignItems='end' justifyContent='start' gap={{ base: '2', md: '4' }}>
                    <FormControl display='flex' alignItems='end' w={{ base: '100%', md: 'auto' }}>
                        <InputGroup shadow='md'>
                            <InputLeftAddon>
                                <Search2Icon color='gray.400' />
                            </InputLeftAddon>
                            <Input onChange={(e) => setSearch(e.target.value)} w='400px' type='text' fontWeight='normal' placeholder='Search your preferred course here...' />
                        </InputGroup>
                    </FormControl>
                    <Box display='flex' gap='2' justifyContent='center' flexWrap='wrap' mt={{base: '2', lg: '0'}}>
                        {initFilter.map((filter, indx) => (
                            <Button key={indx} colorScheme={activeFilter === filter ? 'blue' : 'gray'} bgColor={activeFilter === filter ? 'blue.700' : ''} shadow='md' onClick={() => setActiveFilter(filter)} size='sm' >{filter.toUpperCase()}</Button>
                        ))}
                    </Box>
                </Box>
                {/** Course Lists Block */}
                <Box px={{base: '0%', lg: '10%'}} mt='6'>
                    {isLoading ? (
                        // --- Loading State: Elegant Skeleton Slabs ---
                        <Stack spacing={6} px='3'>
                            <Box>
                                <Skeleton height="40px" borderRadius="5px" mb="4" />
                                <Stack spacing={2}>
                                    <Skeleton height="80px" borderRadius="5px" />
                                    <Skeleton height="80px" borderRadius="5px" />
                                </Stack>
                            </Box>
                            <Box>
                                <Skeleton height="40px" borderRadius="5px" mb="4" />
                                <Stack spacing={2}>
                                    <Skeleton height="80px" borderRadius="5px" />
                                </Stack>
                            </Box>
                        </Stack>
                    ) : (
                        // --- Rendered Content ---
                        <>
                            {/* ==================== Safety Courses ==================== */}
                            {['all courses', 'safety courses'].includes(activeFilter) && filteredSafetyCourses.length > 0 && (
                                <Box px='3' mt='4'>
                                    <Text p='3' borderRadius='5px' shadow='md' bgColor='blue.700' color='white' fontSize='xl'>
                                        Safety Courses
                                    </Text>
                                    <Box display='flex' flexDir='column' gap='2' mt='2'>
                                        {filteredSafetyCourses.map((course) => (
                                            <Box key={course.id} fontWeight='normal' border='1px solid' borderColor='gray.400' borderRadius='5px' shadow='md' p='3'>
                                                <Text fontSize='0.85rem'>
                                                    {course.course_name.toUpperCase()}
                                                </Text>
                                                <Box mt='2' display='flex' alignItems='end' justifyContent='space-between'>
                                                    <Text w='100%' fontWeight='bold'>{`Code: ${course.course_code.toUpperCase()}`}</Text>
                                                    <Text w='100%'>
                                                        {`Duration: ${course.numOfDays.toString() === "1" ? `${course.numOfDays} Day` : `${course.numOfDays} Days`}`}
                                                    </Text>
                                                    <Button 
                                                        onClick={() => { router.push('/admissions/ol/forms') }} 
                                                        w='200px' 
                                                        colorScheme='blue' 
                                                        bgColor='teal.500' 
                                                        fontWeight='normal' 
                                                        fontSize='xs' 
                                                        size='sm' 
                                                        shadow='md'
                                                    >
                                                        Reserve slot
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            {/* ==================== STCW Courses ==================== */}
                            {['all courses', 'stcw'].includes(activeFilter) && filteredStcwCourses.length > 0 && (
                                <Box px='3' mt='4'>
                                    <Text p='3' borderRadius='5px' shadow='md' bgColor='blue.700' color='white' fontSize='xl'>
                                        STCW Courses
                                    </Text>
                                    <Box display='flex' flexDir='column' gap='2' mt='2'>
                                        {filteredStcwCourses.map((course) => (
                                            <Box key={course.id} fontWeight='normal' border='1px solid' borderColor='gray.400' borderRadius='5px' shadow='md' p='3'>
                                                <Text fontSize='0.85rem'>
                                                    {course.course_name.toUpperCase()}
                                                </Text>
                                                <Box mt='2' display='flex' alignItems='end' justifyContent='space-between'>
                                                    <Text w='100%' fontWeight='bold'>{`Code: ${course.course_code.toUpperCase()}`}</Text>
                                                    <Text w='100%'>
                                                        {`Duration: ${course.numOfDays.toString() === "1" ? `${course.numOfDays} Day` : `${course.numOfDays} Days`}`}
                                                    </Text>
                                                    <Button 
                                                        onClick={() => { router.push('/admissions/ol/forms') }} 
                                                        w='200px' 
                                                        colorScheme='blue' 
                                                        bgColor='teal.500' 
                                                        fontWeight='normal' 
                                                        fontSize='xs' 
                                                        size='sm' 
                                                        shadow='md'
                                                    >
                                                        Reserve slot
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            {/* ==================== Mds Courses ==================== */}
                            {['all courses', 'domestic'].includes(activeFilter) && filteredMdsCourses.length > 0 && (
                                <Box px='3' mt='4'>
                                    <Text p='3' borderRadius='5px' shadow='md' bgColor='blue.700' color='white' fontSize='xl'>
                                        Domestic Courses
                                    </Text>
                                    <Box display='flex' flexDir='column' gap='2' mt='2'>
                                        {filteredMdsCourses.map((course) => (
                                            <Box key={course.id} fontWeight='normal' border='1px solid' borderColor='gray.400' borderRadius='5px' shadow='md' p='3'>
                                                <Text fontSize='0.85rem'>
                                                    {course.course_name.toUpperCase()}
                                                </Text>
                                                <Box mt='2' display='flex' alignItems='end' justifyContent='space-between'>
                                                    <Text w='100%' fontWeight='bold'>{`Code: ${course.course_code.toUpperCase()}`}</Text>
                                                    <Text w='100%'>
                                                        {`Duration: ${course.numOfDays.toString() === "1" ? `${course.numOfDays} Day` : `${course.numOfDays} Days`}`}
                                                    </Text>
                                                    <Button 
                                                        onClick={() => { router.push('/admissions/ol/forms') }} 
                                                        w='200px' 
                                                        colorScheme='blue' 
                                                        bgColor='teal.500' 
                                                        fontWeight='normal' 
                                                        fontSize='xs' 
                                                        size='sm' 
                                                        shadow='md'
                                                    >
                                                        Reserve slot
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            {/* ==================== In-House Courses ==================== */}
                            {['all courses', 'in-house'].includes(activeFilter) && filteredInHouseCourses.length > 0 && (
                                <Box px='3' mt='4'>
                                    <Text p='3' borderRadius='5px' shadow='md' bgColor='blue.700' color='white' fontSize='xl'>
                                        In-House Courses
                                    </Text>
                                    <Box display='flex' flexDir='column' gap='2' mt='2'>
                                        {filteredInHouseCourses.map((course) => (
                                            <Box key={course.id} fontWeight='normal' border='1px solid' borderColor='gray.400' borderRadius='5px' shadow='md' p='3'>
                                                <Text fontSize='0.85rem'>
                                                    {course.course_name.toUpperCase()}
                                                </Text>
                                                <Box mt='2' display='flex' alignItems='end' justifyContent='space-between'>
                                                    <Text w='100%' fontWeight='bold'>{`Code: ${course.course_code.toUpperCase()}`}</Text>
                                                    <Text w='100%'>
                                                        {`Duration: ${course.numOfDays.toString() === "1" ? `${course.numOfDays} Day` : `${course.numOfDays} Days`}`}
                                                    </Text>
                                                    <Button 
                                                        onClick={() => { router.push('/admissions/ol/forms') }} 
                                                        w='200px' 
                                                        colorScheme='blue' 
                                                        bgColor='teal.500' 
                                                        fontWeight='normal' 
                                                        fontSize='xs' 
                                                        size='sm' 
                                                        shadow='md'
                                                    >
                                                        Reserve slot
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            {/* ==================== Empty State Placeholder ==================== */}
                            {filteredMdsCourses.length === 0 && filteredInHouseCourses.length === 0 && filteredSafetyCourses.length === 0 && filteredStcwCourses.length === 0 && (
                                <Stack spacing={6} px='3'>
                                    <Box>
                                        <Skeleton height="40px" borderRadius="5px" mb="4" />
                                        <Stack spacing={2}>
                                            <Skeleton height="80px" borderRadius="5px" />
                                            <Skeleton height="80px" borderRadius="5px" />
                                        </Stack>
                                    </Box>
                                    <Box>
                                        <Skeleton height="40px" borderRadius="5px" mb="4" />
                                        <Stack spacing={2}>
                                            <Skeleton height="80px" borderRadius="5px" />
                                        </Stack>
                                    </Box>
                                </Stack>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
