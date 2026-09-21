import type { Metadata } from "next";
import "./globals.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import 'react-datepicker/dist/react-datepicker.css';
import { Inter } from "next/font/google";
import { Providers } from './providers'
import { NavBar, NavBarV2, Footer } from '@/Components/SiteComponents'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://pentagonmaritime.com'),
  title: {
    default: 'Pentagon Maritime Services Corp.',
    template: '%s | Pentagon Maritime'
  },
  description: "Pentagon Maritime Services Corp. is a premier maritime training institution dedicated to delivering high-quality upgrading courses that comply with national and international maritime training standards. Our commitment is to equip maritime professionals with the knowledge, skills, and competencies needed to excel in today's dynamic global shipping industry. Our organization is built on the collective expertise of professionals with over 15 years of experience in maritime education, training, quality management, business operations, account management, and customer relations. Inspired by the institutions that shaped our own careers, we have established a new standard of maritime training —one founded on excellence, innovation, integrity, and continuous improvement.",
  openGraph: {
    title: 'Pentagon Maritime Services Corp.',
    description: "Pentagon Maritime Services Corp. is a premier maritime training institution dedicated to delivering high-quality upgrading courses that comply with national and international maritime training standards. Our commitment is to equip maritime professionals with the knowledge, skills, and competencies needed to excel in today's dynamic global shipping industry. Our organization is built on the collective expertise of professionals with over 15 years of experience in maritime education, training, quality management, business operations, account management, and customer relations. Inspired by the institutions that shaped our own careers, we have established a new standard of maritime training —one founded on excellence, innovation, integrity, and continuous improvement.",
    url: 'https://pentagonmaritime.com',
    siteName: 'Pentagon Maritime',
    type: 'website',
  },
};


export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      <body className={inter.className} >
        <Providers>
            <NavBarV2 />
            {children}
            <Footer />
        </Providers>
      </body>
    </html>
  );
}
