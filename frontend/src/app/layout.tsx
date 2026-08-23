import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "MediBook",
  description: "Healthcare appointment platform",
};

import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
