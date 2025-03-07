import React, { useState } from 'react'
import { Box, Text, Button, useToast, } from '@chakra-ui/react';

import { CHANGE_AT } from '@/lib/trainee_controller'; 

import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'

import { ToastStatus } from '@/types/handling'

interface PageProps {
    training_id: string;
    onClose: () => void;
    reg_id: string;
}

export default function ChangeAccountType({training_id, onClose, reg_id}: PageProps) {
    const toast = useToast()
    const { data: allTraining } = useTraining()
    const { data: allRegistrations } = useRegistrations()
    
    const [loading, setLoading] = useState<boolean>(false)

    // Get Training Doc using training_id parameter
    const GetTraining = allTraining && allTraining.find((training) => training.id === training_id)
    // Get Registration using reg_id parameter
    const GetRegistration = allRegistrations && allRegistrations.find((reg) => reg.id === reg_id) || null
    // Get Trainee Doc using the fetched registration's trainee_ref_id field
    const GetTrainee = GetRegistration?.trainee_ref_id

    // Get all Registrations of the same trainee by filtering registration using the trainee_reg_id (GetTrainee)
    const GetRegistrations = allRegistrations && allRegistrations?.filter((reg) => reg.trainee_ref_id === GetTrainee)
    
    // Using Find function GetRegistrations to fetch the registration of a trainee using the id of each doc in GetRegistration 
    // and id of GetRegistration and by matching the date of registration and it must be the same date 
    const GetOtherReg = GetRegistrations?.find((reg) => { 
        return reg.id !== GetRegistration?.id 
        && reg.date_registered.toDate().toLocaleDateString("en-US", {year: "numeric", month: "long", day: "2-digit"}) === GetRegistration?.date_registered.toDate().toLocaleDateString("en-US", {year: "numeric", month: "long", day: "2-digit"})
    }) || null

    const handleChangeAT = async () => {
        setLoading(true)
        
        new Promise<void>((res,rej) => {
            setTimeout(async () => {
                try{
                    await CHANGE_AT(training_id, GetOtherReg, GetRegistration, reg_id)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Change Account Type Successfully!', `Thsi Training's account type was changed into ${GetOtherReg?.reg_accountType == 0 ? 'CREW' : 'COMPANY'}.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
            onClose()
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

    return(
    <>
    <Box>
        <Text fontSize='xl' color='blue.700' fontWeight='700'>Change Account Type</Text>
        <Box>
            <Box display={'flex'} flexDir='column' justifyContent='center' py='3'>
                <Text textAlign='center' fontSize='lg'>{`Are you sure to Change the Account Type of this Training from ${GetTraining?.accountType === 0 ? 'CREW' : 'COMPANY'} into ${GetTraining?.accountType === 0 ? 'COMPANY' : 'CREW'}?`}</Text>
                <Box display='flex' justifyContent='center' mt='3'>
                    <Button colorScheme='red' variant='outline' onClick={onClose} shadow='md' mr='3'>Cancel</Button>
                    <Button onClick={handleChangeAT} isLoading={loading} shadow='md' colorScheme='blue' bgColor='#1c437e'>Yes, Change it</Button>
                </Box>
            </Box>
        </Box>
    </Box>
    </>
    )
}
