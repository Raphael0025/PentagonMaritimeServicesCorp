'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';
import 'animate.css';

import UnderMaintenance from '@/Components/UnderMaintenance'

export default function Page(){
    
    
    return(
        <>
            <UnderMaintenance />
        </>
    )
}