import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { BrowserProvider } from "ethers";

// EAS contract addresses
export const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021"; // Base chain
export const SCHEMA_REGISTRY_ADDRESS = "0x4200000000000000000000000000000000000020"; // Base chain

// Schema UIDs for our attestations
export const IDEA_SCHEMA_UID = "0x8e7c66b1b7c6d8e9f2a0b5c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4"; // Placeholder - to be created
export const UPVOTE_SCHEMA_UID = "0x1f2e3d4c5b6a7980e9f8e7d6c5b4a3928170f9e8d7c6b5a4938291a0b9c8d7e6f5"; // Placeholder - to be created
export const REMIX_SCHEMA_UID = "0x6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"; // Placeholder - to be created
export const CLAIM_SCHEMA_UID = "0x9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7"; // Placeholder - to be created
export const BUILD_SCHEMA_UID = "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6"; // Placeholder - to be created
export const BUILD_RATING_SCHEMA_UID = "0x7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9"; // Placeholder - to be created

// Schema definitions
export const IDEA_SCHEMA = "string title,string description,string miniappUrl,uint256 timestamp";
export const UPVOTE_SCHEMA = "bytes32 ideaAttestationUID,uint256 timestamp";
export const REMIX_SCHEMA = "bytes32 originalIdeaUID,string title,string description,string miniappUrl,uint256 timestamp";
export const CLAIM_SCHEMA = "bytes32 ideaAttestationUID,string status,string miniappUrl,uint256 timestamp";
export const BUILD_SCHEMA = "bytes32 ideaAttestationUID,string title,string description,string buildUrl,string githubUrl,uint256 timestamp";
export const BUILD_RATING_SCHEMA = "bytes32 buildAttestationUID,uint256 rating,string comment,uint256 timestamp";

export interface IdeaAttestation {
  uid: string;
  title: string;
  description: string;
  miniappUrl: string;
  timestamp: number;
  attester: string;
  upvotes: number;
  remixes: IdeaAttestation[];
  claims: ClaimAttestation[];
}

export interface ClaimAttestation {
  uid: string;
  ideaAttestationUID: string;
  status: string;
  miniappUrl: string;
  timestamp: number;
  attester: string;
}

export interface BuildAttestation {
  uid: string;
  ideaAttestationUID: string;
  title: string;
  description: string;
  buildUrl: string;
  githubUrl: string;
  timestamp: number;
  attester: string;
  ratings: BuildRatingAttestation[];
  averageRating: number;
}

export interface BuildRatingAttestation {
  uid: string;
  buildAttestationUID: string;
  rating: number;
  comment: string;
  timestamp: number;
  attester: string;
}

export async function getEAS(): Promise<EAS> {
  if (typeof window === "undefined") {
    throw new Error("EAS can only be used in browser environment");
  }

  const provider = new BrowserProvider(window.ethereum);
  const eas = new EAS(EAS_CONTRACT_ADDRESS);
  eas.connect(provider);
  
  return eas;
}

export async function createIdeaAttestation(
  title: string,
  description: string,
  miniappUrl: string = ""
): Promise<string> {
  const eas = await getEAS();
  const schemaEncoder = new SchemaEncoder(IDEA_SCHEMA);
  
  const encodedData = schemaEncoder.encodeData([
    { name: "title", value: title, type: "string" },
    { name: "description", value: description, type: "string" },
    { name: "miniappUrl", value: miniappUrl, type: "string" },
    { name: "timestamp", value: BigInt(Date.now()), type: "uint256" }
  ]);

  const tx = await eas.attest({
    schema: IDEA_SCHEMA_UID,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: 0n,
      revocable: false,
      data: encodedData,
    },
  });

  const newAttestationUID = await tx.wait();
  return newAttestationUID;
}

export async function createUpvoteAttestation(ideaAttestationUID: string): Promise<string> {
  const eas = await getEAS();
  const schemaEncoder = new SchemaEncoder(UPVOTE_SCHEMA);
  
  const encodedData = schemaEncoder.encodeData([
    { name: "ideaAttestationUID", value: ideaAttestationUID, type: "bytes32" },
    { name: "timestamp", value: BigInt(Date.now()), type: "uint256" }
  ]);

  const tx = await eas.attest({
    schema: UPVOTE_SCHEMA_UID,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: 0n,
      revocable: false,
      data: encodedData,
    },
  });

  const newAttestationUID = await tx.wait();
  return newAttestationUID;
}

