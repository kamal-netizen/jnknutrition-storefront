import Link from "next/link";
import { getProducts } from "@/lib/queries/products";
import { getCollection } from "@/lib/queries/collections";
import type { Product } from "@/lib/queries/products";
import ProductCard from "@/components/ProductCard";
import SectionStrip from "@/components/home/SectionStrip";
import ScrollRow from "@/components/home/ScrollRow";
import GoalCard, { GOALS } from "@/components/home/GoalCard";
import BrandCard, { BRANDS } from "@/components/home/BrandCard";
import HeroBanner from "@/components/home/HeroBanner";
import SectionHeading from "@/components/home/SectionHeading";
import UAEFlagBanner from "@/components/home/UAEFlagBanner";

export const revalidate = 300;

const nodes = (
  data: { edges: { node: Product }[] } | null | undefined
): Product[] =>
  data?.edges.map((e) => e.node).filter((p) => p.availableForSale) ?? [];

export default async function Home() {
  const [
    trending,
    fresh,
    deals,
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
    getProducts({ first: 15, sortKey: "BEST_SELLING", query: "available_for_sale:true" }),
    getProducts({ first: 8, sortKey: "CREATED_AT", reverse: true, query: "available_for_sale:true" }),
    getCollection("today-deals", { first: 8, filters: [{ available: true }] }),
    getCollection("whey-protein", { first: 4, filters: [{ available: true }] }),
    getCollection("creatine", { first: 8, filters: [{ available: true }] }),
    getCollection("pre-workouts", { first: 8, filters: [{ available: true }] }),
    getCollection("muscle-building-products", { first: 8, filters: [{ available: true }] }),
    getCollection("health-wellness", { first: 8, filters: [{ available: true }] }),
    getCollection("vegan-protein", { first: 4, filters: [{ available: true }] }),
    getCollection("shakers", { first: 8, filters: [{ available: true }] }),
    getCollection("core-champs", { first: 8, filters: [{ available: true }] }),
    getCollection("muscle-rulz", { first: 8, filters: [{ available: true }] }),
    getCollection("proscience-nutra", { first: 8, filters: [{ available: true }] }),
  ]);

  const trendingProducts = nodes(trending);
  const freshProducts = nodes(fresh);

  const hasDiscount = (p: Product) =>
    p.variants.edges.some(({ node: v }) => {
      if (!v.compareAtPrice) return false;
      return parseFloat(v.compareAtPrice.amount) > parseFloat(v.price.amount);
    });

  const rawDealProducts = nodes(deals?.products);
  const dealDedupIds = new Set(rawDealProducts.map((p) => p.id));
  const discountedFallback = [...trendingProducts, ...freshProducts].filter(
    (p) => !dealDedupIds.has(p.id) && hasDiscount(p)
  );
  const dealProducts =
    rawDealProducts.length >= 6
      ? rawDealProducts
      : [...rawDealProducts, ...discountedFallback].slice(0, 10);
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
      {/* Hero — carousel on desktop, hidden on mobile (category grid takes over) */}
      <div className="hidden md:block">
        <HeroBanner />
      </div>

      {/* UAE flag gradient banner */}
      <div className="mt-6 sm:mt-8">
        <UAEFlagBanner />
      </div>

      {/* ─── Deals banner ─────────────────────────────────────── */}
      {dealProducts.length > 0 && (
        <section className="bg-[#EEF4FF] border-y border-[#CBD5E1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <p className="text-[#F9D20F] text-xs font-black uppercase tracking-[0.2em] mb-2">
                  Limited Time
                </p>
                <h2 className="text-3xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
                  Today&apos;s Deals
                </h2>
              </div>
              <Link
                href="/collections/today-deals"
                className="shrink-0 inline-flex items-center bg-[#F9D20F] text-[#0B0F14] font-bold uppercase tracking-wide px-6 py-3 rounded-lg shadow-card hover:bg-[#E7BF00] hover:shadow-card-hover transition-all self-start sm:self-auto"
              >
                Shop Deals →
              </Link>
            </div>
            <ScrollRow>
              {dealProducts.map((product) => (
                <div
                  key={product.id}
                  className="snap-start shrink-0 w-[45%] sm:w-[240px] md:w-[260px]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </ScrollRow>
          </div>
        </section>
      )}

      {/* ─── Shop your goal ───────────────────────────────────── */}
      {/* order-first on mobile: acts as the hero in place of the carousel */}
      <section className="order-first md:order-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full">
        <div className="mb-8">
          <SectionHeading>Shop by Category</SectionHeading>
          <p className="mt-3 text-[#64748B]">
            Find exactly what your training needs.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {GOALS.map((goal) => (
            <GoalCard key={goal.title} goal={goal} />
          ))}
        </div>
      </section>

      {/* ─── Trending now ─────────────────────────────────────── */}
      <SectionStrip
        title="Trending Now"
        subtitle="The gear athletes keep coming back for."
        href="/products"
        products={trendingProducts}
      />

      {/* ─── Strength starts here (whey) ──────────────────────── */}
      {wheyProducts.length > 0 && (
          <section className="bg-[#F5F7FA] border-y border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full grid lg:grid-cols-[320px_1fr] gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-[#F9D20F] text-xs font-black uppercase tracking-[0.2em] mb-3">
                Buy Whey
              </p>
              <h2 className="text-3xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight leading-[0.95]">
                Strength Starts Here
              </h2>
              <p className="mt-4 text-[#64748B] leading-relaxed">
                Premium whey protein to build lean muscle and recover faster
                after every session.
              </p>
              <Link
                href="/collections/whey-protein"
                className="inline-flex mt-6 bg-[#F9D20F] text-[#0B0F14] font-bold uppercase tracking-wide px-6 py-3 rounded hover:bg-[#E7BF00] transition-colors"
              >
                Shop Whey →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {wheyProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Daily creatine support ───────────────────────────── */}
      <SectionStrip
        title="Daily Creatine Support"
        subtitle="Power, strength and performance—one scoop at a time."
        href="/collections/creatine"
        products={creatineProducts}
      />

      {/* ─── Fresh picks ──────────────────────────────────────── */}
      <SectionStrip
        title="Fresh Picks"
        subtitle="Newly landed supplements, just for you."
        href="/products?sort=newest"
        products={freshProducts}
        grid
      />

      {/* ─── Pre-workout power ────────────────────────────────── */}
      {preworkoutProducts.length > 0 && (
        <section className="bg-gradient-to-r from-[#EEF4FF] to-white border-y border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[#F9D20F] text-xs font-black uppercase tracking-[0.2em] mb-2">
                  Explosive Energy
                </p>
                <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
                  Pre-Workout Power
                </h2>
              </div>
              <Link
                href="/collections/pre-workouts"
                className="shrink-0 text-sm font-bold text-[#F9D20F] hover:text-[#E7BF00] uppercase tracking-wide"
              >
                View All →
              </Link>
            </div>
            <ScrollRow>
              {preworkoutProducts.map((product) => (
                <div
                  key={product.id}
                  className="snap-start shrink-0 w-[45%] sm:w-[240px] md:w-[260px]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </ScrollRow>
          </div>
        </section>
      )}

      {/* ─── Core Champs ──────────────────────────────────────── */}
      <SectionStrip
        title="Core Champs"
        subtitle="Championship-grade supplements for peak performance."
        href="/collections/core-champs"
        products={coreChampsProducts}
      />

      {/* ─── Muscle Rulz ──────────────────────────────────────── */}
      <SectionStrip
        title="Muscle Rulz"
        subtitle="Hardcore formulas built to fuel serious gains."
        href="/collections/muscle-rulz"
        products={muscleRulzProducts}
      />

      {/* ─── Proscience Nutra ─────────────────────────────────── */}
      <SectionStrip
        title="Proscience Nutra"
        subtitle="Science-backed nutrition for next-level results."
        href="/collections/proscience-nutra"
        products={proscienceNutraProducts}
      />

      {/* ─── Mass gainer / muscle building ────────────────────── */}
      <SectionStrip
        title="Serious Mass & Muscle"
        subtitle="Gainers and builders for size and power."
        href="/collections/muscle-building-products"
        products={massProducts}
      />

      {/* ─── Shop by brand ────────────────────────────────────── */}
      <section className="bg-[#F5F7FA] border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
          <div className="flex items-end justify-between mb-8">
            <SectionHeading>Shop by Brand</SectionHeading>
            <Link
              href="/brands"
              className="shrink-0 text-sm font-bold text-[#F9D20F] hover:text-[#E7BF00] uppercase tracking-wide"
            >
              All Brands →
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

      {/* ─── Health & wellness ────────────────────────────────── */}
      <SectionStrip
        title="Health & Wellness"
        subtitle="Vitamins, fish oil and daily essentials."
        href="/collections/health-wellness"
        products={wellnessProducts}
      />

      {/* ─── Vegan & plant-based ──────────────────────────────── */}
      <SectionStrip
        title="Vegan & Plant-Based"
        subtitle="Clean, plant-powered nutrition."
        href="/collections/vegan-protein"
        products={veganProducts}
        grid
      />

      {/* ─── Accessories ──────────────────────────────────────── */}
      <SectionStrip
        title="Accessories & Gear"
        subtitle="Shakers, bottles and training essentials."
        href="/collections/shakers"
        products={accessoryProducts}
        grid
      />

      {/* ─── Final CTA ────────────────────────────────────────── */}
      <section className="bg-[#F9D20F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight leading-[0.95]">
              Ready to level up?
            </h2>
            <p className="mt-3 text-[#082D4C] font-semibold text-lg">
              Explore the full range and fuel your next personal best.
            </p>
          </div>
          <Link
            href="/products"
            className="shrink-0 inline-flex items-center justify-center bg-[#0B0F14] text-white font-black uppercase tracking-wide px-8 py-4 rounded hover:bg-[#1A2333] transition-colors self-center"
          >
            Shop All Products →
          </Link>
        </div>
      </section>
    </div>
  );
}
