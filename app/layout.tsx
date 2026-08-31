import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import AddTaskFAB from '@/components/AddTaskFAB';
import ToastProvider from '@/components/ToastProvider';

export const metadata: Metadata = {
  title: 'TaskFlow — Personal Task & Calendar Tracker',
  description:
    'A centralized personal task tracker for academic deadlines and skill acquisition goals. Organize, schedule, and complete tasks on a visual calendar.',
};


export default async function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <ToastProvider>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <AddTaskFAB />
        </ToastProvider>
      </body>
    </html>
  );
}
