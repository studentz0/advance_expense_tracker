'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { CapacitorUpdater } from '@capgo/capacitor-updater';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initialize OTA Updates
    const initOTA = async () => {
      try {
        // Tell native side we are ready
        await CapacitorUpdater.notifyAppReady();
        
        // Listen for download completion
        const listener = await CapacitorUpdater.addListener('downloadComplete', (result) => {
          if (window.confirm(`New version ${result.bundle.version} is ready! Restart to apply?`)) {
            CapacitorUpdater.reload();
          }
        });

        // Proactively check for updates
        const update = await CapacitorUpdater.getLatest();
        if (update && update.version) {
          // Compare versions or just try to download (plugin handles compatibility)
          await CapacitorUpdater.download({
            url: update.url || '',
            version: update.version
          });
        }

        return () => {
          if (listener) listener.remove();
        };
      } catch (e) {
        console.error('OTA Setup Error:', e);
      }
    };
    initOTA();

    // 2. Auth State Management
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (session && pathname === '/login') {
        router.push('/dashboard');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
