import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { 
  createIdeaAttestation, 
  createUpvoteAttestation, 
  createRemixAttestation, 
  createClaimAttestation, 
  createBuildAttestation, 
  createBuildRatingAttestation,
  getStoredIdeas,
  storeIdea,
  updateIdeaUpvotes,
  addRemixToIdea,
  addClaimToIdea,
  getStoredBuilds,
  storeBuild,
  addRatingToBuild,
  IdeaAttestation,
  ClaimAttestation,
  BuildAttestation,
  BuildRatingAttestation
} from '~/lib/eas';

interface UseEASResult {
  isLoading: boolean;
  error: string | null;
  ideas: IdeaAttestation[];
  builds: BuildAttestation[];
  submitIdea: (title: string, description: string, miniappUrl?: string) => Promise<string | null>;
  upvoteIdea: (ideaUID: string) => Promise<boolean>;
  remixIdea: (originalIdeaUID: string, title: string, description: string, miniappUrl?: string) => Promise<string | null>;
  claimIdea: (ideaUID: string, status?: string) => Promise<string | null>;
  submitBuild: (ideaUID: string, title: string, description: string, buildUrl: string, githubUrl?: string) => Promise<string | null>;
  rateBuild: (buildUID: string, rating: number, comment?: string) => Promise<boolean>;
  refreshData: () => void;
}

export function useEAS(): UseEASResult {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<IdeaAttestation[]>(() => getStoredIdeas());
  const [builds, setBuilds] = useState<BuildAttestation[]>(() => getStoredBuilds());

  const refreshData = useCallback(() => {
    setIdeas(getStoredIdeas());
    setBuilds(getStoredBuilds());
  }, []);

  const submitIdea = useCallback(async (
    title: string, 
    description: string, 
    miniappUrl?: string
  ): Promise<string | null> => {
    if (!address) {
      setError('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const attestationUID = await createIdeaAttestation(title, description, miniappUrl);
      
      const newIdea: IdeaAttestation = {
        uid: attestationUID,
        title,
        description,
        miniappUrl: miniappUrl || "https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes",
        timestamp: Date.now(),
        attester: address,
        upvotes: 0,
        remixes: [],
        claims: []
      };

      storeIdea(newIdea);
      setIdeas(prev => [...prev, newIdea]);
      
      return attestationUID;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit idea';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const upvoteIdea = useCallback(async (ideaUID: string): Promise<boolean> => {
    if (!address) {
      setError('Please connect your wallet');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createUpvoteAttestation(ideaUID);
      
      const currentIdea = ideas.find(idea => idea.uid === ideaUID);
      if (currentIdea) {
        const newUpvotes = currentIdea.upvotes + 1;
        updateIdeaUpvotes(ideaUID, newUpvotes);
        setIdeas(prev => prev.map(idea => 
          idea.uid === ideaUID ? { ...idea, upvotes: newUpvotes } : idea
        ));
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upvote idea';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address, ideas]);

  const remixIdea = useCallback(async (
    originalIdeaUID: string,
    title: string,
    description: string,
    miniappUrl?: string
  ): Promise<string | null> => {
    if (!address) {
      setError('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const attestationUID = await createRemixAttestation(originalIdeaUID, title, description, miniappUrl);
      
      const remix: IdeaAttestation = {
        uid: attestationUID,
        title,
        description,
        miniappUrl: miniappUrl || "https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes",
        timestamp: Date.now(),
        attester: address,
        upvotes: 0,
        remixes: [],
        claims: []
      };

      addRemixToIdea(originalIdeaUID, remix);
      setIdeas(prev => prev.map(idea => 
        idea.uid === originalIdeaUID 
          ? { ...idea, remixes: [...idea.remixes, remix] }
          : idea
      ));
      
      return attestationUID;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remix idea';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const claimIdea = useCallback(async (
    ideaUID: string,
    status: string = 'in_progress'
  ): Promise<string | null> => {
    if (!address) {
      setError('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const attestationUID = await createClaimAttestation(ideaUID, status);
      
      const claim: ClaimAttestation = {
        uid: attestationUID,
        ideaAttestationUID: ideaUID,
        status,
        miniappUrl: '',
        timestamp: Date.now(),
        attester: address
      };

      addClaimToIdea(ideaUID, claim);
      setIdeas(prev => prev.map(idea => 
        idea.uid === ideaUID 
          ? { ...idea, claims: [...idea.claims, claim] }
          : idea
      ));
      
      return attestationUID;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim idea';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const submitBuild = useCallback(async (
    ideaUID: string,
    title: string,
    description: string,
    buildUrl: string,
    githubUrl?: string
  ): Promise<string | null> => {
    if (!address) {
      setError('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const attestationUID = await createBuildAttestation(ideaUID, title, description, buildUrl, githubUrl);
      
      const build: BuildAttestation = {
        uid: attestationUID,
        ideaAttestationUID: ideaUID,
        title,
        description,
        buildUrl,
        githubUrl: githubUrl || '',
        timestamp: Date.now(),
        attester: address,
        ratings: [],
        averageRating: 0
      };

      storeBuild(build);
      setBuilds(prev => [...prev, build]);
      
      return attestationUID;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit build';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const rateBuild = useCallback(async (
    buildUID: string,
    rating: number,
    comment?: string
  ): Promise<boolean> => {
    if (!address) {
      setError('Please connect your wallet');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const attestationUID = await createBuildRatingAttestation(buildUID, rating, comment);
      
      const buildRating: BuildRatingAttestation = {
        uid: attestationUID,
        buildAttestationUID: buildUID,
        rating,
        comment: comment || '',
        timestamp: Date.now(),
        attester: address
      };

      addRatingToBuild(buildUID, buildRating);
      setBuilds(prev => prev.map(build => {
        if (build.uid === buildUID) {
          const newRatings = [...build.ratings, buildRating];
          const totalRatings = newRatings.length;
          const sumRatings = newRatings.reduce((sum, r) => sum + r.rating, 0);
          const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
          
          return {
            ...build,
            ratings: newRatings,
            averageRating
          };
        }
        return build;
      }));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rate build';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  return {
    isLoading,
    error,
    ideas,
    builds,
    submitIdea,
    upvoteIdea,
    remixIdea,
    claimIdea,
    submitBuild,
    rateBuild,
    refreshData
  };
}