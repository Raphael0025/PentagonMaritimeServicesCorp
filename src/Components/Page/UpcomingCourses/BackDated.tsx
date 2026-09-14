'use client'

import React, { useMemo, useState } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Textarea,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { SAVE_REMARKS } from '@/lib/trainee_controller'

const getStatusBgColor = (status: number) => {
  switch (status) {
    case 0: return 'white'
    case 1: return 'yellow.100'
    case 2: return 'white'
    case 3: return 'blue.100'
    case 4: return 'purple.100'
    case 6: return 'green.200'
    case 7: return 'red.200'
    case 8: return 'red.100'
    case 9: return 'yellow.100'
    default: return 'white'
  }
}

const getStatus = (status: number) => {
  switch (status) {
    case 0: return 'white'
    case 1: return 'yellow.100'
    case 2: return 'RESERVED/PENDING'
    case 3: return 'ENROLLED'
    case 4: return 'BACKDATED'
    case 6: return 'GRADUATED'
    case 7: return 'CANCELLED'
    case 8: return 'ABSENT'
    case 9: return 'NON-APPEARANCE'
    default: return 'white'
  }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const getMonthInfo = (dateStr: string | undefined) => {
  if (!dateStr || dateStr === 'No Date') {
    return { monthName: 'Unscheduled', startDateObj: new Date(0) }
  }

  const normalized = dateStr.toUpperCase()

  const monthMap: Record<string, string> = {
    JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April',
    MAY: 'May', JUN: 'June', JUL: 'July', AUG: 'August',
    SEP: 'September', OCT: 'October', NOV: 'November', DEC: 'December'
  }

  let matchedMonth = ''
  for (const [short, full] of Object.entries(monthMap)) {
    if (normalized.includes(short)) {
      matchedMonth = full
      break
    }
  }

  const rawDateStr = dateStr.includes(',') ? dateStr.split(',')[1].trim() : dateStr.trim()
  const currentYear = new Date().getFullYear()
  const parsed = new Date(`${rawDateStr}, ${currentYear}`)

  if (!isNaN(parsed.getTime())) {
    const localNoonDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 12, 0, 0)
    return {
      monthName: matchedMonth || localNoonDate.toLocaleDateString('en-US', { month: 'long' }),
      startDateObj: localNoonDate
    }
  }

  return {
    monthName: matchedMonth || 'Unscheduled',
    startDateObj: new Date(0)
  }
}

