"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { createIdeaAttestation, storeIdea, type IdeaAttestation } from "~/lib/eas";
import { useAccount } from "wagmi";

const ideaFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be under 500 characters"),
  miniappUrl: z.string().url().optional().default("https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes"),
});

type IdeaFormData = z.infer<typeof ideaFormSchema>;

interface IdeaSubmissionFormProps {
  onIdeaSubmitted?: (idea: IdeaAttestation) => void;
}

export default function IdeaSubmissionForm({ onIdeaSubmitted }: IdeaSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address, isConnected } = useAccount();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaFormSchema),
    defaultValues: {
      miniappUrl: "https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes",
    },
  });

  const onSubmit = async (data: IdeaFormData) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to submit an idea");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create attestation on-chain
      const attestationUID = await createIdeaAttestation(
        data.title,
        data.description,
        data.miniappUrl
      );

      // Create idea object
      const newIdea: IdeaAttestation = {
        uid: attestationUID,
        title: data.title,
        description: data.description,
        miniappUrl: data.miniappUrl,
        timestamp: Date.now(),
        attester: address,
        upvotes: 0,
        remixes: [],
        claims: [],
      };

      // Store locally
      storeIdea(newIdea);

      // Notify parent component
      onIdeaSubmitted?.(newIdea);

      // Reset form
      reset();
      
      toast.success("Idea submitted successfully and attested on-chain!");
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
        <CardTitle>Submit Your Idea</CardTitle>
        <CardDescription>
          Share your innovative idea with the community. It will be attested on-chain with a timestamp and signature.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter your idea title..."
              {...register("title")}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your idea in detail..."
              rows={4}
              {...register("description")}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="miniappUrl">Mini App URL</Label>
            <Input
              id="miniappUrl"
              placeholder="https://farcaster.xyz/miniapps/GuNc8GIUCIqj/vibes"
              {...register("miniappUrl")}
              disabled={isSubmitting}
            />
            {errors.miniappUrl && (
              <p className="text-sm text-red-600">{errors.miniappUrl.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !isConnected}
          >
            {isSubmitting ? "Submitting..." : "Submit Idea"}
          </Button>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Connect your wallet to submit an idea
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}