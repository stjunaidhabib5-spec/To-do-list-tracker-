import Navbar from '@/components/Navbar';
import AddTaskFAB from '@/components/AddTaskFAB';

/**
 * App layout — wraps all authenticated app routes (/, /calendar, /tasks).
 * Provides the Navbar and the AddTask floating action button.
 * Auth pages use (auth)/layout.tsx instead and get neither.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1 bg-transparent">
        {children}
      </main>
      <AddTaskFAB />
    </>
  );
}
