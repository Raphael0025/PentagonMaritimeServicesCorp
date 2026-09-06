import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admissions',
    description: "Here you'll find all the information you need to enroll in your desired course.",
};

export default function AdmissionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}