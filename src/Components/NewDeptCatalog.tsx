'use client'

import React, { useState } from 'react'
import { Box, Button, FormControl, Input, InputGroup, useToast, InputLeftAddon, } from '@chakra-ui/react'
import { IDIcon, UsersIcon } from '@/Components/Icons'
import { initDept, DEPARTMENT } from '@/types/utils'
import { ToastStatus } from '@/types/handling'
import { NewCatalogDept } from '@/lib/controller'

interface IProps{
    onCloseModal: () => void;
}

export default function Page({ onCloseModal } : IProps){
    const toast = useToast()

    const [department, setDept] = useState<DEPARTMENT>(initDept)
    const [loading, setLoading] = useState<boolean>(false)

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target

        setDept(prev => ({
            ...prev,
            [id]: value.toUpperCase(),
        }))
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

    const handleSubmit = (): Promise<void> => {
        return new Promise(async (res, rej) => {
            const actor: string | null = localStorage.getItem('customToken')
            setLoading(true)
            try{
                await NewCatalogDept(department, actor)
                res()
            }catch(error){
                rej(error)
            }finally{
                setLoading(false)
                handleToast('New Catalog Created!', `${actor} has successfully created a new department catalog.`, 5000, 'success')
            }
            setDept(initDept)
            onCloseModal()
        })
    }

    return(
        <Box className='space-y-4'>
            <form className='space-y-4' >
                <FormControl>
                    <InputGroup>
                        <InputLeftAddon><IDIcon color='#0D70AB' size='24' /></InputLeftAddon>
                        <Input id='code' onChange={handleOnChange} value={department.code.toUpperCase()} placeholder='Code' />
                    </InputGroup>
                </FormControl>
                <FormControl>
                    <InputGroup>
                        <InputLeftAddon><UsersIcon color='#0D70AB' size='24' /></InputLeftAddon>
                        <Input id='name' onChange={handleOnChange} value={department.name.toUpperCase()} placeholder='Department' />
                    </InputGroup>
                </FormControl>
            </form>
            <Box className='border-t border-gray-400 flex justify-end py-2 space-x-3'>
                <Button colorScheme='red' variant='outline' onClick={onCloseModal} >Cancel</Button>
                <Button isLoading={loading} onClick={handleSubmit} colorScheme='blue' loadingText='Saving...' >Save Catalog</Button>
            </Box>
        </Box>
    )
}