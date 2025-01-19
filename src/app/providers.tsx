'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { TraineeProvider } from "@/context/TraineeContext";
import { CourseProvider } from "@/context/CourseContext";
import { ClientProvider } from '@/context/ClientCompanyContext'
import {RankProvider} from '@/context/RankContext'
import {TypeProvider} from '@/context/TypeContext'
import {CatalogProvider} from '@/context/CatalogContext'
import {CategoryProvider} from '@/context/CategoryContext'

export function Providers({children}: { children: React.ReactNode}) {
    return (
        <ChakraProvider>
            <RankProvider>
                <CategoryProvider>
                    <CatalogProvider>
                        <TypeProvider>
                            <CourseProvider>
                                <ClientProvider>
                                    <TraineeProvider>
                                        {children}
                                    </TraineeProvider>
                                </ClientProvider>
                            </CourseProvider>
                        </TypeProvider>
                    </CatalogProvider>
                </CategoryProvider>
            </RankProvider>
        </ChakraProvider>
    )
}