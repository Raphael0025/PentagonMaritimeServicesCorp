import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Online Registration | Pentagon Maritime Services Corp.",
    description: "Official website of Pentagon Maritime Services Corp.",
};


export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <>
        {children}
    </>
  );
}