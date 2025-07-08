"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Lightbulb, MessageSquare, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { toast } from "sonner";
import IdeaSubmissionForm from "./idea-submission-form";
import IdeasBoard from "./ideas-board";
import RemixModal from "./remix-modal";
import { useIdeasAttestation, type Idea } from "~/hooks/useIdeasAttestation";

export default function IdeaApp() {
  const [selectedRemixIdea, setSelectedRemixIdea] = useState<Idea | null>(null);
  const { address, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { submitIdea } = useIdeasAttestation();

  const handleIdeaSubmitted = async (ideaData: {
    title: string;
    description: string;
    category: string;
    submitter: string;
  }) => {
    try {
      await submitIdea(ideaData);
      toast.success("Idea submitted successfully!");
    } catch (error) {
      console.error("Error submitting idea:", error);
      toast.error("Failed to submit idea. Please try again.");
    }
  };

  const handleRemixIdea = (idea: Idea) => {
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
        <h1 className="text-4xl font-bold mb-2">💡 IdeaCraction</h1>
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
      <Tabs defaultValue="board" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="board" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Ideas Board</span>
          </TabsTrigger>
          <TabsTrigger value="submit" className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4" />
            <span>Submit Idea</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="board" className="mt-6">
          <IdeasBoard onRemixIdea={handleRemixIdea} />
        </TabsContent>
        
        <TabsContent value="submit" className="mt-6">
          <IdeaSubmissionForm onSubmit={handleIdeaSubmitted} />
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