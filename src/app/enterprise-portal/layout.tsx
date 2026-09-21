import type { Metadata } from "next";
import TopWithSideNav from '@/Components/TopWithSideNav'
import {CourseBatchProvider} from '@/context/BatchContext'
import {CompanyUserProvider} from '@/context/CompanyUserContext'
import {ReminderProvider} from '@/context/ReminderContext'
import {HistoryLogProvider} from '@/context/HistoryLogContext'
import {TicketProvider} from '@/context/TicketContext'
import {RegistrationProvider} from '@/context/RegistrationContext'
import {TrainingProvider} from '@/context/TrainingContext'

export const metadata: Metadata = {
    title: "Enterprise Portal | Pentagon Maritime Services Corp.",
    description: "Official Enterprise Portal of Pentagon Maritime Services Corp.",
};

export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
        <CompanyUserProvider>
            <ReminderProvider>
                <CourseBatchProvider>
                    <TicketProvider>
                        <HistoryLogProvider>
                            <RegistrationProvider>
                                <TrainingProvider>
                                    <TopWithSideNav />
                                    <main className='main-container h-dvh z-0 enterprise-bg'>
                                        {children}
                                    </main>
                                </TrainingProvider>
                            </RegistrationProvider>
                        </HistoryLogProvider>
                    </TicketProvider>
                </CourseBatchProvider>
            </ReminderProvider>
        </CompanyUserProvider>
    );
}