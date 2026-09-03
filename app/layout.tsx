import type { Metadata } from 'next';
import { Teko } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import AddTaskFAB from '@/components/AddTaskFAB';
import ToastProvider from '@/components/ToastProvider';
import ThemeProvider from '@/components/ThemeProvider';

const teko = Teko({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700'],
  variable: '--font-display'
});

export const metadata: Metadata = {
  title: 'TaskFlow — Personal Task & Calendar Tracker',
  description:
    'A centralized personal task tracker for academic deadlines and skill acquisition goals. Organize, schedule, and complete tasks on a visual calendar.',
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`h-full bg-transparent ${teko.variable}`}>
      <head>
        {/* Anti-flash: apply stored theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('taskflow-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',t||(d?'dark':'light'));}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-transparent">
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <main id="main-content" className="flex-1 bg-transparent">
              {children}
            </main>
            <AddTaskFAB />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
