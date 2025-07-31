import { calculateReputation } from '@/ai/flows/calculate-reputation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Award, Star } from 'lucide-react';

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getMedal(rank: number) {
  if (rank === 0) return <Award className="h-5 w-5 text-yellow-500" />;
  if (rank === 1) return <Award className="h-5 w-5 text-slate-400" />;
  if (rank === 2) return <Award className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-medium w-5 text-center">{rank + 1}</span>;
}

export async function Leaderboard() {
  const leaderboardData = await calculateReputation({});

  // Sort by reputation score in descending order
  const sortedLeaderboard = leaderboardData.sort((a, b) => b.reputationScore - a.reputationScore);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Star className="text-primary" />
          Top Helpers
        </CardTitle>
        <CardDescription>AI-powered reputation leaderboard based on on-chain help data.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedLeaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground">No reputation data yet.</p>
            <p className="text-sm text-muted-foreground">Send some help to build reputation!</p>
          </div>
        ) : (
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
                  <TableCell className="text-right font-mono font-semibold text-primary">{entry.reputationScore.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
