"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Lightbulb, MessageSquare, Wallet, Hammer } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { toast } from "sonner";
import IdeaSubmissionForm from "./idea-submission-form";
import IdeasBoard from "./ideas-board";
import RemixModal from "./remix-modal";
import BuildRatingForm from "./BuildRatingForm";
import { useEAS } from "~/hooks/useEAS";
import { type IdeaAttestation, type BuildAttestation } from "~/lib/eas";

export default function IdeaApp() {
  const [selectedRemixIdea, setSelectedRemixIdea] = useState<IdeaAttestation | null>(null);
  const [selectedRatingBuild, setSelectedRatingBuild] = useState<BuildAttestation | null>(null);
  const { address, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { submitIdea, builds, error: easError } = useEAS();

  const handleIdeaSubmitted = async (ideaData: {
    title: string;
    description: string;
    miniappUrl?: string;
  }) => {
    try {
      await submitIdea(ideaData.title, ideaData.description, ideaData.miniappUrl);
      toast.success("Idea submitted successfully!");
    } catch (error) {
      console.error("Error submitting idea:", error);
      toast.error("Failed to submit idea. Please try again.");
    }
  };

  const handleRemixIdea = (idea: IdeaAttestation) => {
    setSelectedRemixIdea(idea);
  };

  const handleConnect = () => {
    const connector = connectors[0]; // Use the first available connector
    if (connector) {
      connect({ connector });
    } else {
      toast.error("No wallet connector available");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🔨 Built It</h1>
        <p className="text-muted-foreground">
          Submit, attest, and build on ideas collaboratively
        </p>
      </div>

      {/* Wallet Connection */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Wallet</span>
            </div>
            
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {formatAddress(address!)}
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => disconnect()}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                onClick={handleConnect}
                disabled={!connectors.length}
              >
                Connect Wallet
              </Button>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error.message}</p>
          )}
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submit" className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4" />
            <span>Submit Idea</span>
          </TabsTrigger>
          <TabsTrigger value="board" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Ideas Board</span>
          </TabsTrigger>
          <TabsTrigger value="built" className="flex items-center space-x-2">
            <Hammer className="w-4 h-4" />
            <span>Built It</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="submit" className="mt-6">
          <IdeaSubmissionForm onSubmit={handleIdeaSubmitted} />
        </TabsContent>
        
        <TabsContent value="board" className="mt-6">
          <IdeasBoard onRemixIdea={handleRemixIdea} />
        </TabsContent>
        
        <TabsContent value="built" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hammer className="w-5 h-5" />
                <span>Built Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {builds.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Projects built from community ideas will appear here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet and claim an idea to start building
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {builds.map((build) => (
                    <div key={build.uid} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{build.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {build.averageRating > 0 ? `★ ${build.averageRating.toFixed(1)}` : "Not rated"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({build.ratings.length} ratings)
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">{build.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Button size="sm" variant="outline" asChild>
                          <a href={build.buildUrl} target="_blank" rel="noopener noreferrer">
                            View Build
                          </a>
                        </Button>
                        {build.githubUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={build.githubUrl} target="_blank" rel="noopener noreferrer">
                              GitHub
                            </a>
                          </Button>
                        )}
                        {address && address !== build.attester && !build.ratings.some(r => r.attester === address) && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Rate Build
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <BuildRatingForm
                                build={build}
                                onSubmit={(rating) => {
                                  setSelectedRatingBuild(null);
                                }}
                                onCancel={() => setSelectedRatingBuild(null)}
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Built by {build.attester.slice(0, 6)}...{build.attester.slice(-4)}</span>
                        <span>{new Date(build.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Remix Modal */}
      {selectedRemixIdea && (
        <RemixModal
          originalIdea={selectedRemixIdea}
          isOpen={!!selectedRemixIdea}
          onClose={() => setSelectedRemixIdea(null)}
        />
      )}

      {/* Info Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start space-x-2">
            <span className="font-medium">1.</span>
            <p>Submit your idea with title and description</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium">2.</span>
            <p>Ideas are attested on-chain with timestamp and signature</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium">3.</span>
            <p>Community can upvote, remix, or claim to build ideas</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium">4.</span>
            <p>All interactions are recorded as attestations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}