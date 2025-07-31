'use client';

import { useContractRead } from 'wagmi';
import abi from '../abi.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

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

export default function HelpBoard() {
  const { data: records, isLoading } = useContractRead({
    address: contractAddress,
    abi,
    functionName: 'getAllRecords',
    watch: true,
  });

  const reversedRecords = records ? [...(records as HelpRecord[])].reverse() : [];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Help Board</CardTitle>
        <CardDescription>A public ledger of all kindness acts recorded on-chain.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Helper</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))}
              {!isLoading && reversedRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No acts of kindness recorded yet. Be the first!
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                reversedRecords.map((record, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Badge variant="secondary">{truncateAddress(record.helper)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{truncateAddress(record.recipient)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{record.message}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDistanceToNow(new Date(Number(record.timestamp) * 1000), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
