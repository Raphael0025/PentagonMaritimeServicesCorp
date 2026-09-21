import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Courses',
    description: "Pentagon Maritime is committed to providing quality training programs aimed at developing highly skilled and capable seafarers.",
};

export default function AdmissionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}