import { Suspense } from 'react';
import { ConnectButton } from '@/components/ConnectButton';
import GiveHelpForm from '@/components/GiveHelpForm';
import HelpBoard from '@/components/HelpBoard';
import { Leaderboard } from '@/components/Leaderboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  return (
    <main className="container mx-auto max-w-7xl p-4 md:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">
          Chain of Kindness 🤝
        </h1>
        <ConnectButton />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <GiveHelpForm />
          <HelpBoard />
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
            <Leaderboard />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
