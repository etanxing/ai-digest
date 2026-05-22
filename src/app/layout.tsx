import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Digest",
  description: "The AI-curated AI briefing. 20+ sources. 3 stories. 5 minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
