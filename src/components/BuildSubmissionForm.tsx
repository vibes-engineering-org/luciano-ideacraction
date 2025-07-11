"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useIdeasAttestation, type Idea } from "~/hooks/useIdeasAttestation";

interface BuildSubmissionFormProps {
  idea: Idea;
  onSubmit: (build: any) => void;
  onCancel: () => void;
}

export default function BuildSubmissionForm({ idea, onSubmit, onCancel }: BuildSubmissionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buildUrl, setBuildUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { submitBuild } = useIdeasAttestation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet to submit a build");
      return;
    }

    if (!title.trim() || !description.trim() || !buildUrl.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const build = await submitBuild({
        ideaId: idea.id,
        title: title.trim(),
        description: description.trim(),
        buildUrl: buildUrl.trim(),
        githubUrl: githubUrl.trim(),
      });

      if (build) {
        onSubmit(build);
        toast.success("Build submitted successfully!");
        // Reset form
        setTitle("");
        setDescription("");
        setBuildUrl("");
        setGithubUrl("");
      }
    } catch (error) {
      console.error("Error submitting build:", error);
      toast.error("Failed to submit build. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Submit Build for: {idea.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Build Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your build a catchy title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your implementation, what features you built, and how it works..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildUrl">Build URL *</Label>
            <Input
              id="buildUrl"
              type="url"
              value={buildUrl}
              onChange={(e) => setBuildUrl(e.target.value)}
              placeholder="https://your-app.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL (Optional)</Label>
            <Input
              id="githubUrl"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Build"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}