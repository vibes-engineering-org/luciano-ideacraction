"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useEAS } from "~/hooks/useEAS";
import { type BuildAttestation } from "~/lib/eas";
import { Star } from "lucide-react";

interface BuildRatingFormProps {
  build: BuildAttestation;
  onSubmit: (rating: any) => void;
  onCancel: () => void;
}

export default function BuildRatingForm({ build, onSubmit, onCancel }: BuildRatingFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { rateBuild } = useIdeasAttestation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet to rate a build");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      await rateBuild(build.id, rating, comment.trim());
      onSubmit({ rating, comment: comment.trim() });
      toast.success("Rating submitted successfully!");
      // Reset form
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Rate Build: {build.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 0 && "Click stars to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this build..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading || rating === 0}>
              {loading ? "Submitting..." : "Submit Rating"}
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