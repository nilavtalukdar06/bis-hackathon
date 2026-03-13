"use client";

import Link from "next/link";
import {
  Shield,
  Search,
  Camera,
  AlertTriangle,
  Map,
  Activity,
  ArrowRight,
} from "lucide-react";

const quickActions = [
  {
    href: "/medicine",
    icon: Search,
    title: "Verify Batch",
    description: "Check if a medicine batch is genuine using CDSCO database",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    href: "/scan",
    icon: Camera,
    title: "AI Scan",
    description: "Upload packaging image for AI-powered counterfeit detection",
    color: "blue",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    href: "/reports",
    icon: AlertTriangle,
    title: "Report Fake",
    description: "Report suspected counterfeit medicines with your location",
    color: "red",
    gradient: "from-red-500 to-rose-600",
  },
  {
    href: "/map",
    icon: Map,
    title: "Fraud Map",
    description: "View heatmap of counterfeit medicine reports across India",
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
  },
];

const stats = [
  { label: "Batches Verified", value: "2,847", icon: Shield },
  { label: "Fakes Detected", value: "156", icon: AlertTriangle },
  { label: "AI Scans", value: "1,203", icon: Camera },
  { label: "Reports Filed", value: "89", icon: Activity },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome to DawaScan — India&apos;s AI-powered medicine verification platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10">
              <stat.icon className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6
                       transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg`}
            >
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">{action.title}</h3>
            <p className="text-sm text-muted-foreground">
              {action.description}
            </p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-600 transition-all group-hover:gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Demo Info */}
      <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <h3 className="mb-2 font-semibold text-emerald-600">
          🧪 Demo Batch Numbers
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Try these batch numbers in the verification tool:
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { batch: "BATCH-2024-001", desc: "Genuine — Cipla Paracetamol" },
            { batch: "BATCH-2024-002", desc: "Genuine — Sun Pharma Amoxicillin" },
            { batch: "BATCH-FAKE-001", desc: "Counterfeit — Unknown source" },
            { batch: "RECALL-2024-001", desc: "Recalled — Maiden Cough Syrup" },
          ].map((item) => (
            <div
              key={item.batch}
              className="rounded-lg bg-background/60 px-3 py-2 text-sm"
            >
              <code className="font-mono text-xs text-emerald-600">
                {item.batch}
              </code>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
