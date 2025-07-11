"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { 
  createIdeaAttestation, 
  createUpvoteAttestation, 
  createRemixAttestation, 
  createClaimAttestation,
  createBuildAttestation,
  createBuildRatingAttestation,
  getStoredIdeas,
  getStoredBuilds,
  storeIdea,
  storeBuild,
  updateIdeaUpvotes,
  addRemixToIdea,
  addClaimToIdea,
  addRatingToBuild,
  type IdeaAttestation,
  type ClaimAttestation,
  type BuildAttestation,
  type BuildRatingAttestation
} from "~/lib/eas";
import { toast } from "sonner";

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  submitter: string;
  timestamp: number;
  attestationHash?: string;
  upvotes: number;
  upvoters: string[];
  remixes: Remix[];
  claimedBy?: string;
  status: "open" | "in_progress" | "completed";
  miniappUrl?: string;
}

export interface Remix {
  id: string;
  originalId: string;
  title: string;
  description: string;
  submitter: string;
  timestamp: number;
  attestationHash?: string;
}

export interface Upvote {
  id: string;
  ideaId: string;
  voter: string;
  timestamp: number;
  attestationHash?: string;
}

export interface Build {
  id: string;
  ideaId: string;
  title: string;
  description: string;
  buildUrl: string;
  githubUrl: string;
  builder: string;
  timestamp: number;
  attestationHash?: string;
  ratings: BuildRating[];
  averageRating: number;
}

export interface BuildRating {
  id: string;
  buildId: string;
  rating: number;
  comment: string;
  rater: string;
  timestamp: number;
  attestationHash?: string;
}

