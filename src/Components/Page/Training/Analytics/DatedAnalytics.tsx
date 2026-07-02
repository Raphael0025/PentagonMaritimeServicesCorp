'use client'
import { useState, useMemo, useEffect} from 'react';
import { Box, Image as ChakraImage, Text, Textarea, Button, Tooltip, Checkbox, Select, Input, FormControl, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons'
import { PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'

import { useTraining } from '@/context/TrainingContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useInstructors } from '@/context/InstructorContext'

import { CourseBatchByID } from '@/types/course-batches'
import { BATCH_ANALYSIS, batchArr } from '@/types/training'

import { ToastStatus } from '@/types/handling'
import { fullMonth, } from '@/handlers/util_handler'
import { deployYDate } from '@/types/utils' 

import { UPDATE_BATCH_ID } from '@/lib/course_batches_controller'
import { TrainingModeChart } from './PieChart/TrainingModeChart'
import { TrainingCategoryChart } from './PieChart/TrainingCategoryChart'
import { InstructorComparisonChart } from './PieChart/InstructorComparisonChart'
import { AccomplishedForm } from './PieChart/AccomplishedForm'
import { CertificateAndAccountChart } from './PieChart/CertificateAndAccountChart'
import SimuVsNonSimu from './BarChart/SimuVsNonSimu'

export default function Dated () {
    const toast = useToast()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch } = useCourseBatch()
    const { data: allInstructors } = useInstructors()
    const { data: allClients, courseCodes } = useClients()
    const { allData: allTrainingData, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { allData: allRegData, setMonth: setRMonth, setYear: setRYear } = useRegistrations()

    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())

    const { isOpen: isOpenDate, onOpen: onOpenDate, onClose: onCloseDate } = useDisclosure()
    const { isOpen: isOpenRemarks, onOpen: onOpenRemarks, onClose: onCloseRemarks } = useDisclosure()

    const [batchCourses, setBatchCourses] = useState<BATCH_ANALYSIS[]>([])
    const [batchID, setBatchID] = useState<string>('')
    const [bRemarks, setBRemarks] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [filterCourse, setFilterCourse] = useState<string>('');
    const [filteredTrainList, setFilteredTrainList] = useState<any[]>([]);
    const [filteredOverLapTrainList, setFilteredOverLapTrainList] = useState<any[]>([]);
    const [overlapTrainings, setOverlapTrainings] = useState<any[]>([]);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear()
    const currMonth = monthSelected
    const startYear = parseInt(deployYDate, 10)

    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i)

    const handleData = () => {
        setTMonth(monthSelected + 1) 
        setTYear(yearSelected)
        setRMonth(monthSelected + 1) 
        setRYear(yearSelected)
        onCloseDate()
    }

    useEffect(() => {
        if (!allCourses || !courseBatch || !allTrainingData) return

        const months = [
            "jan", "feb", "mar", "apr", "may", "jun",
            "jul", "aug", "sep", "oct", "nov", "dec"
        ];
        const trimmedMonth = months[monthSelected]

        const coursesToProcess = filterCourse 
        ? allCourses.filter(c => c.course_code === filterCourse)
        : allCourses;

        /* ----------------------------------------
            1. Filter batches by CREATED date
        ----------------------------------------- */
        const filteredBatches = courseBatch && courseBatch.filter((cb) => {
            const createdDate = cb.createdAt.toDate().getFullYear();
            const [, trainingSched] = cb.start_date.split(',');
            const trainingMonth = new Date(trainingSched).getMonth();

            return (
                trainingMonth === monthSelected &&
                createdDate === yearSelected
            )
        })
        
        const filteredOverlapBatches = courseBatch && courseBatch.filter((cb) => {
            if (!cb?.createdAt || !cb?.start_date || !cb?.end_date) return false;

            const createdDate = cb.createdAt.toDate().getFullYear();
            const [, StartTrainingSched] = cb.start_date.split(',');
            const [, EndTrainingSched] = cb.end_date.split(',');
            const StartTrainingMonth = new Date(StartTrainingSched).getMonth();
            const EndTrainingMonth = new Date(EndTrainingSched).getMonth();

            return (
                (StartTrainingMonth === monthSelected && EndTrainingMonth === monthSelected + 1) &&
                createdDate === yearSelected
            );
        })
        
        // Fast lookup map (batchId → batch)
        const batchMap = new Map(filteredBatches.map(b => [b.id, b]));
        const overLapBatchMap = new Map(filteredOverlapBatches?.map(b => [b.id, b]) || []);
        /* ----------------------------------------
            2. Filter training data by ACTUAL dates
        ----------------------------------------- */
        const allTrainData = allTrainingData && allTrainingData
            .filter((t) => t.reg_status >= 3 )    
            .filter((t) => {
                const start = t.start_date.toLowerCase();
                const end = t.end_date.toLowerCase();
                
                return (
                    (start.includes(trimmedMonth) && end.includes(trimmedMonth)) ||
                    (end === '' && start.includes(trimmedMonth))
                );
            })
            .filter(t => batchMap.has(t.batch))
        
        const certData = allTrainingData && allTrainingData
            .filter((t) => t.regType === 0 && t.batch !== '1')    
            .filter((t) => [ 3, 6 ].includes(t.reg_status) && [ 0, 1, 2 ].includes(t.cert_status))    
            .filter((t) => {
                const start = t.start_date.toLowerCase();
                const end = t.end_date.toLowerCase();
                
                return (
                    (start.includes(trimmedMonth) && end.includes(trimmedMonth)) ||
                    (end === '' && start.includes(trimmedMonth))
                )
            })

        setFilteredTrainList(certData || [])
        const finalOverlapTrainings = allTrainingData && allTrainingData
            .filter(t => overLapBatchMap.has(t.batch))
            .filter(t => t.regType === 0 && t.reg_status >= 3); // Applying your baseline status rules
        setOverlapTrainings(finalOverlapTrainings || []);

        /* ----------------------------------------
            3. Build analysis per course
        ----------------------------------------- */
        const batchAnalysis = coursesToProcess.reduce<BATCH_ANALYSIS[]>((acc, course) => {
            const courseBatches = filteredBatches.filter((b) =>{
                const start = b.start_date.toLowerCase();
                const end = b.end_date.toLowerCase();
                
                return (
                    (start.includes(trimmedMonth) && end.includes(trimmedMonth)) ||
                    (end === '' && start.includes(trimmedMonth))
                );
            }).filter(
                b => b.course === course.id
            )

            if (!courseBatches.length) return acc;

            const tMode = Number(course?.trainingMode);
            const cType = Number(course?.courseType);

            const isSimulator = tMode === 1 && cType === 1;
            const isNonSimulator = tMode === 0 && cType === 1;
            const isMDS = cType === 0;
            const isSTCW = cType === 2;
            const isSafetyCourse = cType === 3;

            let totalTraineesCount = 0;
            let courseDeliveredCount = 0;

            const batches = courseBatches.map((batch) => {
                const trainees = allTrainData.filter(
                    t => t.batch === batch.id
                );

                const delivered = trainees.filter(t => t.reg_status === 6).length;
                const cancelled = trainees.filter(t => t.reg_status === 7).length;
                const nonAppearance = trainees.filter(t => t.reg_status === 9).length;

                totalTraineesCount += trainees.length;
                courseDeliveredCount += delivered;

                return {
                    batch_id: batch.id,
                    batch_no: batch.batch_no.toString(),
                    trainees_per_batch: trainees.length.toString(),
                    delivered: delivered.toString(),
                    trainingMode: batch.training_mode,
                    cancelled: cancelled.toString(),
                    non_appearance: nonAppearance.toString(),
                    remarks: batch.remarks,
                }
            })

            const ttl_simu = isSimulator ? courseDeliveredCount : 0;
            const ttl_non_simu = isNonSimulator ? courseDeliveredCount : 0;
            const ttl_stcw = isSTCW ? courseDeliveredCount : 0;
            const ttl_safety = isSafetyCourse ? courseDeliveredCount : 0;
            const ttl_mds = isMDS ? courseDeliveredCount : 0;

            acc.push({
                course: course.course_code,
                courseType: course.trainingMode.toString(),
                batches,
                sortedBatches: batches.sort((a, b) => b.batch_no.localeCompare(a.batch_no)),
                total_batches: courseBatches.length,
                total_trainees: totalTraineesCount,
                ttl_simu,
                ttl_non_simu,
                ttl_stcw: ttl_stcw,
                ttl_safety: ttl_safety,
                ttl_mds: ttl_mds,
            })
            return acc;
        }, [])

        const sortedBatchCourses = [...batchAnalysis]
        .sort((a, b) => a.course.localeCompare(b.course))
        .map(bc => ({
            ...bc,
            sortedBatches: [...bc.batches].sort((a, b) =>
                b.batch_no.localeCompare(a.batch_no)
            ),
        }));
        setBatchCourses(sortedBatchCourses)
    }, [ allCourses, courseBatch, allTrainingData, monthSelected, yearSelected, filterCourse ])
    
    const getGroupedOverlapData = () => {
        const groups: { [key: string]: { courseCode: string; dateStr: string; count: number } } = {};
        
        overlapTrainings.forEach((t) => {
            const batchDetails = courseBatch?.find((b) => b.id === t.batch);
            // 1. FIXED: Find main course, or fall back to courseCodes list explicitly
            const mainCourse = allCourses?.find((c) => c.id === t.course);
            const fallbackCourse = !mainCourse ? courseCodes?.find((cc) => cc.id === t.course || cc.id_course_ref === t.course) : null;
            
            // Extract whatever code is available
            const courseCode = mainCourse?.course_code || fallbackCourse?.company_course_code || 'UNKNOWN';
            
            const dateStr = batchDetails 
                ? `${batchDetails.start_date} - ${batchDetails.end_date}`
                : t.start_date;

            const key = `${courseCode.toUpperCase()}_${t.batch}`;
            if (!groups[key]) {
                groups[key] = {
                    courseCode,
                    dateStr,
                    count: 0,
                };
            }
            groups[key].count += 1;
        });

        return Object.values(groups);
    };
    
    const groupedOverlapList = getGroupedOverlapData();
    const monthsList = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

    const handleRemarks = async () => {
        try {
            setLoading(true)
            await UPDATE_BATCH_ID(batchID, {remarks: bRemarks}, null)
            handleToast(`Remarks Updated`, ``, 5000, 'success')
            onCloseRemarks()
            setBatchID('')
            setBRemarks('')
        }catch(error){
            toast({
                title: 'Error updating remarks',
                status: 'error' as ToastStatus,
                duration: 3000,
                isClosable: true,
            })
            console.error(error)
        } finally {
            setLoading(false)
        }
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

    const headerStyle= {
        h: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid white',
    }

    const generateDynamicBatchSummary = () => {
        // 1. Calculate the delivery totals on the fly from the nested batchCourses array
        let onlineTotal = batchCourses.reduce((total, bc) => {
            return total + bc.sortedBatches.reduce((sum, batch) => {
                return sum +
                    (['ol', 'olt', 'olp'].includes(batch.trainingMode) ? Number(batch.delivered) : 0);
                }, 0);
            }, 0);

        let f2fTotal = batchCourses.reduce((total, bc) => {
            return total + bc.sortedBatches.reduce((sum, batch) => {
                return sum +
                    (['f2f', 'f2ft', 'f2fp'].includes(batch.trainingMode) ? Number(batch.delivered) : 0);
                }, 0);
            }, 0);

        let cbtTotal = batchCourses.reduce((total, bc) => {
            return total + bc.sortedBatches.reduce((sum, batch) => {
                return sum +
                    (['f2fm', 'olm'].includes(batch.trainingMode) ? Number(batch.delivered) : 0);
                }, 0);
            }, 0);

        let blendedTotal = batchCourses.reduce((total, bc) => total + bc.sortedBatches
                .reduce((sum, batch) => 
                    sum + (batch.trainingMode === 'blended' ? Number(batch.delivered) : 0), 
                0), 
            0);

        const totalTrainees = onlineTotal + f2fTotal + cbtTotal + blendedTotal;

        if (totalTrainees === 0) {
            return "No training delivery data recorded for the selected period.";
        }

        // 2. Wrap-around month math handling for previous month boundaries safely
        const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        const displayMonthName = months[(currMonth + 12) % 12];
        const displayYear = currMonth === -1 ? currentYear - 1 : currentYear;

        // 3. 📊 MODE OF DELIVERY: Dynamic Sorting Array
        const modes = [
            { name: 'online', label: 'online', count: onlineTotal },
            { name: 'f2f', label: 'face-to-face', count: f2fTotal },
            { name: 'cbt', label: 'CBT', count: cbtTotal },
            { name: 'blended', label: 'blended', count: blendedTotal },
        ];

        // Sort modes from highest count to lowest count dynamically
        const sortedModes = [...modes].sort((a, b) => b.count - a.count);
        const highestMode = sortedModes[0];
        const remainingModes = sortedModes.slice(1);

        const getPct = (count: number) => ((count / totalTrainees) * 100).toFixed(0);

        const modesString = (
            <>
                By mode of delivery, the highest proportion was conducted{" "}
                <Text as="span" fontWeight="bold">{`${highestMode.label} with ${highestMode.count} trainees (${getPct(highestMode.count)}%) `}</Text>
                followed by {" "}
                {remainingModes.map((m, idx) => (
                    <Text as='span' key={m.name}>
                        {idx === remainingModes.length - 1 ? ", and " : ", "}
                        {m.label}{" "}<Text as="span" fontWeight="bold">with {m.count} trainees ({getPct(m.count)}%)</Text>
                    </Text>
                ))}.
            </>
        )

        // 4. 📈 TRAINING CATEGORIES: Dynamic Sorting Array
        // Parse category numbers from the nested state structures
        let nonSimuTotal = batchCourses.reduce((total, bc) => total + (bc.ttl_non_simu || 0), 0);
        let simuTotal = batchCourses.reduce((total, bc) => total + (bc.ttl_simu || 0), 0);
        let stcwTotal = batchCourses.reduce((total, bc) => total + (bc.ttl_stcw || 0), 0);
        let mdsTotal = batchCourses.reduce((total, bc) => total + (bc.ttl_mds || 0), 0);
        let safetyCourses = batchCourses.reduce((total, bc) => total + (bc.ttl_safety || 0), 0);

        const categories = [
            { name: 'non-simu', label: 'Non-simulator courses', count: nonSimuTotal },
            { name: 'simu', label: 'Simulator courses', count: simuTotal },
            { name: 'stcw', label: 'STCW', count: stcwTotal },
            { name: 'mds', label: 'MDS courses', count: mdsTotal },
            { name: 'safety', label: 'Safety courses', count: safetyCourses },
        ];

        const sortedCategories = [...categories].sort((a, b) => b.count - a.count);
        const majorityCat = sortedCategories[0];
        const runnerUpCat = sortedCategories[1];
        const smallShareCats = sortedCategories.slice(2);

        const categoriesString = (
            <>
                {" "}For the training category, the majority attended{" "}
                <Text as="span" fontWeight="bold">{majorityCat.label} with {majorityCat.count} trainees ({getPct(majorityCat.count)}%)</Text>
                , followed by <Text as="span" fontWeight="bold">{runnerUpCat.label} accounted for {runnerUpCat.count} trainees ({getPct(runnerUpCat.count)}%)</Text>
                , while{" "}
                <Text as="span" fontWeight="bold">
                    {smallShareCats.map((c) => c.label.replace(' courses', '')).join(' and ')} recorded{" "}
                    {smallShareCats.reduce((sum, c) => sum + c.count, 0)} trainees ({getPct(smallShareCats.reduce((sum, c) => sum + c.count, 0))}%)
                </Text>
                , representing the smallest share.
            </>
        );

        // 5. Final Output String Structure Compilation
        return (
            <>
                <Text fontWeight="bold" as="span" textTransform="uppercase" borderBottom="1px solid black" pb="0.5">
                    FOR DATED {displayMonthName} {displayYear}
                </Text>
                {" "}A total of <Text as="span" fontWeight="bold">{totalTrainees} trainees</Text> were recorded. {modesString}
                <br/>
                {categoriesString}
            </>
        )
    }

    const cellStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    }

    const getFullMatrixData = () => {
        const createRowTemplate = () => ({
            f2fBatches: 0, f2fTrainees: 0,
            onlineBatches: 0, onlineTrainees: 0,
            blendedBatches: 0, blendedTrainees: 0,
            cancelled: 0, nonAppearance: 0
        });

        const createCategoryTemplate = () => ({
            scheduledTrainees: 0, // 🟢 CHANGED: Tracks total scheduled trainees now
            withInstructor: createRowTemplate(),
            withoutInstructor: createRowTemplate(),
        });

        const matrix = {
            simulator: createCategoryTemplate(),
            nonSimulator: createCategoryTemplate(),
            stcw: createCategoryTemplate(),
            mds: createCategoryTemplate(),
        };

        batchCourses.forEach((bc) => {
            let catKey: 'simulator' | 'nonSimulator' | 'stcw' | 'mds' = 'nonSimulator';
            
            const isSim = bc.ttl_simu > 0 || bc.courseType === "1"; 
            const isStcw = bc.ttl_stcw > 0;
            const isMds = bc.ttl_mds > 0 || bc.ttl_safety > 0;

            if (isStcw) {
                catKey = 'stcw';
            } else if (isMds) {
                catKey = 'mds';
            } else if (isSim) {
                catKey = 'simulator';
            } else {
                catKey = 'nonSimulator';
            }

            const cat = matrix[catKey];
            
            // 🟢 FIXED: Add total course trainees to the category's scheduled total
            cat.scheduledTrainees += Number(bc.total_trainees || 0);

            bc.sortedBatches?.forEach((batch: any) => {
                const modeVal = (batch.trainingMode || '').toLowerCase().trim();
                const isModular = modeVal.endsWith('m');
                const targetRow = isModular ? cat.withoutInstructor : cat.withInstructor;

                const deliveredCount = Number(batch.delivered || 0);
                const cancelledCount = Number(batch.cancelled || 0);
                const nonAppearanceCount = Number(batch.non_appearance || 0);

                targetRow.cancelled += cancelledCount;
                targetRow.nonAppearance += nonAppearanceCount;

                if (modeVal.startsWith('f2f')) {
                    targetRow.f2fBatches += 1;
                    targetRow.f2fTrainees += deliveredCount;
                } else if (modeVal.startsWith('ol')) {
                    targetRow.onlineBatches += 1;
                    targetRow.onlineTrainees += deliveredCount;
                } else if (modeVal === 'blended') {
                    targetRow.blendedBatches += 1;
                    targetRow.blendedTrainees += deliveredCount;
                }
            });
        });

        return matrix;
    };

    const tableData = getFullMatrixData();

    // Calculate totals matching the green highlights in image_ad0d62.png
    const getCategoryTotal = (cat: any) => {
        return (
            cat.withInstructor.f2fTrainees + cat.withoutInstructor.f2fTrainees +
            cat.withInstructor.onlineTrainees + cat.withoutInstructor.onlineTrainees +
            cat.withInstructor.blendedTrainees + cat.withoutInstructor.blendedTrainees
        );
    };

    const simTotal = getCategoryTotal(tableData.simulator);
    const nonSimTotal = getCategoryTotal(tableData.nonSimulator);
    const stcwTotal = getCategoryTotal(tableData.stcw);
    const mdsTotal = getCategoryTotal(tableData.mds);
    const grandTotal = simTotal + nonSimTotal + stcwTotal + mdsTotal;
    
    return(
        <>
            <Text fontSize='xl' fontFamily='Arial, sans-serif' textTransform='uppercase' >Training Analysis</Text>
            <Box display='flex' justifyContent='space-between'>
                <Box display='flex' alignItems='center'>
                    <Text fontSize='lg' mr='3'>Filters:</Text>
                    <Button w='auto' mr={4} onClick={onOpenDate} rightIcon={<ChevronDownIcon />} size='sm' shadow='md'>Filter Date</Button>
                    {/* Clean Dropdown Selection tied directly to the useEffect state trigger */}
                    <Select 
                        size="sm" 
                        shadow='md'
                        w="auto"
                        value={filterCourse} 
                        onChange={(e) => setFilterCourse(e.target.value)}
                    >
                        <option hidden>All Courses</option>
                        {allCourses
                        ?.sort((a, b) => a.course_code.localeCompare(b.course_code))
                        .map(c => (
                            <option key={c.id} value={c.course_code}>{c.course_code.toUpperCase()}</option>
                        ))}
                    </Select>
                    {filterCourse && (
                        <Button ms='3' onClick={() => setFilterCourse('')} colorScheme='red' shadow='md' size='sm'>Clear</Button>
                    )}
                </Box>
                <Button colorScheme='blue' bgColor='blue.700' shadow='md' size='sm'>Print Report</Button>
            </Box>
            <Box >
                <Box display='flex' justifyContent='space-between'>
                    <Box display='flex' mb='2' textAlign='center' fontWeight='normal'>
                        <Box w='200px' borderY='1px solid gray' borderX='1px solid gray' borderTopStartRadius={'5px'} borderBottomStartRadius={'5px'}>
                            <Text>Total Courses</Text>
                            <Text>{batchCourses.length}</Text>
                        </Box>
                        <Box w='140px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>Total Batches</Text>
                            <Text>
                            {batchCourses.reduce(
                                (total, bc) => total + bc.sortedBatches.length,
                                0
                            )}
                            </Text>
                        </Box>
                        <Box w='140px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>Total Declared</Text>
                            <Text>
                            {batchCourses.reduce(
                                (total, bc) => total + bc.total_trainees,
                                0
                            )}
                            </Text>
                        </Box>
                        <Box w='140px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>Total Delivered</Text>
                            <Text>
                            {batchCourses.reduce(
                                (total, bc) => total + bc.sortedBatches.reduce((sum, batch) => sum + Number(batch.delivered), 0),
                                0
                            )}
                            </Text>
                        </Box>
                        <Box w='50px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>F2F</Text>
                            <Text>
                            {batchCourses.reduce((total, bc) => {
                                return total + bc.sortedBatches.reduce((sum, batch) => {
                                    return sum +
                                        (['f2f', 'f2ft', 'f2fp'].includes(batch.trainingMode) ? Number(batch.delivered) : 0);
                                    }, 0);
                                }, 0)
                            }
                            </Text>
                        </Box>
                        <Box w='50px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>OINS</Text>
                            <Text>
                            {batchCourses.reduce((total, bc) => {
                                return total + bc.sortedBatches.reduce((sum, batch) => {
                                    return sum +
                                        (['ol', 'olt', 'olp'].includes(batch.trainingMode) ? Number(batch.delivered) : 0);
                                    }, 0);
                                }, 0)
                            }
                            </Text>
                        </Box>
                        <Box w='50px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>OM</Text>
                            <Text>
                            {batchCourses.reduce((total, bc) => {
                                return total + bc.sortedBatches.reduce((sum, batch) => sum + (batch.trainingMode === 'olm' ? Number(batch.delivered) : 0), 0);
                                }, 0)
                            }
                            </Text>
                        </Box>
                        <Box w='50px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>CBT</Text>
                            <Text>
                            {batchCourses.reduce((total, bc) => {
                                return total + bc.sortedBatches.reduce((sum, batch) => sum + (batch.trainingMode === 'f2fm' ? Number(batch.delivered) : 0), 0);
                                }, 0)
                            }
                            </Text>
                        </Box>
                        <Box w='100px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>BLENDED</Text>
                            <Text>
                            {batchCourses.reduce((total, bc) => total + bc.sortedBatches
                                .reduce((sum, batch) => 
                                    sum + (batch.trainingMode === 'blended' ? Number(batch.delivered) : 0), 
                                0), 
                            0)}
                            </Text>
                        </Box>
                        <Box w='50px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>C</Text>
                            <Text>
                            {batchCourses.reduce(
                                (total, bc) => total + bc.sortedBatches.reduce((sum, batch) => sum + Number(batch.cancelled), 0),
                                0
                            )}
                            </Text>
                        </Box>
                        <Box w='50px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>F</Text>
                            <Text>&nbsp;</Text>
                        </Box>
                        <Box w='50px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>NT</Text>
                            <Text>&nbsp;</Text>
                        </Box>
                        <Box w='50px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>NA</Text>
                            <Text>
                            {batchCourses.reduce(
                                (total, bc) => total + bc.sortedBatches.reduce((sum, batch) => sum + Number(batch.non_appearance), 0),
                                0
                            )}
                            </Text>
                        </Box>
                        <Box w='50px' borderY='1px solid gray' borderRight='1px solid gray' borderTopEndRadius={'5px'} borderBottomEndRadius={'5px'}>
                            <Text>D</Text>
                            <Text>
                            {batchCourses.reduce(
                                (total, bc) => total + bc.sortedBatches.reduce((sum, batch) => sum + Number(batch.delivered), 0),
                                0
                            )}
                            </Text>
                        </Box>
                    </Box>
                    <Box display='flex' mb='2' textAlign='center' fontWeight='normal'>
                        <Box w='80px' borderY='1px solid gray' borderX='1px solid gray' borderTopStartRadius={'5px'} borderBottomStartRadius={'5px'}>
                            <Text>Simu</Text>
                            <Text>
                            {batchCourses.reduce((total, bc) => total + (bc.ttl_simu || 0), 0)}
                            </Text>
                        </Box>
                        <Box w='80px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>Non-Simu</Text>
                            <Text>
                            {batchCourses.reduce((total, bc) => total + (bc.ttl_non_simu || 0), 0)}
                            </Text>
                        </Box>
                        <Box w='80px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>STCW</Text>
                            <Text>
                            {batchCourses.reduce((total, bc) => total + (bc.ttl_stcw || 0), 0)}
                            </Text>
                        </Box>
                        <Box w='80px' borderY='1px solid gray' borderRight='1px solid gray'>
                            <Text>Safety</Text>
                            <Text>
                            {batchCourses.reduce((total, bc) => total + (bc.ttl_safety || 0), 0)}
                            </Text>
                        </Box>
                        <Box w='80px' borderY='1px solid gray' borderRight='1px solid gray' borderTopEndRadius={'5px'} borderBottomEndRadius={'5px'}>
                            <Text>MDS</Text>
                            <Text>
                            {batchCourses.reduce((total, bc) => total + (bc.ttl_mds || 0), 0)}
                            </Text>
                        </Box>
                    </Box>
                </Box>
                <Box h='700px' style={{maxHeight: '750px', overflowY: 'auto', scrollbarWidth: 'thin'}}>
                    {/** HEADER */}
                    <Box w='1727px' py='1' h='60px' display='flex' alignItems='start' textAlign='center' borderRadius={'5px'} bgColor='blue.700' color='white' position='sticky' top='0' zIndex='1'>
                        <Box w='200px' sx={headerStyle}> Courses </Box>
                        <Box w='140px' sx={headerStyle}>Batch</Box>
                        <Box w='140px' sx={headerStyle}>Total # of Batches</Box>
                        <Box w='140px' sx={headerStyle}>No. of Trainees per Batch</Box>
                        <Box w='140px' sx={headerStyle}>Total # of Trainees</Box>
                        <Box w='140px' sx={headerStyle}>Delivered</Box>
                        <Box w='300px' borderRight='1px solid white'>
                            <Text>MODE OF TRAINING</Text>
                            <Box display={'flex'} h='35px' borderTop='1px solid white'alignItems='center' justifyContent='space-between'>
                                <Text w='50px' sx={headerStyle} >F2F</Text>
                                <Box w='100px' borderRight='1px solid white' >
                                    <Text>ONLINE</Text>
                                    <Box display='flex' justifyContent='space-between'>
                                        <Text w='50px' borderRight='1px solid white' borderTop='1px solid white'>INS</Text>
                                        <Text w='50px' borderTop='1px solid white'>MOD</Text>
                                    </Box>
                                </Box>
                                <Text w='50px' sx={headerStyle} >CBT</Text>
                                <Text w='100px' >BLENDED</Text>
                            </Box>
                        </Box>
                        <Box w='250px' >
                            <Text borderRight='1px solid white'>COMPLETION</Text>
                            <Box display='flex' h='35px' borderTop='1px solid white' alignItems='center' justifyContent='space-between'>
                                <Text w='50px' sx={headerStyle}>C</Text>
                                <Text w='50px' sx={headerStyle}>F</Text>
                                <Text w='50px' sx={headerStyle}>NT</Text>
                                <Text w='50px' sx={headerStyle}>NA</Text>
                                <Text w='50px' sx={headerStyle}>D</Text>
                            </Box>
                        </Box>
                        <Box w='300px' sx={headerStyle}>REMARKS</Box>
                    </Box>
                    {/** BODY */}
                    <Box>
                    {batchCourses.map((bc, index) => {
                        return(
                            <Box key={index} _hover={{bgColor: 'gray.200'}} w='1727px' display='flex' alignItems='center' textAlign='center' fontWeight='normal' borderBottom='1px solid gray' borderX='1px solid gray'>
                                <Text w='200px' fontWeight='bold' color={bc.courseType === '1' ? '#0070c0' : 'black'}>{bc.course.toUpperCase()}</Text>
                                <Box w='140px' >
                                    {bc.sortedBatches.map((b, idx, arr) => 
                                        <Text  _hover={{bgColor: 'blue.100'}} key={idx} borderBottom={idx === arr.length - 1 ? 'none' : '1px solid gray'} borderX='1px solid gray'>
                                            {b.batch_no}
                                        </Text>)
                                    }
                                </Box>
                                <Text w='140px'>{bc.total_batches}</Text>
                                <Box w='140px' >
                                    {bc.sortedBatches.map((b, idx, arr) => 
                                        <Text key={idx} _hover={{bgColor: 'blue.100'}} borderBottom={idx === arr.length - 1 ? 'none' : '1px solid gray'} borderX='1px solid gray'>
                                            {b.trainees_per_batch}
                                        </Text>)
                                    }
                                </Box>
                                <Text w='140px'>{bc.total_trainees}</Text>
                                <Box>
                                    {bc.sortedBatches.map((b, idx, arr) => (
                                        <Box key={idx} _hover={{bgColor: 'blue.100'}} display='flex' alignItems='center' justifyContent='space-between' borderBottom={idx === arr.length - 1 ? 'none' : '1px solid gray'} borderX='1px solid gray'>
                                            <Text w='140px' borderRight='1px solid gray'>{b.delivered}</Text>
                                            <Box w='300px' >
                                                <Box display={'flex'} alignItems='center' justifyContent='space-between'>
                                                    <Text w='50px' bgColor='#eaf1dd' sx={headerStyle} borderRight='1px solid gray'>{['f2f', 'f2ft', 'f2fp'].includes(b.trainingMode) ? b.delivered : <>&nbsp;</>}</Text>
                                                    <Box w='100px' >
                                                        <Box display='flex' justifyContent='space-between'>
                                                            <Text bgColor='#daeef3' w='50px' borderX='1px solid gray'>{['ol', 'olt', 'olp'].includes(b.trainingMode) ? b.delivered : <>&nbsp;</>}</Text>
                                                            <Text bgColor='#daeef3' w='50px' borderRight='1px solid gray'>{b.trainingMode === 'olm' ? b.delivered : <>&nbsp;</>}</Text>
                                                        </Box>
                                                    </Box>
                                                    <Text w='50px' bgColor='#ddd9c3' sx={headerStyle} >{b.trainingMode === 'f2fm' ? b.delivered : <>&nbsp;</>}</Text>
                                                    <Text w='100px' bgColor='#b6dde8' borderX='1px solid gray'>{b.trainingMode === 'blended' ? b.delivered : <>&nbsp;</>}</Text>
                                                </Box>
                                            </Box>
                                            <Box w='250px' display='flex' alignItems='center' justifyContent='space-between'>
                                                <Text w='50px' borderRight={'1px solid gray'}>{b.cancelled !== '0' ? b.cancelled : <>&nbsp;</>}</Text> {/** Re-evaluate this status */}
                                                <Text w='50px' borderRight={'1px solid gray'}>&nbsp;</Text>
                                                <Text w='50px' borderRight={'1px solid gray'}>&nbsp;</Text>
                                                <Text w='50px' borderRight={'1px solid gray'}>{b.non_appearance !== '0' ? b.non_appearance : <>&nbsp;</>}</Text> {/** Re-evaluate this status */}
                                                <Text w='50px'>{b.delivered !== '0' ? b.delivered : <>&nbsp;</>}</Text>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                                <Text w='300px' >
                                {bc.sortedBatches.map((b, idx, arr) => 
                                    <Text key={idx} onClick={() => {setBatchID(b.batch_id); setBRemarks(b.remarks); onOpenRemarks()}} fontWeight={b?.remarks === '' || b?.remarks === null ? 'normal' : 'bold'} _hover={{cursor: 'pointer'}} borderBottom={idx === arr.length - 1 ? 'none' : '1px solid gray'}>
                                        {b?.remarks === '' || b?.remarks === null ? 'None' : b.remarks}
                                    </Text>)
                                }
                                </Text>
                            </Box>
                        )
                    })}
                    </Box>
                </Box>
                {/** Overlap Training Data Table UI */}
                <Box mt="6" maxW="100%" overflowX="auto">
                    <Box w="650px" border="1px solid black" display="flex" flexDir="column">
                        {/* Table Title Header */}
                        <Text textAlign="center" fontWeight="700" p="2" bg="white" borderBottom="1px solid black" letterSpacing="0.5px">
                            OVERLAP TRAINING
                        </Text>
                        {/* Columns Header Row */}
                        <Box display="flex" bg="gray.100" fontWeight="600" fontSize="13px" borderBottom="1px solid black" textAlign="center">
                            <Text w="150px" p="1.5" borderRight="1px solid black">COURSE</Text>
                            <Text flex="1" p="1.5" borderRight="1px solid black">DATE</Text>
                            <Text w="180px" p="1.5">NO. OF TRAINEES</Text>
                        </Box>
                        {/* Dynamic Rows Content Layer */}
                        {groupedOverlapList.length === 0 ? (
                            <Box p="6" textAlign="center" fontSize="14px" fontWeight="600">
                                NO OVERLAP TRAINING FROM {monthsList[monthSelected]} TO {monthsList[(monthSelected + 1) % 12]}
                            </Box>
                        ) : (
                            groupedOverlapList.map((row, idx) => (
                                <Box  key={idx}  display="flex"  textAlign="center"  fontSize="13px"  borderBottom={idx === groupedOverlapList.length - 1 ? "none" : "1px solid black"} >
                                    <Text w="150px" p="2" fontWeight='normal' borderRight="1px solid black" display="flex" alignItems="center" justifyContent="center">
                                        {row.courseCode.toUpperCase()}
                                    </Text>
                                    <Text flex="1" p="2" fontWeight='normal' borderRight="1px solid black" display="flex" alignItems="center" justifyContent="center">
                                        {row.dateStr}
                                    </Text>
                                    <Text w="180px" p="2" fontWeight='normal' display="flex" alignItems="center" justifyContent="center">
                                        {row.count}
                                    </Text>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>
                {/** Training Mode and Category Chart */}
                <Box display='flex' gap='4'>
                    <Box display='flex' justifyContent='center' mt={4}>
                        <TrainingModeChart batchCourses={batchCourses as any} />
                    </Box>
                    <Box display='flex' justifyContent='center' mt={4}>
                        <TrainingCategoryChart batchCourses={batchCourses as any} />
                    </Box>
                </Box>
                {/** Instructor Comparison and Accomplished Forms Chart */}
                <Box display='flex' gap='4'>
                    <Box display='flex' justifyContent='center' mt={4}>
                        <InstructorComparisonChart batchCourses={batchCourses as any} />
                    </Box>
                    <Box display='flex' justifyContent='center' mt={4}>
                        <AccomplishedForm batchCourses={batchCourses as any} />
                    </Box>
                </Box>
                {/** Certificates Chart */}
                <Box display='flex' gap='4'>
                    <Box display='flex' justifyContent='center' mt={4}>
                        <CertificateAndAccountChart trainingData={filteredTrainList} />
                    </Box>
                </Box>
            </Box>
            <Box border='1px solid black' w='216mm' h='279mm' p='5' bg='white'>
                {/** Header */}
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                    <ChakraImage src='/Logo.jpg' width={'2.81in'} height={'0.66in'} alt='logo'/>
                    <Box >
                        <Text display='flex' justifyContent='end' alignItems='center' fontSize='9pt' fontFamily='Calibri, Arial, sans-serif' fontWeight='normal'>
                            <Text as='span' mr={1}>
                                <PinIcon size={'12'} color={'#000'} />
                            </Text>
                            <Text>2/F 801 Building UN Avenue Ermita Manila</Text>
                        </Text>
                        <Text display='flex' justifyContent='end' alignItems='center' fontSize='9pt' fontFamily='Calibri, Arial, sans-serif' fontWeight='normal'>
                            <Text as='span' mr={1}>
                                <PhoneIcon size={'12'} color={'#000'} />
                            </Text>
                            <Text>(02) 8 281-8155</Text>
                        </Text>
                        <Text display='flex' justifyContent='end' alignItems='center' fontSize='9pt' fontFamily='Calibri, Arial, sans-serif' fontWeight='normal'>
                            <Text as='span' mr={1}>
                                <MailIcon size={'12'} color={'#000'} />
                            </Text>
                            <Text>pentagonmaritimeservicescorp@gmail.com</Text>
                        </Text>
                        <Text display='flex' justifyContent='end' alignItems='center' fontSize='9pt' fontFamily='Calibri, Arial, sans-serif' fontWeight='normal'>
                            <Text as='span' mr={1}>
                                <FacebookIcon size={'12'} color={'#000'} />
                            </Text>
                            <Text>/pentagonmaritimeservicescorp</Text>
                        </Text>
                    </Box>
                </Box>
                {/** Report Title */}
                <Text textAlign='center' display='flex' flexDir='column'>
                    <Text as='span' fontWeight='bold' fontSize='16pt' >MONTHLY REPORT</Text>
                    <Text as='span' fontWeight='normal' fontSize='10pt'>{`For the Month of `} 
                        <Text as='span' fontWeight='bold' textDecoration='underline'>{`${monthsList[(currMonth + 12) % 12]} ${currentYear}`}</Text>
                    </Text>
                </Text>
                <Text textAlign='center' display='flex' fontSize='10pt' gap='3'>
                    <Text as='span' fontWeight='normal'>Department:</Text>
                    <Text as='span' fontWeight='bold' textDecoration='underline'>TRAINING</Text>
                </Text>
                <Text fontSize="10pt" mt='5' fontWeight="bold" mb="3" color="gray.800">
                    I. Training Delivery Performance
                </Text>
                {/** Content */}
                <Box fontSize='8pt' lineHeight='1.7' >
                    {generateDynamicBatchSummary()}
                </Box>
                <Box mt="4" maxW="100%" overflowX="auto" p="2" bg="white">
                    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '200mm', fontSize: '8pt', border: '1px solid black', fontFamily: 'sans-serif' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>
                                <th rowSpan={3} style={{ border: '1px solid black', width: '180px' }}>.</th>
                                <th rowSpan={3} style={{ border: '1px solid black', width: '100px' }}>Scheduled</th>
                                <th colSpan={6} style={{ border: '1px solid black', padding: '4px' }}>Conducted</th>
                                <th rowSpan={3} style={{ border: '1px solid black', width: '80px' }}>Ongoing</th>
                                <th rowSpan={3} style={{ border: '1px solid black', width: '80px' }}>Cancelled</th>
                                <th rowSpan={3} style={{ border: '1px solid black', width: '80px' }}>Re-Schedule</th>
                                <th rowSpan={3} style={{ border: '1px solid black', width: '100px' }}>Scheduled for Next Month</th>
                                <th rowSpan={3} style={{ border: '1px solid black', width: '90px' }}>Total</th>
                            </tr>
                            <tr style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                <th colSpan={2} style={{ border: '1px solid black', padding: '2px' }}>Face to Face</th>
                                <th colSpan={2} style={{ border: '1px solid black', padding: '2px' }}>Online</th>
                                <th colSpan={2} style={{ border: '1px solid black', padding: '2px' }}>Blended</th>
                            </tr>
                            <tr style={{ fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                                <th style={{ border: '1px solid black', width: '65px' }}>No. of Batches</th>
                                <th style={{ border: '1px solid black', width: '65px' }}>No. of trainees</th>
                                <th style={{ border: '1px solid black', width: '65px' }}>No. of Batches</th>
                                <th style={{ border: '1px solid black', width: '65px' }}>No. of trainees</th>
                                <th style={{ border: '1px solid black', width: '65px' }}>No. of Batches</th>
                                <th style={{ border: '1px solid black', width: '65px' }}>No. of trainees</th>
                            </tr>
                        </thead>
                        <tbody style={{ textAlign: 'center' }}>
                            
                            {/* 1. SIMULATOR SECTION */}
                            <tr style={{ fontWeight: 'bold', backgroundColor: '#ffffff' }}><td colSpan={13} style={{ border: '1px solid black', padding: '4px' }}>Simulator Courses</td></tr>
                            <tr>
                                <td style={{ border: '1px solid black', textAlign: 'left', paddingLeft: '20px' }}>- w/ Instructor</td>
                                <td rowSpan={2} style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.simulator.scheduledTrainees || 0}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.simulator.withInstructor.f2fBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{tableData.simulator.withInstructor.f2fTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.simulator.withInstructor.onlineBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.simulator.withInstructor.onlineTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.simulator.withInstructor.blendedBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{tableData.simulator.withInstructor.blendedTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td> {/* Ongoing Placeholder */}
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.simulator.withInstructor.cancelled || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td> {/* Re-Schedule Placeholder */}
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td> {/* Next Month Placeholder */}
                                <td rowSpan={2} style={{ border: '1px solid black', fontWeight: 'bold', color: 'green' }}>{simTotal || ''}</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid black', textAlign: 'left', paddingLeft: '20px' }}>- w/o Instructor</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.simulator.withoutInstructor.f2fBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{tableData.simulator.withoutInstructor.f2fTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.simulator.withoutInstructor.onlineBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.simulator.withoutInstructor.onlineTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.simulator.withoutInstructor.blendedBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{tableData.simulator.withoutInstructor.blendedTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.simulator.withoutInstructor.cancelled || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                            </tr>

                            {/* 2. NON-SIMULATOR SECTION */}
                            <tr style={{ fontWeight: 'bold', backgroundColor: '#ffffff' }}><td colSpan={13} style={{ border: '1px solid black', padding: '4px' }}>Non-Simulator Courses</td></tr>
                            <tr>
                                <td style={{ border: '1px solid black', textAlign: 'left', paddingLeft: '20px' }}>- w/ Instructor</td>
                                <td rowSpan={2} style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.nonSimulator.scheduledTrainees || 0}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.nonSimulator.withInstructor.f2fBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{tableData.nonSimulator.withInstructor.f2fTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.nonSimulator.withInstructor.onlineBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.nonSimulator.withInstructor.onlineTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.nonSimulator.withInstructor.blendedBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{tableData.nonSimulator.withInstructor.blendedTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.nonSimulator.withInstructor.cancelled || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td rowSpan={2} style={{ border: '1px solid black', fontWeight: 'bold', color: 'green' }}>{nonSimTotal || ''}</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid black', textAlign: 'left', paddingLeft: '20px' }}>- w/o Instructor</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.nonSimulator.withoutInstructor.f2fBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{tableData.nonSimulator.withoutInstructor.f2fTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.nonSimulator.withoutInstructor.onlineBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.nonSimulator.withoutInstructor.onlineTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.nonSimulator.withoutInstructor.blendedBatches || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{tableData.nonSimulator.withoutInstructor.blendedTrainees || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.nonSimulator.withoutInstructor.cancelled || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                            </tr>

                            {/* 3. STCW FLAT ROW */}
                            <tr>
                                <td style={{ border: '1px solid black', textAlign: 'left', fontWeight: 'bold', paddingLeft: '8px' }}>STCW</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.stcw.scheduledTrainees || 0}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{(tableData.stcw.withInstructor.f2fBatches + tableData.stcw.withoutInstructor.f2fBatches) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{(tableData.stcw.withInstructor.f2fTrainees + tableData.stcw.withoutInstructor.f2fTrainees) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{(tableData.stcw.withInstructor.onlineBatches + tableData.stcw.withoutInstructor.onlineBatches) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{(tableData.stcw.withInstructor.onlineTrainees + tableData.stcw.withoutInstructor.onlineTrainees) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{(tableData.stcw.withInstructor.blendedBatches + tableData.stcw.withoutInstructor.blendedBatches) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{(tableData.stcw.withInstructor.blendedTrainees + tableData.stcw.withoutInstructor.blendedTrainees) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{(tableData.stcw.withInstructor.cancelled + tableData.stcw.withoutInstructor.cancelled) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{border: '1px solid black', fontWeight: 'bold', color: 'green' }}>{stcwTotal || ''}</td>
                            </tr>

                            {/* 4. MDS FLAT ROW */}
                            <tr>
                                <td style={{ border: '1px solid black', textAlign: 'left', fontWeight: 'bold', paddingLeft: '8px' }}>MDS</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{tableData.mds.scheduledTrainees || 0}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{(tableData.mds.withInstructor.f2fBatches + tableData.mds.withoutInstructor.f2fBatches) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{(tableData.mds.withInstructor.f2fTrainees + tableData.mds.withoutInstructor.f2fTrainees) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{(tableData.mds.withInstructor.onlineBatches + tableData.mds.withoutInstructor.onlineBatches) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{(tableData.mds.withInstructor.onlineTrainees + tableData.mds.withoutInstructor.onlineTrainees) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{(tableData.mds.withInstructor.blendedBatches + tableData.mds.withoutInstructor.blendedBatches) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black', backgroundColor: '#f4f4f4' }}>{(tableData.mds.withInstructor.blendedTrainees + tableData.mds.withoutInstructor.blendedTrainees) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}>{(tableData.mds.withInstructor.cancelled + tableData.mds.withoutInstructor.cancelled) || ''}</td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{ fontWeight: 'normal', border: '1px solid black' }}></td>
                                <td style={{ border: '1px solid black', fontWeight: 'bold', color: 'green' }}>{mdsTotal || ''}</td>
                            </tr>

                            {/* GRAND TOTAL */}
                            <tr style={{ fontWeight: 'bold' }}>
                                <td style={{ border: '1px solid black', textAlign: 'left', color: 'green', padding: '6px' }}>Total</td>
                                <td colSpan={11} style={{ border: '1px solid black' }}></td>
                                <td style={{ border: '1px solid black', color: 'green' }}>{grandTotal || '0'}</td>
                            </tr>
                        </tbody>
                    </table>
                </Box>
                {/** Bar Chart */}
                <SimuVsNonSimu tableData={tableData} />
                
            </Box>
            <Modal isOpen={isOpenRemarks} onClose={() => {onCloseRemarks(); setBatchID('');}} size='xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Remarks</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Textarea minH='250px' shadow='md' placeholder='Remarks here' fontWeight='normal' value={bRemarks} onChange={(e) => setBRemarks(e.target.value)}></Textarea>
                    </ModalBody>
                    <ModalFooter>
                        <Button isLoading={loading} loadingText='Saving...' onClick={handleRemarks} colorScheme='blue' bgColor='blue.700' shadow='md'>Save Remarks</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpenDate} scrollBehavior='inside' onClose={onCloseDate}>
                <ModalOverlay />
                <ModalContent px={4}>
                    <ModalHeader className='text-sky-700' fontWeight='800'>Select Month & Year</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex'>
                        <Box w='50%' mr={4}>
                            <Text fontSize='xl' color='blue.700'>Months</Text>
                            <Box>
                            {fullMonth.map((month, index) => (
                                <Text borderRadius={'10px'} color='gray.500' fontSize='xl' p={2} _hover={{bg: 'gray.100'}} onClick={() => {setMonthSelected(index)}} key={index}>
                                    {month}
                                </Text>
                            ))}
                            </Box>
                        </Box>
                        <Box w='50%'>
                            <Text fontSize='xl' color='blue.700'>Years</Text>
                            <Box h='550px' overflowY='auto'>
                            {years.map((year) => (
                                <Text  borderRadius="10px"  color="gray.500"  fontSize="xl"  p={2}  _hover={{ bg: "gray.100" }}  onClick={() => setYearSelected(year)}  key={year}>
                                    {year}
                                </Text>
                            ))}
                            </Box>
                        </Box>
                    </ModalBody>
                    <ModalFooter display='flex' justifyContent='space-between' borderTopWidth='1px'>
                        <Text fontSize='lg'>{`Date: ${fullMonth[monthSelected]} ${yearSelected}`}</Text>
                        <Box> 
                            <Button onClick={handleData} colorScheme='blue'>Select</Button>
                        </Box>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}