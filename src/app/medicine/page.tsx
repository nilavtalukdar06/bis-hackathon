"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MedicinePage() {
  const [batch, setBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/medicine/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchNumber: batch }),
      });
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-xl">
      <h1 className="text-2xl mb-4">Verify Medicine Batch</h1>
      <form onSubmit={handleVerify} className="flex gap-2">
        <input
          className="border px-2 py-1 flex-1"
          placeholder="Enter batch number"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        />
        <Button type="submit" disabled={loading || !batch}>
          {loading ? "Checking..." : "Verify"}
        </Button>
      </form>
      <div className="mt-4">
        <pre className="text-sm bg-surface rounded p-2">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
}
