'use client'

import React from 'react';
import { useState, useRef } from 'react'
import { Box, Text, Input, useToast, Button, Grid, GridItem } from '@chakra-ui/react'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useRank } from '@/context/RankContext'
import { useClients } from '@/context/ClientCompanyContext'

import { getFormatDate } from '@/handlers/util_handler';
import { formatDateToShort } from '@/handlers/trainee_handler';
import { parsingTimestamp, ToastStatus } from '@/types/handling'

import { CCR } from '@/Components/Page/Forms/TrainingForms'

import { useReactToPrint } from 'react-to-print'

interface TFProps {
    onClose: () => void;
    trainingForm: string;
    start_date: string;
    end_date: string;
    course: string;
    courseCode: string;
    batch_no: string;
    batchID: string;
    courseID: string;
}

export default function PreviewCCR({ onClose, batch_no, trainingForm, batchID, courseID, start_date, end_date, course, courseCode }: TFProps) {
    return(
        <>
        </>
    )
}