export function useIdeasAttestation() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

  // Load ideas from localStorage on mount
  useEffect(() => {
    const savedIdeas = localStorage.getItem("ideacraction-ideas");
    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    } else {
      // Initialize with some sample ideas
      const sampleIdeas: Idea[] = [
        {
          id: "sample-1",
          title: "Decentralized Reputation System",
          description: "Build a reputation system that tracks developer contributions across different platforms and protocols, creating a unified reputation score.",
          category: "infrastructure",
          submitter: "0x742d35Cc6634C0532925a3b8D39",
          timestamp: Date.now() - 86400000, // 1 day ago
          attestationHash: "0x1234567890abcdef1234567890abcdef12345678",
          upvotes: 15,
          upvoters: ["0x123...abc", "0x456...def"],
          remixes: [],
          status: "open",
          miniappUrl: "https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes"
        },
        {
          id: "sample-2", 
          title: "Social Trading Platform",
          description: "Create a platform where users can follow successful traders and automatically copy their moves, with built-in risk management.",
          category: "defi",
          submitter: "0x8f3CF7ad23Cd3CaDbD9735AFf958",
          timestamp: Date.now() - 172800000, // 2 days ago  
          attestationHash: "0x9876543210fedcba9876543210fedcba98765432",
          upvotes: 8,
          upvoters: ["0x789...ghi"],
          remixes: [],
          status: "open",
          miniappUrl: "https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes"
        },
        {
          id: "sample-3",
          title: "NFT Rental Marketplace", 
          description: "A marketplace where NFT owners can rent out their NFTs for utility purposes (gaming, access, etc.) with automatic smart contract management.",
          category: "nft",
          submitter: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
          timestamp: Date.now() - 259200000, // 3 days ago
          attestationHash: "0xabcdef1234567890abcdef1234567890abcdef12",
          upvotes: 23,
          upvoters: ["0x111...222", "0x333...444", "0x555...666"],
          remixes: [],
          status: "in_progress",
          claimedBy: "0x456...def",
          miniappUrl: "https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes"
        }
      ];
      setIdeas(sampleIdeas);
    }
  }, []);

  // Load builds from localStorage on mount
  useEffect(() => {
    const savedBuilds = localStorage.getItem("ideacraction-builds");
    if (savedBuilds) {
      setBuilds(JSON.parse(savedBuilds));
    }
  }, []);

  // Save ideas to localStorage whenever ideas change
  useEffect(() => {
    localStorage.setItem("ideacraction-ideas", JSON.stringify(ideas));
  }, [ideas]);

  // Save builds to localStorage whenever builds change
  useEffect(() => {
    localStorage.setItem("ideacraction-builds", JSON.stringify(builds));
  }, [builds]);

  const submitIdea = async (ideaData: {
    title: string;
    description: string;
    category: string;
    submitter: string;
  }) => {
    setLoading(true);
    try {
      const newIdea: Idea = {
        id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...ideaData,
        timestamp: Date.now(),
        upvotes: 0,
        upvoters: [],
        remixes: [],
        status: "open",
        miniappUrl: "https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes",
      };

      try {
        // Try to create real EAS attestation
        const attestationUID = await createIdeaAttestation(
          ideaData.title,
          ideaData.description,
          newIdea.miniappUrl
        );
        newIdea.attestationHash = attestationUID;
        
        // Store the idea with EAS UID
        const easIdea: IdeaAttestation = {
          uid: attestationUID,
          title: ideaData.title,
          description: ideaData.description,
          miniappUrl: newIdea.miniappUrl || "https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes",
          timestamp: Date.now(),
          attester: address || "anonymous",
          upvotes: 0,
          remixes: [],
          claims: []
        };
        storeIdea(easIdea);
        
        toast.success("Idea attested on-chain successfully!");
      } catch (error) {
        console.warn("Failed to create EAS attestation, using mock:", error);
        // Fallback to mock attestation
        const attestationHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        newIdea.attestationHash = attestationHash;
        
        toast.success("Idea submitted successfully!");
      }

      setIdeas((prev) => [newIdea, ...prev]);
      return newIdea;
    } finally {
      setLoading(false);
    }
  };

  const upvoteIdea = async (ideaId: string) => {
    if (!address) return;

    setLoading(true);
    try {
      const idea = ideas.find(i => i.id === ideaId);
      if (!idea) return;

      // Check if user already upvoted
      if (idea.upvoters.includes(address)) {
        toast.error("You've already upvoted this idea!");
        return;
      }

      try {
        // Try to create real EAS upvote attestation
        const upvoteUID = await createUpvoteAttestation(idea.attestationHash || idea.id);
        
        setIdeas((prev) =>
          prev.map((idea) => {
            if (idea.id === ideaId) {
              const newUpvotes = idea.upvotes + 1;
              updateIdeaUpvotes(idea.attestationHash || idea.id, newUpvotes);
              
              return {
                ...idea,
                upvotes: newUpvotes,
                upvoters: [...idea.upvoters, address],
              };
            }
            return idea;
          })
        );

        toast.success("Upvote attested on-chain!");
      } catch (error) {
        console.warn("Failed to create EAS upvote attestation, using mock:", error);
        
        // Fallback to mock upvote
        setIdeas((prev) =>
          prev.map((idea) => {
            if (idea.id === ideaId) {
              return {
                ...idea,
                upvotes: idea.upvotes + 1,
                upvoters: [...idea.upvoters, address],
              };
            }
            return idea;
          })
        );

        toast.success("Upvote recorded!");
      }
    } finally {
      setLoading(false);
    }
  };

  const remixIdea = async (
    originalId: string,
    remixData: {
      title: string;
      description: string;
    }
  ) => {
    if (!address) return;

    setLoading(true);
    try {
      const originalIdea = ideas.find(i => i.id === originalId);
      if (!originalIdea) return;

      const newRemix: Remix = {
        id: `remix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalId,
        ...remixData,
        submitter: address,
        timestamp: Date.now(),
      };

      try {
        // Try to create real EAS remix attestation
        const remixUID = await createRemixAttestation(
          originalIdea.attestationHash || originalId,
          remixData.title,
          remixData.description,
          "https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes"
        );
        
        newRemix.attestationHash = remixUID;
        
        // Store the remix with EAS UID
        const easRemix: IdeaAttestation = {
          uid: remixUID,
          title: remixData.title,
          description: remixData.description,
          miniappUrl: "https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes",
          timestamp: Date.now(),
          attester: address,
          upvotes: 0,
          remixes: [],
          claims: []
        };
        addRemixToIdea(originalIdea.attestationHash || originalId, easRemix);
        
        toast.success("Remix attested on-chain!");
      } catch (error) {
        console.warn("Failed to create EAS remix attestation, using mock:", error);
        newRemix.attestationHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        toast.success("Remix submitted!");
      }

      setIdeas((prev) =>
        prev.map((idea) => {
          if (idea.id === originalId) {
            return {
              ...idea,
              remixes: [...idea.remixes, newRemix],
            };
          }
          return idea;
        })
      );

      return newRemix;
    } finally {
      setLoading(false);
    }
  };

  const claimIdea = async (ideaId: string) => {
    if (!address) return;

    setLoading(true);
    try {
      const idea = ideas.find(i => i.id === ideaId);
      if (!idea || idea.status !== "open") {
        toast.error("Idea is not available for claiming!");
        return;
      }

      try {
        // Try to create real EAS claim attestation
        const claimUID = await createClaimAttestation(
          idea.attestationHash || ideaId,
          "in_progress"
        );
        
        // Store the claim with EAS UID
        const easClaim: ClaimAttestation = {
          uid: claimUID,
          ideaAttestationUID: idea.attestationHash || ideaId,
          status: "in_progress",
          miniappUrl: "",
          timestamp: Date.now(),
          attester: address
        };
        addClaimToIdea(idea.attestationHash || ideaId, easClaim);
        
        toast.success("Claim attested on-chain!");
      } catch (error) {
        console.warn("Failed to create EAS claim attestation, using mock:", error);
        toast.success("Idea claimed!");
      }

      setIdeas((prev) =>
        prev.map((idea) => {
          if (idea.id === ideaId && idea.status === "open") {
            return {
              ...idea,
              claimedBy: address,
              status: "in_progress" as const,
            };
          }
          return idea;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const getIdeasByCategory = (category: string) => {
    return ideas.filter((idea) => idea.category === category);
  };

  const getIdeasByUser = (userAddress: string) => {
    return ideas.filter((idea) => idea.submitter === userAddress);
  };

  const getUpvotedIdeas = (userAddress: string) => {
    return ideas.filter((idea) => idea.upvoters.includes(userAddress));
  };

  const getClaimedIdeas = (userAddress: string) => {
    return ideas.filter((idea) => idea.claimedBy === userAddress);
  };

  const submitBuild = async (buildData: {
    ideaId: string;
    title: string;
    description: string;
    buildUrl: string;
    githubUrl?: string;
  }) => {
    if (!address) return;

    setLoading(true);
    try {
      const idea = ideas.find(i => i.id === buildData.ideaId);
      if (!idea) {
        toast.error("Idea not found!");
        return;
      }

      const newBuild: Build = {
        id: `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ideaId: buildData.ideaId,
        title: buildData.title,
        description: buildData.description,
        buildUrl: buildData.buildUrl,
        githubUrl: buildData.githubUrl || "",
        builder: address,
        timestamp: Date.now(),
        ratings: [],
        averageRating: 0,
      };

      try {
        // Try to create real EAS build attestation
        const buildUID = await createBuildAttestation(
          idea.attestationHash || buildData.ideaId,
          buildData.title,
          buildData.description,
          buildData.buildUrl,
          buildData.githubUrl || ""
        );
        
        newBuild.attestationHash = buildUID;
        
        // Store the build with EAS UID
        const easBuild: BuildAttestation = {
          uid: buildUID,
          ideaAttestationUID: idea.attestationHash || buildData.ideaId,
          title: buildData.title,
          description: buildData.description,
          buildUrl: buildData.buildUrl,
          githubUrl: buildData.githubUrl || "",
          timestamp: Date.now(),
          attester: address,
          ratings: [],
          averageRating: 0
        };
        storeBuild(easBuild);
        
        toast.success("Build attested on-chain!");
      } catch (error) {
        console.warn("Failed to create EAS build attestation, using mock:", error);
        newBuild.attestationHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        toast.success("Build submitted!");
      }

      // Update the idea status to completed
      setIdeas((prev) =>
        prev.map((idea) => {
          if (idea.id === buildData.ideaId) {
            return {
              ...idea,
              status: "completed" as const,
            };
          }
          return idea;
        })
      );

      setBuilds((prev) => [newBuild, ...prev]);
      return newBuild;
    } finally {
      setLoading(false);
    }
  };

  const rateBuild = async (buildId: string, rating: number, comment: string = "") => {
    if (!address) return;

    setLoading(true);
    try {
      const build = builds.find(b => b.id === buildId);
      if (!build) {
        toast.error("Build not found!");
        return;
      }

      // Check if user already rated this build
      if (build.ratings.some(r => r.rater === address)) {
        toast.error("You've already rated this build!");
        return;
      }

      const newRating: BuildRating = {
        id: `rating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        buildId,
        rating,
        comment,
        rater: address,
        timestamp: Date.now(),
      };

      try {
        // Try to create real EAS rating attestation
        const ratingUID = await createBuildRatingAttestation(
          build.attestationHash || buildId,
          rating,
          comment
        );
        
        newRating.attestationHash = ratingUID;
        
        // Store the rating with EAS UID
        const easRating: BuildRatingAttestation = {
          uid: ratingUID,
          buildAttestationUID: build.attestationHash || buildId,
          rating,
          comment,
          timestamp: Date.now(),
          attester: address
        };
        addRatingToBuild(build.attestationHash || buildId, easRating);
        
        toast.success("Rating attested on-chain!");
      } catch (error) {
        console.warn("Failed to create EAS rating attestation, using mock:", error);
        newRating.attestationHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        toast.success("Rating submitted!");
      }

      setBuilds((prev) =>
        prev.map((build) => {
          if (build.id === buildId) {
            const newRatings = [...build.ratings, newRating];
            const newAverage = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;
            return {
              ...build,
              ratings: newRatings,
              averageRating: newAverage,
            };
          }
          return build;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const getBuildsByIdea = (ideaId: string) => {
    return builds.filter((build) => build.ideaId === ideaId);
  };

  const getBuildsByUser = (userAddress: string) => {
    return builds.filter((build) => build.builder === userAddress);
  };

  const getTopRatedBuilds = () => {
    return builds.sort((a, b) => b.averageRating - a.averageRating);
  };

  return {
    ideas,
    builds,
    loading,
    submitIdea,
    upvoteIdea,
    remixIdea,
    claimIdea,
    submitBuild,
    rateBuild,
    getIdeasByCategory,
    getIdeasByUser,
    getUpvotedIdeas,
    getClaimedIdeas,
    getBuildsByIdea,
    getBuildsByUser,
    getTopRatedBuilds,
  };
}