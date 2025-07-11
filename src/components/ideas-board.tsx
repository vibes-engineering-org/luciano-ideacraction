"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar } from "~/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { useAccount } from "wagmi";
import { useIdeasAttestation, type Idea } from "~/hooks/useIdeasAttestation";
import BuildSubmissionForm from "./BuildSubmissionForm";

interface IdeasBoardProps {
  onRemixIdea: (idea: Idea) => void;
}

export default function IdeasBoard({ onRemixIdea }: IdeasBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [selectedBuildIdea, setSelectedBuildIdea] = useState<Idea | null>(null);
  const { address } = useAccount();
  const { ideas, upvoteIdea, claimIdea, loading } = useIdeasAttestation();

  const categories = [
    { value: "all", label: "All Ideas", emoji: "🎯" },
    { value: "defi", label: "DeFi", emoji: "💰" },
    { value: "nft", label: "NFT", emoji: "🎨" },
    { value: "gaming", label: "Gaming", emoji: "🎮" },
    { value: "social", label: "Social", emoji: "👥" },
    { value: "tooling", label: "Tooling", emoji: "🔧" },
    { value: "infrastructure", label: "Infrastructure", emoji: "⚡" },
    { value: "other", label: "Other", emoji: "🌟" },
  ];

  const filteredIdeas = ideas
    .filter((idea) => selectedCategory === "all" || idea.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "popular") {
        return b.upvotes - a.upvotes;
      }
      return b.timestamp - a.timestamp;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "open":
        return "🟢";
      case "in_progress":
        return "🟡";
      case "completed":
        return "🔵";
      default:
        return "⚪";
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const handleUpvote = async (ideaId: string) => {
    if (!address) return;
    await upvoteIdea(ideaId);
  };

  const handleClaim = async (ideaId: string) => {
    if (!address) return;
    await claimIdea(ideaId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Ideas Board</h2>
        <p className="text-gray-600">Discover, upvote, and build on community ideas</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className="text-sm"
            >
              <span className="mr-1">{category.emoji}</span>
              {category.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant={sortBy === "newest" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("newest")}
          >
            🕐 Newest
          </Button>
          <Button
            variant={sortBy === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("popular")}
          >
            🔥 Popular
          </Button>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => (
          <Card key={idea.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(idea.status)}>
                    {getStatusEmoji(idea.status)} {idea.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {idea.description}
              </p>

              <div className="flex items-center gap-2 mb-4">
                <Avatar className="h-6 w-6">
                  <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    {idea.submitter.slice(0, 2)}
                  </div>
                </Avatar>
                <span className="text-xs text-gray-500">
                  {idea.submitter.slice(0, 6)}...{idea.submitter.slice(-4)}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(idea.timestamp)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpvote(idea.id)}
                    disabled={loading || (address && idea.upvoters.includes(address))}
                    className="flex items-center gap-1 h-8 px-2"
                  >
                    <span className={address && idea.upvoters.includes(address) ? "text-red-500" : ""}>
                      {address && idea.upvoters.includes(address) ? "❤️" : "🤍"}
                    </span>
                    <span className="text-sm">{idea.upvotes}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemixIdea(idea)}
                    className="flex items-center gap-1 h-8 px-2"
                  >
                    <span>🔄</span>
                    <span className="text-sm">{idea.remixes.length}</span>
                  </Button>
                </div>

                {idea.status === "open" && address && idea.submitter !== address && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClaim(idea.id)}
                    disabled={loading}
                    className="h-8 px-3"
                  >
                    🔨 Claim
                  </Button>
                )}

                {idea.status === "in_progress" && address && idea.claimedBy === address && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                      >
                        🚀 Submit Build
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <BuildSubmissionForm
                        idea={idea}
                        onSubmit={(build) => {
                          setSelectedBuildIdea(null);
                        }}
                        onCancel={() => setSelectedBuildIdea(null)}
                      />
                    </DialogContent>
                  </Dialog>
                )}

                {idea.claimedBy && idea.status !== "in_progress" && (
                  <Badge variant="secondary" className="text-xs">
                    🔨 Claimed
                  </Badge>
                )}
              </div>

              {idea.attestationHash && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <span className="font-mono">🔗 {idea.attestationHash.slice(0, 20)}...</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💡</div>
          <h3 className="text-xl font-semibold mb-2">No ideas yet</h3>
          <p className="text-gray-600">Be the first to submit an idea!</p>
        </div>
      )}
    </div>
  );
}