'use client'

import React from 'react';
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Box, Text, Input, Button, Grid, GridItem } from '@chakra-ui/react'

import { TRAINING_BY_ID } from '@/types/trainees'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRank } from '@/context/RankContext'

interface ERProps {
    e_report: string;
    course: string;
    schedule: string;
    year: string;
    room: string;
}

export default function MDS_ER({ e_report, course, schedule, year, room }: ERProps) {
    return (
        <Box >
            mds
        </Box>
    );
}