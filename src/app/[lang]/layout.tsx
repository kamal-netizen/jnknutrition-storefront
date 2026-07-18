import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { getLocale, LOCALE_CODES } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import FloatingSearch from "@/components/FloatingSearch";
import { getCollections } from "@/lib/queries/collections";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_TAGLINE, DEFAULT_KEYWORDS, BUSINESS_LOCALITY, BUSINESS_REGION, BUSINESS_COUNTRY, BUSINESS_PHONE, BUSINESS_STREET_ADDRESS, BUSINESS_POSTAL_CODE, BUSINESS_LATITUDE, BUSINESS_LONGITUDE, BUSINESS_OPENING_HOURS, HAS_LOCAL_BUSINESS_DATA, absoluteUrl } from "@/lib/seo";
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

export function generateStaticParams() {
  return LOCALE_CODES.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const locale = getLocale(lang);
  const shopLang = locale.isDefault ? undefined : locale.shopifyLanguage;
  const collections = await getCollections(20, shopLang);

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

  // LocalBusiness/Store schema. Street address, geo coordinates and opening
  // hours are only included when real data is configured in seo.ts — this
  // strengthens ranking for local intent ("supplement store dubai", "…near me").
  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": HAS_LOCAL_BUSINESS_DATA ? ["Store", "LocalBusiness"] : "Store",
    "@id": `${SITE_URL}/#store`,
    name: SITE_NAME,
    url: SITE_URL,
    image: absoluteUrl("/logo.svg"),
    description: SITE_DESCRIPTION,
    telephone: BUSINESS_PHONE,
    priceRange: "$$",
    currenciesAccepted: "AED",
    address: {
      "@type": "PostalAddress",
      ...(BUSINESS_STREET_ADDRESS ? { streetAddress: BUSINESS_STREET_ADDRESS } : {}),
      addressLocality: BUSINESS_LOCALITY,
      addressRegion: BUSINESS_REGION,
      ...(BUSINESS_POSTAL_CODE ? { postalCode: BUSINESS_POSTAL_CODE } : {}),
      addressCountry: BUSINESS_COUNTRY,
    },
    ...(BUSINESS_LATITUDE && BUSINESS_LONGITUDE
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: BUSINESS_LATITUDE,
            longitude: BUSINESS_LONGITUDE,
          },
        }
      : {}),
    ...(BUSINESS_OPENING_HOURS.length
      ? { openingHours: BUSINESS_OPENING_HOURS }
      : {}),
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
      lang={locale.htmlLang}
      dir={locale.dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KQQ2TB5');`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-white pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KQQ2TB5"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
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
