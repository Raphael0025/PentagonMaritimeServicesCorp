'use client'

import { Timestamp } from 'firebase/firestore'
import React, { useState, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

import { Image as ChakraImage, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea, ModalCloseButton, Box, Text, Input, Button, useToast,  } from '@chakra-ui/react'
import { PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'

import { ToastStatus } from '@/types/handling'
import { BATCH_ANALYSIS, } from '@/types/training'
import { InstructorByID } from '@/types/instructor'
import { CourseBatchByID } from '@/types/course-batches'
import { TrainingReportByID, TrainingReport, initTrainingReport, Issues_Challenges, initIssues_Challenges, PlannedTrainingSchedMD } from '@/types/ReportMetadata.model'

import { CertificationSummaryTable } from './MiscTables/CertificationSummaryTable'
import PlannedTrainingSched from './MiscTables/PlannedTrainingSched'
import SimuVsNonSimu from './BarChart/SimuVsNonSimu'
import TrainerPerformanceTable from './MiscTables/TrainerPerformanceTable'

import { useReportMetaData } from '@/context/ReportMetaDataContext'
import { GENERATE_REPORT, UPDATE_REPORT } from '@/lib/ReportMetadata.controller'

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
    const { data: fetchedReportData } = useReportMetaData()

    const [ reportMetaData, setReport ] = useState<TrainingReport | null>(initTrainingReport)
    const [ reportDbMetaData, setDbReport ] = useState<TrainingReportByID | null>({...initTrainingReport, id: '', generatedAt: Timestamp.now(), generatedBy: '',})
    const [ issuesArr, setIssuesArr ] = useState<Issues_Challenges>(initIssues_Challenges)

    useEffect(() => {
        // 2. Loop / find the unique record matching the selected month and year
        const matchedRecord = fetchedReportData?.find(report => 
            report?.month === monthSelected && 
            report?.year === yearSelected
        );

        if (matchedRecord) {
            setReport({
                ...initTrainingReport, 
                ...matchedRecord,   
                plannedTrainingSched: {
                    ...initTrainingReport.plannedTrainingSched,
                    ...(matchedRecord.plannedTrainingSched || {})
                },
                month: monthSelected,
                year: yearSelected,
            });
    
            // 🟢 FIX 2: Set the database trace parameters correctly on track 2
            setDbReport({
                id: matchedRecord.id,
                generatedAt: matchedRecord.generatedAt,
                generatedBy: matchedRecord.generatedBy || ''
            });
            return;
        }
        // Default clear fallbacks if no match found
        setReport({ ...initTrainingReport, month: monthSelected, year: yearSelected });
        setDbReport(null); // Reset ID state track cleanly
    }, [fetchedReportData, monthSelected, yearSelected])

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

    const handleIssueFieldChange = (index: number, field: keyof IssuesChallenges, value: string) => {
        setReport((prev) => {
            if (!prev) return prev;
    
            // 1. Copy the existing issues list safely
            const updatedIssues = [...(prev.issues_challenges || [])];
    
            // 2. Update the target field on the specific row index
            updatedIssues[index] = {
                ...updatedIssues[index],
                [field]: value
            };
    
            // 3. Return the updated master state layout tree
            return {
                ...prev,
                issues_challenges: updatedIssues
            };
        });
    }

    const addNewIssueRow = () => {
        setReport((prev) => {
            if (!prev) return prev;
    
            // 1. Create a blank blueprint layout mapping your interface properties
            const newRow: IssuesChallenges = {
                issue: '',
                action: '',
                recommend: '',
                responsible: '',
                timeline: '',
                status: 'Pending' // Set a helpful default state string if desired
            };
    
            // 2. Return state with the new blank row added safely at the tail end
            return {
                ...prev,
                issues_challenges: [...(prev.issues_challenges || []), newRow]
            };
        });
    }

    const removeIssueRow = (indexToRemove: number) => {
        setReport((prev) => {
            if (!prev) return prev;
    
            // Filter out the item that matches the targeted index position
            const updatedIssues = (prev.issues_challenges || []).filter(
                (_, index) => index !== indexToRemove
            );
    
            return {
                ...prev,
                issues_challenges: updatedIssues
            }
        })
    }

    const handleListKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
        text: string,
        setText: (val: string) => void
      ) => {
        const textarea = e.currentTarget;
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
      
        // 1. Extract the current line the cursor is resting on
        const textBeforeCursor = text.substring(0, selectionStart);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines[lines.length - 1];
      
        // Match: "1. ", "  2. ", "a. ", "  b. " (Supports spaces, digits/letters, a literal dot, and a trailing space)
        const listMatch = currentLine.match(/^(\s*)(\d+|[a-zA-Z])\.\s/);
      
        // 🟢 CASE 1: USER PRESSES ENTER
        if (e.key === 'Enter' && listMatch) {
          e.preventDefault(); // Stop default paragraph break line behavior
      
          const indentation = listMatch[1];
          const currentMarker = listMatch[2];
          let nextMarker = '';
      
          // If it's a digit (e.g., "1"), convert to number and increment it
          if (/^\d+$/.test(currentMarker)) {
            nextMarker = `${Number(currentMarker) + 1}. `;
          } else {
            // If it's an alphabetical character (e.g., "a"), increment char code token
            nextMarker = `${String.fromCharCode(currentMarker.charCodeAt(0) + 1)}. `;
          }
      
          const insertedText = `\n${indentation}${nextMarker}`;
          const newText = text.substring(0, selectionStart) + insertedText + text.substring(selectionEnd);
          
          setText(newText);
      
          // Force React to set the blinking text cursor position right after our new list token prefix
          setTimeout(() => {
            const newCursorPos = selectionStart + insertedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
          }, 0);
        }
      
        // 🟢 CASE 2: USER PRESSES TAB
        if (e.key === 'Tab' && listMatch) {
          e.preventDefault();
      
          const currentLineStart = selectionStart - currentLine.length;
          // Indent by 4 spaces and shift down list indexing layout to target letter formatting "a. "
          const nestedLine = currentLine.replace(/^(\s*)(\d+|[a-zA-Z])\.\s/, '$1    a. ');
          
          const newText = text.substring(0, currentLineStart) + nestedLine + text.substring(selectionEnd);
          setText(newText);
      
          setTimeout(() => {
            const newCursorPos = currentLineStart + nestedLine.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
          }, 0);
        }
    }

    const handleSchedChange = (category: keyof PlannedTrainingSchedMD, field: 'w_oIns' | 'w_Ins', value: number ) => {
        setReport((prev) => {
            // Guard configuration case against an initially empty/partial state
            if (!prev) return prev; 
            
            return {
                ...prev,
                plannedTrainingSched: {
                    ...prev.plannedTrainingSched,
                    [category]: {
                        ...prev.plannedTrainingSched?.[category],
                        [field]: value
                    }
                }
            }
        })
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
            case 'without':
                return (
                    (cat.withoutInstructor?.f2fBatches ?? 0) +
                    (cat.withoutInstructor?.onlineBatches ?? 0) +
                    (cat.withoutInstructor?.blendedBatches ?? 0)
                )
            default:
                return 0;
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

    const handleSaveOrUpdate = async () => {
        const actor: string | null = localStorage.getItem('customToken');
        if (!reportMetaData) return;
    
        try {
            if (reportDbMetaData?.id) {
                await UPDATE_REPORT(reportDbMetaData.id, reportMetaData);
                handleToast('Monthly Report Updated!', ``, 3000, 'success');
            } else {
                // Execute fresh save transaction
                const savedRecord = await GENERATE_REPORT(reportMetaData, actor);
                
                // 🟢 Update Track 2 state with the new database markers
                setDbReport({
                    id: savedRecord.id,
                    generatedAt: new Date(),
                    generatedBy: actor,
                });
    
                handleToast('Monthly Report Saved!', ``, 3000, 'success');
            }
        } catch (error) {
            console.error("Failed to process report details:", error);
            handleToast('Error processing report', 'Please try again.', 3000, 'error');
        }
    }

    return(
        <ModalContent>
            <ModalHeader pt='12' borderRadius='10px' bg='white' display='flex' w='100%' justifyContent='space-between' position='sticky' top='0px' zIndex='docked'>
                <Text fontWeight='bolder' fontSize='xl' color='blue.700'>Report Preview</Text>
                <Box display='flex' gap='4'>
                    <Button 
                        onClick={handleSaveOrUpdate} 
                        colorScheme={reportDbMetaData?.id ? 'teal' : 'blue'} 
                        bgColor={reportDbMetaData?.id ? 'teal.700' : 'blue.700'} 
                        shadow="md"
                    >
                        {reportDbMetaData?.id ? 'Update Details' : 'Save Details'}
                    </Button>
                    <Button onClick={handlePrint} colorScheme='blue' bgColor='blue.700' shadow='md' >Print Report</Button>
                </Box>
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
                                                        <tr style={{ fontWeight: 'bold', backgroundColor: '#ffffff' }}>
                                                            <td colSpan={13} style={{ border: '1px solid black', padding: '4px' }}>Simulator Courses</td>
                                                        </tr>
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
                                            <PlannedTrainingSched tableData={tableData} getTotal={getCategoryTotal} getTotalBatches={getTotalBatches} schedData={reportMetaData?.plannedTrainingSched} onInputChange={handleSchedChange} />
                                            <Box mt='4'>
                                                <TrainerPerformanceTable batches={batchCourses || []} allInstructors={allInstructors || []} courseBatch={courseBatch || []} />
                                            </Box>
                                            <Text fontSize="10pt" mt='2' fontWeight="bold" mb="1" color="gray.800" 
                                                style={{ pageBreakBefore: 'always' }} // Standard inline style
                                                sx={{
                                                    '@media print': {
                                                        breakBefore: 'page', // Modern CSS standard alternative
                                                        marginTop: '0px'    // Reset margin top since it's now at the top of a fresh page
                                                    }
                                                }}
                                            >
                                                II. CERTIFICATIONS
                                            </Text>
                                            <CertificationSummaryTable trainingData={filteredTrainList} />
                                            <Text fontSize="10pt" mt='2' fontWeight="bold" mb="1" color="gray.800">{`III. ISSUES & CHALLENGES`}</Text>
                                            <Box mt="2" maxW="100%" overflowX="auto" p="2" bg="white">
                                                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '200mm', fontSize: '8pt', border: '1px solid black', fontFamily: 'sans-serif' }}>
                                                    <thead >
                                                        <tr style={{ backgroundColor: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>
                                                            <td style={{ border: '1px solid black', width: '180px' }}>ISSUES IDENTIFIED</td>
                                                            <td style={{ border: '1px solid black', width: '180px' }}>ACTION TAKEN</td>
                                                            <td style={{ border: '1px solid black', width: '180px' }}>RECOMMENDATIONS</td>
                                                            <td style={{ border: '1px solid black', width: '120px', whiteSpace: 'normal' }}>RESPONSIBLE PERSON</td>
                                                            <td style={{ border: '1px solid black', width: '180px' }}>TIMELINE</td>
                                                            <td style={{ border: '1px solid black', width: '120px', whiteSpace: 'normal' }}>STATUS/ REMARKS</td>
                                                        </tr>
                                                    </thead>
                                                    <>
                                                    {/* 🟢 Pure Inline Print/Screen CSS Rules Engine Injector */}
                                                        <style dangerouslySetInnerHTML={{__html: `
                                                            @media screen {
                                                                .print-only-row-group { display: none !important; }
                                                            }
                                                            @media print {
                                                                .screen-only-row-group { display: none !important; }
                                                                .print-only-row-group { display: table-row-group !important; }
                                                            }
                                                        `}} />

                                                        {/* 🖥️ SCREEN ONLY BODY */}
                                                        <tbody 
                                                            className="screen-only-row-group" 
                                                            style={{ textAlign: 'center', fontWeight: 'normal' }}
                                                        >
                                                            {reportMetaData?.issues_challenges?.map((item, index) => (
                                                            <tr key={index}>
                                                                <td><Textarea fontSize='8pt' value={item.issue} onChange={(e) => handleIssueFieldChange(index, 'issue', e.target.value)} size="sm"/></td>
                                                                <td><Textarea fontSize='8pt' value={item.action} onChange={(e) => handleIssueFieldChange(index, 'action', e.target.value)} size="sm"/></td>
                                                                <td><Textarea fontSize='8pt' value={item.recommend} onChange={(e) => handleIssueFieldChange(index, 'recommend', e.target.value)} size="sm"/></td>
                                                                <td><Textarea fontSize='8pt' value={item.responsible} onChange={(e) => handleIssueFieldChange(index, 'responsible', e.target.value)} size="sm"/></td>
                                                                <td><Textarea fontSize='8pt' value={item.timeline} onChange={(e) => handleIssueFieldChange(index, 'timeline', e.target.value)} size="sm"/></td>
                                                                <td><Textarea fontSize='8pt' value={item.status} onChange={(e) => handleIssueFieldChange(index, 'status', e.target.value)} size="sm"/></td>
                                                                <td>
                                                                    <Button colorScheme="red" variant="ghost" size="xs" onClick={() => removeIssueRow(index)}> ✕ </Button>
                                                                </td>
                                                            </tr>
                                                            ))}
                                                            <tr>
                                                            <td colSpan={6}>
                                                                <Button onClick={addNewIssueRow} size="sm" colorScheme="green" variant="ghost" w="100%" mt="2">
                                                                + Add New Issue Entry Row
                                                                </Button>
                                                            </td>
                                                            </tr>
                                                        </tbody>
                                                        {/* 🖨️ PRINT ONLY BODY */}
                                                        <tbody 
                                                            className="print-only-row-group" 
                                                            style={{ textAlign: 'start', fontWeight: 'normal' }}
                                                        >
                                                            {reportMetaData?.issues_challenges?.map((item, index) => (
                                                            <tr key={index} style={{ pageBreakInside: 'avoid' }}>
                                                                <td style={{ fontSize: '8pt', padding: '2px 4px', lineHeight: '1.0', border: '1px solid black' }}>{item.issue}</td>
                                                                <td style={{ fontSize: '8pt', padding: '2px 4px', lineHeight: '1.0', border: '1px solid black' }}>{item.action}</td>
                                                                <td style={{ fontSize: '8pt', padding: '2px 4px', lineHeight: '1.0', border: '1px solid black' }}>{item.recommend}</td>
                                                                <td style={{ fontSize: '8pt', padding: '2px 4px', lineHeight: '1.0', border: '1px solid black' }}>{item.responsible}</td>
                                                                <td style={{ fontSize: '8pt', padding: '2px 4px', lineHeight: '1.0', border: '1px solid black' }}>{item.timeline}</td>
                                                                <td style={{ fontSize: '8pt', padding: '2px 4px', lineHeight: '1.0', border: '1px solid black' }}>{item.status}</td>
                                                            </tr>
                                                            ))}
                                                        </tbody>
                                                    </>
                                                </table>
                                            </Box>
                                            <Text fontSize="10pt" mt='2' fontWeight="bold" mb="1" color="gray.800">
                                                {`IV. ACTION PLANS & RECOMMENDATIONS`}
                                            </Text>
                                            <>
                                                {/* 🟢 Inline Print/Screen Visibility Controller */}
                                                <style dangerouslySetInnerHTML={{__html: `
                                                    @media screen {
                                                        .print-only-action-plan { display: none !important; }
                                                    }
                                                    @media print {
                                                        .screen-only-action-plan { display: none !important; }
                                                        .print-only-action-plan { display: block !important; }
                                                    }
                                                `}} />
                                                {/* 🖥️ SCREEN ONLY VIEW: Interactive Textarea with Smart List Handling */}
                                                <div className="screen-only-action-plan">
                                                    <Textarea
                                                        value={reportMetaData?.actionPlan || ''}
                                                        // 🟢 Points to actionPlan field
                                                        onChange={(e) => setReport(prev => prev ? { ...prev, actionPlan: e.target.value } : null)}
                                                        // 🟢 Sends data to the smart keyboard listener
                                                        onKeyDown={(e) => handleListKeyDown(e, reportMetaData?.actionPlan || '', (val) => {
                                                            setReport(prev => prev ? { ...prev, actionPlan: val } : null);
                                                        })}
                                                        placeholder="Type action plans here... (e.g., Type '1. ' then press Enter for '2. ', or Tab to nest an inner 'a. ' list)"
                                                        size="sm"
                                                        minH="150px"
                                                        fontSize="10pt"
                                                    />
                                                </div>
                                                {/* 🖨️ PRINT ONLY VIEW: Displays raw, unboxed clean text summary during document printing */}
                                                <div className="print-only-action-plan" style={{ fontSize: '8pt', fontWeight: 'normal', whiteSpace: 'pre-wrap', lineHeight: '1.0' }}>
                                                    {reportMetaData?.actionPlan || 'No action plans recorded.'}
                                                </div>
                                            </>
                                            <Text fontSize="10pt" mt='2' fontWeight="bold" mb="1" color="gray.800">
                                                V. OTHERS
                                            </Text>
                                            <Box>
                                                {/* 🟢 Consolidated Inline Print/Screen Visibility Controller for Sections A to F */}
                                                <style dangerouslySetInnerHTML={{__html: `
                                                    @media screen {
                                                        .print-section-view { display: none !important; }
                                                    }
                                                    @media print {
                                                        .screen-section-view { display: none !important; }
                                                        .print-section-view { display: block !important; }
                                                    }
                                                `}} />

                                                {/* ==================== A. Improvement Initiatives ==================== reportDbMetaData*/}
                                                <Text fontSize="10pt" mt='2' fontWeight="bold" mb="1" color="gray.800">
                                                    A. Improvement Initiatives
                                                </Text>
                                                <div className="screen-section-view">
                                                    <Textarea
                                                        value={reportMetaData?.improvement || ''}
                                                        onChange={(e) => setReport(prev => prev ? { ...prev, improvement: e.target.value } : null)}
                                                        onKeyDown={(e) => handleListKeyDown(e, reportMetaData?.improvement || '', (val) => {
                                                            setReport(prev => prev ? { ...prev, improvement: val } : null);
                                                        })}
                                                        placeholder="Type improvement initiatives here..."
                                                        size="sm" minH="100px" fontSize="10pt"
                                                    />
                                                </div>
                                                <div className="print-section-view" style={{ fontSize: '8pt', fontWeight: 'normal',  whiteSpace: 'pre-wrap', lineHeight: '1.0', paddingLeft: '10px' }}>
                                                    {reportMetaData?.improvement || ' '}
                                                </div>
                                                {/* ==================== B. List of planned training sessions ==================== */}
                                                <Text fontSize="10pt" mt='2' fontWeight="bold" mb="1" color="gray.800">
                                                    B. List of planned training sessions for the next month
                                                </Text>
                                                <div className="screen-section-view">
                                                    <Textarea
                                                        value={reportMetaData?.plannedTraining || ''}
                                                        onChange={(e) => setReport(prev => prev ? { ...prev, plannedTraining: e.target.value } : null)}
                                                        onKeyDown={(e) => handleListKeyDown(e, reportMetaData?.plannedTraining || '', (val) => {
                                                            setReport(prev => prev ? { ...prev, plannedTraining: val } : null);
                                                        })}
                                                        placeholder="Type planned training sessions here..."
                                                        size="sm" minH="100px" fontSize="10pt"
                                                    />
                                                </div>
                                                <div className="print-section-view" style={{ fontSize: '8pt', fontWeight: 'normal',  whiteSpace: 'pre-wrap', lineHeight: '1.0', paddingLeft: '10px' }}>
                                                    {reportMetaData?.plannedTraining || ' '}
                                                </div>
                                                {/* ==================== C. Upcoming plans for next month ==================== */}
                                                <Text fontSize="10pt" mt='2' fontWeight="bold" mb="1" color="gray.800">
                                                    C. Upcoming plans for next month
                                                </Text>
                                                <div className="screen-section-view">
                                                    <Textarea
                                                        value={reportMetaData?.upcomingPlans || ''}
                                                        onChange={(e) => setReport(prev => prev ? { ...prev, upcomingPlans: e.target.value } : null)}
                                                        onKeyDown={(e) => handleListKeyDown(e, reportMetaData?.upcomingPlans || '', (val) => {
                                                            setReport(prev => prev ? { ...prev, upcomingPlans: val } : null);
                                                        })}
                                                        placeholder="Type upcoming plans here..."
                                                        size="sm" minH="100px" fontSize="10pt"
                                                    />
                                                </div>
                                                <div className="print-section-view" style={{ fontSize: '8pt', fontWeight: 'normal',  whiteSpace: 'pre-wrap', lineHeight: '1.0', paddingLeft: '10px' }}>
                                                    {reportMetaData?.upcomingPlans || ' '}
                                                </div>
                                                {/* ==================== D. Simulator Problems ==================== */}
                                                <Text fontSize="10pt" mt='2' fontWeight="bold" mb="1" color="gray.800">
                                                    D. Simulator Problems
                                                </Text>
                                                <div className="screen-section-view">
                                                    <Textarea
                                                        value={reportMetaData?.simuProblems || ''}
                                                        onChange={(e) => setReport(prev => prev ? { ...prev, simuProblems: e.target.value } : null)}
                                                        onKeyDown={(e) => handleListKeyDown(e, reportMetaData?.simuProblems || '', (val) => {
                                                            setReport(prev => prev ? { ...prev, simuProblems: val } : null);
                                                        })}
                                                        placeholder="Type simulator problems here..."
                                                        size="sm" minH="100px" fontSize="10pt"
                                                    />
                                                </div>
                                                <div className="print-section-view" style={{ fontSize: '8pt', fontWeight: 'normal',  whiteSpace: 'pre-wrap', lineHeight: '1.0', paddingLeft: '10px' }}>
                                                    {reportMetaData?.simuProblems || ' '}
                                                </div>
                                                {/* ==================== E. Additional ==================== */}
                                                <Text fontSize="10pt" mt='2' fontWeight="bold" mb="1" color="gray.800">
                                                    E. Additional
                                                </Text>
                                                <div className="screen-section-view">
                                                    <Textarea
                                                        value={reportMetaData?.additional || ''}
                                                        onChange={(e) => setReport(prev => prev ? { ...prev, additional: e.target.value } : null)}
                                                        onKeyDown={(e) => handleListKeyDown(e, reportMetaData?.additional || '', (val) => {
                                                            setReport(prev => prev ? { ...prev, additional: val } : null);
                                                        })}
                                                        placeholder="Type additional remarks here..."
                                                        size="sm" minH="100px" fontSize="10pt"
                                                    />
                                                </div>
                                                <div className="print-section-view" style={{ fontSize: '8pt', fontWeight: 'normal',  whiteSpace: 'pre-wrap', lineHeight: '1.0', paddingLeft: '10px' }}>
                                                    {reportMetaData?.additional || ' '}
                                                </div>
                                                {/* ==================== F. Facilities ==================== */}
                                                <Text fontSize="10pt" mt='2' fontWeight="bold" mb="1" color="gray.800">
                                                    F. Facilities
                                                </Text>
                                                <div className="screen-section-view">
                                                    <Textarea
                                                        value={reportMetaData?.facilities || ''}
                                                        onChange={(e) => setReport(prev => prev ? { ...prev, facilities: e.target.value } : null)}
                                                        onKeyDown={(e) => handleListKeyDown(e, reportMetaData?.facilities || '', (val) => {
                                                            setReport(prev => prev ? { ...prev, facilities: val } : null);
                                                        })}
                                                        placeholder="Type facility updates here..."
                                                        size="sm" minH="100px" fontSize="10pt"
                                                    />
                                                </div>
                                                <div className="print-section-view" style={{ fontSize: '8pt', fontWeight: 'normal',  whiteSpace: 'pre-wrap', lineHeight: '1.0', paddingLeft: '10px' }}>
                                                    {reportMetaData?.facilities || ' '}
                                                </div>
                                            </Box>
                                        </Box>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Box>
                </Box>
            </ModalBody>
        </ModalContent>
    )
}