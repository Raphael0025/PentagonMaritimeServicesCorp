import type { Metadata } from "next";
import ProgressTracker from '@/Components/ProgressTracker';

export const metadata: Metadata = {
    title: "Online Registrtion | Pentagon Maritime Services Corp.",
    description: "Official website of Pentagon Maritime Services Corp.",
};


export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <>
        <ProgressTracker />
        {children}
    </>
  );
}