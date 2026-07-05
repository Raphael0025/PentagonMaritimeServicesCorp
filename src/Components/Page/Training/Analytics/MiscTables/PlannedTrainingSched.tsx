'use client';
import React from 'react';
import { Input, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Card, CardBody, Text,} from '@chakra-ui/react';

interface PlannedTrainingSchedProps {
    tableData: any;
    getTotal: (cat: any) => number;
    getTotalBatches: (cat: any, category: string) => number;
}

export default function PlannedTrainingSched({tableData, getTotal, getTotalBatches}: PlannedTrainingSchedProps) {
    
    const firstColStyle = {
        textAlign: 'start',
        fontWeight: 'bold',
        borderRight: '1px solid black',
        borderBottom: '1px solid black',
        color: 'black',
        paddingY: '0',
        paddingX: '2',
    }
    
    const dataColStyle = {
        textAlign: 'center',
        fontWeight: 'normal',
        borderRight: '1px solid black',
        borderBottom: '1px solid black',
        color: 'black',
        paddingY: '0',
        paddingX: '2',
    }
    
    const dataColTotalStyle = {
        textAlign: 'center',
        fontWeight: 'bold',
        borderRight: '1px solid black',
        borderBottom: '1px solid black',
        color: 'black',
        paddingY: '0',
        paddingX: '2',
    }
    
    const lastColStyle = {
        textAlign: 'start',
        fontWeight: 'bold',
        borderBottom: '1px solid black',
        color: 'black',
        paddingY: '0',
        paddingX: '2',
    }
    
    const firstColStyle3 = {
        ...firstColStyle,
        textAlign: 'end !important'
    }

    const firstColStyle2 = {
        fontStyle: 'italic',
        borderRight: '1px solid black',
        borderBottom: '1px solid black',
        color: 'black',
        paddingY: '0',
        paddingX: '2',
    }

    const inputStyle = {
        // size='xs' p='0' fontSize='8pt' borderBottom='none'  variant='flushed' textAlign='center'
        textAlign: 'center',
        fontSize: '8pt',
        borderBottom: 'none',
        padding: '0',
    }

    const grandTotalCancelled = tableData.stcw.withInstructor.cancelled 
    + tableData.stcw.withoutInstructor.cancelled
    + tableData.mds.withoutInstructor.cancelled
    + tableData.mds.withoutInstructor.cancelled
    + tableData.nonSimulator.withoutInstructor.cancelled
    + tableData.simulator.withoutInstructor.cancelled
    + tableData.nonSimulator.withoutInstructor.cancelled
    + tableData.simulator.withoutInstructor.cancelled

    const simTotal = getTotal(tableData.simulator);
    const nonSimTotal = getTotal(tableData.nonSimulator);
    const stcwTotal = getTotal(tableData.stcw);
    const mdsTotal = getTotal(tableData.mds);
    const grandTotal = simTotal + nonSimTotal + stcwTotal + mdsTotal;

    const stcwBatchesWInsTotal = getTotalBatches(tableData.stcw, 'with');
    const stcwBatchesWOInsTotal = getTotalBatches(tableData.stcw, 'without');
    const mdsBatchesWInsTotal = getTotalBatches(tableData.mds, 'with');
    const mdsBatchesWOInsTotal = getTotalBatches(tableData.mds, 'without');
    const nonSimBatchesWInsTotal = getTotalBatches(tableData.nonSimulator, 'with');
    const nonSimBatchesWOInsTotal = getTotalBatches(tableData.nonSimulator, 'without');
    const simBatchesWInsTotal = getTotalBatches(tableData.simulator, 'with');
    const simBatchesWOInsTotal = getTotalBatches(tableData.simulator, 'without');
    
    const grandBatchesTotal = stcwBatchesWInsTotal + stcwBatchesWOInsTotal + mdsBatchesWInsTotal + mdsBatchesWOInsTotal + nonSimBatchesWInsTotal + nonSimBatchesWOInsTotal + simBatchesWInsTotal + simBatchesWOInsTotal;

    return (
    <>  
        <Text mt='4' fontSize='10pt' fontWeight='normal'>Percentage compliance with planned training schedule.</Text>
        <Card boxShadow="none" m="1" bg="white">
            <CardBody p="1">
                <TableContainer border="1px solid black" borderBottom='none'>
                    <Table variant="simple" layout='fixed'>
                        <Thead bg="white">
                            <Tr >
                                <Th rowSpan={2} w='160px' borderRight="1px solid black" color="black" fontSize="8pt" fontWeight="bold" px="3" py="0"></Th>
                                <Th colSpan={3} borderBottom='1px solid black' textAlign='center' borderRight="1px solid black" color="black" fontSize="8pt" fontWeight="bold" px="3" py="0">NO. OF BATCHES</Th>
                                <Th rowSpan={2} w='125px' wordBreak='break-word' whiteSpace='normal' textAlign='center' borderRight="1px solid black" color="black" fontSize="8pt" fontWeight="bold" px="3" py="0">NO. OF TRAINEES GRADUATED</Th>
                                <Th rowSpan={2} w='105px' wordBreak='break-word' whiteSpace='normal' textAlign='center' borderRight="1px solid black" color="black" fontSize="8pt" fontWeight="bold" px="3" py="0">CANCELLED TRAINEES</Th>
                                <Th rowSpan={2} w='105px' wordBreak='break-word' whiteSpace='normal' textAlign='center' color="black" fontSize="8pt" fontWeight="bold" px="3" py="0">RESCHEDULED TRAINEES</Th>
                            </Tr>
                            <Tr borderBottom="2px solid black">
                                <Th colSpan={1} textAlign='center' borderRight="1px solid black" color="black" fontSize="8pt" fontWeight="bold" px="3" py="0">SCHEDULED</Th>
                                <Th colSpan={1} textAlign='center' borderRight="1px solid black" color="black" fontSize="8pt" fontWeight="bold" px="3" py="0">CONDUCTED</Th>
                                <Th colSpan={1} textAlign='center' borderRight="1px solid black" color="black" fontSize="8pt" fontWeight="bold" px="3" py="0">%</Th>
                            </Tr>
                        </Thead>
                        <Tbody fontSize='8pt' textTransform='uppercase' fontWeight='normal'>
                            <Tr >
                                <Td sx={firstColStyle} >STCW</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} ></Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} >{stcwTotal || '-'}</Td>
                                <Td sx={dataColStyle} >{(tableData.stcw.withInstructor.cancelled + tableData.stcw.withoutInstructor.cancelled) || '-'}</Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >With Instructor</Td>
                                <Td sx={dataColStyle} >
                                    <Input sx={inputStyle} size='xs' variant='flushed' />
                                </Td>
                                <Td sx={dataColStyle} >{stcwBatchesWInsTotal || 0}</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >Without Instructor</Td>
                                <Td sx={dataColStyle} >
                                    <Input sx={inputStyle} size='xs' variant='flushed' />
                                </Td>
                                <Td sx={dataColStyle} >{stcwBatchesWOInsTotal || 0}</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle} >MDS</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} >{mdsTotal || '-'}</Td>
                                <Td sx={dataColStyle} >{(tableData.mds.withInstructor.cancelled + tableData.mds.withoutInstructor.cancelled) || '-'}</Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >With Instructor</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} >{mdsBatchesWInsTotal || 0}</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >Without Instructor</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} >{mdsBatchesWOInsTotal || 0}</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle} >in-house simulator</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} >{simTotal || '-'}</Td>
                                <Td sx={dataColStyle} >{(tableData.simulator.withInstructor.cancelled + tableData.simulator.withoutInstructor.cancelled) || '-'}</Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >With Instructor</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} >{simBatchesWInsTotal || 0}</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >Without Instructor</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} >{simBatchesWOInsTotal || 0}</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle} >in house non-simulator</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} >{nonSimTotal || '-'}</Td>
                                <Td sx={dataColStyle} >{(tableData.nonSimulator.withInstructor.cancelled + tableData.nonSimulator.withoutInstructor.cancelled) || '-'}</Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >With Instructor</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} >{nonSimBatchesWInsTotal || 0}</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >Without Instructor</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} >{nonSimBatchesWOInsTotal || 0}</Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle3} >Total</Td>
                                <Td sx={dataColTotalStyle} > </Td>
                                <Td sx={dataColTotalStyle} >{grandBatchesTotal || '-'}</Td>
                                <Td sx={dataColTotalStyle} > </Td>
                                <Td sx={dataColTotalStyle} >{grandTotal || '-'}</Td>
                                <Td sx={dataColTotalStyle} >{grandTotalCancelled || '-'}</Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
            </CardBody>
        </Card>
    </>
    );
}