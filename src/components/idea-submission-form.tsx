"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useAccount } from "wagmi";
import { toast } from "sonner";

interface IdeaSubmissionFormProps {
  onSubmit: (idea: {
    title: string;
    description: string;
    miniappUrl?: string;
  }) => void;
}

export default function IdeaSubmissionForm({ onSubmit }: IdeaSubmissionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [miniappUrl, setMiniappUrl] = useState("https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        miniappUrl: miniappUrl.trim() || undefined,
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setMiniappUrl("https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes");
      
      // Show success feedback
      toast.success("Idea submitted successfully!");
    } catch (error) {
      console.error("Error submitting idea:", error);
      toast.error("Failed to submit idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <span className="text-3xl">💡</span>
          Submit Your Idea
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Idea Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your idea title..."
              className="w-full"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea in detail..."
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              maxLength={500}
              required
            />
          </div>

          <div>
            <label htmlFor="miniappUrl" className="block text-sm font-medium mb-2">
              Mini App URL
            </label>
            <Input
              id="miniappUrl"
              type="url"
              value={miniappUrl}
              onChange={(e) => setMiniappUrl(e.target.value)}
              placeholder="https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes"
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>🚀</span>
                Submit Idea
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}