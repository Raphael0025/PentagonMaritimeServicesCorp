import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms and Conditions',
    description: " ",
};

export default function TACLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}