"use client";

import { useState, useRef } from "react";
import { useAnalyzePackage } from "@/features/scan/hooks/use-analyze-package";
import {
  Upload,
  X,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Eye,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export function ImageUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const analyzeMutation = useAnalyzePackage();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  function handleAnalyze() {
    if (!imageUrl) return;
    analyzeMutation.mutate({ imageUrl });
  }

  function handleReset() {
    setPreview(null);
    setImageUrl(null);
    analyzeMutation.reset();
    if (fileRef.current) fileRef.current.value = "";
  }

  const result = analyzeMutation.data;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!preview ? (
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-3
                     rounded-2xl border-2 border-dashed border-border bg-card/50
                     p-12 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5"
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">Drop medicine packaging image here</p>
            <p className="text-sm text-muted-foreground">
              JPEG, PNG, WebP or GIF — max 10MB
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <img
            src={preview}
            alt="Medicine packaging"
            className="h-64 w-full object-contain bg-card"
          />
          <button
            onClick={handleReset}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5
                       text-white transition-all hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Actions */}
      {preview && !result && (
        <button
          onClick={handleAnalyze}
          disabled={!imageUrl || analyzeMutation.isPending || uploading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600
                     px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/25
                     transition-all hover:bg-blue-500 hover:shadow-blue-500/30
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analyzeMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
          {uploading
            ? "Uploading..."
            : analyzeMutation.isPending
            ? "Analyzing with AI..."
            : "Analyze Packaging"}
        </button>
      )}

      {/* Error */}
      {analyzeMutation.error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Analysis failed: {analyzeMutation.error.message}
          </p>
        </div>
      )}

      {/* Results */}
      {result && <AnalysisResult data={result} />}
    </div>
  );
}

function AnalysisResult({
  data,
}: {
  data: {
    scanId: string;
    hologram: boolean;
    spellingErrors: string[];
    suspicious: boolean;
    confidenceScore: number;
    batchFormatValid: boolean;
    printQuality: "high" | "medium" | "low";
    analysis: string;
  };
}) {
  const isGenuine = !data.suspicious && data.confidenceScore >= 0.7;

  return (
    <div
      className={`rounded-2xl border-2 p-6 ${
        isGenuine
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        {isGenuine ? (
          <ShieldCheck className="h-8 w-8 text-emerald-500" />
        ) : (
          <ShieldAlert className="h-8 w-8 text-red-500" />
        )}
        <div>
          <h3
            className={`text-lg font-bold ${
              isGenuine ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isGenuine ? "Packaging Looks Genuine" : "⚠ Suspicious Packaging"}
          </h3>
        </div>
      </div>

      {/* Analysis Summary */}
      <p className="mb-4 rounded-lg bg-background/60 p-3 text-sm leading-relaxed">
        {data.analysis}
      </p>

      {/* Indicators Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Indicator
          label="Hologram"
          value={data.hologram ? "Detected" : "Not found"}
          positive={data.hologram}
        />
        <Indicator
          label="Print Quality"
          value={data.printQuality}
          positive={data.printQuality === "high"}
        />
        <Indicator
          label="Batch Format"
          value={data.batchFormatValid ? "Valid" : "Invalid"}
          positive={data.batchFormatValid}
        />
        <Indicator
          label="Spelling Errors"
          value={data.spellingErrors.length === 0 ? "None" : `${data.spellingErrors.length} found`}
          positive={data.spellingErrors.length === 0}
        />
      </div>

      {/* Spelling Errors Detail */}
      {data.spellingErrors.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">Spelling Errors Found</span>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {data.spellingErrors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Confidence Score</span>
          <span className="font-mono font-medium">
            {Math.round(data.confidenceScore * 100)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              data.confidenceScore >= 0.7
                ? "bg-emerald-500"
                : data.confidenceScore >= 0.4
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.round(data.confidenceScore * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Indicator({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-background/60 p-2.5">
      {positive ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
      )}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium capitalize">{value}</p>
      </div>
    </div>
  );
}
