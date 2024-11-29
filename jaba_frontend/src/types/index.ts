import { Principal } from '@dfinity/principal';

export interface Proposal {
  id: bigint;
  title: string;
  description: string;
  creator: Principal;
  votes: bigint;
  votesAgainst: bigint;
  status: 'Active' | 'Ended';
  category: bigint;
  endTime?: bigint;
}

export interface User {
  id: Principal;
  name: string;
}

export interface Category {
  id: bigint;
  name: string;
}

export interface Comment {
  id: bigint;
  author: Principal;
  content: string;
  createdAt: bigint;
}

export interface Analytics {
  totalProposals: bigint;
  totalVotes: bigint;
  totalComments: bigint;
  categoryCounts: Array<{ category: string; count: bigint }>;
}
