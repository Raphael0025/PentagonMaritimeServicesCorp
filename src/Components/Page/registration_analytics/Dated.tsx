'use client'

import { Timestamp } from 'firebase/firestore'
import React, { useState, useRef, useEffect} from 'react'
import { useReactToPrint } from 'react-to-print'
import { Image as ChakraImage, Box, Text, Input, SimpleGrid, Textarea, Button, IconButton, Tooltip as ChakraTooltip, HStack, Flex, Select, useToast, Stat, StatLabel, Link, VStack, StatNumber, StatHelpText, StatArrow, Badge, Tfoot, Table, TableContainer, Tbody, Thead, Th, Tr, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Divider, List, ListItem, ListIcon, UnorderedList} from '@chakra-ui/react'

import { PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { ToastStatus } from '@/types/handling'

import { useRegistrations } from '@/context/RegistrationContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTraining } from '@/context/TrainingContext'
import { useTrainees } from '@/context/TraineeContext'
import { useCourses } from '@/context/CourseContext'
import { useInquiries } from '@/context/InquiriesContext'
import { useReportMetaData } from '@/context/ReportMetaDataContext'

import { GENERATE_REG_REPORT, UPDATE_REG_REPORT } from '@/lib/ReportMetadata.controller'

import { RegistrationReport, RegistrationReportByID, initRegReport } from '@/types/ReportMetadata.model'
import { REGISTRATION } from '../../../types/trainees';

ChartJS.register( CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend )
// Define interface for the table structure
interface CompanyBreakdown {
  name: string
  companyCharge: number
  crewCharge: number
  total: number
  isTapped: boolean
}

interface CourseBreakdown {
  course: string;
  isMarinaCourse: boolean;
  isSimuCourse: boolean;
  totalTrainees: number;
}

export default function DatedAnalytics() {
  const toast = useToast()
  const { data: allCourses } = useCourses()
  const { data: allTrainee } = useTrainees()
  const { data: allInquiries = [] } = useInquiries()
  const { regData: regRepData } = useReportMetaData()
  const { data: allClients, courseCodes } = useClients()
  const { allData: allTraining, setMonth: setTMonth, setYear: setTYear } = useTraining()
  const { allData: allRegistrations, setMonth: setRMonth, setYear: setRYear } = useRegistrations()

  const [fb, setFb] = useState<number>(0)
  const [walkIn, setWalkIn] = useState<number>(0)
  const [others, setOthers] = useState<number>(0)
  const [accountMgmt, setAccountMgmt] = useState<number>(0)
  const [consultancy, setConsultancy] = useState<number>(0)
  const [cancelledCount, setCancelledCount] = useState<number>(0)
  const [companyEndorse, setCompanyEndorse] = useState<number>(0)
  const [totalInquiriesCount, setTotalInquiriesCount] = useState<number>(0)

  const [currentMonthCount, setCurrentMonthCount] = useState<number>(0)
  const [prevMonthCount, setPrevMonthCount] = useState<number>(0)
  const [percentageChange, setPercentageChange] = useState<number>(0)

  const [ regReport, setRegReport ] = useState<RegistrationReport | null>(initRegReport)
  const [ regReportID, setRegReportID ] = useState<RegistrationReportByID | null>({...initRegReport, id: '', generatedAt: Timestamp.now(), generatedBy: '',})
  const [ userName, setUsername ] = useState<string>('')

  // State for Top 3 Clients Chart
  const [topClientNames, setTopClientNames] = useState<string[]>(['N/A', 'N/A', 'N/A', 'N/A', 'N/A'])
  const [topClientCounts, setTopClientCounts] = useState<number[]>([0, 0, 0,0,0])

  const [courseLabels, setCourseLabels] = useState<string[]>(['N/A', 'N/A', 'N/A', 'N/A', 'N/A'])
  const [courseData, setCourseData] = useState<number[]>([0, 0, 0,0,0])

  // --- Date Picker / Filter States (Defaults to Current Month and Year) ---
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()) // 0 - 11
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  const [crewChargeCount, setCrewChargeCount] = useState<number>(0)
  const [companyChargeCount, setCompanyChargeCount] = useState<number>(0)
  const [totalTraineesCount, setTotalTraineesCount] = useState<number>(0)
  // State for segregated data
  const [tappedClients, setTappedClients] = useState<CompanyBreakdown[]>([])
  const [untappedClients, setUntappedClients] = useState<CompanyBreakdown[]>([])

  // State declarations at top of component:
  const [allCourseBreakdown, setAllCourseBreakdown] = useState<CourseBreakdown[]>([])
  const [simuCourseBreakdown, setSimuCourseBreakdown] = useState<CourseBreakdown[]>([])
  const [marinaCourseBreakdown, setMarinaCourseBreakdown] = useState<CourseBreakdown[]>([])
  const [nonSimuCourseBreakdown, setNonSimuCourseBreakdown] = useState<CourseBreakdown[]>([])

  const [nextMonthCourseCounts, setNextMonthCourseCounts] = useState<{ code: string; count: number }[]>([]);

  const [content, setContent] = useState('');
  const [tempContent, setTempContent] = useState('');
  // FIX 1: Provide HTMLDivElement type to useRef
  const editorRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpen = () => {
    setTempContent(content);
    onOpen();
  };

  // Using undefined resolves the 'null' type mismatch cleanly
  const format = (command: string, value: string = '') => {
    document.execCommand(command, false, value || undefined);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleSave = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML); // Now works cleanly without ts(2339)
      setRegReport((prev) => ({
        month: prev?.month ?? new Date().getMonth(), // fallback to current month if null
        year: prev?.year ?? new Date().getFullYear(),  // fallback to current year if null
        ...(prev || {}),
        otherMatters: editorRef.current?.innerHTML || '',
      }));
    }
    onClose();
  };

  const isEmpty = !content || content === '<br>' || content === '<div><br></div>';

  // Shared CSS styles to override Chakra's list reset and restore Word-like formatting
  const richTextStyles = {
    'ol': {
      listStyleType: 'decimal !important',
      paddingLeft: '28px !important',
      marginTop: '4px',
      marginBottom: '8px',
    },
    'ul': {
      listStyleType: 'disc !important',
      paddingLeft: '28px !important',
      marginTop: '4px',
      marginBottom: '8px',
    },
    'li': {
      marginBottom: '4px',
      display: 'list-item !important',
    },
    'p, div': {
      marginBottom: '4px',
    },
  }

