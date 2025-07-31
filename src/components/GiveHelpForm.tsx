'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { isAddress } from 'viem';
import abi from '../abi.json';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const formSchema = z.object({
  recipient: z.string().refine(isAddress, { message: 'Please enter a valid wallet address.' }),
  message: z.string().min(3, 'Message must be at least 3 characters long.').max(280, 'Message cannot exceed 280 characters.'),
});

export default function GiveHelpForm() {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: '',
      message: '',
    },
  });

  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash, 
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    writeContract({
      address: contractAddress,
      abi,
      functionName: 'giveHelp',
      args: [values.recipient, values.message],
    });
  }

  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Help Sent!",
        description: "Your act of kindness has been recorded on the blockchain.",
        variant: 'default',
        action: <CheckCircle className="text-green-500" />,
      });
      form.reset();
    }
    if (error) {
      toast({
        title: "Transaction Error",
        description: error.shortMessage || "An unknown error occurred.",
        variant: 'destructive'
      });
    }
  }, [isConfirmed, error, toast, form]);

  const isLoading = isPending || isConfirming;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Record an Act of Kindness</CardTitle>
        <CardDescription>Enter the recipient's wallet address and a message describing the help you provided.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient's Wallet Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Helped debug a smart contract"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe your act of kindness. This will be public on the blockchain.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!isConnected || isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isConfirming && 'Confirming Transaction...'}
              {isPending && !isConfirming && 'Waiting for signature...'}
              {!isLoading && (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Proof of Help
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {!isConnected && (
        <p className="text-center text-sm text-muted-foreground pb-4">Please connect your wallet to send help.</p>
      )}
    </Card>
  );
}
