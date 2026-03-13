import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/dal/client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "DawaScan — AI Medicine Verification",
  description:
    "AI-powered medicine verification platform. Verify batch numbers, scan packaging for counterfeits, report fake medicines, and view fraud hotspots.",
};

export default function RootLayout({ children }: child) {
  return (
    <html lang="en" className={cn("dark font-sans antialiased", inter.variable)}>
      <body>
        <TRPCReactProvider>
          {children}
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
