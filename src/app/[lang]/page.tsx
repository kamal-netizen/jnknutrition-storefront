import Link from "@/components/LocaleLink";
import {
  getProducts,
  getTopDiscountedProducts,
  isDiscounted,
} from "@/lib/queries/products";
import { getMonthlyBestSellers } from "@/lib/queries/best-sellers";
import { getCollection } from "@/lib/queries/collections";
import type { ProductCardData } from "@/lib/queries/products";
import SectionStrip from "@/components/home/SectionStrip";
import ScrollRow from "@/components/home/ScrollRow";
import GoalCard, { GOALS } from "@/components/home/GoalCard";
import BrandCard, { BRANDS } from "@/components/home/BrandCard";
import HeroBanner from "@/components/home/HeroBanner";
import SectionHeading from "@/components/home/SectionHeading";
import ShelfSection, { type ShelfScene } from "@/components/home/ShelfSection";
import UAEFlagBanner from "@/components/home/UAEFlagBanner";
import DealsBanner from "@/components/home/DealsBanner";
import { notAdHidden } from "@/lib/ad-landing";
import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, DEFAULT_KEYWORDS } from "@/lib/seo";
import { getLocale, localizePath, hreflangAlternates } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";

export const revalidate = 1800;

// `/foo.txt` is the one URL shape that reaches app/[lang] with a junk locale:
// proxy.ts skips any path containing a dot, so a single dotted segment lands
// here as [lang] and matches no other route. The layout's LOCALE_CODES guard
// already turns that into a 404, but only after React has rendered this page in
// parallel and serialized it — a ~350 KB response for every scanner probing
// /ads.txt or /index.php. This rejects the same requests during routing, before
// any of that work happens. Scoped to this file on purpose: on the shared
// layout it would compose into every child route, where generateStaticParams
// covers only the first page of products and collections.
export const dynamicParams = false;

type PageProps = { params: Promise<{ lang: string }> };

// Shelf scenes (banner-work/2026-11/shelf-crop.mjs). Each colour is sampled
// from the render's flat floor, not the one asked for in the prompt.
const scene = (slug: string, color: string, dark?: boolean): ShelfScene => ({
  mobile: { src: `/shelves/2026-11/${slug}-mobile-1200x600.webp`, width: 1200, height: 600 },
  desktop: { src: `/shelves/2026-11/${slug}-desktop-1536x512.webp`, width: 1536, height: 512 },
  color,
  dark,
});
const SCENES = {
  whey: scene("whey", "#96D5F3"),
  creatine: scene("creatine", "#C7BFF6"),
  preworkout: scene("preworkout", "#FC9A80"),
  coreChamps: scene("corechamps", "#1B1F25", true),
  muscleRulz: scene("musclerulz", "#FED548"),
  wellness: scene("wellness", "#9FDFBA"),
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = getLocale(lang);
  const url = localizePath("/", locale);
  return {
    // `absolute` bypasses the root "%s | JNK Nutrition" template so the homepage
    // owns an exact, local-intent SERP title ("supplement store dubai" is a top
    // non-brand query cluster) without duplicating the brand suffix.
    title: {
      absolute: "Supplement Store in Dubai & UAE — 100% Genuine | JNK Nutrition",
    },
    description: SITE_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    alternates: { canonical: url, languages: hreflangAlternates("/") },
    openGraph: {
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: SITE_DESCRIPTION,
      url,
      type: "website",
    },
  };
}

// Products kept off every homepage strip — see lib/ad-landing.ts.
const notHidden = notAdHidden;

const nodes = (
  data: { edges: { node: ProductCardData }[] } | null | undefined
): ProductCardData[] =>
  data?.edges
    .map((e) => e.node)
    .filter((p) => p.availableForSale && notHidden(p)) ?? [];