export default function Page() {
  const { data: allTrainee } = useTrainees()
  const { allData: allTraining } = useTraining()
  const { data: allCourses } = useCourses()
  const { allData: allRegistrations } = useRegistrations()
  const { data: allClients, courseCodes } = useClients()

  const toast = useToast()

  const { isOpen: isOpenRm, onOpen: onOpenRm, onClose: onCloseRm } = useDisclosure()
  const [idRef, setID] = useState<string>('')
  const [remarks, setRemarks] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const currentYear = new Date().getFullYear()
  const currentMonthName = MONTHS[new Date().getMonth()]
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthName)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  const handleToast = (
    title: string,
    description: string,
    duration: number,
    status: 'success' | 'error' | 'warning' | 'info'
  ) => {
    toast({
      title,
      description,
      status,
      duration,
      isClosable: true,
      position: 'top-right',
    })
  }

  const handleSaveRemark = async () => {
    setIsSaving(true)
    const actor: string | null = localStorage.getItem('customToken')

    try {
      await SAVE_REMARKS(idRef, remarks, actor)
      handleToast(
        'Remarks Saved Successfully!',
        'Your Remarks on this registration has been saved successfully.',
        5000,
        'success'
      )
    } catch (error) {
      console.error('Error saving remarks: ', error)
      handleToast('Error', 'Failed to save remarks. Please try again.', 5000, 'error')
    } finally {
      setIsSaving(false)
      onCloseRm()
      setRemarks('')
    }
  }

  const groupedSchedule = useMemo(() => {
    if (!allTraining || allTraining.length === 0) return []

    const registrationsMap = new Map((allRegistrations || []).map((r) => [String(r.id), r]))
    const traineesMap = new Map((allTrainee || []).map((t) => [String(t.id), t]))
    const standardCoursesMap = new Map((allCourses || []).map((c) => [String(c.id), c.course_code]))
    const companyCoursesMap = new Map((courseCodes || []).map((c) => [String(c.id), c.company_course_code]))

    const enriched = []

    for (let i = 0; i < allTraining.length; i++) {
      const t = allTraining[i]

      const isCorrectRegType = t.regType === 0 || t.regType === 2 || t.regType === 1
      const isValidStatus = t.reg_status !== undefined && t.reg_status >= 0

      if (!isCorrectRegType || !isValidStatus) continue

      const registration = registrationsMap.get(String(t.reg_ref_id))
      const rawTimestamp = t.date_enrolled

      if (rawTimestamp !== undefined && rawTimestamp !== null) {
        let enrolledDate: Date | null = null

        if (typeof rawTimestamp === 'object' && rawTimestamp !== null && 'toDate' in rawTimestamp && typeof (rawTimestamp as any).toDate === 'function') {
          enrolledDate = (rawTimestamp as any).toDate()
        } else if (!isNaN(Number(rawTimestamp))) {
          const num = Number(rawTimestamp)
          enrolledDate = new Date(num < 10000000000 ? num * 1000 : num)
        } else if (typeof rawTimestamp === 'string' || typeof rawTimestamp === 'number' || rawTimestamp instanceof Date) {
          enrolledDate = new Date(rawTimestamp)
        }

        if (enrolledDate && !isNaN(enrolledDate.getTime())) {
          if (enrolledDate.getFullYear() !== currentYear) {
            continue
          }
        }
      }

      const resolvedCourseCode =
        standardCoursesMap.get(String(t.course)) ||
        companyCoursesMap.get(String(t.course)) ||
        'UNASSIGNED COURSE'

      const trainee = registration ? traineesMap.get(String(registration.trainee_ref_id)) : null
      const startDateStr = t.start_date ? String(t.start_date).trim().toUpperCase() : 'NO DATE'
      const { monthName, startDateObj } = getMonthInfo(startDateStr)
      const displayDate = startDateStr
      const monthYear = `${monthName} ${currentYear}`

      const startDate = t.start_date ? String(t.start_date).trim() : 'N/A'
      const endDate = t.end_date ? String(t.end_date).trim() : ''

      // Determine if single day course (end_date is null/empty/same as start_date)
      const isSingleDay = !endDate || endDate.toUpperCase() === 'N/A' || endDate === startDate

      enriched.push({
        ...t,
        courseCode: resolvedCourseCode.toUpperCase(),
        startDateObj,
        monthName,
        monthYear,
        displayDate,
        startDate,
        endDate,
        isSingleDay,
        traineeName: trainee
          ? `${trainee.last_name}, ${trainee.first_name} ${
              trainee.middle_name ? trainee.middle_name.charAt(0) + '.' : ''
            }`
          : 'Unknown Trainee',
        reg_type: registration?.regType,
        contactNo: trainee?.contact_no || 'N/A',
        email: trainee?.email || 'N/A',
        company: t.accountType === 1 ? 'COMPANY' : 'CREW',
      })
    }

    const monthFiltered = selectedMonth
      ? enriched.filter((item) => item.monthName.toLowerCase() === selectedMonth.toLowerCase())
      : enriched

    const dateMap = new Map<string, {
      displayDate: string,
      monthYear: string,
      startDateObj: Date,
      coursesMap: Map<string, {
        courseCode: string,
        startDate: string,
        endDate: string,
        isSingleDay: boolean,
        trainees: typeof monthFiltered
      }>
    }>()

    monthFiltered.forEach((item) => {
      if (!dateMap.has(item.displayDate)) {
        dateMap.set(item.displayDate, {
          displayDate: item.displayDate,
          monthYear: item.monthYear,
          startDateObj: item.startDateObj,
          coursesMap: new Map()
        })
      }
      const dateGroup = dateMap.get(item.displayDate)!

      const courseKey = `${item.courseCode}_${item.startDate}_${item.endDate}`

      if (!dateGroup.coursesMap.has(courseKey)) {
        dateGroup.coursesMap.set(courseKey, {
          courseCode: item.courseCode,
          startDate: item.startDate,
          endDate: item.endDate,
          isSingleDay: item.isSingleDay,
          trainees: []
        })
      }
      dateGroup.coursesMap.get(courseKey)!.trainees.push(item)
    })

    const sortedDateGroups = Array.from(dateMap.values()).sort((a, b) => {
      return sortOrder === 'desc'
        ? b.startDateObj.getTime() - a.startDateObj.getTime()
        : a.startDateObj.getTime() - b.startDateObj.getTime()
    })

    return sortedDateGroups.map((dateGroup) => ({
      ...dateGroup,
      courses: Array.from(dateGroup.coursesMap.values())
    }))
  }, [allTraining, allCourses, courseCodes, allRegistrations, allTrainee, selectedMonth, currentYear, sortOrder])

  return (
    <main className="p-4 w-full">
      <HStack mb={4} spacing={6} align="center">
        <HStack spacing={2}>
          <Text fontWeight="bold" fontSize="sm">Select Month:</Text>
          <Select
            w="180px"
            size="sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </HStack>

        <HStack spacing={2}>
          <Text fontWeight="bold" fontSize="sm">Sort Order:</Text>
          <Select
            w="200px"
            size="sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
          >
            <option value="desc">Latest to Oldest</option>
            <option value="asc">Oldest to Latest</option>
          </Select>
        </HStack>
      </HStack>

      <Box overflowX="auto" border="1px" borderColor="gray.300" borderRadius="md" shadow="sm">
        <Table variant="simple" size="sm" fontFamily="mono">
          <Thead bg="blue.900">
            <Tr>
              <Th color="white" w="18%">TYPE / COMPANY</Th>
              <Th color="white" w="25%">{`TRAINEE'S NAME`}</Th>
              <Th color="white" w="15%">CONTACT NO.</Th>
              <Th color="white" w="20%">EMAIL</Th>
              <Th color="white" w="10%">STATUS</Th>
              <Th color="white" w="10%">REMARKS</Th>
            </Tr>
          </Thead>

          <Tbody>
            {groupedSchedule.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={6} color="gray.500">
                  No records found for the selected filter.
                </Td>
              </Tr>
            ) : (
              groupedSchedule.map((dateGroup) => (
                <React.Fragment key={dateGroup.displayDate}>
                  <Tr bg="gray.300" borderTop="2px" borderColor="gray.500">
                    <Td colSpan={6} py={2} px={4} color="gray.900" fontWeight="extrabold" fontSize="sm" letterSpacing="wide">
                      DATE: {dateGroup.displayDate} ({dateGroup.monthYear})
                    </Td>
                  </Tr>

                  {dateGroup.courses.map((courseGroup) => (
                    <React.Fragment key={`${courseGroup.courseCode}-${courseGroup.startDate}-${courseGroup.endDate}`}>
                      <Tr bg="blue.700" borderTop="1px" borderBottom="1px" borderColor="blue.900">
                        <Td colSpan={6} py={1.5} px={6} color="white" fontWeight="bold" fontSize="xs">
                          <HStack justify="space-between" pr={4}>
                            <Text>COURSE: {courseGroup.courseCode}</Text>
                            <Text fontSize="11px" color="blue.100" fontWeight="normal">
                              {courseGroup.isSingleDay ? (
                                <>
                                  TRAINING PERIOD: <b>{courseGroup.startDate}</b> (1 DAY TRAINING)
                                </>
                              ) : (
                                <>
                                  TRAINING PERIOD: <b>{courseGroup.startDate}</b> to <b>{courseGroup.endDate}</b>
                                </>
                              )}
                            </Text>
                          </HStack>
                        </Td>
                      </Tr>

                      {courseGroup.trainees.map((item) => (
                        <Tr
                          key={item.id}
                          bg={getStatusBgColor(item.reg_status)}
                          _hover={{ filter: 'brightness(0.96)' }}
                          borderBottom="1px"
                          borderColor="gray.200"
                          color={item.reg_status === 2 ? 'cyan.700' : item.reg_type === 1 ? 'purple.600' : 'black'}
                        >
                          <Td fontSize="xs" textTransform="uppercase">{item.company}</Td>
                          <Td fontSize="xs" fontWeight="bold" textTransform="uppercase">{item.traineeName}</Td>
                          <Td fontSize="xs">{item.contactNo}</Td>
                          <Td fontSize="xs" color="blue.700" textDecoration="underline">{item.email}</Td>
                          <Td fontSize="xs">
                            <Badge
                              colorScheme={item.reg_status === 6 ? 'green' : item.reg_status === 7 ? 'red' : 'gray'}
                              fontSize="10px"
                            >
                              {getStatus(item.reg_status)}
                            </Badge>
                          </Td>
                          <Td px={2}>
                            <Button
                              onClick={() => {
                                setID(item.id)
                                setRemarks(item.train_remarks || '')
                                onOpenRm()
                              }}
                              size="sm"
                              p={0}
                              variant="link"
                              w="200px"
                              justifyContent="flex-start"
                            >
                              <Text
                                noOfLines={1}
                                w="200px"
                                fontWeight="normal"
                                textAlign="left"
                                className={!item.train_remarks ? 'text-gray-500' : 'text-blue-600'}
                              >
                                {!item.train_remarks ? 'Add Remarks' : item.train_remarks}
                              </Text>
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpenRm} onClose={onCloseRm} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">Edit Training Remarks</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks here..."
              rows={4}
              fontSize="sm"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} size="sm" onClick={onCloseRm} isDisabled={isSaving}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              size="sm"
              isLoading={isSaving}
              onClick={handleSaveRemark}
            >
              Save Remarks
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  )
}