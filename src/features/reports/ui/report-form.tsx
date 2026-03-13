"use client";

import { useState, useEffect } from "react";
import { useSubmitReport } from "@/features/reports/hooks/use-reports";
import {
  MapPin,
  Loader2,
  SendHorizonal,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export function ReportForm() {
  const [batchNumber, setBatchNumber] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [success, setSuccess] = useState(false);

  const submitMutation = useSubmitReport();

  // Request geolocation on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setLocationError(
            "Location access denied. Please enable location services."
          );
        }
      );
    } else {
      setLocationError("Geolocation is not supported in this browser.");
    }
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!batchNumber.trim() || !location) return;

    submitMutation.mutate(
      {
        batchNumber: batchNumber.trim(),
        latitude: location.lat,
        longitude: location.lng,
        imageUrl: imageUrl || undefined,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setBatchNumber("");
          setImageUrl("");
          setTimeout(() => setSuccess(false), 3000);
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-600">
            Report submitted successfully! Thank you for helping keep medicines safe.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Batch Number */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Batch Number <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm
                       transition-all placeholder:text-muted-foreground/50
                       focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            placeholder="Enter the suspected batch number"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Your Location <span className="text-destructive">*</span>
          </label>
          {location ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          ) : locationError ? (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-600">{locationError}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Getting your location...
              </span>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Evidence Photo <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm
                       file:mr-4 file:rounded-lg file:border-0 file:bg-muted file:px-4
                       file:py-1.5 file:text-sm file:font-medium"
          />
          {imageUrl && (
            <p className="text-xs text-emerald-600">✓ Image uploaded</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={
            !batchNumber.trim() ||
            !location ||
            submitMutation.isPending
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600
                     px-6 py-3 font-semibold text-white shadow-lg shadow-red-600/25
                     transition-all hover:bg-red-500 hover:shadow-red-500/30
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizonal className="h-5 w-5" />
          )}
          {submitMutation.isPending ? "Submitting..." : "Report Counterfeit"}
        </button>
      </form>

      {submitMutation.error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Error: {submitMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
}
