// ─── Static News / Blog data ─────────────────────────────────────────────────
// SEO-friendly static news articles served at /blogs/news and /blogs/news/[slug].
// Content is authored inline so the pages can be statically generated (SSG).

export type NewsArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  image: {
    url: string;
    alt: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  contentHtml: string;
};

export const NEWS: NewsArticle[] = [
  {
    slug: "protein-timing-myths-debunked",
    title: "Protein Timing Myths Debunked: When Should You Really Take Whey?",
    excerpt:
      "The 30-minute 'anabolic window' has haunted gym-goers for years. We break down what the research actually says about protein timing and muscle growth.",
    category: "Nutrition Science",
    author: "JNK Nutrition Team",
    publishedAt: "2026-06-24",
    readingMinutes: 6,
    image: {
      url: "/feature%20image/whey.webp",
      alt: "Scoop of whey protein powder for post-workout nutrition",
    },
    seo: {
      title: "Protein Timing Myths Debunked — When to Take Whey Protein",
      description:
        "Does the anabolic window really matter? Learn what the science says about protein timing, total daily intake, and getting the most from your whey protein.",
      keywords: [
        "protein timing",
        "anabolic window",
        "whey protein",
        "muscle growth",
        "post workout nutrition",
      ],
    },
    contentHtml: `
      <p>For decades, lifters have sprinted to the changing room to slam a shake within 30 minutes of their last rep, convinced the "anabolic window" was slamming shut. Newer research paints a far more relaxed picture.</p>
      <h2>Total daily protein beats the clock</h2>
      <p>Meta-analyses consistently show that <strong>total daily protein intake</strong> — roughly 1.6–2.2g per kg of bodyweight — is the primary driver of muscle protein synthesis. As long as you hit that target across the day, the exact minute you drink your shake matters far less than once believed.</p>
      <h2>The window is bigger than you think</h2>
      <p>Rather than 30 minutes, the practical post-exercise window spans several hours. Spreading protein across 3–5 meals of 25–40g each keeps synthesis elevated throughout the day.</p>
      <h2>Practical takeaways</h2>
      <ul>
        <li>Prioritise your daily protein total before worrying about timing.</li>
        <li>A shake around your workout is convenient, not magic.</li>
        <li>Include a protein source in every main meal.</li>
      </ul>
      <p>Bottom line: consistency wins. A fast-digesting whey shake is a great tool — just don't let the stopwatch stress you out.</p>
    `,
  },
  {
    slug: "creatine-monohydrate-complete-guide",
    title: "Creatine Monohydrate: The Most Studied Supplement, Explained",
    excerpt:
      "Backed by hundreds of trials, creatine remains the gold standard for strength and power. Here's how to dose it, load it, and skip the myths.",
    category: "Supplement Guides",
    author: "JNK Nutrition Team",
    publishedAt: "2026-06-18",
    readingMinutes: 7,
    image: {
      url: "/feature%20image/creatine.webp",
      alt: "Creatine monohydrate powder measured with a scoop",
    },
    seo: {
      title: "Creatine Monohydrate Guide — Dosing, Loading & Benefits",
      description:
        "A no-nonsense guide to creatine monohydrate: proven benefits, how to dose it, whether to load, and common myths about water retention and kidneys.",
      keywords: [
        "creatine monohydrate",
        "creatine dosing",
        "creatine loading",
        "strength supplements",
        "creatine benefits",
      ],
    },
    contentHtml: `
      <p>If you could only take one supplement, creatine monohydrate would be a strong contender. It's cheap, safe, and supported by more research than almost anything else on the shelf.</p>
      <h2>What creatine actually does</h2>
      <p>Creatine helps regenerate ATP — your muscles' rapid energy currency. More available ATP means more reps, heavier loads, and better power output over time.</p>
      <h2>How to dose it</h2>
      <p>A simple <strong>3–5g per day</strong>, every day, is all most people need. Loading (20g/day split over four servings for a week) fills your stores faster but isn't required — you'll reach saturation either way.</p>
      <h2>Myths worth ignoring</h2>
      <ul>
        <li><strong>"It damages your kidneys."</strong> No evidence of harm in healthy individuals.</li>
        <li><strong>"It's just water weight."</strong> Early scale changes are intramuscular water, which supports performance — real lean gains follow.</li>
        <li><strong>"You must cycle it."</strong> Cycling is unnecessary; consistent daily use is best.</li>
      </ul>
      <p>Take it any time of day, with or without food. Consistency is what matters.</p>
    `,
  },
  {
    slug: "eaa-vs-bcaa-which-wins",
    title: "EAAs vs BCAAs: Which Amino Acid Supplement Actually Wins?",
    excerpt:
      "BCAAs dominated shelves for years, but essential amino acids may offer more complete support. We compare the two head-to-head.",
    category: "Supplement Guides",
    author: "JNK Nutrition Team",
    publishedAt: "2026-06-12",
    readingMinutes: 5,
    image: {
      url: "/feature%20image/EAAS_600x.webp",
      alt: "Essential amino acid supplement drink",
    },
    seo: {
      title: "EAAs vs BCAAs — Which Amino Acid Supplement Is Better?",
      description:
        "Essential amino acids or branched-chain? Learn the real difference between EAAs and BCAAs and which one supports muscle protein synthesis better.",
      keywords: [
        "EAA vs BCAA",
        "essential amino acids",
        "branched chain amino acids",
        "muscle recovery",
        "intra workout",
      ],
    },
    contentHtml: `
      <p>Branched-chain amino acids (BCAAs) supply just three of the nine essential amino acids. Essential amino acid (EAA) blends deliver all nine — the full toolkit your body needs to build muscle.</p>
      <h2>Why complete matters</h2>
      <p>Muscle protein synthesis requires <strong>all nine essential amino acids</strong>. Providing only leucine, isoleucine, and valine can stimulate the signal but lacks the raw materials to fully capitalise on it.</p>
      <h2>When each makes sense</h2>
      <ul>
        <li><strong>EAAs:</strong> Better all-round choice, especially if daily protein is low or during fasted training.</li>
        <li><strong>BCAAs:</strong> Cheaper and fine for flavouring your water, but largely redundant if you already eat enough protein.</li>
      </ul>
      <p>For most people already hitting their protein targets, neither is essential — but if you choose one, EAAs offer the more complete profile.</p>
    `,
  },
  {
    slug: "pre-workout-ingredients-that-work",
    title: "Pre-Workout Ingredients That Actually Work (And Ones That Don't)",
    excerpt:
      "Proprietary blends hide fairy dust behind flashy labels. Here are the evidence-backed ingredients worth paying for.",
    category: "Supplement Guides",
    author: "JNK Nutrition Team",
    publishedAt: "2026-06-05",
    readingMinutes: 6,
    image: {
      url: "/feature%20image/preworkout.webp",
      alt: "Pre-workout supplement powder ready to mix",
    },
    seo: {
      title: "Pre-Workout Ingredients That Work — Evidence-Based Breakdown",
      description:
        "Cut through the hype. Discover which pre-workout ingredients — caffeine, citrulline, beta-alanine — are backed by science and which are just filler.",
      keywords: [
        "pre workout ingredients",
        "citrulline malate",
        "beta alanine",
        "caffeine performance",
        "proprietary blend",
      ],
    },
    contentHtml: `
      <p>A great pre-workout can sharpen focus and push back fatigue. A bad one is expensive caffeine with a light show. Here's what to look for on the label.</p>
      <h2>Ingredients worth your money</h2>
      <ul>
        <li><strong>Caffeine (150–300mg):</strong> The most reliable performance booster available.</li>
        <li><strong>L-Citrulline (6–8g):</strong> Supports blood flow and that satisfying pump.</li>
        <li><strong>Beta-Alanine (3.2g):</strong> Buffers fatigue in longer sets — expect a harmless tingle.</li>
        <li><strong>Creatine (3–5g):</strong> Great if your pre-workout includes a full dose.</li>
      </ul>
      <h2>Red flags</h2>
      <p>Avoid <strong>proprietary blends</strong> that hide individual doses. If a label won't tell you how much citrulline you're getting, assume it's underdosed.</p>
      <p>Buy for the dose, not the marketing.</p>
    `,
  },
  {
    slug: "fat-loss-supplements-honest-look",
    title: "Fat-Loss Supplements: An Honest Look at What Helps",
    excerpt:
      "No pill replaces a calorie deficit — but a few supplements can support the process. We separate the useful from the hype.",
    category: "Nutrition Science",
    author: "JNK Nutrition Team",
    publishedAt: "2026-05-28",
    readingMinutes: 6,
    image: {
      url: "/feature%20image/fat-loss.webp",
      alt: "Fat-loss support supplements and measuring tape",
    },
    seo: {
      title: "Fat-Loss Supplements — What Actually Helps for Weight Loss",
      description:
        "An honest, evidence-based look at fat-loss supplements. Learn which fat burners offer modest support and why a calorie deficit still does the heavy lifting.",
      keywords: [
        "fat loss supplements",
        "fat burners",
        "weight loss",
        "caffeine fat loss",
        "calorie deficit",
      ],
    },
    contentHtml: `
      <p>Let's be clear from the start: no supplement melts fat. Sustainable fat loss comes from a consistent calorie deficit, adequate protein, and movement. That said, a few products can offer a modest edge.</p>
      <h2>The genuinely useful</h2>
      <ul>
        <li><strong>Caffeine:</strong> Slightly boosts metabolism and training performance.</li>
        <li><strong>Protein powder:</strong> Increases fullness and preserves muscle in a deficit.</li>
        <li><strong>Fibre supplements:</strong> Help control appetite between meals.</li>
      </ul>
      <h2>Manage your expectations</h2>
      <p>"Fat burners" typically stack caffeine with a few thermogenic extras. Effects are small and fade as tolerance builds. Treat them as a minor assist — never a substitute for diet.</p>
      <p>The foundation is always the same: protein, a modest deficit, and patience.</p>
    `,
  },
  {
    slug: "multivitamins-do-you-need-them",
    title: "Do You Really Need a Multivitamin? A Practical Breakdown",
    excerpt:
      "Insurance policy or waste of money? We look at who benefits most from a daily multivitamin and how to choose a good one.",
    category: "Nutrition Science",
    author: "JNK Nutrition Team",
    publishedAt: "2026-05-20",
    readingMinutes: 5,
    image: {
      url: "/feature%20image/MULTIVITAMINS_AND_MINERALS_600x.webp",
      alt: "Multivitamin and mineral supplement tablets",
    },
    seo: {
      title: "Do You Need a Multivitamin? Benefits & How to Choose",
      description:
        "Are multivitamins worth it? Find out who benefits most, which nutrients matter, and how to pick a quality multivitamin and mineral supplement.",
      keywords: [
        "multivitamin",
        "vitamins and minerals",
        "micronutrients",
        "supplement basics",
        "daily vitamins",
      ],
    },
    contentHtml: `
      <p>A varied, whole-food diet covers most micronutrient needs. But real life — busy schedules, restrictive diets, and hard training — can leave gaps. That's where a quality multivitamin earns its place.</p>
      <h2>Who benefits most</h2>
      <ul>
        <li>Athletes in a calorie deficit eating less overall food.</li>
        <li>Vegans and vegetarians (B12, iron, zinc).</li>
        <li>Anyone with a limited or repetitive diet.</li>
      </ul>
      <h2>Choosing a good one</h2>
      <p>Look for meaningful doses of the nutrients you're likely to miss, avoid mega-doses of fat-soluble vitamins, and pick a reputable, tested brand. A multivitamin is a <strong>safety net</strong> — not a replacement for eating well.</p>
    `,
  },
  {
    slug: "spotting-fake-supplements-uae",
    title: "How to Spot Fake Supplements in the UAE Market",
    excerpt:
      "Counterfeit supplements are big business. Learn the tell-tale signs and how to guarantee you're buying 100% authentic products.",
    category: "Buyer's Guide",
    author: "JNK Nutrition Team",
    publishedAt: "2026-05-14",
    readingMinutes: 6,
    image: {
      url: "/banners/Top%20Brands.%20Best%20Prices.%20Fast%20Results.jpg",
      alt: "Authentic sports nutrition supplements from top brands",
    },
    seo: {
      title: "How to Spot Fake Supplements in the UAE — Buyer's Guide",
      description:
        "Protect your health and wallet. Learn how to identify counterfeit supplements in the UAE and where to buy 100% authentic sports nutrition.",
      keywords: [
        "fake supplements",
        "authentic supplements UAE",
        "counterfeit protein",
        "genuine supplements",
        "supplement safety",
      ],
    },
    contentHtml: `
      <p>Counterfeit supplements don't just waste your money — they can be genuinely unsafe. Fakes have become increasingly convincing, so knowing what to check is essential.</p>
      <h2>Warning signs</h2>
      <ul>
        <li>Prices that seem too good to be true.</li>
        <li>Blurry labels, spelling errors, or mismatched fonts.</li>
        <li>Broken or resealed safety seals.</li>
        <li>Taste, texture, or solubility that differs from previous tubs.</li>
      </ul>
      <h2>How to stay safe</h2>
      <p>Buy from <strong>authorised retailers</strong> who source directly from official distributors. At JNK, every product is verified genuine before it reaches your door — no fakes, no compromises.</p>
      <p>When in doubt, scan the batch code and verify with the brand.</p>
    `,
  },
  {
    slug: "hydration-and-electrolytes-for-training",
    title: "Hydration and Electrolytes: The Overlooked Performance Edge",
    excerpt:
      "Dehydration can tank your workout before you touch a weight. Here's how to dial in fluids and electrolytes for peak performance.",
    category: "Performance",
    author: "JNK Nutrition Team",
    publishedAt: "2026-05-06",
    readingMinutes: 5,
    image: {
      url: "/banners/core%20chamos%20eaa%20banner%20for%20jnk.jpg",
      alt: "Electrolyte and amino acid hydration drink for training",
    },
    seo: {
      title: "Hydration & Electrolytes for Training — Performance Guide",
      description:
        "Learn how proper hydration and electrolyte balance improve strength, endurance, and recovery — plus practical tips for training in a hot climate.",
      keywords: [
        "hydration",
        "electrolytes",
        "sodium performance",
        "training hydration",
        "endurance",
      ],
    },
    contentHtml: `
      <p>Even mild dehydration — a 2% drop in body water — can reduce strength, endurance, and focus. In a hot climate, the stakes are even higher.</p>
      <h2>The role of electrolytes</h2>
      <p>Sweat carries out more than water. <strong>Sodium, potassium, and magnesium</strong> keep muscles firing and nerves signalling correctly. Replacing only water can dilute these further.</p>
      <h2>Practical hydration</h2>
      <ul>
        <li>Start sessions already hydrated — sip through the day.</li>
        <li>Add electrolytes for sessions over an hour or heavy sweating.</li>
        <li>Use urine colour as a quick daily check.</li>
      </ul>
      <p>Hydration is the cheapest performance upgrade you're probably ignoring.</p>
    `,
  },
  {
    slug: "building-your-first-supplement-stack",
    title: "Building Your First Supplement Stack on a Budget",
    excerpt:
      "New to supplements and overwhelmed? Here's a simple, affordable stack that covers the essentials without wasting a dirham.",
    category: "Buyer's Guide",
    author: "JNK Nutrition Team",
    publishedAt: "2026-04-29",
    readingMinutes: 6,
    image: {
      url: "/banners/DOWNLOAD%20APP.jpg",
      alt: "Starter supplement stack essentials",
    },
    seo: {
      title: "First Supplement Stack on a Budget — Beginner's Guide",
      description:
        "A simple, affordable beginner supplement stack. Learn the three essentials worth buying first and how to spend your money where it counts.",
      keywords: [
        "supplement stack",
        "beginner supplements",
        "budget supplements",
        "starter stack",
        "supplement basics",
      ],
    },
    contentHtml: `
      <p>Walk into any supplement store and the wall of tubs can be paralysing. The good news: a beginner only needs a handful of proven basics.</p>
      <h2>The core three</h2>
      <ul>
        <li><strong>Whey protein:</strong> Convenient way to hit daily protein goals.</li>
        <li><strong>Creatine monohydrate:</strong> Cheap, safe, and effective for strength.</li>
        <li><strong>A quality multivitamin:</strong> Covers micronutrient gaps.</li>
      </ul>
      <h2>Add later, if needed</h2>
      <p>Once the basics are habit, you might add caffeine or a pre-workout for training days. Everything else is optional. Spend your money on <strong>consistency and food first</strong> — supplements fill the gaps, they don't build the house.</p>
    `,
  },
  {
    slug: "sleep-recovery-and-muscle-growth",
    title: "Sleep, Recovery, and Muscle Growth: The Missing Link",
    excerpt:
      "You can't out-supplement bad sleep. Discover why rest may be the most powerful performance enhancer you're neglecting.",
    category: "Performance",
    author: "JNK Nutrition Team",
    publishedAt: "2026-04-22",
    readingMinutes: 6,
    image: {
      url: "/banners/fat%20burn%20banner%202.jpg",
      alt: "Recovery and rest for muscle growth",
    },
    seo: {
      title: "Sleep, Recovery & Muscle Growth — Why Rest Matters Most",
      description:
        "Sleep is where muscle is built and recovery happens. Learn how better sleep boosts strength, hormones, and gains more than any supplement can.",
      keywords: [
        "sleep and muscle growth",
        "recovery",
        "sleep performance",
        "muscle recovery",
        "training recovery",
      ],
    },
    contentHtml: `
      <p>You break muscle down in the gym — but you build it back during rest. Skimp on sleep and even a perfect diet and program will underdeliver.</p>
      <h2>Why sleep is anabolic</h2>
      <p>Deep sleep drives <strong>growth hormone release</strong>, muscle repair, and central nervous system recovery. Chronic sleep debt raises cortisol, blunts recovery, and saps training motivation.</p>
      <h2>Simple wins</h2>
      <ul>
        <li>Aim for 7–9 hours consistently.</li>
        <li>Keep a regular sleep and wake time.</li>
        <li>Cut caffeine 8+ hours before bed.</li>
        <li>Keep the room dark, cool, and screen-free before sleep.</li>
      </ul>
      <p>Before chasing another supplement, fix your sleep. It's free, and nothing beats it for recovery.</p>
    `,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getAllNews(): NewsArticle[] {
  return [...NEWS].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return NEWS.find((article) => article.slug === slug);
}

export function formatNewsDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
