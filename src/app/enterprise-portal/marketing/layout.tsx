import {TabMarketing} from '@/Components/Tabs'

export default function RootLayout({ children, }: { children: React.ReactNode }) {

    return (
        <>
            <main className='flex flex-col py-2 pb-8 px-6 space-y-5 '>
                <TabMarketing />
                {children}
            </main>
        </>
    );
}