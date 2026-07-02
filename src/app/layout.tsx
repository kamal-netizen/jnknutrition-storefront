import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCollections } from "@/lib/queries/collections";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "JNK Nutrition",
    template: "%s | JNK Nutrition",
  },
  description: "Premium nutrition supplements — fuel your performance.",
  metadataBase: new URL("https://www.jnknutrition.com"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const collections = await getCollections(20);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <Header collections={collections} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
