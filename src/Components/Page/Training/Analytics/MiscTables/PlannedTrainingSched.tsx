'use client';
import React, { ChangeEvent } from 'react';
import { Input, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Card, CardBody, Text,} from '@chakra-ui/react';
import { PlannedTrainingSchedMD } from '@/types/ReportMetadata.model'

interface PlannedTrainingSchedProps {
    tableData: any;
    getTotal: (cat: any) => number;
    getTotalBatches: (cat: any, category: string) => number;
    schedData: PlannedTrainingSchedMD;
    onInputChange: (category: keyof PlannedTrainingSchedMD, field: 'w_oIns' | 'w_Ins', value: number) => void;
}

export default function PlannedTrainingSched({tableData, getTotal, getTotalBatches, schedData, onInputChange}: PlannedTrainingSchedProps) {
    
    const handleFieldChange = (category: keyof PlannedTrainingSchedMD, field: 'w_oIns' | 'w_Ins', e: ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value) || 0
        onInputChange(category, field, val)
    }

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
    
    // Helper utility function to safely compute percentages without breaking on zero denominators
    const calculateSafePct = (batchesTotal: number, schedInput: any) => {
        const denominator = Number(schedInput) || 0;
        if (denominator === 0) return 0; // Prevent dividing by zero early
        
        const result = (batchesTotal / denominator) * 100;
        return isNaN(result) || !isFinite(result) ? 0 : result;
    }

    // 1. Calculate each category percentage safely
    const stcwWInsPctTotal = calculateSafePct(stcwBatchesWInsTotal, schedData?.stcw?.w_Ins);
    const stcwWoInsPctTotal = calculateSafePct(stcwBatchesWOInsTotal, schedData?.stcw?.w_oIns);

    const mdsWInsPctTotal = calculateSafePct(mdsBatchesWInsTotal, schedData?.mds?.w_Ins);
    const mdsWoInsPctTotal = calculateSafePct(mdsBatchesWOInsTotal, schedData?.mds?.w_oIns);

    const simWInsPctTotal = calculateSafePct(simBatchesWInsTotal, schedData?.simu?.w_Ins);
    const simWoInsPctTotal = calculateSafePct(simBatchesWOInsTotal, schedData?.simu?.w_oIns);

    const nonSimWInsPctTotal = calculateSafePct(nonSimBatchesWInsTotal, schedData?.nonSimu?.w_Ins);
    const nonSimWoInsPctTotal = calculateSafePct(nonSimBatchesWOInsTotal, schedData?.nonSimu?.w_oIns);

    // 2. The grand total will now add up perfectly without any NaN or Infinity corruption
    const grandPctTotal = (
        stcwWInsPctTotal + stcwWoInsPctTotal + 
        mdsWInsPctTotal + mdsWoInsPctTotal + 
        simWInsPctTotal + simWoInsPctTotal + 
        nonSimWInsPctTotal + nonSimWoInsPctTotal
    )

    const grandBatchesTotal = stcwBatchesWInsTotal + stcwBatchesWOInsTotal + mdsBatchesWInsTotal + mdsBatchesWOInsTotal + nonSimBatchesWInsTotal + nonSimBatchesWOInsTotal + simBatchesWInsTotal + simBatchesWOInsTotal;
    const grandInputTotal = (schedData?.stcw?.w_Ins ?? 0) + (schedData?.stcw?.w_oIns ?? 0) + (schedData?.mds?.w_Ins ?? 0) + (schedData?.mds?.w_oIns ?? 0) + (schedData?.simu?.w_Ins ?? 0) + (schedData?.simu?.w_oIns ?? 0) + (schedData?.nonSimu?.w_Ins ?? 0) + (schedData?.nonSimu?.w_oIns ?? 0)

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
                                    <Input onChange={(e) => handleFieldChange('stcw', 'w_Ins', e)} value={schedData?.stcw?.w_Ins} sx={inputStyle} size='xs' variant='flushed' />
                                </Td>
                                <Td sx={dataColStyle} >{stcwBatchesWInsTotal || 0}</Td>
                                <Td sx={dataColStyle} >
                                {(() => {
                                    if(isNaN(stcwWInsPctTotal) || !isFinite(stcwWInsPctTotal)) return '0.00%'

                                    return `${stcwWInsPctTotal.toFixed(2)}%`
                                })()}
                                </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >Without Instructor</Td>
                                <Td sx={dataColStyle} >
                                    <Input onChange={(e) => handleFieldChange('stcw', 'w_oIns', e)} value={schedData?.stcw?.w_oIns} sx={inputStyle} size='xs' variant='flushed' />
                                </Td>
                                <Td sx={dataColStyle} >{stcwBatchesWOInsTotal || 0}</Td>
                                <Td sx={dataColStyle} >
                                {(() => {
                                    if(isNaN(stcwWoInsPctTotal) || !isFinite(stcwWoInsPctTotal)) return '0.00%'

                                    return `${stcwWoInsPctTotal.toFixed(2)}%`
                                })()}
                                </Td>
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
                                <Td sx={dataColStyle} > 
                                    <Input onChange={(e) => handleFieldChange('mds', 'w_Ins', e)} value={schedData?.mds?.w_Ins} sx={inputStyle} size='xs' variant='flushed' />
                                </Td>
                                <Td sx={dataColStyle} >{mdsBatchesWInsTotal || 0}</Td>
                                <Td sx={dataColStyle} >
                                {(() => {
                                    if(isNaN(mdsWInsPctTotal) || !isFinite(mdsWInsPctTotal)) return '0.00%'

                                    return `${mdsWInsPctTotal.toFixed(2)}%`
                                })()}
                                </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >Without Instructor</Td>
                                <Td sx={dataColStyle} >
                                    <Input onChange={(e) => handleFieldChange('mds', 'w_oIns', e)} value={schedData?.mds?.w_oIns} sx={inputStyle} size='xs' variant='flushed' />
                                </Td>
                                <Td sx={dataColStyle} >{mdsBatchesWOInsTotal || 0}</Td>
                                <Td sx={dataColStyle} >
                                {(() => {
                                    if(isNaN(mdsWoInsPctTotal) || !isFinite(mdsWoInsPctTotal)) return '0.00%'

                                    return `${mdsWoInsPctTotal.toFixed(2)}%`
                                })()}
                                </Td>
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
                                <Td sx={dataColStyle} >                                    
                                    <Input onChange={(e) => handleFieldChange('simu', 'w_Ins', e)} value={schedData?.simu?.w_Ins} sx={inputStyle} size='xs' variant='flushed' />
                                </Td>
                                <Td sx={dataColStyle} >{simBatchesWInsTotal || 0}</Td>
                                <Td sx={dataColStyle} >
                                {(() => {
                                    if(isNaN(simWInsPctTotal) || !isFinite(simWInsPctTotal)) return '0.00%'

                                    return `${simWInsPctTotal.toFixed(2)}%`
                                })()}
                                </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >Without Instructor</Td>
                                <Td sx={dataColStyle} >                                    
                                    <Input onChange={(e) => handleFieldChange('simu', 'w_oIns', e)} value={schedData?.simu?.w_oIns} sx={inputStyle} size='xs' variant='flushed' />
                                </Td>
                                <Td sx={dataColStyle} >{simBatchesWOInsTotal || 0}</Td>
                                <Td sx={dataColStyle} >
                                {(() => {
                                    if(isNaN(simWoInsPctTotal) || !isFinite(simWoInsPctTotal)) return '0.00%'

                                    return `${simWoInsPctTotal.toFixed(2)}%`
                                })()}
                                </Td>
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
                                <Td sx={dataColStyle} >
                                    <Input onChange={(e) => handleFieldChange('nonSimu', 'w_Ins', e)} value={schedData?.nonSimu?.w_Ins} sx={inputStyle} size='xs' variant='flushed' />
                                </Td>
                                <Td sx={dataColStyle} >{nonSimBatchesWInsTotal || 0}</Td>
                                <Td sx={dataColStyle} >
                                {(() => {
                                    if(isNaN(nonSimWInsPctTotal) || !isFinite(nonSimWInsPctTotal)) return '0.00%'

                                    return `${nonSimWInsPctTotal.toFixed(2)}%`
                                })()}
                                </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle2} >Without Instructor</Td>
                                <Td sx={dataColStyle} >
                                    <Input onChange={(e) => handleFieldChange('nonSimu', 'w_oIns', e)} value={schedData?.nonSimu?.w_oIns} sx={inputStyle} size='xs' variant='flushed' />
                                </Td>
                                <Td sx={dataColStyle} >{nonSimBatchesWOInsTotal || 0}</Td>
                                <Td sx={dataColStyle} >
                                {(() => {
                                    if(isNaN(nonSimWoInsPctTotal) || !isFinite(nonSimWoInsPctTotal)) return '0.00%'

                                    return `${nonSimWoInsPctTotal.toFixed(2)}%`
                                })()}
                                </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={dataColStyle} > </Td>
                                <Td sx={lastColStyle} ></Td>
                            </Tr>
                            <Tr>
                                <Td sx={firstColStyle3} >Total</Td>
                                <Td sx={dataColTotalStyle} >
                                {(() => {
                                    if(isNaN(grandInputTotal) || !isFinite(grandInputTotal)) return '0'

                                    return `${grandInputTotal}`
                                })()}
                                </Td>
                                <Td sx={dataColTotalStyle} >{grandBatchesTotal || '-'}</Td>
                                <Td sx={dataColStyle}>
                                    {isNaN(grandPctTotal) || !isFinite(grandPctTotal) 
                                        ? '0.00%' 
                                        : `${grandPctTotal.toFixed(2)}%`}
                                </Td>
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