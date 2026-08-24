import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "MediBook",
  description: "Healthcare appointment platform",
};

import { AuthProvider } from '@/contexts/AuthContext';
import LayoutShell from '@/components/layout/LayoutShell';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
