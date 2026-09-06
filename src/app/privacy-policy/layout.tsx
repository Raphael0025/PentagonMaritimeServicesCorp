import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: "Feel Free to contact us and send your inquiries!",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}