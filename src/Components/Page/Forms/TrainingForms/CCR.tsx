'use client'

import React from 'react';
import { Box, Text, Grid, Image, GridItem } from '@chakra-ui/react'
import { PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'

import { TRAINING_BY_ID } from '@/types/trainees'
import { useRegistrations } from '@/context/RegistrationContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRank } from '@/context/RankContext'

import { splitTextAtWordBoundary } from '@/handlers/util_handler';

import { parsingTimestamp } from '@/types/handling'

interface TFProps {
    course: string;
    courseCode: string;
    site: string;
    practicumDate: string;
    instructor: string;
    assessor: string;
    schedule: string;
    year: string;
    room: string;
    batchNo: string;
    trainingArray?: TRAINING_BY_ID[];
}

export default function CCR({ courseCode, site, practicumDate, course, schedule, year, room, batchNo, instructor, assessor, trainingArray}: TFProps) {
    return(
    <>
    
    </>
    )
}