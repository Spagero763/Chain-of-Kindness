'use client';

import { useEffect, useState } from 'react';
import { useContractRead, useContractReads } from 'wagmi';
import abi from '../abi.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Award, Star } from 'lucide-react';

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

type HelpRecord = {
  helper: `0x${string}`;
  recipient: `0x${string}`;
  message: string;
  timestamp: bigint;
};

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getMedal(rank: number) {
  if (rank === 0) return <Award className="h-5 w-5 text-yellow-500" />;
  if (rank === 1) return <Award className="h-5 w-5 text-slate-400" />;
  if (rank === 2) return <Award className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-medium w-5 text-center">{rank + 1}</span>;
}

export default function Leaderboard() {
  const [helpers, setHelpers] = useState<`0x${string}`[]>([]);
  const [sortedLeaderboard, setSortedLeaderboard] = useState<{ address: string; score: string }[]>([]);

  // Step 1: Get all help records
  const { data: records, isLoading: isLoadingRecords } = useContractRead({
    address: contractAddress,
    abi,
    functionName: 'getAllRecords',
    watch: true,
  });

  // Step 2: Extract unique helpers
  useEffect(() => {
    if (records) {
      const all = (records as HelpRecord[]).map((r) => r.helper);
      const unique = [...new Set(all)];
      setHelpers(unique);
    }
  }, [records]);

  // Step 3: Query getReputation for all helpers
  const { data: reputations, isLoading: isLoadingReputations } = useContractReads({
    contracts: helpers.map((addr) => ({
      address: contractAddress,
      abi,
      functionName: 'getReputation',
      args: [addr],
    })),
    enabled: helpers.length > 0,
    watch: true,
  });

  // Step 4: Pair addresses with scores and sort
  useEffect(() => {
    if (helpers.length > 0 && reputations) {
      const leaderboard = helpers.map((addr, i) => ({
        address: addr,
        score: reputations[i]?.result?.toString() ?? '0',
      }));
      const sorted = leaderboard.sort((a, b) => Number(b.score) - Number(a.score));
      setSortedLeaderboard(sorted);
    } else if (helpers.length === 0) {
      setSortedLeaderboard([]);
    }
  }, [helpers, reputations]);

  const isLoading = isLoadingRecords || (helpers.length > 0 && isLoadingReputations);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Star className="text-primary" />
          Top Helpers
        </CardTitle>
        <CardDescription>Reputation leaderboard based on on-chain help data.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Helper</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && sortedLeaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground">No reputation data yet.</p>
            <p className="text-sm text-muted-foreground">Send some help to build reputation!</p>
          </div>
        ) : !isLoading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Helper</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeaderboard.map((entry, index) => (
                <TableRow key={entry.address}>
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center">
                      {getMedal(index)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{truncateAddress(entry.address)}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">{entry.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
