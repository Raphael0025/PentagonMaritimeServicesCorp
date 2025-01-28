import {TabAdmin} from@/Components/Tabs/TabAdmin

export default function RootLayout({ children, }: { children: React.ReactNode }) {

    return (
        <>
            <main className='flex flex-col py-2 pb-8 px-6 space-y-5 '>
                <TabAdmin />
                {children}
            </main>
        </>
    );
}