export async function createRemixAttestation(
  originalIdeaUID: string,
  title: string,
  description: string,
  miniappUrl: string = ""
): Promise<string> {
  const eas = await getEAS();
  const schemaEncoder = new SchemaEncoder(REMIX_SCHEMA);
  
  const encodedData = schemaEncoder.encodeData([
    { name: "originalIdeaUID", value: originalIdeaUID, type: "bytes32" },
    { name: "title", value: title, type: "string" },
    { name: "description", value: description, type: "string" },
    { name: "miniappUrl", value: miniappUrl, type: "string" },
    { name: "timestamp", value: BigInt(Date.now()), type: "uint256" }
  ]);

  const tx = await eas.attest({
    schema: REMIX_SCHEMA_UID,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: 0n,
      revocable: false,
      data: encodedData,
    },
  });

  const newAttestationUID = await tx.wait();
  return newAttestationUID;
}

export async function createClaimAttestation(
  ideaAttestationUID: string,
  status: string = "in_progress",
  miniappUrl: string = ""
): Promise<string> {
  const eas = await getEAS();
  const schemaEncoder = new SchemaEncoder(CLAIM_SCHEMA);
  
  const encodedData = schemaEncoder.encodeData([
    { name: "ideaAttestationUID", value: ideaAttestationUID, type: "bytes32" },
    { name: "status", value: status, type: "string" },
    { name: "miniappUrl", value: miniappUrl, type: "string" },
    { name: "timestamp", value: BigInt(Date.now()), type: "uint256" }
  ]);

  const tx = await eas.attest({
    schema: CLAIM_SCHEMA_UID,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: 0n,
      revocable: false,
      data: encodedData,
    },
  });

  const newAttestationUID = await tx.wait();
  return newAttestationUID;
}

// API helpers for storing attestations in Supabase
export async function getStoredIdeas(): Promise<IdeaAttestation[]> {
  try {
    const response = await fetch('/api/ideas');
    if (!response.ok) {
      throw new Error('Failed to fetch ideas');
    }
    const data = await response.json();
    
    // Convert database format to IdeaAttestation format
    return data.map((item: any) => ({
      uid: item.uid,
      title: item.title,
      description: item.description,
      miniappUrl: item.miniapp_url || '',
      timestamp: item.timestamp,
      attester: item.attester,
      upvotes: item.upvotes || 0,
      remixes: item.remixes || [],
      claims: item.claims || []
    }));
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return [];
  }
}

export async function storeIdea(idea: IdeaAttestation): Promise<void> {
  try {
    const response = await fetch('/api/ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: idea.uid,
        title: idea.title,
        description: idea.description,
        miniappUrl: idea.miniappUrl,
        timestamp: idea.timestamp,
        attester: idea.attester
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to store idea');
    }
  } catch (error) {
    console.error('Error storing idea:', error);
    throw error;
  }
}

