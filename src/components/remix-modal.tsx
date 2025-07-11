"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useAccount } from "wagmi";
import { useEAS } from "~/hooks/useEAS";
import { type IdeaAttestation } from "~/lib/eas";

interface RemixModalProps {
  originalIdea: IdeaAttestation;
  isOpen: boolean;
  onClose: () => void;
}

export default function RemixModal({ originalIdea, isOpen, onClose }: RemixModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address } = useAccount();
  const { remixIdea } = useEAS();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !address) {
      return;
    }

    setIsSubmitting(true);
    try {
      await remixIdea(
        originalIdea.uid,
        title.trim(),
        description.trim(),
        originalIdea.miniappUrl
      );
      
      // Reset form and close modal
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error submitting remix:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <span>🔄</span>
            Remix Idea
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Original Idea Reference */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Original Idea:</span>
              <Badge variant="outline">Idea</Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">{originalIdea.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{originalIdea.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">
                by {originalIdea.attester.slice(0, 6)}...{originalIdea.attester.slice(-4)}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {originalIdea.upvotes} upvotes
              </span>
            </div>
          </div>

          {/* Remix Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="remix-title" className="block text-sm font-medium mb-2">
                Your Remix Title
              </label>
              <Input
                id="remix-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How would you improve or expand this idea?"
                className="w-full"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="remix-description" className="block text-sm font-medium mb-2">
                Your Remix Description
              </label>
              <textarea
                id="remix-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your improvements, extensions, or alternative approach..."
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                maxLength={500}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>🔄</span>
                    Submit Remix
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* Existing Remixes */}
          {originalIdea.remixes.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Existing Remixes ({originalIdea.remixes.length})</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {originalIdea.remixes.map((remix) => (
                  <div key={remix.uid} className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">{remix.title}</h5>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{remix.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>by {remix.attester.slice(0, 6)}...{remix.attester.slice(-4)}</span>
                      <span>•</span>
                      <span>{new Date(remix.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}