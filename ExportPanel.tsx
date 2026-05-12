export type NeuronType = 'thought' | 'idea' | 'project' | 'contact' | 'meeting' | 'place' | 'task' | 'event' | 'note' | 'insight';

export type SubscriptionTier = 'Free' | 'Basic' | 'Pro' | 'Quantum';

export interface NeuronConnection {
  targetId: string;
  relationshipType?: 'introduced_by' | 'collaborator' | 'acquaintance' | 'stakeholder' | 'mentor' | 'friend' | 'related_to';
  context?: string;
}

export interface Neuron {
  id: string;
  type: NeuronType;
  title: string;
  description: string;
  content?: string;
  tags: string[];
  size: number;
  importance: number;
  created: number;
  updated: number;
  connections: string[]; // Keep for legacy/simple logic
  richConnections?: NeuronConnection[]; // New detailed connections
  metadata: Record<string, any>;
  phi?: number;
  theta?: number;
  r3?: number;
  pp?: number;
}

export interface UserProfile {
  uid?: string;
  email: string;
  name: string;
  nickname?: string;
  location?: string;
  nationality?: string;
  role?: string;
  company?: string;
  domains: string[];
  decisionStyle: string;
  peakTime: string;
  socialEnergy: string;
  topPriority: string;
  longTermGoal: string;
  currentChallenge: string;
  bio: string;
  technicalLevel: 'Beginner' | 'Intermediate' | 'Expert';
  learningRate: 'Slow' | 'Normal' | 'Hyper';
  productivityMethod: string;
  created: any; // Can be number or Timestamp
  updated?: any;
  tier: SubscriptionTier;
  neuronCount: number;
  avatar?: string;
  goal?: string;
}

export interface AuthState {
  uid: string | null;
  email: string | null;
  name: string | null;
  loggedIn: boolean;
  isAdmin?: boolean;
}
