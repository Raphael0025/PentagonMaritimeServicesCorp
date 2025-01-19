'use client'

import { useState } from 'react';
import { Box, Text, Input, Button, InputLeftAddon, Menu, MenuList, MenuButton, MenuItem, MenuGroup, MenuDivider, MenuOptionGroup, MenuItemOption, InputGroup, useToast, Accordion, AccordionButton, AccordionPanel, AccordionIcon, AccordionItem,  } from '@chakra-ui/react';
import { DotsIcon, SearchIcon } from '@/Components/Icons';
import { Timestamp } from 'firebase/firestore';

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'

import { handleRegStatus } from '@/handlers/trainee_handler'
import { parsingTimestamp, ToastStatus } from '@/types/handling'

import { ACKNOWLEDGE_REGISTRATION } from '@/lib/trainee_controller'
import { TRAINING_BY_ID } from '@/types/trainees'

export default function Page() {
    const toast = useToast()
    const { data: allClients } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining } = useTraining()
    const { data: allCourses } = useCourses()
    const { data: allRegistrations } = useRegistrations()

    const [activeBtn, setActiveBtn] = useState<string>('')
    const [search, setSearch] = useState<string>('');

    // Function to filter registrations based on search
    const filteredRegistrations = allRegistrations?.filter((registration) => {
        const traineeFound = allTrainee?.find((trainee) => trainee.id === registration.trainee_ref_id);

        // Check if any field matches the search query
        return (
            traineeFound?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
            traineeFound?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
            traineeFound?.rank?.toLowerCase().includes(search.toLowerCase()) ||
            traineeFound?.srn?.toLowerCase().includes(search.toLowerCase()) ||
            parsingTimestamp(registration.date_registered)
                .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    });

    const handleAcknowledge = async (reg_id: string, reg: TRAINING_BY_ID, email: string, last_name: string, first_name: string) => {
        setActiveBtn(reg_id)
        const actor: string | null = localStorage.getItem('customToken')
        
        new Promise<void>((res,rej) => {
            setTimeout(async () => {
                try{
                    const { id, ...rest } = reg
                    await ACKNOWLEDGE_REGISTRATION(reg_id, rest, actor)
                    await fetch('/api/mail-verification', {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        }, 
                        body: JSON.stringify({
                            to: email,
                            subject: 'Pentagon Maritime Services Corp.',
                            text: 'Good news, your registration has been verified. Please await for someone to assist you on the next step. Thank you have a nice day!',
                            last_name: last_name,
                            first_name: first_name,
                        })
                    })
                    res()
                }catch(error){
                    rej(error)
                }
            }, 1500)
        }).then(() => {
            handleToast('Acknowledge Successfully!', `Registration was acknowledge, await for the cashier to acknowledge this to proceed for the enrollment.`, 7000, 'success')
        }).catch((error) => {
            console.log('Error:, ', error)
        }).finally(() => {
            setActiveBtn('')
        })
    }
    
    const handleToast = (title: string = '', desc: string = '', timer: number, status: ToastStatus) => {
        toast({
            title: title,
            description: desc,
            position: 'top-right',
            variant: 'left-accent',
            status: status,
            duration: timer,
            isClosable: true,
        })
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
    const currentYear = currentDate.getFullYear();

    return (
        <main className="w-full space-y-3">
            <Box className="w-full flex">
                <InputGroup w="30%" className="shadow-md rounded-lg">
                    <InputLeftAddon>
                        <SearchIcon color="#a1a1a1" size="18" />
                    </InputLeftAddon>
                    <Input
                        placeholder="e.g. Juan dela Cruz..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </InputGroup>
            </Box>
            <Box className="w-full px-5 space-y-3">
                <Box className="flex justify-between items-center bg-sky-700 rounded uppercase shadow-md p-3 px-8 text-white">
                    <Text w="40%" className="text-center">Registration Date</Text>
                    <Text w="50%" className="text-center">{`Trainee's Name`}</Text>
                    <Text w="40%" className="text-center">rank</Text>
                    <Text w="40%" className="text-center">Balance</Text>
                    <Text w="40%" className="text-center">Company</Text>
                    <Text w="40%" className="text-center">email</Text>
                    {/* <Text w="50%" className="text-center">Payment Balance</Text> */}
                    <Text w="40%" className="text-center">contact no</Text>
                </Box>
                <Box className='px-3' style={{maxHeight: '700px', overflowY: 'auto'}}>
                    <Accordion allowToggle className="space-y-3">
                        {filteredRegistrations?.filter((registration) => allTraining?.some((training) => training.reg_ref_id === registration.id && training.reg_status >= 1 ))
                        ?.sort((a, b) => {
                                const dateA =
                                    a.date_registered instanceof Timestamp
                                        ? a.date_registered.toDate()
                                        : new Date(0);
                                const dateB =
                                    b.date_registered instanceof Timestamp
                                        ? b.date_registered.toDate()
                                        : new Date(0);

                                return dateB.getTime() - dateA.getTime();
                            }).map((registration) => {
                            const traineeFound = allTrainee?.find((trainee) => trainee.id === registration.trainee_ref_id)
                            return(
                                <AccordionItem  key={registration.id}>
                                    <AccordionButton _expanded={{bg: '#a8d1e8'}} py={4} borderRadius='md' borderLeftWidth='6px' borderColor={`${registration.reg_accountType === 0 ? 'blue.600' : 'green.400'}`} className={`${registration.reg_accountType === 0 ? '' : ''} flex items-center justify-between rounded shadow-md px-8 uppercase`}>
                                        <Text w="40%" className="text-xs text-center">{parsingTimestamp(registration.date_registered).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>
                                        <Text w="50%" className="text-xs text-center">
                                            {`${traineeFound?.last_name}, ${traineeFound?.first_name} ${traineeFound?.middle_name === '' || traineeFound?.middle_name.toLowerCase() === 'n/a' ? '' : `${traineeFound?.middle_name.charAt(0)}.`} ${traineeFound?.suffix === '' || traineeFound?.suffix.toLowerCase() === 'n/a'  ? '' : traineeFound?.suffix}`}
                                        </Text>
                                        <Text w="40%" className="text-xs text-center">{traineeFound?.rank}</Text>
                                        <Text w="40%" className="text-xs text-center">{`Php ${registration.payment_balance}`}</Text>
                                        <Text w="40%" className="text-xs text-center">
                                            {allClients?.find((client) => client.id === traineeFound?.company)?.company || traineeFound?.company}
                                        </Text>
                                        <Text w="40%" className="text-xs text-center lowercase">{traineeFound?.email}</Text>
                                        <Text w="40%" className="text-xs text-center">{traineeFound?.contact_no}</Text>
                                    </AccordionButton>
                                    <AccordionPanel display='flex' flexDir='column'  gridGap={3}>
                                        <Box className='uppercase w-full p-3 border rounded text-center shadow-md' bg='#dcdee1' display='flex' justifyContent='between' >
                                            <Text className='text-zinc-500' w='100%'>course</Text>
                                            <Text className='text-zinc-500' w='100%'>course fee</Text>
                                            <Text className='text-zinc-500' w='100%'>charge</Text>
                                            <Text className='text-zinc-500' w='100%'>start date</Text>
                                            <Text className='text-zinc-500' w='100%'>end date</Text>
                                            <Text className='text-zinc-500' w='100%'>duration</Text>
                                            <Text className='text-zinc-500' w='100%'>status</Text>
                                        </Box>
                                        {allTraining && allTraining?.filter((training) => training.reg_ref_id === registration.id && training.reg_status >= 1 ).map((training) => (
                                            <Box key={training.id} className='py-3 px-5 items-center text-center border-b rounded' display='flex' justifyContent='between'>
                                                <Text w='100%' className='text-xs uppercase'>
                                                    {allCourses?.find((course) => course.id === training.course)?.course_code || ''}
                                                </Text>
                                                <Text w='100%' className='text-xs uppercase'>{`Php  ${training.course_fee}`}</Text>
                                                <Text w='100%' className='text-xs uppercase'>{training.accountType === 0 ? 'Crew' : 'Company'}</Text>
                                                <Text w='100%' className='text-xs uppercase'>{training.start_date}</Text>
                                                <Text w='100%' className='text-xs uppercase'>{training.end_date !== '' ? training.end_date : '--'}</Text>
                                                <Text w='100%' className='text-xs uppercase'>{training.numOfDays > 1 ? `${training.numOfDays} days` : `${training.numOfDays} day`}</Text>
                                                {training.reg_status === 1 ? (
                                                    <Button w='100%' onClick={() => {handleAcknowledge(training.id, training, traineeFound?.email || '', traineeFound?.last_name || '', traineeFound?.first_name || '')}} colorScheme='yellow' className="text-xs uppercase text-center" size='xs' py={4} variant='link' isLoading={activeBtn === training.id} loadingText='Acknowledging...'>Acknowledge</Button>
                                                ) : (
                                                    <Text w='100%' className={`${training.reg_status >= 2 ? 'text-green-500 font-bolder' : ''} text-xs uppercase`}>{handleRegStatus(training.reg_status)}</Text>
                                                )}
                                            </Box>
                                        ))}
                                    </AccordionPanel>
                                </AccordionItem> 
                            )
                        })}
                    </Accordion>
                </Box>
            </Box>
        </main>
    );
}
