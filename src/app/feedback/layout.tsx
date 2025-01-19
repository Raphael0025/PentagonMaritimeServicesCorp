import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Client Survey | Pentagon Maritime Services Corp.",
    description: "This is help figuring out what and how can Pentagon Maritime Services Corp. improve their services.",
};


export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    )
}