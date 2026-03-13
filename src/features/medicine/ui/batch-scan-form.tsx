"use client";

import { useState } from "react";
import { useTRPC } from "@/dal/client";
import { useQuery } from "@tanstack/react-query";
import { Shield, ShieldCheck, ShieldAlert, Loader2, Search } from "lucide-react";

export function BatchScanForm() {
  const [batchInput, setBatchInput] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [submitted, setSubmitted] = useState("");

  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(
    trpc.medicine.verifyBatch.queryOptions(
      { batchNumber: submitted, medicineName: medicineName || undefined },
      { enabled: submitted.length > 0 }
    )
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (batchInput.trim()) {
      setSubmitted(batchInput.trim());
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Batch Number <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm
                       transition-all placeholder:text-muted-foreground/50
                       focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="e.g. BATCH-2024-001"
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Medicine Name <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm
                       transition-all placeholder:text-muted-foreground/50
                       focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="e.g. Paracetamol 500mg"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !batchInput.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600
                     px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-600/25
                     transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          {isLoading ? "Verifying..." : "Verify Batch"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Error: {error.message}
          </p>
        </div>
      )}

      {data && <VerificationResult data={data} />}
    </div>
  );
}

function VerificationResult({
  data,
}: {
  data: {
    isValid: boolean;
    batchNumber: string;
    medicineName: string | null;
    manufacturer: string | null;
    expiry: Date | string | null;
    approved: boolean;
    recallStatus: boolean;
    confidence: number;
    source: string;
  };
}) {
  const isGenuine = data.isValid && data.approved && !data.recallStatus;

  return (
    <div
      className={`rounded-2xl border-2 p-6 transition-all ${
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
            {isGenuine ? "✓ Verified Genuine" : "⚠ Verification Failed"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Source: {data.source === "cache" ? "Database Cache" : "CDSCO Lookup"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoRow label="Batch Number" value={data.batchNumber} />
        <InfoRow label="Medicine" value={data.medicineName || "Unknown"} />
        <InfoRow label="Manufacturer" value={data.manufacturer || "Unknown"} />
        <InfoRow
          label="Expiry"
          value={
            data.expiry
              ? new Date(data.expiry).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Unknown"
          }
        />
        <InfoRow label="Approved" value={data.approved ? "Yes" : "No"} />
        <InfoRow
          label="Recall Status"
          value={data.recallStatus ? "⚠ RECALLED" : "Not recalled"}
        />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Confidence Score</span>
          <span className="font-mono font-medium">
            {Math.round(data.confidence * 100)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              data.confidence >= 0.7
                ? "bg-emerald-500"
                : data.confidence >= 0.4
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.round(data.confidence * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/60 p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
