'use server';

/**
 * @fileOverview AI-powered reputation leaderboard for top helpers.
 *
 * - calculateReputation - A function that calculates the reputation scores of helpers and returns a leaderboard.
 * - CalculateReputationInput - The input type for the calculateReputation function (currently empty).
 * - CalculateReputationOutput - The return type for the calculateReputation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schemas for input and output
const CalculateReputationInputSchema = z.object({})
export type CalculateReputationInput = z.infer<typeof CalculateReputationInputSchema>;

const LeaderboardEntrySchema = z.object({
  address: z.string().describe('The address of the helper.'),
  reputationScore: z.number().describe('The AI-assessed reputation score of the helper.'),
});

const CalculateReputationOutputSchema = z.array(LeaderboardEntrySchema);
export type CalculateReputationOutput = z.infer<typeof CalculateReputationOutputSchema>;

// Exported function to call the flow
export async function calculateReputation(input: CalculateReputationInput): Promise<CalculateReputationOutput> {
  return calculateReputationFlow(input);
}

// Define the prompt to calculate reputation scores
const reputationPrompt = ai.definePrompt({
  name: 'reputationPrompt',
  input: {schema: z.object({
    helpRecords: z.array(z.object({
      helper: z.string(),
      recipient: z.string(),
      message: z.string(),
    })).describe('An array of help records from the blockchain.'),
  })},
  output: {schema: CalculateReputationOutputSchema},
  prompt: `You are an AI assistant tasked with evaluating the reputation of helpers based on their contributions.

Given the following help records, analyze the messages to determine the helpfulness and impact of each helper's contribution.
Consider factors such as the clarity, usefulness, and positivity of the message. Then, create a leaderboard of top helpers, ranked by their reputation scores.

Help Records:
{{#each helpRecords}}
- Helper: {{helper}}, Recipient: {{recipient}}, Message: {{message}}
{{/each}}

Return a JSON array of leaderboard entries, with each entry containing the helper's address and their calculated reputation score. The reputation score should be a number between 0 and 100, where 100 is the highest reputation.
Ensure that the output is a valid JSON array matching the CalculateReputationOutputSchema.
`,
});

// Define the Genkit flow
const calculateReputationFlow = ai.defineFlow(
  {
    name: 'calculateReputationFlow',
    inputSchema: CalculateReputationInputSchema,
    outputSchema: CalculateReputationOutputSchema,
  },
  async input => {
    // Fetch help records from the blockchain (replace with actual data retrieval)
    // For now, using mock data
    const helpRecords = [
      { helper: '0x123', recipient: '0x456', message: 'Provided guidance on smart contract deployment.' },
      { helper: '0x789', recipient: '0xabc', message: 'Assisted with debugging a critical bug.' },
      { helper: '0x123', recipient: '0xdef', message: 'Shared helpful resources for learning Solidity.' },
      { helper: '0x456', recipient: '0x789', message: 'Explained gas optimization techniques.' },
    ];

    // Call the reputation prompt to calculate reputation scores
    const {output} = await reputationPrompt({
      helpRecords: helpRecords,
    });

    // Return the leaderboard
    return output!;
  }
);
