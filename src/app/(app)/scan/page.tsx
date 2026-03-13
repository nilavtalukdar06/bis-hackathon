"use client";

import { ImageUpload } from "@/features/scan/ui/image-upload";
import { Camera } from "lucide-react";

export default function ScanPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10">
            <Camera className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Packaging Scan
          </h1>
          <p className="mt-1 text-muted-foreground">
            Upload a photo of medicine packaging and our AI will analyze it for
            signs of counterfeiting.
          </p>
        </div>

        {/* Upload Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <ImageUpload />
        </div>

        {/* AI Info */}
        <div className="mt-6 rounded-xl bg-muted/50 p-4">
          <h3 className="mb-2 text-sm font-medium">How does AI scan work?</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our AI uses GPT-4o Vision to analyze medicine packaging for key
            authenticity indicators: hologram presence, spelling errors (common in
            counterfeits), print quality, and batch format validity. The analysis
            returns a confidence score and detailed breakdown.
          </p>
        </div>
      </div>
    </div>
  );
}
