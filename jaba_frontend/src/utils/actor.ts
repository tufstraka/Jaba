import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory } from './voting_canister_backend.did.js';

let actor: any = null;
let host = process.env.NEXT_PUBLIC_IC_HOST || 'https://ic0.app';
let canisterId = process.env.NEXT_PUBLIC_VOTING_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai';

/**
 * Create or retrieve the actor instance.
 */
export const createActor = async (): Promise<any> => {
  /*if (actor) return actor;

  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();

  if (!identity) {
    console.error('No identity found. User might not be logged in.');
    return null;
  }



  const agent = await HttpAgent.create({ 
    identity, 
    host: host,
    verifyQuerySignatures: false 
  });*/

  const agent = await HttpAgent.create({ host, verifyQuerySignatures: false });


   //Only fetch root key in development
  if (process.env.NODE_ENV !== 'production') {
    await agent.fetchRootKey().catch(err => {
      console.warn('Unable to fetch root key. Check internet connection');
    });
  }

  actor = Actor.createActor(idlFactory, {
    agent,
    canisterId: canisterId,
  });

  return actor;
};

/**
 * Log in the user via Internet Identity and register their principal on the backend.
 */
export const login = async (name: string, email: string): Promise<boolean> => {
  const authClient = await AuthClient.create();

  return new Promise<boolean>((resolve) => {
    authClient.login({
      identityProvider: `https://identity.ic0.app/#authorize`,
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

/**
 * Log out the user and reset the actor.
 */
export const logout = async (): Promise<void> => {
  const authClient = await AuthClient.create();
  await authClient.logout();
  actor = null; // Reset actor
  console.log('User logged out successfully.');
};

/**
 * Helper function to retrieve the current user's principal.
 */
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


