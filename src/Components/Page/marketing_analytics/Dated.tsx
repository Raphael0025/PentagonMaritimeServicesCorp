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


  useEffect(() => {
    const fetchReportData = () => {
      const actor: string | null = localStorage.getItem('customToken');
      setUsername(actor || '')

      const foundRecord = regRepData?.find(rep =>
        rep?.month === selectedMonth &&
        rep?.year === selectedYear &&
        rep?.regType === 0
      )

      if(foundRecord){
        setRegReport({
          ...initRegReport,
          ...foundRecord,
          month: selectedMonth,
          year: selectedYear,
          regType: 0,
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
      setRegReport({...initRegReport, regType: 0, month: selectedMonth, year: selectedYear})
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
            const searchStr = String(rawCourseId).trim().toLowerCase()

            // 1. Check courseCodes first (Priority)
            const matchedCourseCodeRecord: any = Array.isArray(courseCodes)
              ? courseCodes.find(
                  (c: any) =>
                    String(c.id || '').trim().toLowerCase() === searchStr ||
                    String(c._id || '').trim().toLowerCase() === searchStr ||
                    String(c.code || '').trim().toLowerCase() === searchStr ||
                    String(c.courseCode || '').trim().toLowerCase() === searchStr ||
                    String(c.course_code || '').trim().toLowerCase() === searchStr ||
                    String(c.company_course_code || '').trim().toLowerCase() === searchStr
                )
              : null

            // 2. Extract reference pointer if courseCodes links to allCourses (e.g., id_course_ref)
            const secondaryRefId = matchedCourseCodeRecord?.id_course_ref || 
                                  matchedCourseCodeRecord?.course_id || 
                                  searchStr

            const secondarySearchStr = String(secondaryRefId).trim().toLowerCase()

            // 3. Fall back / match against allCourses second
            let matchedCourse: any = Array.isArray(allCourses)
              ? allCourses.find(
                  (c: any) =>
                    String(c.id || '').trim().toLowerCase() === secondarySearchStr ||
                    String(c._id || '').trim().toLowerCase() === secondarySearchStr ||
                    String(c.code || '').trim().toLowerCase() === secondarySearchStr ||
                    String(c.courseCode || '').trim().toLowerCase() === secondarySearchStr ||
                    String(c.course_code || '').trim().toLowerCase() === secondarySearchStr ||
                    String(c.company_course_code || '').trim().toLowerCase() === secondarySearchStr
                )
              : null

            const rawCode = 
              matchedCourse?.company_course_code || 
              matchedCourse?.course_code || 
              matchedCourse?.code || 
              matchedCourseCodeRecord?.company_course_code ||
              matchedCourseCodeRecord?.course_code ||
              matchedCourseCodeRecord?.code ||
              rawCourseId

            const displayName = String(rawCode).trim().toUpperCase()

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
      legend: {
        display: false
      },
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
    

  return(
    <>
      <Box p={4}>
        <Text fontWeight="bold" fontSize="xl">
          ANALYTICS
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
              Top Five (5) Client Companies
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
              Top Five (5) Courses
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
      </Box>
    </>
    )
}
