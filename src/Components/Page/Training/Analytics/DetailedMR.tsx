'use client'

import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

import { Image as ChakraImage, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Box, Text, Input, Button, useToast,  } from '@chakra-ui/react'
import { PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'

import { ToastStatus } from '@/types/handling'
import { BATCH_ANALYSIS, } from '@/types/training'
import { InstructorByID } from '@/types/instructor'
import { CourseBatchByID } from '@/types/course-batches'

import { CertificationSummaryTable } from './MiscTables/CertificationSummaryTable'
import PlannedTrainingSched from './MiscTables/PlannedTrainingSched'
import SimuVsNonSimu from './BarChart/SimuVsNonSimu'
import TrainerPerformanceTable from './MiscTables/TrainerPerformanceTable'

interface DetailedMRProps {
    batchCourses: BATCH_ANALYSIS[];
    filteredTrainList: any;
    allInstructors: InstructorByID[];
    monthSelected: number;
    yearSelected: number;
    courseBatch: CourseBatchByID[];
    currentYear: number;
    currMonth: number;
}

export default function DetailedMonthlyReport ({ batchCourses, filteredTrainList, allInstructors, courseBatch, monthSelected, yearSelected, currentYear, currMonth }: DetailedMRProps){
    const toast = useToast()
    
    const componentRef = useRef<HTMLDivElement | null>(null)
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Monthly Report ${monthSelected + 1}-${yearSelected}.pdf`,
        onBeforePrint: () => {
            handleToast('Preparing to print Monthly Report...', ``, 3000, 'info');
        },
        onAfterPrint: () => {
            handleToast('Monthly Report Printed!', ``, 3000, 'success');
        },
    })

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

    const monthsList = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

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
        // 🟢 Return 0 early if the whole category object is missing
        if (!cat) return 0; 
    
        return (
            (cat.withInstructor?.f2fTrainees ?? 0) + 
            (cat.withoutInstructor?.f2fTrainees ?? 0) +
            (cat.withInstructor?.onlineTrainees ?? 0) + 
            (cat.withoutInstructor?.onlineTrainees ?? 0) +
            (cat.withInstructor?.blendedTrainees ?? 0) + 
            (cat.withoutInstructor?.blendedTrainees ?? 0)
        );
    }

    // Calculate totals matching the green highlights in image_ad0d62.png
    const getTotalBatches = (cat: any, category: string) => {
        // 🟢 Return 0 early if the whole category object is missing
        if (!cat) return 0; 
        
        switch(category){
            case 'with':
                return (
                    (cat.withInstructor?.f2fBatches ?? 0) +
                    (cat.withInstructor?.onlineBatches ?? 0) +
                    (cat.withInstructor?.blendedBatches ?? 0)
                )
                break;
            case 'without':
                return (
                    (cat.withoutInstructor?.f2fBatches ?? 0) +
                    (cat.withoutInstructor?.onlineBatches ?? 0) +
                    (cat.withoutInstructor?.blendedBatches ?? 0)
                )
                break;
            default:
                return 0;
                break;
        }
    }

    const simTotal = getCategoryTotal(tableData.simulator);
    const nonSimTotal = getCategoryTotal(tableData.nonSimulator);
    const stcwTotal = getCategoryTotal(tableData.stcw);
    const mdsTotal = getCategoryTotal(tableData.mds);
    const grandTotal = simTotal + nonSimTotal + stcwTotal + mdsTotal;
    
    const tableDataStyle = {
        fontWeight: 'normal',
        border: '1px solid black',
    }
    
    const tableDataStyle2 = {
        ...tableDataStyle,
        backgroundColor: '#f4f4f4',
    }

    return(
        <ModalContent>
            <ModalHeader pt='12' borderRadius='10px' bg='white' display='flex' w='100%' justifyContent='space-between' position='sticky' top='0px' zIndex='docked'>
                <Text fontWeight='bolder' fontSize='xl' color='blue.700'>Report Preview</Text>
                <Button onClick={handlePrint} colorScheme='blue' bgColor='blue.700' shadow='md' >Print Report</Button>
            </ModalHeader>
            <ModalBody display='flex' flexDir='column' justifyContent='center'>
                <Box ref={componentRef} display='flex' flexDir='column' justifyContent='center' w='100%'
                    sx={{
                        // 🟢 Global CSS print instructions passed to the browser engine
                        '@media print': {
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
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            {/* 1. FIXED HEADER: The browser automatically clones this at the top of page 1, page 2, page 3, etc. */}
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
                            {/* 2. AUTOMATIC CONTENT STREAM: Your long table fills this space and breaks safely across page margins */}
                            <tbody>
                                <tr>
                                    <td>
                                        <Box as="main" w="100%">
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
                                            <Box mt="2" maxW="100%" overflowX="auto" p="2" bg="white">
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
                                                            <td rowSpan={2} style={tableDataStyle}>{tableData.simulator.scheduledTrainees || 0}</td>
                                                            <td style={tableDataStyle}>{tableData.simulator.withInstructor.f2fBatches || ''}</td>
                                                            <td style={tableDataStyle2}>{tableData.simulator.withInstructor.f2fTrainees || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.simulator.withInstructor.onlineBatches || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.simulator.withInstructor.onlineTrainees || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.simulator.withInstructor.blendedBatches || ''}</td>
                                                            <td style={tableDataStyle2}>{tableData.simulator.withInstructor.blendedTrainees || ''}</td>
                                                            <td style={tableDataStyle}></td> {/* Ongoing Placeholder */}
                                                            <td style={tableDataStyle}>{tableData.simulator.withInstructor.cancelled || ''}</td>
                                                            <td style={tableDataStyle}></td> {/* Re-Schedule Placeholder */}
                                                            <td style={tableDataStyle}></td> {/* Next Month Placeholder */}
                                                            <td rowSpan={2} style={{ border: '1px solid black', fontWeight: 'bold', color: 'green' }}>{simTotal || ''}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ border: '1px solid black', textAlign: 'left', paddingLeft: '20px' }}>- w/o Instructor</td>
                                                            <td style={tableDataStyle}>{tableData.simulator.withoutInstructor.f2fBatches || ''}</td>
                                                            <td style={tableDataStyle2}>{tableData.simulator.withoutInstructor.f2fTrainees || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.simulator.withoutInstructor.onlineBatches || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.simulator.withoutInstructor.onlineTrainees || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.simulator.withoutInstructor.blendedBatches || ''}</td>
                                                            <td style={tableDataStyle2}>{tableData.simulator.withoutInstructor.blendedTrainees || ''}</td>
                                                            <td style={tableDataStyle}></td>
                                                            <td style={tableDataStyle}>{tableData.simulator.withoutInstructor.cancelled || ''}</td>
                                                            <td style={tableDataStyle}></td>
                                                            <td style={tableDataStyle}></td>
                                                        </tr>
                                                        {/* 2. NON-SIMULATOR SECTION */}
                                                        <tr style={{ fontWeight: 'bold', backgroundColor: '#ffffff' }}><td colSpan={13} style={{ border: '1px solid black', padding: '4px' }}>Non-Simulator Courses</td></tr>
                                                        <tr>
                                                            <td style={{ border: '1px solid black', textAlign: 'left', paddingLeft: '20px' }}>- w/ Instructor</td>
                                                            <td rowSpan={2} style={tableDataStyle}>{tableData.nonSimulator.scheduledTrainees || 0}</td>
                                                            <td style={tableDataStyle}>{tableData.nonSimulator.withInstructor.f2fBatches || ''}</td>
                                                            <td style={tableDataStyle2}>{tableData.nonSimulator.withInstructor.f2fTrainees || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.nonSimulator.withInstructor.onlineBatches || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.nonSimulator.withInstructor.onlineTrainees || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.nonSimulator.withInstructor.blendedBatches || ''}</td>
                                                            <td style={tableDataStyle2}>{tableData.nonSimulator.withInstructor.blendedTrainees || ''}</td>
                                                            <td style={tableDataStyle}></td>
                                                            <td style={tableDataStyle}>{tableData.nonSimulator.withInstructor.cancelled || ''}</td>
                                                            <td style={tableDataStyle}></td>
                                                            <td style={tableDataStyle}></td>
                                                            <td rowSpan={2} style={{ border: '1px solid black', fontWeight: 'bold', color: 'green' }}>{nonSimTotal || ''}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ border: '1px solid black', textAlign: 'left', paddingLeft: '20px' }}>- w/o Instructor</td>
                                                            <td style={tableDataStyle}>{tableData.nonSimulator.withoutInstructor.f2fBatches || ''}</td>
                                                            <td style={tableDataStyle2}>{tableData.nonSimulator.withoutInstructor.f2fTrainees || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.nonSimulator.withoutInstructor.onlineBatches || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.nonSimulator.withoutInstructor.onlineTrainees || ''}</td>
                                                            <td style={tableDataStyle}>{tableData.nonSimulator.withoutInstructor.blendedBatches || ''}</td>
                                                            <td style={tableDataStyle2}>{tableData.nonSimulator.withoutInstructor.blendedTrainees || ''}</td>
                                                            <td style={tableDataStyle}></td>
                                                            <td style={tableDataStyle}>{tableData.nonSimulator.withoutInstructor.cancelled || ''}</td>
                                                            <td style={tableDataStyle}></td>
                                                            <td style={tableDataStyle}></td>
                                                        </tr>
                                                        {/* 3. STCW FLAT ROW */}
                                                        <tr>
                                                            <td style={{ border: '1px solid black', textAlign: 'left', fontWeight: 'bold', paddingLeft: '8px' }}>STCW</td>
                                                            <td style={tableDataStyle}>{tableData.stcw.scheduledTrainees || 0}</td>
                                                            <td style={tableDataStyle}>{(tableData.stcw.withInstructor.f2fBatches + tableData.stcw.withoutInstructor.f2fBatches) || ''}</td>
                                                            <td style={tableDataStyle2}>{(tableData.stcw.withInstructor.f2fTrainees + tableData.stcw.withoutInstructor.f2fTrainees) || ''}</td>
                                                            <td style={tableDataStyle}>{(tableData.stcw.withInstructor.onlineBatches + tableData.stcw.withoutInstructor.onlineBatches) || ''}</td>
                                                            <td style={tableDataStyle}>{(tableData.stcw.withInstructor.onlineTrainees + tableData.stcw.withoutInstructor.onlineTrainees) || ''}</td>
                                                            <td style={tableDataStyle}>{(tableData.stcw.withInstructor.blendedBatches + tableData.stcw.withoutInstructor.blendedBatches) || ''}</td>
                                                            <td style={tableDataStyle2}>{(tableData.stcw.withInstructor.blendedTrainees + tableData.stcw.withoutInstructor.blendedTrainees) || ''}</td>
                                                            <td style={tableDataStyle}></td>
                                                            <td style={tableDataStyle}>{(tableData.stcw.withInstructor.cancelled + tableData.stcw.withoutInstructor.cancelled) || ''}</td>
                                                            <td style={tableDataStyle}></td>
                                                            <td style={tableDataStyle}></td>
                                                            <td style={{border: '1px solid black', fontWeight: 'bold', color: 'green' }}>{stcwTotal || ''}</td>
                                                        </tr>
                                                        {/* 4. MDS FLAT ROW */}
                                                        <tr>
                                                            <td style={{ border: '1px solid black', textAlign: 'left', fontWeight: 'bold', paddingLeft: '8px' }}>MDS</td>
                                                            <td style={tableDataStyle}>{tableData.mds.scheduledTrainees || 0}</td>
                                                            <td style={tableDataStyle}>{(tableData.mds.withInstructor.f2fBatches + tableData.mds.withoutInstructor.f2fBatches) || ''}</td>
                                                            <td style={tableDataStyle2}>{(tableData.mds.withInstructor.f2fTrainees + tableData.mds.withoutInstructor.f2fTrainees) || ''}</td>
                                                            <td style={tableDataStyle}>{(tableData.mds.withInstructor.onlineBatches + tableData.mds.withoutInstructor.onlineBatches) || ''}</td>
                                                            <td style={tableDataStyle}>{(tableData.mds.withInstructor.onlineTrainees + tableData.mds.withoutInstructor.onlineTrainees) || ''}</td>
                                                            <td style={tableDataStyle}>{(tableData.mds.withInstructor.blendedBatches + tableData.mds.withoutInstructor.blendedBatches) || ''}</td>
                                                            <td style={tableDataStyle2}>{(tableData.mds.withInstructor.blendedTrainees + tableData.mds.withoutInstructor.blendedTrainees) || ''}</td>
                                                            <td style={tableDataStyle}></td>
                                                            <td style={tableDataStyle}>{(tableData.mds.withInstructor.cancelled + tableData.mds.withoutInstructor.cancelled) || ''}</td>
                                                            <td style={tableDataStyle}></td>
                                                            <td style={tableDataStyle}></td>
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
                                            <PlannedTrainingSched tableData={tableData} getTotal={getCategoryTotal} getTotalBatches={getTotalBatches} />
                                            <Box mt='4'>
                                                <TrainerPerformanceTable batches={batchCourses || []} allInstructors={allInstructors || []} courseBatch={courseBatch || []} />
                                            </Box>
                                            <Text fontSize="10pt" mt='2' fontWeight="bold" mb="1" color="gray.800">
                                                II. CERTIFICATIONS
                                            </Text>
                                            <CertificationSummaryTable trainingData={filteredTrainList} />
                                        </Box>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Box>
                </Box>
            </ModalBody>
            <ModalFooter>

            </ModalFooter>
        </ModalContent>
    )
}