export default async function Home({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.home;
  const viewAll = dict.common.viewAll;
  const language = locale.isDefault ? undefined : locale.shopifyLanguage;
  const [
    trending,
    fresh,
    topDeals,
    whey,
    creatine,
    preworkout,
    massGain,
    wellness,
    vegan,
    accessories,
    coreChamps,
    muscleRulz,
    proscienceNutra,
  ] = await Promise.all([
    // Shopify's BEST_SELLING sort ranks by all-time orders, with no recency in
    // it, so a section called "Trending Now" was really showing the store's
    // lifetime leaders. This ranks the trailing 30 days of orders instead, and
    // falls back to the all-time sort when no Admin token is configured.
    getMonthlyBestSellers({ first: 15, language }),
    getProducts({ first: 8, sortKey: "CREATED_AT", reverse: true, query: "available_for_sale:true", language }),
    // Not the curated `today-deals` collection: that list is hand-maintained
    // and goes stale, so the strip headlined "Today's Deals" was showing
    // whatever happened to sit in it rather than the real markdowns. This ranks
    // the whole in-stock catalog by discount depth, so the deepest cuts in the
    // store lead the row (the collection page aggregates the same way).
    getTopDiscountedProducts(12, language),
    getCollection("whey-protein", { first: 8, filters: [{ available: true }], language }),
    getCollection("creatine", { first: 8, filters: [{ available: true }], language }),
    getCollection("pre-workouts", { first: 8, filters: [{ available: true }], language }),
    getCollection("muscle-building-products", { first: 8, filters: [{ available: true }], language }),
    getCollection("health-wellness", { first: 8, filters: [{ available: true }], language }),
    getCollection("vegan-protein", { first: 4, filters: [{ available: true }], language }),
    getCollection("accessories", { first: 8, filters: [{ available: true }], language }),
    getCollection("core-champs", { first: 8, filters: [{ available: true }], language }),
    getCollection("muscle-rulz", { first: 8, filters: [{ available: true }], language }),
    getCollection("proscience-nutra", { first: 8, filters: [{ available: true }], language }),
  ]);

  // Already filtered to in-stock products, and already an array — the ranking
  // returns cards directly rather than a Shopify connection.
  const trendingProducts = trending.filter(notHidden);
  const freshProducts = nodes(fresh);

  // Only if the catalog scan comes back empty (a Storefront hiccup, or a store
  // with no active markdowns) does the strip fall back to whatever discounts
  // are already loaded, so the band never renders as a headline with no row.
  const visibleDeals = topDeals.filter(notHidden);
  const dealProducts = visibleDeals.length
    ? visibleDeals
    : [...trendingProducts, ...freshProducts].filter(isDiscounted).slice(0, 10);
  const wheyProducts = nodes(whey?.products);
  const creatineProducts = nodes(creatine?.products);
  const preworkoutProducts = nodes(preworkout?.products);
  const massProducts = nodes(massGain?.products);
  const wellnessProducts = nodes(wellness?.products);
  const veganProducts = nodes(vegan?.products);
  const accessoryProducts = nodes(accessories?.products);
  const coreChampsProducts = nodes(coreChamps?.products);
  const muscleRulzProducts = nodes(muscleRulz?.products);
  const proscienceNutraProducts = nodes(proscienceNutra?.products);

  return (
    <div className="flex flex-col">
      {/* Source order is the phone order; `md:-order-1` lifts the blocks that
          lead the desktop page back above the goals grid. The goals grid used to
          sit after the deals strip in the HTML and jump above it with
          `order-first` — but the HTML streams, so a phone painted the flag,
          the Diwali band of the time and H1 first and the grid then landed
          ~80 KB later on top of them, pushing the whole first screen down (PSI
          mobile CLS 0.798). */}

      {/* Hero — carousel on desktop, hidden on mobile (category grid takes over). */}
      <div className="hidden md:block md:-order-1">
        <HeroBanner />
      </div>

      {/* ─── Shop your goal ───────────────────────────────────── */}
      {/* First on mobile: acts as the hero in place of the carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full">
        <div className="mb-8">
          <SectionHeading>{t.shopByCategory}</SectionHeading>
          <p className="mt-3 text-[#55637A]">{t.shopByCategoryTagline}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {/* The grid is 2-up on mobile, so the first four tiles are the two
              rows a phone shows without scrolling, and Lighthouse picks its LCP
              element from among them — the third tile, as it happens, since the
              sticky header clips the top row. All four load eagerly; the last
              two stay lazy. */}
          {GOALS.map((goal, i) => (
            <GoalCard key={goal.title} goal={goal} priority={i < 4} />
          ))}
        </div>
      </section>

      {/* UAE flag gradient banner */}
      <div className="mt-6 sm:mt-8 md:-order-1">
        <UAEFlagBanner label={t.proudOfUae} />
      </div>

      {/* Page H1 — local commercial intent ("supplement store dubai/uae").
          Sized above the section H2s beneath it (36px): as the page heading it
          was previously rendering smaller than every heading it introduces. The
          accent bar is the same one SectionHeading carries, which ties this
          block into the rest of the page instead of leaving it as loose text,
          and the bottom padding stops the paragraph butting straight into the
          deals band below — it had none, so the two were touching. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 pb-10 md:pt-12 md:pb-14 md:-order-1">
        <h1 className="max-w-4xl text-3xl md:text-5xl font-black uppercase tracking-tight leading-[1.05] text-[#0B0F14]">
          {t.heroTitle}
        </h1>
        <span
          aria-hidden="true"
          className="mt-4 block h-1 w-14 rounded-full bg-gradient-to-r from-[#F9D20F] to-[#F9D20F]/30"
        />
        <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-[#55637A]">
          {t.heroBody}
        </p>
      </div>

      {/* ─── Deals banner ─────────────────────────────────────── */}
      <SectionStrip
        title={t.todaysDeals}
        eyebrow={t.limitedTime}
        href="/collections/today-deals"
        products={dealProducts}
        tone="accent"
        cta="button"
        ctaLabel={t.shopDeals}
        className="md:-order-1"
        header={
          <DealsBanner
            title={t.todaysDeals}
            eyebrow={t.limitedTime}
            ctaLabel={t.shopDeals}
            href="/collections/today-deals"
          />
        }
      />

      {/* ─── Trending now ─────────────────────────────────────── */}
      <SectionStrip
        title={t.trendingNow}
        subtitle={t.trendingTagline}
        href="/products"
        products={trendingProducts}
        ctaLabel={viewAll}
      />

      {/* ─── Strength starts here (whey) — scene shelf ────────── */}
      <ShelfSection
        title={t.strengthStartsHere}
        eyebrow={t.buyWhey}
        body={t.wheyBody}
        href="/collections/whey-protein"
        ctaLabel={t.shopWhey}
        products={wheyProducts}
        scene={SCENES.whey}
      />

      {/* ─── Daily creatine support — scene shelf ─────────────── */}
      <ShelfSection
        title={t.creatineTitle}
        body={t.creatineTagline}
        href="/collections/creatine"
        products={creatineProducts}
        ctaLabel={viewAll}
        scene={SCENES.creatine}
      />

      {/* ─── Fresh picks ──────────────────────────────────────── */}
      <SectionStrip
        title={t.freshPicks}
        subtitle={t.freshTagline}
        href="/products?sort=newest"
        products={freshProducts}
        ctaLabel={viewAll}
        grid
      />

      {/* ─── Pre-workout power — scene shelf ──────────────────── */}
      <ShelfSection
        title={t.preworkoutTitle}
        eyebrow={t.explosiveEnergy}
        href="/collections/pre-workouts"
        products={preworkoutProducts}
        ctaLabel={viewAll}
        scene={SCENES.preworkout}
      />

      {/* ─── Mass gainer / muscle building ────────────────────── */}
      <SectionStrip
        title={t.massTitle}
        subtitle={t.massTagline}
        href="/collections/muscle-building-products"
        products={massProducts}
        ctaLabel={viewAll}
      />

      {/* ─── Shop by brand ────────────────────────────────────── */}
      <section className="bg-[#F5F7FA] border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
          <div className="flex items-end justify-between mb-8">
            <SectionHeading>{t.shopByBrand}</SectionHeading>
            <Link
              href="/brands"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#0B0F14] hover:border-[#F9D20F] hover:bg-[#FFFBEB] transition-colors"
            >
              {t.allBrands} <span aria-hidden="true" className="rtl:rotate-180">→</span>
            </Link>
          </div>
          <ScrollRow>
            {BRANDS.map((brand) => (
              <div key={brand.handle} className="snap-start shrink-0">
                <BrandCard brand={brand} />
              </div>
            ))}
          </ScrollRow>
        </div>
      </section>

      {/* ─── Core Champs — scene shelf (brand name kept in Latin) ─ */}
      <ShelfSection
        title="Core Champs"
        eyebrow={t.ccTagline}
        body={t.coreChampsTagline}
        href="/collections/core-champs"
        products={coreChampsProducts}
        ctaLabel={viewAll}
        scene={SCENES.coreChamps}
      />

      {/* ─── Muscle Rulz — scene shelf ────────────────────────── */}
      <ShelfSection
        title="Muscle Rulz"
        body={t.muscleRulzTagline}
        href="/collections/muscle-rulz"
        products={muscleRulzProducts}
        ctaLabel={viewAll}
        scene={SCENES.muscleRulz}
      />

      {/* ─── Proscience Nutra ─────────────────────────────────── */}
      <SectionStrip
        title="Proscience Nutra"
        subtitle={t.proscienceTagline}
        href="/collections/proscience-nutra"
        products={proscienceNutraProducts}
        ctaLabel={viewAll}
      />

      {/* ─── Health & wellness — scene shelf ───────────────────── */}
      <ShelfSection
        title={t.healthWellness}
        body={t.healthTagline}
        href="/collections/health-wellness"
        products={wellnessProducts}
        ctaLabel={viewAll}
        scene={SCENES.wellness}
      />

      {/* ─── Vegan & plant-based ──────────────────────────────── */}
      <SectionStrip
        title={t.veganTitle}
        subtitle={t.veganTagline}
        href="/collections/vegan-protein"
        products={veganProducts}
        ctaLabel={viewAll}
        grid
      />

      {/* ─── Accessories ──────────────────────────────────────── */}
      <SectionStrip
        title={t.accessoriesTitle}
        subtitle={t.accessoriesTagline}
        href="/collections/accessories"
        products={accessoryProducts}
        ctaLabel={viewAll}
        grid
      />

      {/* ─── Final CTA ────────────────────────────────────────── */}
      <section className="bg-[#F9D20F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-center md:text-start">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight leading-[0.95]">
              {t.readyToLevelUp}
            </h2>
            <p className="mt-3 text-[#082D4C] font-semibold text-lg">{t.ctaBody}</p>
          </div>
          <Link
            href="/products"
            className="shrink-0 inline-flex items-center justify-center bg-[#0B0F14] text-white font-black uppercase tracking-wide px-8 py-4 rounded hover:bg-[#1A2333] transition-colors self-center"
          >
            {t.shopAllProducts} <span aria-hidden="true" className="ms-1 rtl:rotate-180">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