export async function updateIdeaUpvotes(ideaUID: string, upvotes: number): Promise<void> {
  try {
    const response = await fetch(`/api/ideas/${ideaUID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ upvotes }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update idea upvotes');
    }
  } catch (error) {
    console.error('Error updating idea upvotes:', error);
    throw error;
  }
}

export async function addRemixToIdea(originalIdeaUID: string, remix: IdeaAttestation): Promise<void> {
  try {
    // Get current idea
    const response = await fetch(`/api/ideas/${originalIdeaUID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch idea');
    }
    const idea = await response.json();
    
    // Add remix to the remixes array
    const updatedRemixes = [...(idea.remixes || []), remix];
    
    // Update the idea
    const updateResponse = await fetch(`/api/ideas/${originalIdeaUID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ remixes: updatedRemixes }),
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update idea with remix');
    }
  } catch (error) {
    console.error('Error adding remix to idea:', error);
    throw error;
  }
}

export async function addClaimToIdea(ideaUID: string, claim: ClaimAttestation): Promise<void> {
  try {
    // Get current idea
    const response = await fetch(`/api/ideas/${ideaUID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch idea');
    }
    const idea = await response.json();
    
    // Add claim to the claims array
    const updatedClaims = [...(idea.claims || []), claim];
    
    // Update the idea
    const updateResponse = await fetch(`/api/ideas/${ideaUID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claims: updatedClaims }),
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update idea with claim');
    }
  } catch (error) {
    console.error('Error adding claim to idea:', error);
    throw error;
  }
}

export async function createBuildAttestation(
  ideaAttestationUID: string,
  title: string,
  description: string,
  buildUrl: string,
  githubUrl: string = ""
): Promise<string> {
  const eas = await getEAS();
  const schemaEncoder = new SchemaEncoder(BUILD_SCHEMA);
  
  const encodedData = schemaEncoder.encodeData([
    { name: "ideaAttestationUID", value: ideaAttestationUID, type: "bytes32" },
    { name: "title", value: title, type: "string" },
    { name: "description", value: description, type: "string" },
    { name: "buildUrl", value: buildUrl, type: "string" },
    { name: "githubUrl", value: githubUrl, type: "string" },
    { name: "timestamp", value: BigInt(Date.now()), type: "uint256" }
  ]);

  const tx = await eas.attest({
    schema: BUILD_SCHEMA_UID,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: 0n,
      revocable: false,
      data: encodedData,
    },
  });

  const newAttestationUID = await tx.wait();
  return newAttestationUID;
}

export async function createBuildRatingAttestation(
  buildAttestationUID: string,
  rating: number,
  comment: string = ""
): Promise<string> {
  const eas = await getEAS();
  const schemaEncoder = new SchemaEncoder(BUILD_RATING_SCHEMA);
  
  const encodedData = schemaEncoder.encodeData([
    { name: "buildAttestationUID", value: buildAttestationUID, type: "bytes32" },
    { name: "rating", value: BigInt(rating), type: "uint256" },
    { name: "comment", value: comment, type: "string" },
    { name: "timestamp", value: BigInt(Date.now()), type: "uint256" }
  ]);

  const tx = await eas.attest({
    schema: BUILD_RATING_SCHEMA_UID,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: 0n,
      revocable: false,
      data: encodedData,
    },
  });

  const newAttestationUID = await tx.wait();
  return newAttestationUID;
}

// Build storage helpers
export async function getStoredBuilds(): Promise<BuildAttestation[]> {
  try {
    const response = await fetch('/api/builds');
    if (!response.ok) {
      throw new Error('Failed to fetch builds');
    }
    const data = await response.json();
    
    // Convert database format to BuildAttestation format
    return data.map((item: any) => ({
      uid: item.uid,
      ideaAttestationUID: item.idea_attestation_uid,
      title: item.title,
      description: item.description,
      buildUrl: item.build_url,
      githubUrl: item.github_url || '',
      timestamp: item.timestamp,
      attester: item.attester,
      ratings: item.ratings || [],
      averageRating: item.average_rating || 0
    }));
  } catch (error) {
    console.error('Error fetching builds:', error);
    return [];
  }
}

export async function storeBuild(build: BuildAttestation): Promise<void> {
  try {
    const response = await fetch('/api/builds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: build.uid,
        ideaAttestationUID: build.ideaAttestationUID,
        title: build.title,
        description: build.description,
        buildUrl: build.buildUrl,
        githubUrl: build.githubUrl,
        timestamp: build.timestamp,
        attester: build.attester
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to store build');
    }
  } catch (error) {
    console.error('Error storing build:', error);
    throw error;
  }
}

export async function addRatingToBuild(buildUID: string, rating: BuildRatingAttestation): Promise<void> {
  try {
    // Get current build
    const response = await fetch(`/api/builds/${buildUID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch build');
    }
    const build = await response.json();
    
    // Add rating to the ratings array
    const updatedRatings = [...(build.ratings || []), rating];
    
    // Recalculate average rating
    const totalRatings = updatedRatings.length;
    const sumRatings = updatedRatings.reduce((sum: number, r: BuildRatingAttestation) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
    
    // Update the build
    const updateResponse = await fetch(`/api/builds/${buildUID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        ratings: updatedRatings,
        average_rating: averageRating
      }),
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update build with rating');
    }
  } catch (error) {
    console.error('Error adding rating to build:', error);
    throw error;
  }
}