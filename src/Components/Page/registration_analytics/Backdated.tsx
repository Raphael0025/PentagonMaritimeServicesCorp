'use client'

import React, { useEffect, useState } from 'react';

import { Box, Button, Select, Text, Tooltip, Table, Thead, Tbody, Tr, Th, Td, TableContainer,} from '@chakra-ui/react'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useClients } from '@/context/ClientCompanyContext'

import { TRAINING_BY_ID, REGISTRATION_BY_ID, TRAINEE_BY_ID } from '@/types/trainees'

import { GET_MONTHLY_DATA } from '@/lib/trainee_controller'
import { GET_TOTAL_COUNT_MONTHLY, GET_CUSTOMERS_GROUP_BY_COMPANY, GET_CUSTOMERS_GROUP_BY_UNTAPPED_COMPANY } from '@/handlers/registration_report_handler'

export default function BackDated(){
    const { data: allClients } = useClients()
    const { data: allTrainee } = useTrainees()
    const { lastMonthReg: allRegistrations, setMonth: setRMonth, setYear: setRYear } = useRegistrations()
    const { data: allTraining, setMonth: setTMonth, setYear: setTYear } = useTraining()

    const initialMonth = new Date().getMonth()
    const initialYear = new Date().getFullYear()

    const startYear = 2024
    const endYear = new Date().getFullYear() + 5

    const [data, setData] = useState<TRAINING_BY_ID[]>([])

    const [monthTotal, setTotal] = useState<number>(0)
    const [companyE, setTotalCompany] = useState<number>(0)
    const [accountMgmtOff, setTotalAMO] = useState<number>(0)
    const [consultancy, setTotalConsult] = useState<number>(0)
    const [reEnrolled, setTotalReEnrolled] = useState<number>(0)
    const [walkIn, setTotalWalkIn] = useState<number>(0)
    const [agent, setTotalAgent] = useState<number>(0)
    const [fb, setTotalFB] = useState<number>(0)
    const [others, setTotalOthers] = useState<number>(0)
    const [inquiry, setTotalInquiry] = useState<number>(0)
    const [cancelled, setTotalCancelled] = useState<number>(0)
    const [visitors, setTotalVisitors] = useState<number>(0)

    const [groupByCompany, setGroupByCompany] = useState<{ company: string; ccCharge: number; crewCharge: number }[]>([]);
    const [groupByUntappedCompany, setGroupByUntappedCompany] = useState<{ company: string; ccCharge: number; crewCharge: number }[]>([]);

    const [month, setMonth] = useState<number>(initialMonth)
    const [year, setYear] = useState<number>(initialYear)

    const [loading, setLoading] = useState<boolean>(false)

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    useEffect(() => {
        const fetchTotal = async () => {
        setLoading(true); // start loading

        try {
            const result = await GET_MONTHLY_DATA(month, year, 0);

            const total_monthly = await GET_TOTAL_COUNT_MONTHLY(result, 'overall')
            setTotal(total_monthly);
            
            const total_ce = await GET_TOTAL_COUNT_MONTHLY(result, 'company')
            setTotalCompany(total_ce);
            
            const total_amo = await GET_TOTAL_COUNT_MONTHLY(result, 'accountMgmtOff')
            setTotalAMO(total_amo);
            
            const total_consult = await GET_TOTAL_COUNT_MONTHLY(result, 'consultancy')
            setTotalConsult(total_consult);
            
            const total_reenrolled = await GET_TOTAL_COUNT_MONTHLY(result, 're_enrolled')
            setTotalReEnrolled(total_reenrolled);
            
            const total_walkin = await GET_TOTAL_COUNT_MONTHLY(result, 'walkIn')
            setTotalWalkIn(total_walkin);
            
            const total_agent = await GET_TOTAL_COUNT_MONTHLY(result, 'agent')
            setTotalAgent(total_agent);
            
            const total_fb = await GET_TOTAL_COUNT_MONTHLY(result, 'fb')
            setTotalFB(total_fb);
            
            const total_others = await GET_TOTAL_COUNT_MONTHLY(result, 'others')
            setTotalOthers(total_others);
            
            const total_inquiry = await GET_TOTAL_COUNT_MONTHLY(result, 'inquiry')
            setTotalInquiry(total_inquiry);
            
            const total_cancel = await GET_TOTAL_COUNT_MONTHLY(result, 'cancelled')
            setTotalCancelled(total_cancel);
            
            const total_visitors = await GET_TOTAL_COUNT_MONTHLY(result, 'visitors')
            setTotalVisitors(total_visitors);
            
            if (allTrainee && allRegistrations && allClients) {
                const grouped = await GET_CUSTOMERS_GROUP_BY_COMPANY(
                    result,
                    allTrainee,
                    allRegistrations,
                    allClients
                );
                setGroupByCompany(grouped)
                
            }
            
            setData(result || []);
        } catch (error) {
            console.error(error);
            setData([]);
        } finally {
            setLoading(false); // stop loading
        }
    };
        fetchTotal();
    }, [month, year, allTrainee, allRegistrations]);

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value, 10);
        setMonth(newMonth)
        setTMonth(newMonth)
        setRMonth(newMonth)
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value, 10);
        setYear(newYear)
        setTYear(newYear)
        setRYear(newYear)
    };

    return(
    <> 
    <main className="w-full space-y-3">
        <Box>
            <Box display='flex' alignItems='center' gap='5px' justifyContent='end'>
                <Text fontSize='xs' fontWeight='500'>Filter Date:</Text>
                <Box display='flex' alignItems='end' gap='5px' justifyContent='end'>
                    <Select w='120px' size='xs' value={month} onChange={handleMonthChange}>
                        {months.map((m, i) => (
                            <option key={i} value={i}>
                                {m}
                            </option>
                        ))}
                    </Select>
                    <Select w='100px' size='xs' value={year} onChange={handleYearChange}>
                        {Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
                        .map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </Select>
                </Box>
                <Button size='sm' fontWeight='500' colorScheme='blue' bgColor='blue.700'>Generate Report</Button>
            </Box>
            <Box display={'flex'} gap='4'>    
                <Box>
                    <Box>
                        <Text>TOTAL # OF CUSTOMERS ASSISTED:</Text>
                    </Box>
                    <Box>
                        <TableContainer w='100%' fontWeight='400' fontSize={'8pt'} border='1px solid gray' borderRadius='5px'>
                            <Table variant='simple'>
                                <Thead>
                                    <Tr>
                                        <Th>ENROLLED</Th>
                                        <Th>TOTAL</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr >
                                        <Td px='4' py='0'>Company Endorsement</Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{companyE}</Td>
                                        )}
                                    </Tr>
                                    <Tr>
                                        <Td px='4' py='0'>Account Management Officer</Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{accountMgmtOff}</Td>
                                        )}                                   </Tr>
                                    <Tr>
                                        <Td px='4' py='0'>Consultancy</Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{consultancy}</Td>
                                        )}                                   </Tr>
                                    <Tr>
                                        <Td px='4' py='0'>Re-Enrolled</Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{reEnrolled}</Td>
                                        )}
                                    </Tr>
                                    <Tr>
                                        <Td px='4' py='0'>Walk-in</Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{walkIn}</Td>
                                        )}
                                    </Tr>
                                    <Tr>
                                        <Td px='4' py='0'>Agent</Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{agent}</Td>
                                        )}                                   </Tr>
                                    <Tr>
                                        <Td px='4' py='0'>FB</Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{fb}</Td>
                                        )}
                                    </Tr>
                                    <Tr>
                                        <Td px='4' py='0'>Others</Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{others}</Td>
                                        )}                                   </Tr>
                                    <Tr>
                                        <Td py='2'>{/** Blank row */}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td px='4' py='0'>INQUIRY</Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{inquiry}</Td>
                                        )}                                   </Tr>
                                    <Tr>
                                        <Td py='2'>{/** Blank row */}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td px='4' py='0'>CANCELLED/WITHDRAWN</Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{cancelled}</Td>
                                        )}
                                    </Tr>
                                    <Tr>
                                        <Td py='2'>{/** Blank row */}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td px='4' py='0'>VISITORS</Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{visitors}</Td>
                                        )}                                   </Tr>
                                    <Tr>
                                        <Td py='0'></Td>
                                        {loading ? (
                                            <Td fontWeight='800' px='4' py='0'>Loading...</Td>   // or use Chakra's <Spinner />
                                        ) : (
                                            <Td fontWeight='800' px='4' py='0'>{monthTotal}</Td>
                                        )}
                                    </Tr>
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
                <Box >
                    <Box>
                        <Text>II. CUSTOMERS GROUP BY COMPANY</Text>
                    </Box>
                    <Box>
                        <TableContainer w="100%" fontWeight="400" fontSize="8pt" border="1px solid gray" borderRadius="5px">
                            <Table variant="simple">
                            <Thead>
                                <Tr>
                                <Th>Company</Th>
                                <Th isNumeric>Company Charge</Th>
                                <Th isNumeric>Crew Charge</Th>
                                <Th isNumeric>Total</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {loading ? (
                                <Tr>
                                    <Td colSpan={4} textAlign="center" fontWeight="800">Loading...</Td>
                                </Tr>
                                ) : (
                                    groupByCompany.map((g, idx) => (
                                        <Tr key={idx}>
                                            <Td>
                                                <Tooltip className='text-center' aria-label='tooltip' label={allClients?.find((client) => client.id === g.company)?.company || g.company}>
                                                    <Text w="200px" noOfLines={1} className='text-wrap'>
                                                        {allClients?.find((client) => client.id === g.company)?.company || g.company}
                                                    </Text>    
                                                </Tooltip>
                                            </Td>
                                            <Td isNumeric>{g.ccCharge}</Td>
                                            <Td isNumeric>{g.crewCharge}</Td>
                                            <Td isNumeric>{g.ccCharge + g.crewCharge}</Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
            </Box>
        </Box>
    </main>
    </>
    )
}