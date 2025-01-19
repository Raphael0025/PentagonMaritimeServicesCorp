'use client'

import React, { useEffect, useState } from 'react';

import { Box, Heading, Text, Circle, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel} from '@chakra-ui/react'
import EmployeeIcon from '@/Components/Icons/EmployeeIcon'
import NewTraineeIcon from '@/Components/Icons/NewTraineeIcon'
import ColoredLoader from '@/Components/Icons/ColoredLoader'
import PieChatWithLabel from '@/Components/PieChartWithLabel'
import MixedBarChartComponent from '@/Components/MixedBarChartComponent'

import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'

export default function Page(){
    // const {data: allCourses} = useCourses()
    // const {data: allTrainee} = useTrainees()
    // const {data: allTrainings} = useTrainings()
    // const {data: allRegistrations} = useRegistrations()

    // const [courseCounts, setCourseCounts] = useState<CourseCount>(initialCourseCounts);
    // const [companyCounts, setCompanyCounts] = useState<{ company: string; count: number }[]>([]);

    // const [currentTotal, setCurrTotal] = useState<number>(0)
    // const [totalOnsite, setOnsite] = useState<number>(0)
    // const [totalOnline, setOnline] = useState<number>(0)
    
    // const [loading, setLoading] = useState<boolean>(true)

    // const [totalAgent, setAgent] = useState<number>(0)
    // const [totalWalk, setWalk] = useState<number>(0)
    // const [totalSoc, setSocMed] = useState<number>(0)
    // const [totalCompany, setCompany] = useState<number>(0)
    // const [totalOthers, setOthers] = useState<number>(0)
    // const [totalTrainees, setTotal] = useState<number>(0)
    
    // const [totalAgentArr, setAgentArr] = useState<number[]>([])
    // const [totalWalkArr, setWalkArr] = useState<number[]>([])
    // const [totalSocArr, setSocMedArr] = useState<number[]>([])
    // const [totalCompanyArr, setCompanyArr] = useState<number[]>([])
    // const [totalOthersArr, setOthersArr] = useState<number[]>([])
    // const [monthlyTrainees, setByMonth] = useState<number[]>([])

    // const [recentEnrollees, setRecentEnrollees] = useState<string[]>([])

    // // Generate random data for each dataset
    // const datasets1 = [
    //     {
    //         label: 'Agent',
    //         data: totalAgentArr, // Random numbers between -100 and 100
    //         backgroundColor: 'rgba(13, 122, 171, 1)', // Red color with transparency
    //         stack: 'Stack 0',
    //     },
    //     {
    //         label: 'Walk-in',
    //         data: totalWalkArr, // Random numbers between -100 and 100
    //         backgroundColor: 'rgba(0, 148, 211, 1)', // Blue color with transparency
    //         stack: 'Stack 0',
    //     },
    //     {
    //         label: 'Social Media',
    //         data: totalSocArr, // Random numbers between -100 and 100
    //         backgroundColor: 'rgba(26, 43, 86, 1)', // Red color with transparency
    //         stack: 'Stack 0',
    //     },
    //     {
    //         label: 'Company',
    //         data: totalCompanyArr, // Random numbers between -100 and 100
    //         backgroundColor: 'rgba(133, 196, 237, 1)', // Blue color with transparency
    //         stack: 'Stack 0',
    //     },
    //     {
    //         label: 'Others',
    //         data: totalOthersArr, // Random numbers between -100 and 100
    //         backgroundColor: 'rgba(133, 196, 237, 1)', // Blue color with transparency
    //         stack: 'Stack 0',
    //     },
    //     {
    //         label: 'Total Trainees',
    //         data: monthlyTrainees, // Random numbers between -100 and 100
    //         backgroundColor: 'rgba(75, 192, 192, 1)', // Green color with transparency
    //         stack: 'Stack 1',
    //     },
    // ]

    // useEffect(() => {
    //     const fetchData = async () => {
    //         setLoading(true)
    //         try {
    //             // Check if all data is available before proceeding
    //             if (!allTrainee || !allRegistrations || !allCourses || !allTrainings) return;
    
    //             const { sortedMergedRegistrations, total, online, onsite, agent, walkin, socMed, company, others, byMonth, agentArr, walkArr, socMedArr, companyArr, othersArr, enrolledCourses, currTotal } = await getTotalTraineesData(allTrainee, allCourses, allRegistrations, allTrainings);
    //             //setRecentEnrollees(sortedMergedRegistrations as CombinedTraineeRegistrationDetails[])
    //             setTotal(total);
    //             setOnline(online);
    //             setOnsite(onsite);
    //             setAgent(agent);
    //             setWalk(walkin);
    //             setSocMed(socMed);
    //             setCompany(company);
    //             setOthers(others);
    //             setByMonth(byMonth);
    //             setAgentArr(agentArr);
    //             setWalkArr(walkArr);
    //             setSocMedArr(socMedArr);
    //             setCompanyArr(companyArr);
    //             setOthersArr(othersArr);
    //             setCurrTotal(currTotal);
    //             setCourseCounts(enrolledCourses);
    //             // Initialize an empty object to store the company counts
    //             const companyCount: CompanyCount = {}
    //             // Iterate through all trainees and count the occurrences of each company
    //             allTrainee && allTrainee.forEach(trainee => {
    //                 const company = trainee.company.toUpperCase().replace(/\s+/g, '');
    //                 // Check if the company already exists in the companyCounts object
    //                 if (company in companyCount) {
    //                     // If it exists, increment the count
    //                     companyCount[company]++;
    //                 } else {
    //                     // If it doesn't exist, initialize the count to 1
    //                     companyCount[company] = 1;
    //                 }
    //             })
    //             // Transform the object into an array of { company, count } objects
    //             const companyCountArray = Object.entries(companyCount)
    //                 .map(([company, count]) => ({ company, count }))
    //                 .sort((a, b) => b.count - a.count) // Sort by count in descending order
    //                 .slice(0, 10); // Take the top 10

    //             // Set the company counts state
    //             setCompanyCounts(companyCountArray);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
    //     // Fetch initial data
    //     fetchData()
    // }, [allCourses, allTrainee, allTrainings, allRegistrations])

    // const TraineeClassification = {
    //     labels: ['Agent', 'Company', 'Walk-in', 'Social Media', 'Others'],
    //     datasets: [
    //         {
    //             label: 'No. of Enrollees',
    //             data: [totalAgent, totalCompany, totalWalk, totalSoc, totalOthers],
    //             backgroundColor: [
    //             'rgba(255, 99, 132, 0.2)',
    //             'rgba(47, 103, 178, 0.2)',
    //             'rgba(26, 43, 86, 0.7)',
    //             'rgba(28, 67, 126, 0.7)',
    //             'rgba(133, 196, 237, 0.7)',
    //             ],
    //             borderColor: [
    //             'rgba(255, 99, 132, 1)',
    //             'rgba(47, 103, 178, 1)',
    //             'rgba(26, 43, 86, 1)',
    //             'rgba(28, 67, 126, 1)',
    //             'rgba(133, 196, 237, 1)',
    //             ],
    //             borderWidth: 1,
    //         },
    //     ],
    // }

    // const TotalOnsiteOnline = {
    //     labels: ['On-Site', 'Online'],
    //     datasets: [
    //         {
    //             label: 'No. of Enrollees',
    //             data: [totalOnsite, totalOnline,],
    //             backgroundColor: [
    //             'rgba(255, 99, 132, 0.2)',
    //             'rgba(54, 162, 235, 0.2)',
    //             ],
    //             borderColor: [
    //             'rgba(255, 99, 132, 1)',
    //             'rgba(54, 162, 235, 1)',
    //             ],
    //             borderWidth: 1,
    //         },
    //     ],
    // }

    return(
    <> 
    {/* <main className='flex space-y-4 px-6 flex-col'>
        <section className='w-2/5 grid grid-flow-col grid-cols-2 md:grid-flow-row gap-4'>
            <Box bgGradient='linear(to-br, #fff, #fff, #0D70AB60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3  rounded border-t border-gray-200 items-center '>
                <Box className='w-full'>
                {loading ? ( // Render loading text if loading is true
                    <ColoredLoader />
                ) : ( // Render total online trainees if loading is false
                <>
                    <Heading as='h4' size='lg' textAlign='center' >{currentTotal}</Heading>
                    <Text color='#a1a1a1'>New Trainees</Text>
                </>
                )}
                </Box>
                <Circle size='50px' bg='#2F67B250'>
                    <NewTraineeIcon />
                </Circle>
            </Box>
            <Box bgGradient='linear(to-br, #fff, #fff, #0D70AB60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3  rounded border-t border-gray-200 items-center '>
                <Box>
                {loading ? ( // Render loading text if loading is true
                    <ColoredLoader />
                ) : ( // Render total onsite trainees if loading is false
                <>
                    <Heading as='h4' size='lg' textAlign='center' >{totalTrainees}</Heading>
                    <Text color='#a1a1a1'>Total Trainees Enrolled</Text>
                </>
                )}
                </Box>
                <Circle size='50px' bg='#2F67B250'>
                    <EmployeeIcon />
                </Circle>
            </Box>
        </section>
        <section className='w-full flex space-x-4 justify-evenly'>
            <Box className='rounded shadow-md border p-3 border-slate-500 content_graph'>
                <MixedBarChartComponent datasets={datasets1} />
            </Box>
            <PieChatWithLabel chartData={TraineeClassification} title={'Trainee Classification'}/>
            <PieChatWithLabel chartData={TotalOnsiteOnline} title={'Total Registered Onsite/Online'} />
        </section>
        <section className='w-full grid gap-4 grid-cols-5' style={{minHeight: '300px'}}>
            <Box className='shadow-md rounded border border-slate-500 p-4 col-span-3 h-full' style={{ maxHeight: '300px'}}>
                <div className='space-y-1' style={{ height: '100%' }}>
                    <Heading as='h6' fontSize='md' color='#0D70AB' >Recently Registered</Heading>
                    <div className='flex justify-between p-2 border-b-2 border-slate-400'>
                        <h3 style={{width: '100%', color: '#a1a1a1' }}>Full Name</h3>
                        <h3 style={{width: '70%', color: '#a1a1a1' }}>Rank/Position</h3>
                        <h3 style={{width: '100%', textAlign: 'start', color: '#a1a1a1' }}>{`Seafarer's Ref. Number`}</h3>
                        <h3 style={{width: '100%', textAlign: 'center', color: '#a1a1a1' }}>Date Enrolled</h3>
                    </div>
                    <div className='space-y-2' style={{ height: 'calc(100% - 60px)', overflowY: 'scroll' }}>
                        <Accordion allowToggle >    
                        {recentEnrollees.map((trainee, index) => (
                            <AccordionItem key={index} > 
                                <AccordionButton>
                                    <div className='flex p-2 py-4 justify-between w-full'>
                                        <p style={{width: '100%', textAlign: 'start', textTransform: 'uppercase', fontSize: 10 }}>{`${trainee.last_name}, ${trainee.given_name}`}</p>
                                        <p style={{width: '70%', textAlign: 'start', fontSize: 10 }}>{`${trainee.rank}`}</p>
                                        <p style={{width: '100%', textAlign: 'center', fontSize: 10 }}>{`${trainee.srn}`}</p>
                                        <p style={{width: '100%', textAlign: 'center', fontSize: 10 }}>{formatDate(trainee.trainee_added.toDate())}</p>
                                    </div>
                                <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel p={4} mb={0}>
                                    <div className='flex justify-between'>
                                        <p style={{ width: '100%', fontSize: 10 }}>Course Code</p>
                                        <p style={{ width: '100%', fontSize: 10 }}>Training Schedule</p>
                                        <p style={{ width: '100%', textAlign: 'center', fontSize: 10 }}>Mode of Payment</p>
                                        <p style={{ width: '100%', textAlign: 'center', fontSize: 10 }}>Course Fee</p>
                                    </div>
                                    {allTrainings && allTrainings.filter(training => training.ref_id === trainee.id).length === 0 ? (
                                        <Box className=' w-full rounded'>
                                            <Text className='p-3 text-center w-full text-gray-400'>No training data available.</Text>
                                        </Box>
                                    ) : (
                                        allTrainings && allTrainings.filter(training => training.ref_id === trainee.id).map((training, trainingIndex) => (
                                            <Box key={trainingIndex} className='content-one rounded border-b-2 mt-1 border-slate-300 p-1 px-3'>
                                                <Box className='flex flex-col w-full'>
                                                    <Text>{training.course}</Text>
                                                </Box>
                                                <Box className='flex flex-col w-full'>
                                                    <Text>{training.training_sched}</Text>
                                                    <Text fontSize='xs'>{formatTime(training.timeSched)}</Text>
                                                </Box>
                                                <Box className='flex flex-col w-full'>
                                                    <Text textAlign='center'>{training.payment_mode}</Text>
                                                </Box>
                                                <Box className='flex flex-col w-full'>
                                                    <Text textAlign='center'>{`Php ${training.training_fee}.00`}</Text>
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                </AccordionPanel>
                            </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </Box> 
            <Box className='shadow-md rounded border border-slate-500 p-3' style={{ maxHeight: '300px' }}>
                <div className='space-y-1' style={{ height: '100%' }}>
                    <Heading as='h6' fontSize='sm' color='#0D70AB' >Top Companies</Heading>
                    <div className='flex justify-between p-2 border-b-2 border-slate-400'>
                        <h3 style={{width: '100%', textAlign: 'center', color: '#a1a1a1' }}>Companies</h3>
                        <h3 style={{width: '100%', textAlign: 'center', color: '#a1a1a1' }}>Trainees</h3>
                    </div>
                    <div className='space-y-2' style={{ height: 'calc(100% - 50px)', overflowY: 'scroll' }}>
                    {loading ? (
                        <div className='flex justify-center items-center h-full'>
                            <ColoredLoader />
                        </div>
                    ) : (
                        companyCounts.map(({ company, count }) => (
                            <div className='flex justify-between p-2 py-4 rounded hover:bg-zinc-200 border-b-2 border-slate-300' key={company}>
                                <p className='w-full text-center uppercase'>{company}</p>
                                <p className='w-full text-center'>{count}</p>
                            </div>
                        ))
                    )}
                    </div>
                </div>
            </Box>
            <Box className='shadow-md rounded border border-slate-500 p-3' style={{ maxHeight: '300px' }}>
                <div className='space-y-1' style={{ height: '100%' }}>
                    <Heading as='h6' fontSize='sm' color='#0D70AB' >Top Courses Enrolled</Heading>
                    <div className='flex justify-between p-2 border-b-2 border-slate-400'>
                        <h3 style={{width: '100%', textAlign: 'start', color: '#a1a1a1' }}>Course</h3>
                        <h3 style={{width: '100%', textAlign: 'center', color: '#a1a1a1' }}>Enrolled</h3>
                    </div>
                    <div className='space-y-2' style={{ height: 'calc(100% - 50px)', overflowY: 'scroll' }}>
                    {loading ? (
                        <div className='flex justify-center items-center h-full'>
                            <ColoredLoader />
                        </div>
                    ) : (
                    <>
                    {Object.entries(courseCounts).map(([courseCode, count], index) => (
                        <div className='flex justify-between p-2 py-4 rounded hover:bg-zinc-200 border-b-2 border-slate-300' key={index}>
                            <p className='w-full text-start uppercase'>{courseCode}</p>
                            <p className='w-full text-center capitalize'>{`${count} enrollee(s)`}</p>
                        </div>
                    ))}
                    </>
                    )}
                    </div>
                </div>
            </Box>
        </section>
    </main> */}
    </>
    )
}