// 2. Handle Dropdown Changes & Sync to Context
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = Number(e.target.value)
    setSelectedMonth(month)
    if (setTMonth) setTMonth(month)
    if (setRMonth) setRMonth(month)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = Number(e.target.value)
    setSelectedYear(year)
    if (setTYear) setTYear(year)
    if (setRYear) setRYear(year)
  }

  const handleToast = (title: string = '', desc: string = '', timer: number, status: ToastStatus) => {
    toast({
        title: title,
        description: desc,
        position: 'bottom-right',
        variant: 'left-accent',
        status: status,
        duration: timer,
        isClosable: true,
    })
  }

  useEffect(() => {
    const fetchReportData = () => {
      const actor: string | null = localStorage.getItem('customToken');
      setUsername(actor || '')

      const foundRecord = regRepData?.find(rep =>
        rep?.month === selectedMonth &&
        rep?.year === selectedYear
      )

      if(foundRecord){
        setRegReport({
          ...initRegReport,
          ...foundRecord,
          month: selectedMonth,
          year: selectedYear,
        })
        
        setRegReportID({
          ...initRegReport,
          ...foundRecord, // OPtional: fallback
          id: foundRecord.id,
          generatedAt: foundRecord.generatedAt,
          generatedBy: foundRecord.generatedBy || ''
        })
        setContent(foundRecord?.otherMatters || '')
        return
      }
      setRegReport({...initRegReport, month: selectedMonth, year: selectedYear})
      setRegReportID(null)
    }
    fetchReportData()
  },[regRepData, selectedMonth, selectedYear])

  useEffect(() => {
    const fetchData = () => {
      let companyCharge = 0
      let crewCharge = 0

      // -------------------------------------------------------------
      // 1. FILTER: regType === 0 AND date_enrolled matches selected month/year
      // -------------------------------------------------------------
      const filteredTraining = (allTraining || []).filter((t: any) => {
        if (t.regType !== 0) return false
        if (t.reg_status === 7) return false
        if (!t.date_enrolled) return false

        const enrolledDate: Date =
          typeof t.date_enrolled.toDate === 'function'
            ? t.date_enrolled.toDate()
            : new Date(t.date_enrolled)

        if (isNaN(enrolledDate.getTime())) return false

        const isSelectedMonthYear =
          enrolledDate.getMonth() === selectedMonth &&
          enrolledDate.getFullYear() === selectedYear

        if (!isSelectedMonthYear) return false

        return t.reg_status === 3 || t.reg_status === 6
      })
      
      const filteredCancelledTraining = (allTraining || []).filter((t: any) => {
        if (t.regType !== 0) return false
        if (!t.date_enrolled) return false

        const enrolledDate: Date =
          typeof t.date_enrolled.toDate === 'function'
            ? t.date_enrolled.toDate()
            : new Date(t.date_enrolled)

        if (isNaN(enrolledDate.getTime())) return false

        const isSelectedMonthYear =
          enrolledDate.getMonth() === selectedMonth &&
          enrolledDate.getFullYear() === selectedYear

        if (!isSelectedMonthYear) return false

        return t.reg_status === 7
      })
      setCancelledCount(filteredCancelledTraining.length)

      const filteredTrainingCourses = (filteredTraining || []).filter((t: any) => {
        if (t.regType !== 0) return false;
        if (t.reg_status === 7) return false;
        if (!t.start_date) return false;

        // Calculate target next month and handle year rollover (Dec -> Jan)
        const targetMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
        const targetYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;

        // Append the target year to the string so JavaScript can parse it correctly
        const dateStringWithYear = `${t.start_date}, ${targetYear}`;
        const startDate = new Date(dateStringWithYear);

        if (isNaN(startDate.getTime())) return false;

        const isNextMonthYear =
          startDate.getMonth() === targetMonth &&
          startDate.getFullYear() === targetYear;

        if (!isNextMonthYear) return false;

        return t.reg_status === 3 || t.reg_status === 6;
      });

      // 2. Count all matching course occurrences from the filtered records
      const countMap: { [code: string]: number } = {};

      filteredTrainingCourses.forEach((training: any) => {
        // Use your exact fallback logic to resolve the course code
        const code =
          allCourses?.find((course: any) => course.id === training.course)?.course_code ||
          courseCodes?.find((course: any) => course.id === training.course)?.company_course_code ||
          '';

        // Only count if a valid course code was found
        if (code) {
          countMap[code] = (countMap[code] || 0) + 1;
        }
      });
      // 3. Convert the map into an array of objects and sort them from highest to lowest count
      const sortedCourseCounts = Object.entries(countMap)
        .map(([code, count]) => ({
          code,
          count,
        }))
        .sort((a, b) => b.count - a.count);

      setNextMonthCourseCounts(sortedCourseCounts);
      // -------------------------------------------------------------
      // 2. Marketing Breakdown (Filtered)
      // -------------------------------------------------------------
      const companyEndorseList = filteredTraining.filter(
        (t: any) => t.marketing === 'COMPANY' || t.marketing === 'N/A'
      )
      const accountMgmtList = filteredTraining.filter((t: any) => t.marketing === 'AGENT')
      const consultancyList = filteredTraining.filter((t: any) => t.marketing === 'CONSULTANCY')
      const walkInList = filteredTraining.filter(
        (t: any) => t.marketing === 'WALK-IN' || t.marketing === 'walk-in'
      )
      const fbList = filteredTraining.filter((t: any) => t.marketing === 'FB')

      const excludedChannels = ['FB', 'COMPANY', 'N/A', 'CONSULTANCY', 'WALK-IN', 'AGENT']
      const othersList = filteredTraining.filter(
        (t: any) => t.marketing && !excludedChannels.includes(t.marketing.toUpperCase())
      )

      setCompanyEndorse(companyEndorseList.length)
      setAccountMgmt(accountMgmtList.length)
      setConsultancy(consultancyList.length)
      setWalkIn(walkInList.length)
      setFb(fbList.length)
      setOthers(othersList.length)

      // Helper function to resolve alias (or fallback to company name) from allClients
      const resolveOfficialClientName = (rawRef: any): string => {
        if (!rawRef || rawRef === '' || rawRef === 'N/A' || rawRef === 'NONE') {
          return 'N/A'
        }

        const searchStr = String(rawRef).trim().toLowerCase()

        if (Array.isArray(allClients)) {
          const matchedClient = allClients.find((c: any) => {
            const idMatch = String(c.id || c._id || '').toLowerCase() === searchStr
            const codeMatch = String(c.code || c.client_code || '').toLowerCase() === searchStr
            const nameMatch = String(c.company || c.company_name || c.name || '').trim().toLowerCase() === searchStr
            const aliasMatch = String(c.alias || '').trim().toLowerCase() === searchStr

            // Loose partial match fallback
            const partialNameMatch =
              searchStr.length > 3 &&
              String(c.company || c.company_name || c.name || '').toLowerCase().includes(searchStr)

            return idMatch || codeMatch || nameMatch || aliasMatch || partialNameMatch
          })

          if (matchedClient) {
            // 1. Strictly prioritize Alias
            const alias = matchedClient.alias ? String(matchedClient.alias).trim() : ''
            if (alias && alias !== 'N/A' && alias !== '') {
              return alias
            }

            // 2. Fallback to Company Name if no Alias exists
            const companyName = matchedClient.company
            if (companyName) {
              return String(companyName).trim()
            }
          }
        }

        return searchStr.toUpperCase()
      }

      // -------------------------------------------------------------
      // 3. Top 3 Clients Calculation (Filtered & Deduplicated)
      // -------------------------------------------------------------
      const clientMap: { [clientName: string]: number } = {}

      filteredTraining.forEach((t: any) => {
        let rawCompanyId = t.company || t.company_id

        if (!rawCompanyId && Array.isArray(allRegistrations) && Array.isArray(allTrainee)) {
          const regRec = allRegistrations.find(
            (r: any) => String(r.id) === String(t.reg_ref_id || t.reg_id)
          )
          const traineeRec = allTrainee.find(
            (tr: any) => String(tr.id) === String(regRec?.trainee_ref_id || t.trainee_id)
          )
          rawCompanyId = traineeRec?.company 
        }

        const officialName = resolveOfficialClientName(rawCompanyId)
        if (officialName !== 'N/A') {
          clientMap[officialName] = (clientMap[officialName] || 0) + 1
        }
      })

      const sortedClients = Object.entries(clientMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      const names = sortedClients.map(([name]) => name)
      const counts = sortedClients.map(([, count]) => count)

      while (names.length < 5) {
        names.push('N/A')
        counts.push(0)
      }

      setTopClientNames(names)
      setTopClientCounts(counts)

      // -------------------------------------------------------------
      // 4. Calculate Top Courses by Resolving ID/Code from allCourses
      // -------------------------------------------------------------
      const courseMap: { [courseName: string]: number } = {}

      if (Array.isArray(filteredTraining) && filteredTraining.length > 0) {
        filteredTraining.forEach((t: any) => {
          const rawCourseId = t.course || t.course_id || t.courseCode || t.course_code

          if (rawCourseId && rawCourseId !== '' && rawCourseId !== 'N/A') {
            const matchedCourse = Array.isArray(allCourses)
              ? allCourses.find(
                  (c: any) =>
                    String(c.id) === String(rawCourseId) ||
                    String(c._id) === String(rawCourseId) ||
                    String(c.code) === String(rawCourseId) ||
                    String(c.courseCode) === String(rawCourseId) ||
                    String(c.course_code) === String(rawCourseId)
                )
              : null

            const rawCode = matchedCourse?.course_code || rawCourseId
            const displayName = rawCode?.toUpperCase()

            if (displayName) {
              courseMap[displayName] = (courseMap[displayName] || 0) + 1
            }
          }
        })
      }

      const sortedCourses = Object.entries(courseMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      const topCourseNames = sortedCourses.map(([name]) => name)
      const topCourseCounts = sortedCourses.map(([, count]) => count)

      while (topCourseNames.length < 5) {
        topCourseNames.push('N/A')
        topCourseCounts.push(0)
      }

      setCourseLabels(topCourseNames)
      setCourseData(topCourseCounts)

      // -------------------------------------------------------------
      // 5. Calculate Current vs Previous Month MoM Growth Percentage
      // -------------------------------------------------------------
      const currentMonthTotal = filteredTraining.length

      const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1
      const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear

      const prevMonthTraining = (allTraining || []).filter((t: any) => {
        if (t.regType !== 0) return false
        if (t.reg_status === 7) return false
        if (!t.date_enrolled) return false

        const enrolledDate: Date =
          typeof t.date_enrolled.toDate === 'function'
            ? t.date_enrolled.toDate()
            : new Date(t.date_enrolled)

        if (isNaN(enrolledDate.getTime())) return false

        return (
          enrolledDate.getMonth() === prevMonth &&
          enrolledDate.getFullYear() === prevYear
        )
      })

      const prevMonthTotal = prevMonthTraining.length

      let growthRate = 0
      if (prevMonthTotal > 0) {
        growthRate = ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100
      } else if (currentMonthTotal > 0) {
        growthRate = 100
      }

      // -------------------------------------------------------------
      // 6. Total Charge Counts & Deduplicated Table Aggregation
      // -------------------------------------------------------------
      // Helper function returning the resolved client object and name
      const resolveClientInfo = (rawRef: any): { name: string; isTapped: boolean } => {
        if (!rawRef || rawRef === '' || rawRef === 'N/A' || rawRef === 'NONE') {
          return { name: 'N/A', isTapped: false }
        }

        const searchStr = String(rawRef).trim().toLowerCase()

        if (Array.isArray(allClients)) {
          const matchedClient = allClients.find((c: any) => {
            const idMatch = String(c.id || c._id || '').toLowerCase() === searchStr
            const codeMatch = String(c.code || c.client_code || '').toLowerCase() === searchStr
            const nameMatch = String(c.company || c.company_name || c.name || '').trim().toLowerCase() === searchStr
            const aliasMatch = String(c.alias || '').trim().toLowerCase() === searchStr

            const partialNameMatch =
              searchStr.length > 3 &&
              String(c.company || c.company_name || c.name || '').toLowerCase().includes(searchStr)

            return idMatch || codeMatch || nameMatch || aliasMatch || partialNameMatch
          })

          if (matchedClient) {
            // Prioritize Alias, fallback to Company Name
            const alias = matchedClient.alias ? String(matchedClient.alias).trim() : ''
            const companyName = matchedClient.company
            const resolvedName = alias && alias !== 'N/A' ? alias : String(companyName).trim()

            return { name: resolvedName, isTapped: true }
          }
        }

        // Not found in allClients -> Untapped Client
        return { name: searchStr.toUpperCase(), isTapped: false }
      }

      // -------------------------------------------------------------
      // 6. Aggregate into Tapped vs Untapped Maps
      // -------------------------------------------------------------
      const companyMap: { 
        [name: string]: { companyCharge: number; crewCharge: number; isTapped: boolean } 
      } = {}

      filteredTraining.forEach((t: any) => {
        let rawCompanyId = t.company || t.company_id || t.company_name

        if (!rawCompanyId && Array.isArray(allRegistrations) && Array.isArray(allTrainee)) {
          const regRec = allRegistrations.find(
            (r: any) => String(r.id) === String(t.reg_ref_id || t.reg_id)
          )
          const traineeRec = allTrainee.find(
            (tr: any) => String(tr.id) === String(regRec?.trainee_ref_id || t.trainee_id)
          )
          rawCompanyId = traineeRec?.company
        }

        const { name: officialCompanyName, isTapped } = resolveClientInfo(rawCompanyId)
        const accountType = Number(t.accountType)

        if (accountType === 1) {
          companyCharge++
        } else {
          crewCharge++
        }

        if (!companyMap[officialCompanyName]) {
          companyMap[officialCompanyName] = { companyCharge: 0, crewCharge: 0, isTapped }
        }

        if (accountType === 1) {
          companyMap[officialCompanyName].companyCharge += 1
        } else {
          companyMap[officialCompanyName].crewCharge += 1
        }
      })

      // Build sorted arrays for Tapped and Untapped
      const allRows: CompanyBreakdown[] = Object.entries(companyMap)
        .map(([name, data]) => ({
          name,
          companyCharge: data.companyCharge,
          crewCharge: data.crewCharge,
          total: data.companyCharge + data.crewCharge,
          isTapped: data.isTapped,
        }))
        .sort((a, b) => b.total - a.total)

      const tapped = allRows.filter((row) => row.isTapped)
      const untapped = allRows.filter((row) => !row.isTapped)

      setTappedClients(tapped)
      setUntappedClients(untapped)

      // 1. Group and aggregate total trainees per course
      const courseBreakdownMap: { [key: string]: CourseBreakdown } = {}

      filteredTraining.forEach((t: any) => {
        const rawCourseId = t.course || t.course_id || t.courseCode || t.course_code
        if (!rawCourseId) return

        const searchStr = String(rawCourseId).trim().toLowerCase()

        let matchedCourse: any = null
        if (Array.isArray(courseCodes)) {
          matchedCourse = courseCodes.find((c: any) => {
            const companyCourseCodeMatch = String(c.company_course_code || '').trim().toLowerCase() === searchStr
            const courseCodeMatch = String(c.course_code || c.code || '').trim().toLowerCase() === searchStr
            const idMatch = String(c.id || c._id || '').trim().toLowerCase() === searchStr
            const nameMatch = String(c.course_name || c.name || '').trim().toLowerCase() === searchStr
            return companyCourseCodeMatch || courseCodeMatch || idMatch || nameMatch
          })
        }

        if (!matchedCourse && Array.isArray(allCourses)) {
          matchedCourse = allCourses.find((c: any) => {
            return (
              String(c.company_course_code || '').trim().toLowerCase() === searchStr ||
              String(c.course_code || c.code || '').trim().toLowerCase() === searchStr ||
              String(c.id || c._id || '').trim().toLowerCase() === searchStr
            )
          })
        }

        const courseKey =
          matchedCourse?.company_course_code ||
          matchedCourse?.course_code ||
          matchedCourse?.code ||
          matchedCourse?.course_name ||
          matchedCourse?.name ||
          String(rawCourseId).toUpperCase()

        // 0 - Marina | 1 - In-house | 2 - STCW | 3 - Safety Course
        // trainingMode: 0 - NS | 1 - Simu
        const courseType = Number(matchedCourse?.courseType ?? t.courseType)
        const trainingMode = Number(matchedCourse?.trainingMode ?? t.trainingMode)

        // Combine Marina (0) and STCW (2) into a single flag
        const isMarinaOrStcw = courseType === 0 || courseType === 2
        const isSimu = trainingMode === 1

        if (!courseBreakdownMap[courseKey]) {
          courseBreakdownMap[courseKey] = {
            course: courseKey,
            isMarinaCourse: isMarinaOrStcw, // Combined Marina + STCW
            isSimuCourse: isSimu,
            totalTrainees: 0,
          }
        }

        courseBreakdownMap[courseKey].totalTrainees += 1
      })

      const allList = Object.values(courseBreakdownMap).sort((a, b) => b.totalTrainees - a.totalTrainees)


      setAllCourseBreakdown(allList)
      setSimuCourseBreakdown(allList.filter((c) => c.isSimuCourse && !c.isMarinaCourse))
      setMarinaCourseBreakdown(allList.filter((c) => c.isMarinaCourse))
      setNonSimuCourseBreakdown(allList.filter((c) => !c.isSimuCourse))

      const totalTrainees = filteredTraining.length

      setCompanyChargeCount(companyCharge)
      setCrewChargeCount(crewCharge)
      setTotalTraineesCount(totalTrainees)

      setCurrentMonthCount(currentMonthTotal)
      setPrevMonthCount(prevMonthTotal)
      setPercentageChange(Number(growthRate.toFixed(1)))

      // Helper to resolve 1-indexed month number (1 - 12)
      const getMonthNumber = (month: string | number): number => {
        if (typeof month === 'number') {
          return month < 12 ? month + 1 : month
        }
        const date = new Date(`${month} 1, 2000`)
        return date.getMonth() + 1
      }

      const selectedMonthNum = getMonthNumber(selectedMonth)

      // Filter inquiries matching selected month and year
      const filteredInquiries = allInquiries && allInquiries.filter((inquiry: any) => {
        const dateVal = inquiry.inquiry_date || inquiry.created_at || inquiry.date || inquiry.createdAt
        if (!dateVal) return false

        // Support Firebase Timestamps, Date objects, or ISO strings
        const dateObj = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal)

        const inquiryMonth = dateObj.getMonth() + 1
        const inquiryYear = dateObj.getFullYear()

        return inquiryMonth === selectedMonthNum && inquiryYear === Number(selectedYear)
      })

      // Set the count in state
      setTotalInquiriesCount(filteredInquiries ? filteredInquiries.length : 0)
    }
    fetchData()
  }, [ allInquiries, allCourses, allTrainee, allClients, allTraining, courseCodes, allRegistrations, selectedMonth, selectedYear, ])

    // Chart configuration object
  const topCoursesChartData = {
    labels: courseLabels,
    datasets: [
      {
        label: 'Registrations per Course',
        data: courseData,
        backgroundColor: [
          '#3182CE', // Chakra Blue
        ],
        borderRadius: 6,
      },
    ],
  }

  // --- CHART 2: Dynamic Top 3 Client Companies Bar Chart Data ---
  const topClientsData = {
    labels: topClientNames,
    datasets: [
      {
        label: 'Trainees Registered',
        data: topClientCounts,
        backgroundColor: ['#3182CE'], // Chakra teal, purple, orange
        borderRadius: 6,
      },
    ],
  }

  // --- CHART 3: Course Category Distribution Doughnut Data ---
  const customersAssistedData = {
    labels: ['Company Endorsement', 'Account Management', 'Consultancy', 'Walk-In', 'Facebook', 'Others'],
    datasets: [
      {
        data: [
          companyEndorse,
          accountMgmt,
          consultancy,
          walkIn,
          fb,
          others,
        ],
        backgroundColor: [
          '#3182CE', // Company Endorsement (Chakra Blue 500)
          '#805AD5', // Account Management  (Chakra Purple 500)
          '#DD6B20', // Consultancy          (Chakra Orange 500)
          '#38A169', // Walk-In              (Chakra Green 500)
          '#319795', // Facebook             (Chakra Teal 500)
          '#718096'  // Others               (Chakra Gray 500)
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins:{
      legend: false,
    },
  }

  const chartOptionsDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  }

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

    const allClientsCombined = [...tappedClients, ...untappedClients]
    const grandCompanyCharge = allClientsCombined.reduce((acc, curr) => acc + curr.companyCharge, 0)
    const grandCrewCharge = allClientsCombined.reduce((acc, curr) => acc + curr.crewCharge, 0)
    const grandTotal = grandCompanyCharge + grandCrewCharge
    
    const handleSaveOrUpdate = async () => {
      const actor: string | null = localStorage.getItem('customToken');
      if (!regReport) return;
  
      try {
          if (regReportID?.id) {
              await UPDATE_REG_REPORT(regReportID.id, regReport);
              handleToast('Monthly Report Updated!', ``, 3000, 'success');
          } else {
              // Execute fresh save transaction
              const savedRecord = await GENERATE_REG_REPORT(regReport, actor);
              // 🟢 Update Track 2 state with the new database markers
              setRegReportID({
                  ...regReport,
                  id: savedRecord || '',
                  generatedAt: Timestamp.now(),
                  generatedBy: actor || '',
              });
  
              handleToast('Monthly Report Saved!', ``, 3000, 'success');
          }
      } catch (error) {
          console.error("Failed to process report details:", error);
          handleToast('Error processing report', 'Please try again.', 3000, 'error');
      }
  }

  const printRef = useRef<HTMLDivElement | null>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${new Date().toLocaleString('en-US', {month: 'short'})}`,
    onBeforePrint: () => {
      handleToast('Preparing to print Monthly Report...', ``, 3000, 'info');
    },
    onAfterPrint: () => {
      handleSaveOrUpdate();
      handleToast('Monthly Report Printed!', ``, 3000, 'success');
    },
  })

  return(
    <>
      <Box p={4}>
        <Text fontWeight="bold" fontSize="xl">
          REGISTRATION ANALYTICS
        </Text>
        <Flex align="end" mb={6} flexWrap="wrap" gap={4}>
          <Stat>
            <StatLabel fontSize="sm" mt={2} color="gray.500" fontWeight="bold" textTransform="uppercase">
              Monthly Growth
            </StatLabel>
            <Flex align="baseline" >
              <StatNumber fontSize="3xl" fontWeight="extrabold">
                {currentMonthCount}{' '}
                <Text as="span" fontSize="md" color="gray.500" fontWeight="normal">
                  trainees
                </Text>
              </StatNumber>
            </Flex>
            <StatHelpText mb={0} fontSize="xs" color="gray.600">
              <Flex align="center" gap={1}>
                <StatArrow type={percentageChange >= 0 ? 'increase' : 'decrease'} />
                <Text as="span" fontWeight="semibold">
                  {Math.abs(percentageChange)}%
                </Text>{' '}
                {percentageChange >= 0 ? 'increase' : 'decrease'} from last month ({prevMonthCount} trainees)
              </Flex>
            </StatHelpText>
          </Stat>
          {/* --- Month & Year Selection Dropdowns --- */}
          <Flex gap={3}>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              w="150px"
              bg="white"
            >
              {months.map((month, idx) => (
                <option key={month} value={idx}>
                  {month}
                </option>
              ))}
            </Select>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              w="110px"
              bg="white"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
            <Button onClick={handlePrint} colorScheme="blue" bgColor="blue.700" shadow="md">
              Export Report
            </Button>
          </Flex>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* Top 3 Clients */}
          <Box as="a" cursor="pointer" p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white"
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault()
              document.getElementById('grpByCmpy')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Text fontWeight="semibold" mb={3} textAlign="center" textTransform="uppercase">
              Top Three (3) Client Companies
            </Text>
            <Box h="260px" position="relative">
              <Bar data={topClientsData} options={chartOptions} />
            </Box>
          </Box>
          {/* Marketing Distribution */}
          <Box as="a" cursor="pointer" p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white"
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault()
              document.getElementById('c_asst')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Text fontWeight="semibold" mb={3} textAlign="center" textTransform="uppercase">
              Customers Assisted
            </Text>
            <Box h="260px" position="relative">
              <Doughnut data={customersAssistedData} options={chartOptionsDoughnut} />
            </Box>
          </Box>
          {/* Top 3 courses */}
          <Box as="a" cursor="pointer" p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white"
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault()
              document.getElementById('grpByCourse')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Text fontWeight="semibold" mb={3} textAlign="center" textTransform="uppercase">
              Top Three (3) Courses
            </Text>
            <Box h="260px" position="relative">
              <Bar data={topCoursesChartData} options={chartOptions} />
            </Box>
          </Box>
        </SimpleGrid>
        <Box mt='2' p={5} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
          <Text fontSize="md" fontWeight="bold" mb={4} color="gray.700">
            Enrollee Account Breakdown
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {/* Company Charge (accountType = 0) */}
            <Stat p={4} borderWidth="1px" borderRadius="md" bg="blue.50" borderColor="blue.100">
              <StatLabel color="blue.700" fontWeight="bold" fontSize="xs" textTransform="uppercase">
                Company Charge
              </StatLabel>
              <StatNumber color="blue.900" fontSize="3xl" fontWeight="extrabold" mt={1}>
                {companyChargeCount}
              </StatNumber>
              <StatHelpText mb={0} fontSize="xs" color="blue.600">
                {totalTraineesCount > 0
                  ? `${((companyChargeCount / totalTraineesCount) * 100).toFixed(1)}% of total`
                  : '0%'}
              </StatHelpText>
            </Stat>
            {/* Crew Charge (accountType = 1) */}
            <Stat p={4} borderWidth="1px" borderRadius="md" bg="orange.50" borderColor="orange.100">
              <StatLabel color="orange.700" fontWeight="bold" fontSize="xs" textTransform="uppercase">
                Crew Charge (Personal)
              </StatLabel>
              <StatNumber color="orange.900" fontSize="3xl" fontWeight="extrabold" mt={1}>
                {crewChargeCount}
              </StatNumber>
              <StatHelpText mb={0} fontSize="xs" color="orange.600">
                {totalTraineesCount > 0
                  ? `${((crewChargeCount / totalTraineesCount) * 100).toFixed(1)}% of total`
                  : '0%'}
              </StatHelpText>
            </Stat>
            {/* Total Trainees */}
            <Stat p={4} borderWidth="1px" borderRadius="md" bg="gray.50" borderColor="gray.200">
              <StatLabel color="gray.700" fontWeight="bold" fontSize="xs" textTransform="uppercase">
                Total Enrollees
              </StatLabel>
              <StatNumber color="gray.900" fontSize="3xl" fontWeight="extrabold" mt={1}>
                {totalTraineesCount}
              </StatNumber>
              <StatHelpText mb={0} fontSize="xs" color="gray.500">
                Filtered for selected period
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>
        {/** 4 tables */}
        <Box gap={8}>
          <Box display='flex' gap={8}>
            <Box w='500px' id='c_asst'>
              <Text fontSize="md" fontWeight="bold" mt='8' mb={4} color="gray.700">Total # of Customers Assisted:</Text>
              <TableContainer borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
                <Table minW='450px' variant="simple" size="sm" sx={{'tbody tr:hover': {bg: 'gray.50 !important'}}}>
                  <Thead bg="gray.100">
                    <Tr>
                      <Th fontSize="xs" fontWeight="bold">ENROLLED</Th>
                      <Th isNumeric fontSize="xs" fontWeight="bold">TOTAL</Th>
                    </Tr>
                  </Thead>
                  <Tbody >
                    <Tr >
                      <Td fontWeight="bold" color="blue.800" fontSize="xs">
                        1.1 Company Endorsement
                      </Td>
                      <Td isNumeric>{companyEndorse}</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" color="blue.800" fontSize="xs">
                        Account Management Officer
                      </Td>
                      <Td isNumeric>{accountMgmt}</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" color="blue.800" fontSize="xs">
                        Consultancy
                      </Td>
                      <Td isNumeric>{consultancy}</Td>
                    </Tr>
                    {/* <Tr>
                      <Td fontWeight="bold" color="blue.800" fontSize="xs">
                        Re-Enrolled
                      </Td>
                      <Td>{0}</Td>
                    </Tr> */}
                    <Tr>
                      <Td fontWeight="bold" color="blue.800" fontSize="xs">
                        Walk-in
                      </Td>
                      <Td isNumeric>{walkIn}</Td>
                    </Tr>
                    {/* <Tr>
                      <Td fontWeight="bold" color="blue.800" fontSize="xs">
                        Agent
                      </Td>
                      <Td>{accountMgmt}</Td>
                    </Tr> */}
                    <Tr>
                      <Td fontWeight="bold" color="blue.800" fontSize="xs">
                        FB
                      </Td>
                      <Td isNumeric>{fb}</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" color="blue.800" fontSize="xs">
                        Others
                      </Td>
                      <Td isNumeric>{others}</Td>
                    </Tr>
                    <Tr>
                      <Td></Td>
                      <Td></Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" color="blue.800" fontSize="xs">1.2 INQUIRY</Td>
                      <Td isNumeric>{totalInquiriesCount}</Td>
                    </Tr>
                    <Tr>
                      <Td></Td>
                      <Td></Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" color="blue.800" fontSize="xs">1.3 CANCELLED/WITHDRAWN</Td>
                      <Td isNumeric>{cancelledCount}</Td>
                    </Tr>
                    <Tr>
                      <Td></Td>
                      <Td></Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" color="blue.800" fontSize="xs">1.4 VISITORS</Td>
                      <Td>-</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
            <Box fontWeight='normal'>
              <Text fontSize="md" fontWeight="bold" mt='8' mb={4} color="gray.700">Other Matters:</Text>
              {isEmpty ? (
                <Text
                  _hover={{ textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={handleOpen}
                  color="gray.500"
                >
                  Please specify here if there are any other matters to report.
                </Text>
              ) : (
                <Box
                  _hover={{ borderColor: 'blue.300', cursor: 'pointer' }}
                  onClick={handleOpen}
                  p={4}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                  bg="gray.50"
                  sx={richTextStyles}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </Box>
          </Box>
          <Box display="flex" gap={8}>
            <Box id='grpByCmpy' >
              <Text fontSize="md" fontWeight="bold" mt='8' mb={4} color="gray.700">Customers Group by Company</Text>
              <TableContainer borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm" sx={{'tbody tr:hover':{bg: 'gray.50 !important'}}}>
                <Table w='400px' variant="simple" size="sm">
                  <Thead bg="gray.100">
                    <Tr>
                      <Th fontSize="xs" fontWeight="bold">CUSTOMERS NAME</Th>
                      <Th isNumeric fontSize="xs" fontWeight="bold">
                        COMPANY CHARGE<br />(# of Trainees)
                      </Th>
                      <Th isNumeric fontSize="xs" fontWeight="bold">
                        CREW CHARGE<br />(# of Trainees)
                      </Th>
                      <Th isNumeric fontSize="xs" fontWeight="bold">
                        TOTAL # TRAINEES
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {/* 2.1 Tapped Clients Section */}
                    {tappedClients.length > 0 && (
                      <>
                        <Tr bg="blue.50">
                          <Td colSpan={4} fontWeight="bold" color="blue.800" fontSize="xs">
                            2.1 Tapped Clients
                          </Td>
                        </Tr>
                        {tappedClients.map((row) => (
                          <Tr key={row.name}>
                            <Td pl={6} fontWeight="medium">{row.name}</Td>
                            <Td isNumeric>{row.companyCharge > 0 ? row.companyCharge : '-'}</Td>
                            <Td isNumeric>{row.crewCharge > 0 ? row.crewCharge : '-'}</Td>
                            <Td isNumeric fontWeight="bold">{row.total}</Td>
                          </Tr>
                        ))}
                      </>
                    )}
                    {/* 2.2 Untapped Clients Section */}
                    {untappedClients.length > 0 && (
                      <>
                        <Tr bg="orange.50">
                          <Td colSpan={4} fontWeight="bold" color="orange.800" fontSize="xs">
                            2.2 Untapped Clients
                          </Td>
                        </Tr>
                        {untappedClients.map((row) => (
                          <Tr key={row.name}>
                            <Td pl={6} fontWeight="medium">{row.name}</Td>
                            <Td isNumeric>{row.companyCharge > 0 ? row.companyCharge : '-'}</Td>
                            <Td isNumeric>{row.crewCharge > 0 ? row.crewCharge : '-'}</Td>
                            <Td isNumeric fontWeight="bold">{row.total}</Td>
                          </Tr>
                        ))}
                      </>
                    )}
                  </Tbody>
                  {/* Footer Summary */}
                  <Tfoot bg="gray.100">
                    <Tr fontWeight="bold">
                      <Th fontSize="xs">TOTAL</Th>
                      <Th isNumeric fontSize="xs">{grandCompanyCharge > 0 ? grandCompanyCharge : '-'}</Th>
                      <Th isNumeric fontSize="xs">{grandCrewCharge > 0 ? grandCrewCharge : '-'}</Th>
                      <Th isNumeric fontSize="xs" color="blue.600">{grandTotal}</Th>
                    </Tr>
                  </Tfoot>
                </Table>
              </TableContainer>
            </Box>
            <Box id='grpByCourse'>
              <Text fontSize="md" fontWeight="bold" mt='8' mb={4} color="gray.700">Customers Group by Course</Text>
              <HStack spacing={6} align="flex-start" wrap="wrap">
                {/* 1. MASTER TABLE: CUSTOMERS GROUP BY COURSE */}
                <TableContainer borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm" minW="260px">
                  <Table variant="simple" size="sm" sx={{'tbody tr:hover':{bg: 'gray.100 !important'}}}>
                    <Thead bg="gray.100">
                      <Tr>
                        <Th fontSize="xs" fontWeight="bold">Course</Th>
                        <Th isNumeric fontSize="xs" fontWeight="bold"># of Enrollees</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {allCourseBreakdown.map((row) => (
                        <Tr key={row.course}>
                          <Td fontWeight="medium">{row.course.toUpperCase()}</Td>
                          <Td isNumeric fontWeight="bold">{row.totalTrainees}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                    <Tfoot bg="gray.100">
                      <Tr fontWeight="bold">
                        <Th fontSize="xs">TOTAL</Th>
                        <Th isNumeric fontSize="xs" color="blue.600">
                          {allCourseBreakdown.reduce((sum, item) => sum + item.totalTrainees, 0)}
                        </Th>
                      </Tr>
                    </Tfoot>
                  </Table>
                </TableContainer>
                {/* RIGHT COLUMN: SIMULATOR & NON-SIMULATOR */}
                <VStack spacing={6} align="stretch" minW="260px">
                  {/* 4. MARINA COURSES */}
                  <TableContainer borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm" minW="260px">
                    <Table variant="simple" size="sm" sx={{'tbody tr:hover':{bg: 'gray.100 !important'}}}>
                      <Thead bg="blue.50">
                        <Tr>
                          <Th fontSize="xs" fontWeight="bold" color="blue.800">MARINA COURSES</Th>
                          <Th isNumeric fontSize="xs" fontWeight="bold" color="blue.800"># of Enrollees</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {marinaCourseBreakdown.map((row) => (
                          <Tr key={row.course}>
                            <Td fontWeight="medium">{row.course.toUpperCase()}</Td>
                            <Td isNumeric fontWeight="bold">{row.totalTrainees}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                      <Tfoot bg="gray.100">
                        <Tr fontWeight="bold">
                          <Th fontSize="xs">TOTAL</Th>
                          <Th isNumeric fontSize="xs" color="blue.700">
                            {marinaCourseBreakdown.reduce((sum, item) => sum + item.totalTrainees, 0)}
                          </Th>
                        </Tr>
                      </Tfoot>
                    </Table>
                  </TableContainer>
                  {/* 2. SIMULATOR COURSES */}
                  <TableContainer borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
                    <Table variant="simple" size="sm" sx={{'tbody tr:hover':{bg: 'gray.100 !important'}}}>
                      <Thead bg="purple.50">
                        <Tr>
                          <Th fontSize="xs" fontWeight="bold" color="purple.800">SIMULATOR COURSES</Th>
                          <Th isNumeric fontSize="xs" fontWeight="bold" color="purple.800"># of Enrollees</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {simuCourseBreakdown.map((row) => (
                          <Tr key={row.course}>
                            <Td fontWeight="medium">{row.course.toUpperCase()}</Td>
                            <Td isNumeric fontWeight="bold">{row.totalTrainees}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                      <Tfoot bg="gray.100">
                        <Tr fontWeight="bold">
                          <Th fontSize="xs">TOTAL</Th>
                          <Th isNumeric fontSize="xs" color="purple.700">
                            {simuCourseBreakdown.reduce((sum, item) => sum + item.totalTrainees, 0)}
                          </Th>
                        </Tr>
                      </Tfoot>
                    </Table>
                  </TableContainer>
                  {/* 3. NON-SIMULATOR COURSES */}
                  <TableContainer borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
                    <Table variant="simple" size="sm" sx={{'tbody tr:hover':{bg: 'gray.100 !important'}}}>
                      <Thead bg="orange.50">
                        <Tr>
                          <Th fontSize="xs" fontWeight="bold" color="orange.800">NON-SIMULATOR COURSES</Th>
                          <Th isNumeric fontSize="xs" fontWeight="bold" color="orange.800"># of Enrollees</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {nonSimuCourseBreakdown.map((row) => (
                          <Tr key={row.course}>
                            <Td fontWeight="medium">{row.course.toUpperCase()}</Td>
                            <Td isNumeric fontWeight="bold">{row.totalTrainees}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                      <Tfoot bg="gray.100">
                        <Tr fontWeight="bold">
                          <Th fontSize="xs">TOTAL</Th>
                          <Th isNumeric fontSize="xs" color="orange.700">
                            {nonSimuCourseBreakdown.reduce((sum, item) => sum + item.totalTrainees, 0)}
                          </Th>
                        </Tr>
                      </Tfoot>
                    </Table>
                  </TableContainer>
                </VStack>
              </HStack>
            </Box>
          </Box>
        </Box>
        {/** actual print */}
        <Box ref={printRef} 
        display={{ base: 'none', md: 'none' }} 
        flexDir='column' justifyContent='center' w='100%'
          sx={{
              // 🟢 Global CSS print instructions passed to the browser engine
              '@media print': {
                  display: 'flex !important', // Forces it to show up during print
                  body: {
                      margin: 0,
                  },
                  // Stops rows from breaking awkwardly in half across page folds
                  'tr': {
                      pageBreakInside: 'avoid !important',
                      breakInside: 'avoid !important',
                  },
              },
          }}
        >
          <Box w='100%' p='2'>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <td>
                      <Box display="flex" justifyContent="space-between" alignItems="center" pb="4" mb="6" >
                          <ChakraImage src="/Logo.jpg" width="2.81in" height="0.66in" alt="logo" />
                          <Box>
                          <Text display="flex" justifyContent="end" alignItems="center" fontSize="9pt" fontFamily="Calibri, Arial, sans-serif">
                              <Text as="span" mr={1}><PinIcon size="12" color="#000" /></Text>
                              2/F 801 Building UN Avenue Ermita Manila
                          </Text>
                          <Text display="flex" justifyContent="end" alignItems="center" fontSize="9pt" fontFamily="Calibri, Arial, sans-serif">
                              <Text as="span" mr={1}><PhoneIcon size="12" color="#000" /></Text>
                              (02) 8 281-8155
                          </Text>
                          <Text display="flex" justifyContent="end" alignItems="center" fontSize="9pt" fontFamily="Calibri, Arial, sans-serif">
                              <Text as="span" mr={1}><MailIcon size="12" color="#000" /></Text>
                              pentagonmaritimeservicescorp@gmail.com
                          </Text>
                          <Text display="flex" justifyContent="end" alignItems="center" fontSize="9pt" fontFamily="Calibri, Arial, sans-serif">
                              <Text as="span" mr={1}><FacebookIcon size="12" color="#000" /></Text>
                              /pentagonmaritimeservicescorp
                          </Text>
                          </Box>
                      </Box>
                  </td>
              </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Box as='main' w='100%'>
                      {/** Report Title */}
                      <Box display='flex' fontSize='11pt' justifyContent='space-between' alignItems='end'>
                        <Text textAlign='center' display='flex'>
                            <Text as='span' mr='2' fontWeight='bold' >{`MONTHLY REPORT FOR THE MONTH OF `}</Text>
                            <Text as='span' textTransform='uppercase' fontWeight='normal'>{` ${months[selectedMonth]} ${selectedYear}`}</Text>
                        </Text>
                        <Text textAlign='center' display='flex' fontSize='10pt' gap='3'>
                            <Text as='span' fontWeight='bold'>Department:</Text>
                            <Text as='span' fontWeight='normal' textDecoration='underline'>REGISTRATION</Text>
                        </Text>
                      </Box>
                      <Box display='flex' fontSize='11pt' justifyContent='space-between'>
                        <Text textAlign='center' display='flex' fontSize='10pt' gap='3'>
                            <Text as='span' fontWeight='bold'>Prepared By:</Text>
                            <Text as='span' fontWeight='normal' textDecoration='underline'>{userName}</Text>
                        </Text>
                        <Text textAlign='center' display='flex' fontSize='10pt' gap='3'>
                            <Text as='span' fontWeight='Bold'>Noted By:</Text>
                            <Text as='span' fontWeight='normal' textDecoration='underline'>JULIUS RYAN MEDALLON</Text>
                        </Text>
                      </Box>
                      <Box mt='2' fontWeight='normal'>
                        <Text fontSize='11pt' fontWeight='bold' my='2'>OVERVIEW:</Text>
                        <Text fontSize='11pt'>{`**For the month of ${months[selectedMonth]} ${selectedYear}, the Registration Department assisted a total of ${(cancelledCount+currentMonthCount)} clients. Out of ${(cancelledCount+currentMonthCount)} clients, ${(currentMonthCount)} trainees were successfully enrolled.`}</Text>
                        <Text fontSize='11pt' fontWeight='bold'>Enrollment Summary:</Text>
                        <Box >
                          <Text fontSize='11pt' fontWeight='bold'>The enrolled trainees were sourced through the following channels:</Text>
                          <Box display='flex' gap='3'>
                            <table style={{width: '400px', height: '200px', fontSize: '11pt', borderCollapse: 'collapse', border: '1px solid #CBD5E0'}}>
                              <thead style={{fontWeight: 'bold'}}>
                                <tr>
                                  <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>Source</td>
                                  <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>Trainees</td>
                                  <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>Percentage</td>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const totalCount = (companyEndorse + accountMgmt + consultancy + walkIn + fb + others)
                                  const p1Num = totalCount > 0 ? (companyEndorse / totalCount) * 100 : 0;
                                  const p2Num = totalCount > 0 ? (accountMgmt / totalCount) * 100 : 0;
                                  const p3Num = totalCount > 0 ? (consultancy / totalCount) * 100 : 0;
                                  const p4Num = totalCount > 0 ? (walkIn / totalCount) * 100 : 0;
                                  const p5Num = totalCount > 0 ? (fb / totalCount) * 100 : 0;
                                  const p6Num = totalCount > 0 ? (others / totalCount) * 100 : 0;

                                  const p1 = p1Num.toFixed(2);
                                  const p2 = p2Num.toFixed(2);
                                  const p3 = p3Num.toFixed(2);
                                  const p4 = p4Num.toFixed(2);
                                  const p5 = p5Num.toFixed(2);
                                  const p6 = p6Num.toFixed(2);

                                  // 2. Sum the numeric variables first, THEN apply .toFixed(2) to the result
                                  const totalP = (p1Num + p2Num + p3Num + p4Num + p5Num + p6Num).toFixed(2);

                                  return (
                                    <>
                                      <tr>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>Company Endorsements</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{companyEndorse}</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{`${p1}%`}</td>
                                      </tr>
                                      <tr>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>Account Management Officer</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{accountMgmt}</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{`${p2}%`}</td>
                                      </tr>
                                      <tr>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>Consultancy</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{consultancy}</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{`${p3}%`}</td>
                                      </tr>
                                      <tr>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>Walk-In</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{walkIn}</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{`${p4}%`}</td>
                                      </tr>
                                      <tr>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>Facebook</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{fb}</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{`${p5}%`}</td>
                                      </tr>
                                      <tr>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>Other Referrals</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{others}</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{`${p6}%`}</td>
                                      </tr>
                                      {/* Combined Total Row */}
                                      <tr style={{ backgroundColor: '#EDF2F7', fontWeight: 'bold' }}>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}><strong>Total</strong></td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}><strong>{totalCount}</strong></td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}><strong>{`${totalP}%`}</strong></td>
                                      </tr>
                                    </>
                                  );
                                })()}
                              </tbody>
                            </table>
                            <Box as="a" cursor="pointer" p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white">
                              <Text fontWeight="semibold" mb={3} textAlign="center" textTransform="uppercase">
                                Customers Assisted
                              </Text>
                              <Box h="300px" w='600px' position="relative">
                                <Doughnut data={customersAssistedData} options={chartOptionsDoughnut} />
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        <Box>
                          <Text fontSize='12pt' mt='4' fontWeight='bold'>{`Top Five Client Companies (based on ${(currentMonthCount)} Total Clients Assisted)`}</Text>
                          <Box display='flex' gap='3'>    
                            <table style={{width: '400px', height: '200px', fontSize: '11pt', borderCollapse: 'collapse', border: '1px solid #CBD5E0'}}>
                              <thead style={{fontWeight: 'bold'}}>
                                <tr>
                                  <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>Company</td>
                                  <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>Trainees</td>
                                  <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>Percentage</td>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const totalCount = topClientCounts.reduce((sum, count) => sum + count, 0);

                                  return (
                                    <>
                                      {topClientNames.map((name, index) => {
                                        const count = topClientCounts[index] || 0;
                                        const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(2) : '0.00';

                                        return (
                                          <tr key={index}>
                                            <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>{name}</td>        {/* Client Name */}
                                            <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{count}</td>         {/* Count */}
                                            <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{percentage}%</td>    {/* Percentage */}
                                          </tr>
                                        );
                                      })}
                                      {/* Combined Total Row */}
                                      <tr style={{ backgroundColor: '#EDF2F7', fontWeight: 'bold' }}>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>Combined Total</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{totalCount}</td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{`${((totalCount / currentMonthCount) * 100).toFixed(2)}%`}</td>
                                      </tr>
                                    </>
                                  );
                                })()}
                              </tbody>
                            </table>
                            <Box as="a" cursor="pointer" p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white">
                              <Text fontWeight="semibold" mb={3} textAlign="center" textTransform="uppercase">
                                Top Five (5) Client Companies
                              </Text>
                              <Box h="300px" w='600px' position="relative">
                                <Bar data={topClientsData} options={chartOptions} />
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        <Box>
                          <Text fontSize='12pt' mt='4' fontWeight='bold'>{`Category Distribution (based on ${(currentMonthCount)} Total Clients Assisted)`}</Text>
                          <Box display='flex' gap='3'>
                            <table style={{width: '400px', height: '200px', fontSize: '11pt', borderCollapse: 'collapse', border: '1px solid #CBD5E0'}}>
                              <thead style={{fontWeight: 'bold'}}>
                                <tr>
                                  <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>Course</td>
                                  <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>Trainees</td>
                                  <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>Percentage</td>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const totalCount = courseData.reduce((sum, count) => sum + count, 0);
                                  // courseLabels
                                  // courseData
                                  return (
                                    <>
                                      {courseLabels.map((name, index) => {
                                        const count = courseData[index] || 0;
                                        const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(2) : '0.00';

                                        return (
                                          <tr key={index}>
                                            <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}>{name}</td>         {/* Client Name */}
                                            <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{count}</td>          {/* Count */}
                                            <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}>{percentage}%</td>    {/* Percentage with 2 decimal places */}
                                          </tr>
                                        );
                                      })}

                                      {/* Combined Total Row */}
                                      <tr style={{ backgroundColor: '#EDF2F7', fontWeight: 'bold' }}>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px' }}><strong>Combined Total</strong></td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}><strong>{totalCount}</strong></td>
                                        <td style={{ border: '1px solid #CBD5E0', padding: '6px 8px', textAlign: 'right' }}><strong>{`${((totalCount/currentMonthCount)*100).toFixed(2)}%`}</strong></td>
                                      </tr>
                                    </>
                                  );
                                })()}
                              </tbody>
                            </table>
                            <Box as="a" cursor="pointer" p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white">
                              <Text fontWeight="semibold" mb={3} textAlign="center" textTransform="uppercase">
                                Top Five (5) Courses
                              </Text>
                              <Box h="300px" w='600px' position="relative">
                                <Bar data={topCoursesChartData} options={chartOptions} />
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        <Text mt='4' fontSize='12pt' fontWeight='bold' sx={{
                            '@media print': {
                                breakBefore: 'page', // Modern CSS standard alternative
                                marginTop: '0px'    // Reset margin top since it's now at the top of a fresh page
                            }
                        }}>{`Cancelled/Withdrawn Trainees (based on ${(currentMonthCount+cancelledCount)} Total Clients Assisted)`}</Text>
                        {(() => {
                          const total = cancelledCount + currentMonthCount;
                          const cancelledPercent = total > 0 ? ((cancelledCount / total) * 100).toFixed(2) : '0.00';
                          const enrolledPercent = total > 0 ? ((currentMonthCount / total) * 100).toFixed(2) : '0.00';

                          return (
                            <UnorderedList>
                              <ListItem fontSize='11pt'>{`Cancelled/Withdrawn:  ${cancelledCount} trainees (${cancelledPercent}%)`}</ListItem>
                              <ListItem fontSize='11pt'>{`Successfully Enrolled:  ${currentMonthCount} trainees (${enrolledPercent}%)`}</ListItem>
                            </UnorderedList>
                          );
                        })()}
                        {(() => {
                          // 1. Calculate totals for each category
                          const marinaTotal = marinaCourseBreakdown.reduce((sum, item) => sum + item.totalTrainees, 0);
                          const simuTotal = simuCourseBreakdown.reduce((sum, item) => sum + item.totalTrainees, 0);
                          const nonSimuTotal = nonSimuCourseBreakdown.reduce((sum, item) => sum + item.totalTrainees, 0);

                          const marinaP = ((marinaTotal / currentMonthCount)*100).toFixed(2)
                          const simuP = ((simuTotal / currentMonthCount)*100).toFixed(2)
                          const nonSimuP = ((nonSimuTotal / currentMonthCount)*100).toFixed(2)

                          // 2. Group them and sort from highest to lowest
                          const rankedCategories = [
                            { name: 'Marina courses', total: marinaTotal, percentage: marinaP },
                            { name: 'Simulator courses', total: simuTotal, percentage: simuP },
                            { name: 'Non-Simulator courses', total: nonSimuTotal, percentage: nonSimuP },
                          ].sort((a, b) => b.total - a.total);

                          return (
                            <Text mt='4' fontSize='11pt'>
                              {`**For the month of ${months[selectedMonth]} ${selectedYear}, ${rankedCategories[0].name} has the highest enrollment with ${rankedCategories[0].total} trainees, representing ${rankedCategories[0].percentage}% of the total enrollment. Followed by ${rankedCategories[1].name} which recorded ${rankedCategories[1].total} trainees (${rankedCategories[1].percentage}%), while ${rankedCategories[2].name} accounted for ${rankedCategories[2].total} trainees (${rankedCategories[2].percentage}%).`}
                              </Text>
                          )
                        })()}
                        <Text mt='4' fontSize='11pt'>{`**A total of ${currentMonthCount} trainees enrolled in ${months[selectedMonth]} ${selectedYear}, compared to ${prevMonthCount} trainees in ${months[(selectedMonth-1)]} ${selectedYear}. This is ${percentageChange >= 0 ? 'an increase' : 'a decrease'} of ${currentMonthCount > prevMonthCount ? (currentMonthCount - prevMonthCount) : (prevMonthCount - currentMonthCount)} trainees or ${Math.abs(percentageChange)}%, showing a significant ${percentageChange >= 0 ? 'rise' : 'drop'} in enrollment compared to the previous month.`}</Text>
                      </Box>
                      <Box mt='2' display='flex' gap='2'>
                        {/* <Box mt='2' w='100%'>
                          <Text my='2'>I. TOTAL # OF CUSTOMERS ASSISTED:</Text>
                          <TableContainer width='280px' borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm" sx={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <Table variant="simple" size="sm"
                              sx={{
                                'th, td': {
                                  py: '2px !important', // Reduces top and bottom padding drastically
                                  px: '8px !important', // Adjusts left and right padding
                                  lineHeight: '1.2',
                                }
                              }}
                            >
                              <Thead bg="gray.100">
                                <Tr>
                                  <Th fontSize="xs" fontWeight="bold" py={2} px={3}>ENROLLED</Th>
                                  <Th isNumeric fontSize="xs" fontWeight="bold" py={2} px={3}>TOTAL</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                <Tr>
                                  <Td fontWeight="bold" color="blue.800" fontSize="xs" py={1.5} px={3}>
                                    1.1 Company Endorsement
                                  </Td>
                                  <Td isNumeric py={1.5} px={3}>{companyEndorse}</Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold" color="blue.800" fontSize="xs" py={1.5} px={3}>
                                    Account Management Officer
                                  </Td>
                                  <Td isNumeric py={1.5} px={3}>{accountMgmt}</Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold" color="blue.800" fontSize="xs" py={1.5} px={3}>
                                    Consultancy
                                  </Td>
                                  <Td isNumeric py={1.5} px={3}>{consultancy}</Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold" color="blue.800" fontSize="xs" py={1.5} px={3}>
                                    Walk-in
                                  </Td>
                                  <Td isNumeric py={1.5} px={3}>{walkIn}</Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold" color="blue.800" fontSize="xs" py={1.5} px={3}>
                                    FB
                                  </Td>
                                  <Td isNumeric py={1.5} px={3}>{fb}</Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold" color="blue.800" fontSize="xs" py={1.5} px={3}>
                                    Others
                                  </Td>
                                  <Td isNumeric py={1.5} px={3}>{others}</Td>
                                </Tr>
                                <Tr>
                                  <Td py={0.5} px={3}></Td>
                                  <Td py={0.5} px={3}></Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold" color="blue.800" fontSize="xs" py={1.5} px={3}>1.2 INQUIRY</Td>
                                  <Td isNumeric py={1.5} px={3}>{totalInquiriesCount}</Td>
                                </Tr>
                                <Tr>
                                  <Td py={0.5} px={3}></Td>
                                  <Td py={0.5} px={3}></Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold" color="blue.800" fontSize="xs" py={1.5} px={3}>1.3 CANCELLED/WITHDRAWN</Td>
                                  <Td isNumeric py={1.5} px={3}>{cancelledCount}</Td>
                                </Tr>
                                <Tr>
                                  <Td py={0.5} px={3}></Td>
                                  <Td py={0.5} px={3}></Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold" color="blue.800" fontSize="xs" py={1.5} px={3}>1.4 VISITORS</Td>
                                  <Td isNumeric py={1.5} px={3}>-</Td>
                                </Tr>
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </Box> */}
                        <Box mt='2'>
                          <Text my='2'>TRAINING COURSES FOR NEXT MONTH:</Text>
                          <TableContainer width="300px" my={4} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm" sx={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <Table variant="simple" size="sm" px='2'
                              sx={{
                                'th, td': {
                                  py: '2px !important', // Reduces top and bottom padding drastically
                                  px: '8px !important', // Adjusts left and right padding
                                  lineHeight: '1.2',
                                  border: '1px solid #CBD5E0 !important', // Adds borders to all cells
                                }
                              }}
                            >
                              <Thead bg="gray.50">
                                <Tr>
                                  <Th color="gray.700" fontWeight="bold">COURSE</Th>
                                  <Th isNumeric color="gray.700" fontWeight="bold">TOTAL</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {nextMonthCourseCounts.map((item, index) => (
                                  <Tr key={index} _hover={{ bg: 'gray.50' }}>
                                    <Td fontWeight="medium">{item.code.toUpperCase()}</Td>
                                    <Td isNumeric>{item.count}</Td>
                                  </Tr>
                                ))}
                                <Tr bg="gray.100" fontWeight="bold">
                                  <Td color="gray.800">Total</Td>
                                  <Td isNumeric color="gray.800">
                                    {nextMonthCourseCounts.reduce((sum, item) => sum + item.count, 0)}
                                  </Td>
                                </Tr>
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Box>
                      <Box mt='4'
                        sx={{
                            '@media print': {
                                breakBefore: 'page', // Modern CSS standard alternative
                                marginTop: '0px'    // Reset margin top since it's now at the top of a fresh page
                            }
                        }}>
                        <Text my='2'>II. CUSTOMERS GROUP BY COMPANY:</Text>
                        <TableContainer w='950px' borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm" sx={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                          <Table w='100%' variant="simple" size="sm" 
                            sx={{
                              'th, td': {
                                py: '2px !important', // Reduces top and bottom padding drastically
                                px: '8px !important', // Adjusts left and right padding
                                lineHeight: '1.2',
                                border: '1px solid #CBD5E0 !important', // Adds borders to all cells
                              }
                            }}>
                            <Thead bg="gray.100">
                              <Tr>
                                <Th w='200px' fontSize="xs" fontWeight="bold">CUSTOMERS NAME</Th>
                                <Th isNumeric fontSize="xs" fontWeight="bold">
                                  COMPANY CHARGE<br />(# of Trainees)
                                </Th>
                                <Th isNumeric fontSize="xs" fontWeight="bold">
                                  CREW CHARGE<br />(# of Trainees)
                                </Th>
                                <Th isNumeric fontSize="xs" fontWeight="bold">
                                  TOTAL # TRAINEES
                                </Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {/* 2.1 Tapped Clients Section */}
                              {tappedClients.length > 0 && (
                                <>
                                  <Tr bg="blue.50">
                                    <Td colSpan={4} fontWeight="bold" color="blue.800" fontSize="xs">
                                      2.1 Tapped Clients
                                    </Td>
                                  </Tr>
                                  {tappedClients.map((row) => (
                                    <Tr key={row.name}>
                                      <Td pl={6} fontWeight="medium">{row.name}</Td>
                                      <Td isNumeric>{row.companyCharge > 0 ? row.companyCharge : '-'}</Td>
                                      <Td isNumeric>{row.crewCharge > 0 ? row.crewCharge : '-'}</Td>
                                      <Td isNumeric fontWeight="bold">{row.total}</Td>
                                    </Tr>
                                  ))}
                                </>
                              )}
                              {/* 2.2 Untapped Clients Section */}
                              {untappedClients.length > 0 && (
                                <>
                                  <Tr bg="orange.50">
                                    <Td colSpan={4} fontWeight="bold" color="orange.800" fontSize="xs">
                                      2.2 Untapped Clients
                                    </Td>
                                  </Tr>
                                  {untappedClients.map((row) => (
                                    <Tr key={row.name}>
                                      <Td pl={6} fontWeight="medium">{row.name}</Td>
                                      <Td isNumeric>{row.companyCharge > 0 ? row.companyCharge : '-'}</Td>
                                      <Td isNumeric>{row.crewCharge > 0 ? row.crewCharge : '-'}</Td>
                                      <Td isNumeric fontWeight="bold">{row.total}</Td>
                                    </Tr>
                                  ))}
                                </>
                              )}
                            </Tbody>
                            {/* Footer Summary */}
                            <Tfoot bg="gray.100">
                              <Tr fontWeight="bold">
                                <Th fontSize="xs">TOTAL</Th>
                                <Th isNumeric fontSize="xs">{grandCompanyCharge > 0 ? grandCompanyCharge : '-'}</Th>
                                <Th isNumeric fontSize="xs">{grandCrewCharge > 0 ? grandCrewCharge : '-'}</Th>
                                <Th isNumeric fontSize="xs" color="blue.600">{grandTotal}</Th>
                              </Tr>
                            </Tfoot>
                          </Table>
                        </TableContainer>
                      </Box>
                      <Box mt='2'
                        sx={{
                            '@media print': {
                                breakBefore: 'page', // Modern CSS standard alternative
                                marginTop: '0px'    // Reset margin top since it's now at the top of a fresh page
                            }
                        }}
                      >
                        <Text mt='2'>III. CUSTOMERS GROUP BY COURSE:</Text>
                        <HStack spacing={4} align="flex-start" wrap="wrap">
                          {/* 1. MASTER TABLE: CUSTOMERS GROUP BY COURSE */}
                          <TableContainer borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm" minW="260px" sx={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <Table variant="simple" size="sm"
                              sx={{
                                'th, td': {
                                  py: '2px !important', // Reduces top and bottom padding drastically
                                  px: '8px !important', // Adjusts left and right padding
                                  lineHeight: '1.2',
                                  border: '1px solid #CBD5E0 !important', // Adds borders to all cells
                                }
                              }}
                            >
                              <Thead bg="gray.100">
                                <Tr>
                                  <Th fontSize="xs" fontWeight="bold">Course</Th>
                                  <Th isNumeric fontSize="xs" fontWeight="bold"># of Enrollees</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {allCourseBreakdown.map((row) => (
                                  <Tr key={row.course}>
                                    <Td fontWeight="medium">{row.course.toUpperCase()}</Td>
                                    <Td isNumeric fontWeight="bold">{row.totalTrainees}</Td>
                                  </Tr>
                                ))}
                              </Tbody>
                              <Tfoot bg="gray.100">
                                <Tr fontWeight="bold">
                                  <Th fontSize="xs">TOTAL</Th>
                                  <Th isNumeric fontSize="xs" color="blue.600">
                                    {allCourseBreakdown.reduce((sum, item) => sum + item.totalTrainees, 0)}
                                  </Th>
                                </Tr>
                              </Tfoot>
                            </Table>
                          </TableContainer>
                          {/* RIGHT COLUMN: SIMULATOR & NON-SIMULATOR */}
                          <VStack spacing={6} align="stretch" minW="260px">
                            {/* 2. SIMULATOR COURSES */}
                            <TableContainer borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm" sx={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                              <Table variant="simple" size="sm"
                                sx={{
                                  'th, td': {
                                    py: '2px !important', // Reduces top and bottom padding drastically
                                    px: '8px !important', // Adjusts left and right padding
                                    lineHeight: '1.2',
                                    border: '1px solid #CBD5E0 !important', // Adds borders to all cells
                                  }
                                }}
                              >
                                <Thead bg="purple.50">
                                  <Tr>
                                    <Th fontSize="xs" fontWeight="bold" color="purple.800">SIMULATOR COURSES</Th>
                                    <Th isNumeric fontSize="xs" fontWeight="bold" color="purple.800"># of Enrollees</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {simuCourseBreakdown.map((row) => (
                                    <Tr key={row.course}>
                                      <Td fontWeight="medium">{row.course.toUpperCase()}</Td>
                                      <Td isNumeric fontWeight="bold">{row.totalTrainees}</Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                                <Tfoot bg="gray.100">
                                  <Tr fontWeight="bold">
                                    <Th fontSize="xs">TOTAL</Th>
                                    <Th isNumeric fontSize="xs" color="purple.700">
                                      {simuCourseBreakdown.reduce((sum, item) => sum + item.totalTrainees, 0)}
                                    </Th>
                                  </Tr>
                                </Tfoot>
                              </Table>
                            </TableContainer>
                            {/* 4. MARINA COURSES */}
                            <TableContainer borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm" minW="260px" sx={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                              <Table variant="simple" size="sm"
                                sx={{
                                  'th, td': {
                                    py: '2px !important', // Reduces top and bottom padding drastically
                                    px: '8px !important', // Adjusts left and right padding
                                    lineHeight: '1.2',
                                    border: '1px solid #CBD5E0 !important', // Adds borders to all cells
                                  }
                                }}
                              >
                                <Thead bg="blue.50">
                                  <Tr>
                                    <Th fontSize="xs" fontWeight="bold" color="blue.800">MARINA COURSES</Th>
                                    <Th isNumeric fontSize="xs" fontWeight="bold" color="blue.800"># of Enrollees</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {marinaCourseBreakdown.map((row) => (
                                    <Tr key={row.course}>
                                      <Td fontWeight="medium">{row.course.toUpperCase()}</Td>
                                      <Td isNumeric fontWeight="bold">{row.totalTrainees}</Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                                <Tfoot bg="gray.100">
                                  <Tr fontWeight="bold">
                                    <Th fontSize="xs">TOTAL</Th>
                                    <Th isNumeric fontSize="xs" color="blue.700">
                                      {marinaCourseBreakdown.reduce((sum, item) => sum + item.totalTrainees, 0)}
                                    </Th>
                                  </Tr>
                                </Tfoot>
                              </Table>
                            </TableContainer>
                          </VStack>
                            {/* 3. NON-SIMULATOR COURSES */}
                            <TableContainer borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm" sx={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                              <Table variant="simple" size="sm"
                                sx={{
                                  'th, td': {
                                    py: '2px !important', // Reduces top and bottom padding drastically
                                    px: '8px !important', // Adjusts left and right padding
                                    lineHeight: '1.2',
                                    border: '1px solid #CBD5E0 !important', // Adds borders to all cells
                                  }
                                }}
                              >
                                <Thead bg="orange.50">
                                  <Tr>
                                    <Th fontSize="xs" fontWeight="bold" color="orange.800">NON-SIMULATOR COURSES</Th>
                                    <Th isNumeric fontSize="xs" fontWeight="bold" color="orange.800"># of Enrollees</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {nonSimuCourseBreakdown.map((row) => (
                                    <Tr key={row.course}>
                                      <Td fontWeight="medium">{row.course.toUpperCase()}</Td>
                                      <Td isNumeric fontWeight="bold">{row.totalTrainees}</Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                                <Tfoot bg="gray.100">
                                  <Tr fontWeight="bold">
                                    <Th fontSize="xs">TOTAL</Th>
                                    <Th isNumeric fontSize="xs" color="orange.700">
                                      {nonSimuCourseBreakdown.reduce((sum, item) => sum + item.totalTrainees, 0)}
                                    </Th>
                                  </Tr>
                                </Tfoot>
                              </Table>
                            </TableContainer>
                        </HStack>
                      </Box>
                      <Box mt='2'sx={{
                            '@media print': {
                                breakBefore: 'page', // Modern CSS standard alternative
                                marginTop: '0px'    // Reset margin top since it's now at the top of a fresh page
                            }
                        }}
                      >
                        <Text my='2'>IV. OTHER MATTERS:</Text>
                        {isEmpty ? (
                          <Text color="gray.500">
                            No other matters to report.
                          </Text>
                        ) : (
                          <Box
                            p={4}
                            sx={richTextStyles}
                            dangerouslySetInnerHTML={{ __html: content }}
                          />
                        )}
                      </Box>
                    </Box>
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
        </Box>
      </Box>
      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent borderRadius="xl" boxShadow="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" pb={3} fontSize="lg">
            Other Matters:
          </ModalHeader>
          <ModalBody py={4}>
            {/* Elegant MS Word-style Toolbar */}
            <HStack
              spacing={1}
              mb={3}
              p={1.5}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              boxShadow="inner"
            >
              <ChakraTooltip label="Bold (Ctrl+B)" hasArrow placement="top">
                <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => format('bold')} fontWeight="bold">
                  B
                </Button>
              </ChakraTooltip>
              <ChakraTooltip label="Italic (Ctrl+I)" hasArrow placement="top">
                <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => format('italic')} fontStyle="italic">
                  I
                </Button>
              </ChakraTooltip>
              <ChakraTooltip label="Underline (Ctrl+U)" hasArrow placement="top">
                <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => format('underline')} textDecoration="underline">
                  U
                </Button>
              </ChakraTooltip>
              <Divider orientation="vertical" height="18px" mx={1} borderColor="gray.300" />
              <ChakraTooltip label="Numbered List" hasArrow placement="top">
                <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => format('insertOrderedList')}>
                  1. List
                </Button>
              </ChakraTooltip>
              <ChakraTooltip label="Bulleted List" hasArrow placement="top">
                <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => format('insertUnorderedList')}>
                  • List
                </Button>
              </ChakraTooltip>
              <Divider orientation="vertical" height="18px" mx={1} borderColor="gray.300" />
              <ChakraTooltip label="Decrease Indent" hasArrow placement="top">
                <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => format('outdent')}>
                  ←
                </Button>
              </ChakraTooltip>
              <ChakraTooltip label="Increase Indent" hasArrow placement="top">
                <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => format('indent')}>
                  →
                </Button>
              </ChakraTooltip>
            </HStack>
            {/* Editable Rich Text Canvas */}
            <Box
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: tempContent }}
              minH="220px"
              maxH="380px"
              overflowY="auto"
              p={4}
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              bg="white"
              transition="all 0.2s"
              sx={{
                '&:focus': {
                  outline: 'none',
                  borderColor: 'blue.400',
                  boxShadow: '0 0 0 1px #3182ce',
                },
                ...richTextStyles,
              }}
            />
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100" pt={3}>
            <Button variant="ghost" mr={3} onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSave} size="sm" px={5}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
    )
}
