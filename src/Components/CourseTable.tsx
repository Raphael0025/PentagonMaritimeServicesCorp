'use client'
import 'animate.css';

import { Button, ButtonGroup, Table, TableContainer, Thead, Tbody, Td, Tr, Th,} from '@chakra-ui/react'
import { Link } from '@chakra-ui/next-js'

interface CourseDetails {
    course: string;
    trainingDate: string;
    modeOfPayment: string;
    fee: number | string; // Depending on your data type
}

interface Props {
    courseDetails: CourseDetails[];
    onRemoveCourse: (index: number) => void;
}

export default function CourseTable ({ courseDetails, onRemoveCourse }: Props) {
    

    return( 
        <TableContainer >
            <Table size='sm' >
                <Thead>
                    <Tr>
                        <Th >Course</Th>
                        <Th >Training Date</Th>
                        <Th >Mode of Payment</Th>
                        <Th >Course Fee</Th>
                        <Th >Action</Th>
                    </Tr>
                </Thead>
                <Tbody>
                {Array.isArray(courseDetails) ? (
                    courseDetails.map((course: CourseDetails, index: number) => (
                        <Tr key={index}>
                            <Td fontSize='xs'>{course.course}</Td>
                            <Td fontSize='xs'>{course.trainingDate}</Td>
                            <Td fontSize='xs'>{course.modeOfPayment}</Td>
                            <Td fontSize='xs'>{course.modeOfPayment === 'Company Charge' ? '--' : course.fee}</Td>
                            <Td><button onClick={() => onRemoveCourse(index)}>Remove</button></Td>
                        </Tr>
                    ))
                ) : (
                    null
                )}
                </Tbody>
            </Table>
        </TableContainer>
    )
}