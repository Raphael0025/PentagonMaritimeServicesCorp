import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import 'react-datepicker/dist/react-datepicker.css';
import { Providers } from './providers'
import { NavBar, Footer } from '@/Components/SiteComponents'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pentagon Maritime Services Corp.",
  description: "Official website of Pentagon Maritime Services Corp.",
};


export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      <body className={inter.className} style={{height: '100vh'}}>
        <Providers>
            <NavBar />
            {children}
            <Footer />
        </Providers>
      </body>
    </html>
  );
}
