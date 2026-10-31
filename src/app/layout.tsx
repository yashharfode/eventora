import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EVENTORA — Plan smarter. Celebrate better.',
  description: 'An intelligent workspace for planning weddings, birthdays and community events.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
