import type { Metadata } from "next";
import TopWithSideNav from '@/Components/TopWithSideNav'

export const metadata: Metadata = {
    title: "Enterprise Portal | Pentagon Maritime Services Corp.",
    description: "Official Enterprise Portal of Pentagon Maritime Services Corp.",
};


export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
        <>
            <TopWithSideNav />
            <main className='main-container h-dvh z-0'>
                {children}
            </main>
        </>
    );
}