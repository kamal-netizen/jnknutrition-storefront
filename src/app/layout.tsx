import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import FloatingSearch from "@/components/FloatingSearch";
import { getCollections } from "@/lib/queries/collections";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_TAGLINE, DEFAULT_KEYWORDS, BUSINESS_LOCALITY, BUSINESS_REGION, BUSINESS_COUNTRY, absoluteUrl } from "@/lib/seo";
import WhatsAppButton from "@/components/WhatsAppButton";

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
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  icons: {
    icon: "/favicon.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const collections = await getCollections(20);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.svg"),
    description: SITE_DESCRIPTION,
    slogan: SITE_TAGLINE,
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS_LOCALITY,
      addressRegion: BUSINESS_REGION,
      addressCountry: BUSINESS_COUNTRY,
    },
    areaServed: [
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "AdministrativeArea", name: "GCC" },
      "Worldwide",
    ],
    knowsAbout: [
      "Genuine sports supplements",
      "Authorised supplement distribution",
      "Wholesale supplement supply",
      "International supplement export",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: "+971556238582",
        areaServed: ["AE", "GCC", "Worldwide"],
        availableLanguage: ["en", "ar"],
      },
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: "+971556238582",
        areaServed: "AE",
        availableLanguage: ["en", "ar"],
      },
    ],
  };

  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/#store`,
    name: SITE_NAME,
    url: SITE_URL,
    image: absoluteUrl("/logo.svg"),
    description: SITE_DESCRIPTION,
    priceRange: "$$",
    currenciesAccepted: "AED",
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS_LOCALITY,
      addressRegion: BUSINESS_REGION,
      addressCountry: BUSINESS_COUNTRY,
    },
    areaServed: [
      { "@type": "Country", name: "United Arab Emirates" },
      "Worldwide",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        {/* Google tag (gtag.js) — Google Ads AW-16909357827 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16909357827"
          strategy="afterInteractive"
        />
        <Script id="google-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16909357827');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Header collections={collections} />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomNav />
        <FloatingSearch />
        <WhatsAppButton />
      </body>
    </html>
  );
}
