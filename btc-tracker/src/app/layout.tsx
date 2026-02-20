import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BTC Predictor Dashboard",
  description: "Live Bitcoin Price Tracker & Predictor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md mx-auto relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
