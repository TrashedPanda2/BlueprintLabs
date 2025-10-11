import "./globals.css";
import type { Metadata } from "next";

export const metadata = {
  title: "Blueprint Labs - Pools",
  description: "Browse and preview Call of Duty weapon blueprints with BlueprintLabs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
