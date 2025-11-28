'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { TraineeProvider } from "@/context/TraineeContext";
import { CourseProvider } from "@/context/CourseContext";
import { ClientProvider } from '@/context/ClientCompanyContext'
import { RankProvider } from '@/context/RankContext'
import { TypeProvider } from '@/context/TypeContext'
import { CatalogProvider } from '@/context/CatalogContext'
import { CategoryProvider } from '@/context/CategoryContext'
import { InquiryProvider } from '@/context/InquiriesContext'
import { InstructorProvider } from '@/context/InstructorContext';
import { UserRoleProvider } from '@/context/UserRolesContext';
import { CommsProvider } from '@/context/CommunicationContext';

export function Providers({children}: { children: React.ReactNode}) {
    return (
        <ChakraProvider>
            <UserRoleProvider>
                <CommsProvider>
                    <RankProvider>
                        <CategoryProvider>
                            <CatalogProvider>
                                <TypeProvider>
                                    <CourseProvider>
                                        <ClientProvider>
                                            <InquiryProvider>
                                                <InstructorProvider>
                                                    <TraineeProvider>
                                                        {children}
                                                    </TraineeProvider>
                                                </InstructorProvider>
                                            </InquiryProvider>
                                        </ClientProvider>
                                    </CourseProvider>
                                </TypeProvider>
                            </CatalogProvider>
                        </CategoryProvider>
                    </RankProvider>
                </CommsProvider>
            </UserRoleProvider>
        </ChakraProvider>
    )
}