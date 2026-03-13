"use client";

import { ReportForm } from "@/features/reports/ui/report-form";
import { AlertTriangle } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-600/10">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Report Counterfeit Medicine
          </h1>
          <p className="mt-1 text-muted-foreground">
            Help protect others by reporting suspected fake medicines. Your
            location will be recorded to help map fraud hotspots.
          </p>
        </div>

        {/* Report Form Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <ReportForm />
        </div>

        {/* Disclaimer */}
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <h3 className="mb-1 text-sm font-medium text-amber-600">
            ⚠ Important Notice
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If you suspect a counterfeit medicine, also report it to CDSCO
            (Central Drugs Standard Control Organization) and your local drug
            inspector. In case of adverse effects, seek immediate medical attention.
          </p>
        </div>
      </div>
    </div>
  );
}
