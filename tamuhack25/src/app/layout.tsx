import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Map3DProvider } from "@/context/map-context";
import { APIProvider } from "@vis.gl/react-google-maps";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AmeriCAN Go",
  description: "A travel visualizer powered by American Airline's flight API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
      {/* <script async src="https://maps.googleapis.com/maps/api/js?key=key&v=alpha&libraries=maps3d"></script> */}
    </html>
  );
}
