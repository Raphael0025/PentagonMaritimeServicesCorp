import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Facilities',
    description: "Train with confidence in our advanced simulator facilities, featuring cutting-edge technology for realistic, hands-on experiences in navigation, ship handling, and emergency response.",
};

export default function AdmissionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}