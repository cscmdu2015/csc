import type { Metadata } from "next";
import { Geist, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-noto-sans-tamil",
  subsets: ["tamil", "latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Central School of Commerce - Speed Typing Platform",
  description:
    "Official high-performance typing evaluation portal for Central School of Commerce, Madurai. Practice Tamil & English tests and view global rankings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${notoTamil.variable} antialiased`}
      >
        <AuthProvider>
          <div className="relative min-h-screen flex flex-col z-0">
            {/* Visual Floating Background Glass Orbs */}
            <div
              className="bg-orb w-[500px] h-[500px] bg-brand-indigo top-[-100px] left-[-100px]"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="bg-orb w-[600px] h-[600px] bg-brand-purple bottom-[-200px] right-[-200px]"
              style={{ animationDelay: "5s" }}
            />
            <div
              className="bg-orb w-[400px] h-[400px] bg-brand-emerald top-[30%] right-[10%]"
              style={{ animationDelay: "10s" }}
            />

            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>

            <footer className="py-6 border-t border-glass-border glass-panel rounded-none border-x-0 border-b-0 text-center text-xs text-slate-500 mt-auto">
              <p>
                © 2026 Central School of Commerce, Madurai. All Rights Reserved.
              </p>
              <p className="mt-1">
                Admin: cscmdu2015@gmail.com | Phone: 8973120153 | Location:
                Madurai
              </p>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}