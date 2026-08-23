import type { Metadata } from "next";
// @ts-expect-error Next.js loads this global stylesheet at runtime.
import "./globals.css";

export const metadata: Metadata = {
  title: "MediBook",
  description: "Healthcare appointment platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
