'use client'

import React, { useMemo, useState } from 'react'
import { Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Select, HStack, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Textarea, useDisclosure, useToast } from '@chakra-ui/react'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useRank } from '@/context/RankContext'
import { SAVE_REMARKS, UPDATE_TRAINING } from '@/lib/trainee_controller'

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
  const { data: allRanks } = useRank()
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
  const [selectedDay, setSelectedDay] = useState<string>('ALL')

  // Handler to jump directly to today's month and day
  const handleSelectToday = () => {
    const today = new Date()
    const monthName = MONTHS[today.getMonth()]
    const dayNumber = String(today.getDate())

    setSelectedMonth(monthName)
    setSelectedDay(dayNumber)
  }

  // Handler for changing month (resets day selection)
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value)
    setSelectedDay('ALL')
  }
  const handleToast = (
    title: string,
    description: string,
    status: 'success' | 'error' | 'warning' | 'info'
  ) => {
    toast({
      title,
      description,
      status,
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
        'success'
      )
    } catch (error) {
      console.error('Error saving remarks: ', error)
      handleToast('Error', 'Failed to save remarks. Please try again.', 'error')
    } finally {
      setIsSaving(false)
      onCloseRm()
      setRemarks('')
    }
  }

const MONTHS_MAP: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
};

// Helper function to safely parse various string formats ("SEP 04 2026", "MON, SEP 28", etc.)
const parseFormattedDate = (dateStr: string, defaultYear: number = 2026): Date | null => {
  if (!dateStr || dateStr.toUpperCase() === 'N/A' || dateStr.toUpperCase() === 'NO DATE') return null;

  // Clean comma and extra spaces
  const cleanedStr = dateStr.replace(/,/g, '').trim();
  const parts = cleanedStr.split(/\s+/);

  // Remove day of week if present (e.g., ["MON", "SEP", "28"])
  if (parts.length > 0 && isNaN(Number(parts[0])) && MONTHS_MAP[parts[0].toUpperCase()] === undefined) {
    parts.shift();
  }

  if (parts.length >= 2) {
    const month = MONTHS_MAP[parts[0].toUpperCase()];
    const day = parseInt(parts[1], 10);
    // Use year from string if provided, otherwise default to currentYear / 2026
    const year = parts.length >= 3 && !isNaN(parseInt(parts[2], 10)) ? parseInt(parts[2], 10) : defaultYear;

    if (month !== undefined && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }

  // Native JS fallback for standard ISO date strings
  const fallbackDate = new Date(dateStr);
  if (!isNaN(fallbackDate.getTime())) {
    // Override 2001 / fallback year if string didn't explicitly specify a 4-digit year
    if (!/\b(19|20)\d{2}\b/.test(dateStr)) {
      fallbackDate.setFullYear(defaultYear);
    }
    return fallbackDate;
  }

  return null;
};

// Helper to generate a standard grouping key (YYYY-MM-DD)
const getStandardDateKey = (dateObj: Date): string => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper to display uniform header text ("SEP 01 2026")
const formatUnifiedDisplayDate = (dateObj: Date): string => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${month} ${day} ${year}`;
};

const groupedSchedule = useMemo(() => {
  if (!allTraining || allTraining.length === 0) return [];

  const targetYear = currentYear || 2026;

  const registrationsMap = new Map((allRegistrations || []).map((r) => [String(r.id), r]));
  const traineesMap = new Map((allTrainee || []).map((t) => [String(t.id), t]));
  const standardCoursesMap = new Map((allCourses || []).map((c) => [String(c.id), c.course_code]));
  const companyCoursesMap = new Map((courseCodes || []).map((c) => [String(c.id), c.company_course_code]));

  const enriched = [];

  for (let i = 0; i < allTraining.length; i++) {
    const t = allTraining[i];

    const isCorrectRegType = t.regType === 0 || t.regType === 2 || t.regType === 1;
    const isValidStatus = t.reg_status !== undefined && t.reg_status >= 0;

    if (!isCorrectRegType || !isValidStatus) continue;

    const registration = registrationsMap.get(String(t.reg_ref_id));
    
    // Process enrolled_date timestamp
    const rawTimestamp = t.date_enrolled;
    let enrolledDate: Date | null = null;

    if (rawTimestamp !== undefined && rawTimestamp !== null) {
      if (typeof rawTimestamp === 'object' && rawTimestamp !== null && 'toDate' in rawTimestamp && typeof (rawTimestamp as any).toDate === 'function') {
        enrolledDate = (rawTimestamp as any).toDate();
      } else if (!isNaN(Number(rawTimestamp))) {
        const num = Number(rawTimestamp);
        enrolledDate = new Date(num < 10000000000 ? num * 1000 : num);
      } else if (typeof rawTimestamp === 'string' || typeof rawTimestamp === 'number' || rawTimestamp instanceof Date) {
        enrolledDate = new Date(rawTimestamp);
      }

      if (enrolledDate && !isNaN(enrolledDate.getTime())) {
        if (enrolledDate.getFullYear() !== targetYear) {
          continue;
        }
      }
    }

    let startDateStr = '';
    let endDateStr = '';
    let startDateObj: Date | null = null;
    let monthName = '';

    // IF STATUS IS 9 (NON-APPEARANCE) -> REFER TO ENROLLED_DATE
    if (t.reg_status === 9) {
      if (enrolledDate && !isNaN(enrolledDate.getTime())) {
        startDateObj = enrolledDate;
        monthName = enrolledDate.toLocaleString('default', { month: 'long' });
        startDateStr = enrolledDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
        endDateStr = startDateStr;
      } else {
        startDateStr = 'NO DATE';
        endDateStr = '';
        monthName = 'Unknown';
        startDateObj = new Date(0);
      }
    } 
    // STANDARD CASE -> USE ACT_START_DATE OR FALLBACK TO START_DATE
    else {
      const rawStart = t.act_start_date || t.start_date;
      const rawEnd = t.act_end_date || t.end_date;

      startDateStr = rawStart ? String(rawStart).trim().toUpperCase() : 'NO DATE';
      endDateStr = rawEnd ? String(rawEnd).trim().toUpperCase() : '';

      startDateObj = parseFormattedDate(startDateStr, targetYear);

      if (startDateObj && !isNaN(startDateObj.getTime())) {
        monthName = startDateObj.toLocaleString('default', { month: 'long' });
      } else {
        monthName = 'Unknown';
        startDateObj = new Date(0);
      }
    }

    const resolvedCourseCode =
      standardCoursesMap.get(String(t.course)) ||
      companyCoursesMap.get(String(t.course)) ||
      'UNASSIGNED COURSE';

    const trainee = registration ? traineesMap.get(String(registration.trainee_ref_id)) : null;
    const displayDate = startDateStr;
    const monthYear = `${monthName} ${targetYear}`;

    const startDate = startDateStr;
    const endDate = endDateStr;

    // Single day check
    const isSingleDay = !endDate || endDate.toUpperCase() === 'N/A' || endDate === startDate;

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
      isEmailed: t.isEmailed || false,
      attendance: t.attendance || false,
      traineeName: trainee
        ? `${allRanks?.find((rank) => rank.code === trainee.rank)?.rank || trainee.rank} ${trainee.last_name}, ${trainee.first_name} ${
            trainee.middle_name ? trainee.middle_name.charAt(0) + '.' : ''
          }`
        : 'Unknown Trainee',
      reg_type: registration?.regType,
      contactNo: trainee?.contact_no || 'N/A',
      email: trainee?.email || 'N/A',
      company: t.accountType === 1 ? 'COMPANY' : 'CREW',
      companyName: allClients?.find((client) => client.id === trainee?.company)?.alias || trainee?.company
    });
  }

  // 1. Filter by Month
  const monthFiltered = selectedMonth
    ? enriched.filter((item) => item.monthName.toLowerCase() === selectedMonth.toLowerCase())
    : enriched;

  // 2. Filter by Specific Day of Month
  const filteredData = selectedDay && selectedDay !== 'ALL'
    ? monthFiltered.filter((item) => {
        if (!item.startDateObj || isNaN(item.startDateObj.getTime())) return false;
        return item.startDateObj.getDate() === parseInt(selectedDay, 10);
      })
    : monthFiltered;

  const dateMap = new Map<string, {
    dateKey: string,
    displayDate: string,
    monthYear: string,
    startDateObj: Date,
    coursesMap: Map<string, {
      courseCode: string,
      startDate: string,
      endDate: string,
      isSingleDay: boolean,
      trainees: typeof filteredData
    }>
  }>();

  // 3. Iterate over filteredData (instead of monthFiltered)
  filteredData.forEach((item) => {
    const isValidDate = item.startDateObj && !isNaN(item.startDateObj.getTime()) && item.startDateObj.getTime() !== 0;
    
    // Normalize to YYYY-MM-DD so backdated and scheduled dates resolve to the exact same map key
    const dateKey = isValidDate ? getStandardDateKey(item.startDateObj) : item.displayDate;
    
    // Standardize header display text (e.g., SEP 28 2026)
    const unifiedDisplayDate = isValidDate ? formatUnifiedDisplayDate(item.startDateObj) : item.displayDate;

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        dateKey,
        displayDate: unifiedDisplayDate,
        monthYear: item.monthYear,
        startDateObj: item.startDateObj,
        coursesMap: new Map()
      });
    }
    
    const dateGroup = dateMap.get(dateKey)!;
    const courseKey = `${item.courseCode}_${item.startDate}_${item.endDate}`;

    if (!dateGroup.coursesMap.has(courseKey)) {
      dateGroup.coursesMap.set(courseKey, {
        courseCode: item.courseCode,
        startDate: item.startDate,
        endDate: item.endDate,
        isSingleDay: item.isSingleDay,
        trainees: []
      });
    }
    dateGroup.coursesMap.get(courseKey)!.trainees.push(item);
  });

  const sortedDateGroups = Array.from(dateMap.values()).sort((a, b) => {
    return sortOrder === 'desc'
      ? b.startDateObj.getTime() - a.startDateObj.getTime()
      : a.startDateObj.getTime() - b.startDateObj.getTime();
  });

  return sortedDateGroups.map((dateGroup) => ({
    ...dateGroup,
    courses: Array.from(dateGroup.coursesMap.values())
  }));
}, [allTraining, allCourses, courseCodes, allRegistrations, allTrainee, selectedMonth, selectedDay, currentYear, sortOrder]);

  const handleToggleAttendance = async(id: string, val: boolean)=> {
    const actor: string | null = localStorage.getItem('customToken')
    try{
      await UPDATE_TRAINING(id, { attendance: !val }, actor)
      handleToast(
        'Update Successful!',
        'Attendance marked successfully!',
        'success'
      )
    }catch(error){
      console.error('Error toggling attendance: ', error)
      handleToast(
        'Update Failed!',
        'Contact your system administrator to resolve this issue.',
        'error'
      )
      throw new Error('Error toggling attendance: ' + error)
    }
  }

  return (
    <main className="p-4 w-full">
      <Box>COMBINED WITH BACKDATED</Box>
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
        {/* Select Day Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>Select Day:</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="ALL">All Days</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={String(day)}>
                  {day}
                </option>
              ))}
            </select>
          </div>
  
          {/* Today Button */}
          <button
            type="button"
            onClick={handleSelectToday}
            style={{
              padding: '6px 16px',
              backgroundColor: '#1d4ed8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Today
          </button>
          {selectedDay !== 'ALL' && (
            <>
            <Button size='sm' colorScheme='red' shadow='md' onClick={() => setSelectedDay('ALL')}>Clear</Button>
            </>
          )}
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
              <Th color="white" w="20%">STATUS</Th>
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
                          <Td fontSize="xs" textTransform="uppercase">{`${item.company}/ ${item.companyName}`}</Td>
                          <Td fontSize="xs" fontWeight="bold" cursor='pointer' textTransform="uppercase"
                            textDecoration={`${item.attendance && 'line-through'}`}
                            onClick={(e) => {handleToggleAttendance(item.id, item.attendance)}}
                          >{item.traineeName}</Td>
                          <Td fontSize="xs">{item.contactNo}</Td>
                          <Td fontSize="xs" color="blue.700" textDecoration="underline">{item.email}</Td>
                          <Td fontSize="xs">
                            <Badge
                              colorScheme={item.reg_status === 6 ? 'green' : item.reg_status === 7 ? 'red' : 'gray'}
                              fontSize="10px"
                            >
                              {getStatus(item.reg_status)}
                            </Badge>
                            {item.isEmailed && (
                              <Badge
                                colorScheme={'green'}
                                fontSize="10px"
                              >
                                {'Emailed'}
                              </Badge>
                            )}
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