import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us',
    description: "Pentagon Maritime Services Corp. is a premier maritime training institution dedicated to delivering high-quality upgrading courses that comply with national and international maritime training standards.",
};

export default function AdmissionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}