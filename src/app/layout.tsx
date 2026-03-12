import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BIS - Hackathon",
};

export default function RootLayout({ children }: child) {
  return (
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)}>
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
