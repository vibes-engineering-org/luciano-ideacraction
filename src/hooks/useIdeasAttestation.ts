"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

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

export function useIdeasAttestation() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

  // Load ideas from localStorage on mount
  useEffect(() => {
    const savedIdeas = localStorage.getItem("ideacraction-ideas");
    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    }
  }, []);

  // Save ideas to localStorage whenever ideas change
  useEffect(() => {
    localStorage.setItem("ideacraction-ideas", JSON.stringify(ideas));
  }, [ideas]);

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
      };

      // Simulate attestation creation (in real app, this would interact with blockchain)
      const attestationHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      newIdea.attestationHash = attestationHash;

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
      setIdeas((prev) =>
        prev.map((idea) => {
          if (idea.id === ideaId) {
            // Check if user already upvoted
            if (idea.upvoters.includes(address)) {
              return idea; // Already upvoted
            }
            
            return {
              ...idea,
              upvotes: idea.upvotes + 1,
              upvoters: [...idea.upvoters, address],
            };
          }
          return idea;
        })
      );

      // Simulate upvote attestation
      const upvoteAttestation = {
        id: `upvote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ideaId,
        voter: address,
        timestamp: Date.now(),
        attestationHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };

      console.log("Upvote attestation created:", upvoteAttestation);
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
      const newRemix: Remix = {
        id: `remix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalId,
        ...remixData,
        submitter: address,
        timestamp: Date.now(),
        attestationHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };

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

  return {
    ideas,
    loading,
    submitIdea,
    upvoteIdea,
    remixIdea,
    claimIdea,
    getIdeasByCategory,
    getIdeasByUser,
    getUpvotedIdeas,
    getClaimedIdeas,
  };
}