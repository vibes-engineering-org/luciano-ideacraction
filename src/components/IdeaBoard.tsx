"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { ThumbsUp, GitFork, Wrench, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";
import { 
  getStoredIdeas, 
  createUpvoteAttestation, 
  createRemixAttestation,
  createClaimAttestation,
  updateIdeaUpvotes,
  addRemixToIdea,
  addClaimToIdea,
  type IdeaAttestation, 
  type ClaimAttestation 
} from "~/lib/eas";
import { useAccount } from "wagmi";

interface IdeaBoardProps {
  refreshTrigger?: number;
}

export default function IdeaBoard({ refreshTrigger }: IdeaBoardProps) {
  const [ideas, setIdeas] = useState<IdeaAttestation[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    loadIdeas();
  }, [refreshTrigger]);

  const loadIdeas = () => {
    setLoading(true);
    try {
      const storedIdeas = getStoredIdeas();
      // Sort by timestamp (newest first)
      const sortedIdeas = storedIdeas.sort((a, b) => b.timestamp - a.timestamp);
      setIdeas(sortedIdeas);
    } catch (error) {
      console.error("Error loading ideas:", error);
      toast.error("Failed to load ideas");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (ideaUID: string) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to upvote");
      return;
    }

    try {
      await createUpvoteAttestation(ideaUID);
      
      // Update local storage
      const idea = ideas.find(i => i.uid === ideaUID);
      if (idea) {
        const newUpvotes = idea.upvotes + 1;
        updateIdeaUpvotes(ideaUID, newUpvotes);
        
        // Update local state
        setIdeas(prev => prev.map(i => 
          i.uid === ideaUID ? { ...i, upvotes: newUpvotes } : i
        ));
      }
      
      toast.success("Upvote submitted and attested on-chain!");
    } catch (error) {
      console.error("Error upvoting idea:", error);
      toast.error("Failed to upvote. Please try again.");
    }
  };

  const handleRemix = async (originalIdea: IdeaAttestation) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to remix");
      return;
    }

    const title = prompt("Enter remix title:");
    const description = prompt("Enter remix description:");
    
    if (!title || !description) return;

    try {
      const remixUID = await createRemixAttestation(
        originalIdea.uid,
        title,
        description
      );

      const remix: IdeaAttestation = {
        uid: remixUID,
        title,
        description,
        miniappUrl: originalIdea.miniappUrl,
        timestamp: Date.now(),
        attester: address,
        upvotes: 0,
        remixes: [],
        claims: [],
      };

      // Add to original idea&apos;s remixes
      addRemixToIdea(originalIdea.uid, remix);
      
      // Reload ideas
      loadIdeas();
      
      toast.success("Remix created and attested on-chain!");
    } catch (error) {
      console.error("Error creating remix:", error);
      toast.error("Failed to create remix. Please try again.");
    }
  };

  const handleClaim = async (ideaUID: string) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to claim");
      return;
    }

    try {
      const claimUID = await createClaimAttestation(ideaUID);
      
      const claim: ClaimAttestation = {
        uid: claimUID,
        ideaAttestationUID: ideaUID,
        status: "in_progress",
        timestamp: Date.now(),
        attester: address,
      };

      // Add to idea&apos;s claims
      addClaimToIdea(ideaUID, claim);
      
      // Reload ideas
      loadIdeas();
      
      toast.success("Claim submitted and attested on-chain!");
    } catch (error) {
      console.error("Error claiming idea:", error);
      toast.error("Failed to claim idea. Please try again.");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No ideas submitted yet. Be the first to share your idea!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Ideas Board</h2>
      
      {ideas.map((idea) => (
        <Card key={idea.uid} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl">{idea.title}</CardTitle>
                <CardDescription className="mt-2">
                  {idea.description}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatTimestamp(idea.timestamp)}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {formatAddress(idea.attester)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {formatAddress(idea.attester)}
                </span>
              </div>
              
              <a 
                href={idea.miniappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View App</span>
              </a>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{idea.upvotes}</span>
                </Badge>
                
                {idea.remixes.length > 0 && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <GitFork className="w-3 h-3" />
                    <span>{idea.remixes.length}</span>
                  </Badge>
                )}
                
                {idea.claims.length > 0 && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Wrench className="w-3 h-3" />
                    <span>{idea.claims.length}</span>
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpvote(idea.uid)}
                  disabled={!isConnected}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Upvote
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemix(idea)}
                  disabled={!isConnected}
                >
                  <GitFork className="w-4 h-4 mr-1" />
                  Remix
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleClaim(idea.uid)}
                  disabled={!isConnected}
                >
                  <Wrench className="w-4 h-4 mr-1" />
                  Claim
                </Button>
              </div>
            </div>

            {/* Show remixes if any */}
            {idea.remixes.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Remixes</h4>
                <div className="space-y-2">
                  {idea.remixes.map((remix) => (
                    <div key={remix.uid} className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{remix.title}</h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            {remix.description}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatAddress(remix.attester)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show claims if any */}
            {idea.claims.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Claims</h4>
                <div className="space-y-2">
                  {idea.claims.map((claim) => (
                    <div key={claim.uid} className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <Badge variant="default">{claim.status}</Badge>
                          <span className="text-sm text-muted-foreground ml-2">
                            Claimed by {formatAddress(claim.attester)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(claim.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}