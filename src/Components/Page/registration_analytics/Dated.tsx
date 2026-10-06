'use client'

import React, { useState, useEffect} from 'react'
import { Box, Text, Input, SimpleGrid, Textarea, Button, IconButton, HStack, Flex, InputLeftAddon, Image, Grid, GridItem, FormControl, Select, Switch, FormLabel, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Menu, MenuItem, MenuList, MenuButton, Table, Thead, Tbody, Tr, Th, Td,TableContainer, Checkbox, Badge } from '@chakra-ui/react'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

import { useRegistrations } from '@/context/RegistrationContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTraining } from '@/context/TrainingContext'
import { useTrainees } from '@/context/TraineeContext'
import { useCourses } from '@/context/CourseContext'
import { useInquiries } from '@/context/InquiriesContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function DatedAnalytics() {
    const toast = useToast()
    const { data: allInquiries = [] } = useInquiries()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: allClients, courseCodes } = useClients()
    const { data: allTraining, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { lastMonthReg: allRegistrations, setMonth: setRMonth, setYear: setRYear } = useRegistrations()

    // --- CHART 1: Customers Assisted Line/Bar Chart Data ---
  const customersAssistedData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Inquiries Assisted',
        data: [12, 19, 15, 22, 18, 25],
        borderColor: '#3182CE', // Chakra blue.500
        backgroundColor: 'rgba(49, 130, 206, 0.4)',
        tension: 0.3,
        fill: true,
      },
    ],
  }

  // --- CHART 2: Top 3 Client Companies Bar Chart Data ---
  const topClientsData = {
    labels: ['Company A', 'Company B', 'Company C'],
    datasets: [
      {
        label: 'Trainees Registered',
        data: [45, 32, 28],
        backgroundColor: ['#319795', '#805AD5', '#DD6B20'], // Chakra teal, purple, orange
        borderRadius: 6,
      },
    ],
  }

  // --- CHART 3: Course Category Distribution Doughnut Data ---
  const courseCategoryData = {
    labels: ['STCW', 'Value-Added', 'Custom Company'],
    datasets: [
      {
        data: [55, 30, 15],
        backgroundColor: ['#3182CE', '#38A169', '#E53E3E'], // Chakra blue, green, red
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

    return(
    <>
        <Box>
            <Text fontWeight='bold' fontSize='xl'>ANALYTICS OVERVIEW</Text>
            {/* Grid container replacing space-evenly flex box for clean layout */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                
                {/* 1. Customers Assisted */}
                <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    boxShadow="sm"
                    bg="white"
                >
                <Text fontWeight="semibold" mb={3} textAlign="center" textTransform="uppercase">
                    Customers Assisted
                </Text>
                <Box h="260px" position="relative">
                    <Line data={customersAssistedData} options={chartOptions} />
                </Box>
                </Box>

                {/* 2. Top Three (3) Client Companies */}
                <Box
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                boxShadow="sm"
                bg="white"
                >
                <Text fontWeight="semibold" mb={3} textAlign="center" textTransform="uppercase">
                    Top Three (3) Client Companies
                </Text>
                <Box h="260px" position="relative">
                    <Bar data={topClientsData} options={chartOptions} />
                </Box>
                </Box>

                {/* 3. Course Category Distribution */}
                <Box
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                boxShadow="sm"
                bg="white"
                >
                <Text fontWeight="semibold" mb={3} textAlign="center" textTransform="uppercase">
                    Course Category Distribution
                </Text>
                <Box h="260px" position="relative">
                    <Doughnut data={courseCategoryData} options={chartOptions} />
                </Box>
                </Box>

            </SimpleGrid>
        </Box>
    </>
    )
}
