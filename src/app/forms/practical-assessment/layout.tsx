import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Practical Assessment",
    description: "This page is for users to take their practical assessment depending on their course.",
};

export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
    <>
        {children}
    </>
    );
}