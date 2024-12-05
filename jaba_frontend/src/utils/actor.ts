import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory } from './voting_canister_backend.did.js';

let actor: any = null;

// Determine the host and canister ID based on environment
const getHostAndCanisterId = () => {
  const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV !== 'production';
  
  // Development configuration
  if (isDevelopment) {
    const localCanisterId = process.env.NEXT_PUBLIC_VOTING_CANISTER_ID;
    return {
      host: "http://bw4dl-smaaa-aaaaa-qaacq-cai.localhost:4943",
      canisterId: localCanisterId || 'aaaaa-aa'
    };
  }
  
  // Production configuration
  return {
    host: 'https://icp0.io',
    canisterId: process.env.NEXT_PUBLIC_VOTING_CANISTER_ID || 'be2us-64aaa-aaaaa-qaabq-cai'
  };
};

/**
 * Create or retrieve the actor instance.
 */
export const createActor = async (): Promise<any> => {
  if (actor) return actor;

  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();

  if (!identity) {
    console.error('No identity found. User might not be logged in.');
    return null;
  }

  const { host, canisterId } = getHostAndCanisterId();
  console.log('Connecting to host:', host);
  console.log('Using canister ID:', canisterId);

  const agent = await HttpAgent.create({
    host,
    identity,
  });

  //Only fetch root key in development
  if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
    await agent.fetchRootKey().catch((err: any) => {
      console.warn('Unable to fetch root key. Check internet connection');
      console.error(err);
    });
  }

  actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });

  return actor;
};

/**
 * Log in the user via Internet Identity and register their principal on the backend.
 */
export const login = async (name: string, email: string): Promise<boolean> => {
  const authClient = await AuthClient.create();
  const { host } = getHostAndCanisterId();

  return new Promise<boolean>((resolve) => {
    authClient.login({
      identityProvider: process.env.NEXT_PUBLIC_NODE_ENV !== 'production' 
        ? host 
        : 'https://identity.ic0.app',
      onSuccess: async () => {
        actor = null; // Reset actor to force re-creation with new identity
        const actorInstance = await createActor();

        // Retrieve the logged-in user's principal
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal().toText();

        console.log('Logged in as:', principal);
        console.log('Name:', name);
        console.log('Email:', email);

        // Register or update the user on the backend
        try {
          const result = await actorInstance.addOrUpdateUser(
            principal,
            name,
            email
          );

          // Check if the result indicates success
          if ('Ok' in result) {
            console.log(`User ${principal} registered or updated successfully.`);
            resolve(true);
          } else {
            console.error('Failed to register user', result);
            resolve(false);
          }
        } catch (err) {
          console.error(`Failed to register user: ${(err as Error).message}`);
          resolve(false);
        }
      },
      onError: (error) => {
        console.error('Login error:', error);
        resolve(false);
      },
    });
  });
};

// Rest of the code remains the same (logout, getPrincipal functions)
export const logout = async (): Promise<void> => {
  const authClient = await AuthClient.create();
  await authClient.logout();
  actor = null; // Reset actor
  console.log('User logged out successfully.');
};

export const getPrincipal = async (): Promise<Object | null> => {
  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();

  if (!identity) {
    console.error('No identity found. User might not be logged in.');
    return null;
  }

  return {
    principal: { toText: () => identity.getPrincipal().toText() }
  };
};


