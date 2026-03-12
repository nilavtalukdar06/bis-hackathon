import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BIS - Hackathon",
};

export default function RootLayout({ children }: child) {
  return (
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)}>
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}
