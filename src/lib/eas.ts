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

// Local storage helpers for caching attestations
export function getStoredIdeas(): IdeaAttestation[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem("ideas");
  return stored ? JSON.parse(stored) : [];
}

export function storeIdea(idea: IdeaAttestation) {
  if (typeof window === "undefined") return;
  
  const ideas = getStoredIdeas();
  ideas.push(idea);
  localStorage.setItem("ideas", JSON.stringify(ideas));
}

export function updateIdeaUpvotes(ideaUID: string, upvotes: number) {
  if (typeof window === "undefined") return;
  
  const ideas = getStoredIdeas();
  const ideaIndex = ideas.findIndex(idea => idea.uid === ideaUID);
  
  if (ideaIndex !== -1) {
    ideas[ideaIndex].upvotes = upvotes;
    localStorage.setItem("ideas", JSON.stringify(ideas));
  }
}

export function addRemixToIdea(originalIdeaUID: string, remix: IdeaAttestation) {
  if (typeof window === "undefined") return;
  
  const ideas = getStoredIdeas();
  const ideaIndex = ideas.findIndex(idea => idea.uid === originalIdeaUID);
  
  if (ideaIndex !== -1) {
    ideas[ideaIndex].remixes.push(remix);
    localStorage.setItem("ideas", JSON.stringify(ideas));
  }
}

export function addClaimToIdea(ideaUID: string, claim: ClaimAttestation) {
  if (typeof window === "undefined") return;
  
  const ideas = getStoredIdeas();
  const ideaIndex = ideas.findIndex(idea => idea.uid === ideaUID);
  
  if (ideaIndex !== -1) {
    ideas[ideaIndex].claims.push(claim);
    localStorage.setItem("ideas", JSON.stringify(ideas));
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
export function getStoredBuilds(): BuildAttestation[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem("builds");
  return stored ? JSON.parse(stored) : [];
}

export function storeBuild(build: BuildAttestation) {
  if (typeof window === "undefined") return;
  
  const builds = getStoredBuilds();
  builds.push(build);
  localStorage.setItem("builds", JSON.stringify(builds));
}

export function addRatingToBuild(buildUID: string, rating: BuildRatingAttestation) {
  if (typeof window === "undefined") return;
  
  const builds = getStoredBuilds();
  const buildIndex = builds.findIndex(build => build.uid === buildUID);
  
  if (buildIndex !== -1) {
    builds[buildIndex].ratings.push(rating);
    // Recalculate average rating
    const totalRatings = builds[buildIndex].ratings.length;
    const sumRatings = builds[buildIndex].ratings.reduce((sum, r) => sum + r.rating, 0);
    builds[buildIndex].averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
    localStorage.setItem("builds", JSON.stringify(builds));
  }
}