/**
 * src/modules/ai/ai.service.ts
 *
 * AI Shopping Assistant — Business Logic Layer.
 *
 * ─────────────────────────────────────────────────────────────
 * Architecture: Two-Pass Relevance Engine (zero ML dependencies)
 * ─────────────────────────────────────────────────────────────
 *
 * PASS 1 — Intent Parsing
 *   Extract from the user's natural language query:
 *     - Detected category (mapped to actual DB slugs)
 *     - Category confidence (HIGH / LOW)
 *     - Budget ceiling
 *     - Use-case modifiers (gaming, fitness, coding, travel…)
 *     - Residual keywords for title/brand matching
 *
 * PASS 2 — DB Fetch + In-Memory Scoring
 *   HIGH confidence → strict category-locked DB query
 *     (only products in matching category, never cross-category)
 *   LOW confidence  → broad fallback query across all fields
 *
 *   Then score every returned product:
 *     +100  title contains primary keyword
 *     +70   brand contains primary keyword
 *     +60   category slug/name exact match
 *     +40   description contains keyword
 *     +30   use-case modifier found in name/description
 *     +20   secondary keyword match
 *     + 4×rating   quality signal (max ~20 pts)
 *     + log(reviews)/2   popularity signal (max ~12 pts)
 *
 *   Category match dominates — headphones always beat phones
 *   for "best headphones" regardless of rating difference.
 *
 * DIVERSITY FILTER
 *   Max 2 results per brand to avoid Sony×5 or Apple×4 dominance.
 *
 * RESPONSE GENERATION
 *   Template-based, context-aware, ecommerce-focused short messages.
 *   Mentions detected category, use-case, and budget naturally.
 *
 * ─────────────────────────────────────────────────────────────
 * Why no LangChain/OpenAI/vector DB?
 *   - Zero latency overhead — DB query + in-memory scoring < 30ms
 *   - Fully explainable in interviews
 *   - Deterministic — same query always returns same products
 *   - Extensible — add mappings without architecture changes
 * ─────────────────────────────────────────────────────────────
 */

import { ApiError } from "../../utils/ApiError";
import { findProductsStrict, findProductsFallback } from "./ai.repository";

// ── Confidence level for category detection ────────────────────
type Confidence = "HIGH" | "LOW";

// ── Category entry: maps user terms → DB slugs + display name ─
interface CategoryEntry {
  displayName: string;       // Used in response messages
  dbSlugs: string[];         // Actual category slugs in DB
  triggerTerms: string[];    // Words that activate this category
  primaryTerms: string[];    // High-confidence triggers (exact product type)
  relatedTerms: string[];    // Supporting terms (broader synonyms)
}

// ── Master category map — keyed to real DB slugs ───────────────
// DB categories: mobiles, laptops, headphones, smartwatches,
//                mens-clothing, womens-clothing, footwear,
//                sports-fitness, grocery, beauty-personal-care,
//                toys-games, home-kitchen, books
const CATEGORY_ENTRIES: CategoryEntry[] = [
  {
    displayName: "headphones & earbuds",
    dbSlugs: ["headphones"],
    triggerTerms: ["headphone", "earphone", "earbud", "earbuds", "headset",
                   "neckband", "audio", "airpods", "wh-1000", "sony wh",
                   "boat", "rockerz", "wired earphone", "wireless earphone"],
    primaryTerms: ["headphone", "earphone", "earbud", "earbuds", "airpods", "neckband"],
    relatedTerms: ["audio", "music", "headset", "noise cancelling", "anc"],
  },
  {
    displayName: "smartphones",
    dbSlugs: ["mobiles"],
    triggerTerms: ["phone", "mobile", "smartphone", "iphone", "android",
                   "samsung galaxy", "pixel", "redmi", "oneplus", "realme"],
    primaryTerms: ["phone", "mobile", "smartphone", "iphone", "android"],
    relatedTerms: ["5g", "camera phone", "selfie", "battery life"],
  },
  {
    displayName: "laptops",
    dbSlugs: ["laptops"],
    triggerTerms: ["laptop", "notebook", "macbook", "chromebook", "ultrabook",
                   "gaming laptop", "xps", "rog", "zephyrus", "dell", "asus rog"],
    primaryTerms: ["laptop", "notebook", "macbook", "chromebook", "ultrabook"],
    relatedTerms: ["computer", "coding", "programming", "office work", "gaming pc"],
  },
  {
    displayName: "smartwatches",
    dbSlugs: ["smartwatches"],
    triggerTerms: ["watch", "smartwatch", "smart watch", "wearable", "fitness band",
                   "garmin", "apple watch", "galaxy watch", "fitbit"],
    primaryTerms: ["watch", "smartwatch", "smart watch", "wearable"],
    relatedTerms: ["fitness tracker", "heart rate", "gps watch", "sports watch"],
  },
  {
    displayName: "shoes & footwear",
    dbSlugs: ["footwear"],
    triggerTerms: ["shoe", "shoes", "sneaker", "sneakers", "footwear", "boot",
                   "loafer", "running shoes", "sports shoes", "nike", "puma", "adidas"],
    primaryTerms: ["shoe", "shoes", "sneaker", "sneakers", "footwear", "boot", "loafer"],
    relatedTerms: ["running", "walking", "casual", "sports", "athletic"],
  },
  {
    displayName: "men's clothing",
    dbSlugs: ["mens-clothing"],
    triggerTerms: ["men shirt", "men jeans", "polo", "t-shirt for men", "men kurta",
                   "men clothing", "men clothes", "men fashion", "mens wear"],
    primaryTerms: ["men shirt", "polo shirt", "men jeans", "men kurta", "mens"],
    relatedTerms: ["shirt", "jeans", "formal", "casual wear"],
  },
  {
    displayName: "women's clothing",
    dbSlugs: ["womens-clothing"],
    triggerTerms: ["women dress", "kurta", "saree", "women clothing", "women clothes",
                   "women fashion", "ethnic wear", "women tops", "lehenga", "biba"],
    primaryTerms: ["kurta", "saree", "women dress", "ethnic", "biba"],
    relatedTerms: ["dress", "top", "blouse", "women fashion"],
  },
  {
    displayName: "beauty & skincare",
    dbSlugs: ["beauty-personal-care"],
    triggerTerms: ["face wash", "serum", "moisturizer", "lipstick", "makeup",
                   "beauty", "skincare", "skin care", "haircare", "hair care",
                   "trimmer", "beard trimmer", "hair dryer", "airwrap", "loreal",
                   "minimalist", "plum", "mac lipstick", "dyson"],
    primaryTerms: ["face wash", "serum", "moisturizer", "lipstick", "makeup", "beauty", "skincare"],
    relatedTerms: ["skin", "grooming", "personal care", "cosmetic"],
  },
  {
    displayName: "sports & fitness",
    dbSlugs: ["sports-fitness"],
    triggerTerms: ["football", "badminton", "yoga mat", "dumbbell", "gym",
                   "fitness", "protein", "whey", "helmet", "sports", "exercise",
                   "racquet", "cricket", "volleyball", "bicycle"],
    primaryTerms: ["football", "badminton", "yoga mat", "dumbbell", "protein", "whey", "helmet"],
    relatedTerms: ["gym", "workout", "exercise", "training", "sports equipment"],
  },
  {
    displayName: "books",
    dbSlugs: ["books"],
    triggerTerms: ["book", "books", "novel", "read", "reading", "self help",
                   "atomic habits", "psychology of money", "deep work",
                   "coding books", "programming books", "finance book"],
    primaryTerms: ["book", "books", "novel", "atomic habits", "deep work"],
    relatedTerms: ["read", "reading", "self improvement", "finance", "productivity"],
  },
  {
    displayName: "toys & games",
    dbSlugs: ["toys-games"],
    triggerTerms: ["toy", "toys", "lego", "board game", "monopoly", "uno",
                   "game", "games", "puzzle", "kids", "children"],
    primaryTerms: ["toy", "toys", "lego", "monopoly", "uno", "board game"],
    relatedTerms: ["kids", "children", "play", "puzzle"],
  },
  {
    displayName: "home & kitchen",
    dbSlugs: ["home-kitchen"],
    triggerTerms: ["mixer", "grinder", "pressure cooker", "mattress", "bedsheet",
                   "water bottle", "refrigerator", "fridge", "kitchen", "home",
                   "cookware", "pigeon", "milton", "wakefit"],
    primaryTerms: ["mixer", "pressure cooker", "mattress", "bedsheet", "water bottle", "refrigerator"],
    relatedTerms: ["kitchen", "home appliance", "cookware", "bedroom"],
  },
  {
    displayName: "grocery & food",
    dbSlugs: ["grocery"],
    triggerTerms: ["grocery", "food", "salt", "flour", "atta", "noodles",
                   "maggi", "oil", "sunflower oil", "tata salt", "aashirvaad"],
    primaryTerms: ["salt", "flour", "atta", "noodles", "oil", "grocery"],
    relatedTerms: ["food", "cooking", "daily essentials"],
  },
];

// ── Use-case modifiers ─────────────────────────────────────────
// Maps intent words to score-boosting keywords in product text
const USE_CASE_MAP: Record<string, string[]> = {
  gaming:       ["gaming", "rog", "rtx", "game", "performance", "high refresh"],
  fitness:      ["fitness", "running", "sport", "workout", "gym", "training"],
  office:       ["office", "professional", "work", "business", "productivity"],
  coding:       ["coding", "programming", "developer", "work", "performance"],
  travel:       ["travel", "portable", "lightweight", "compact"],
  wireless:     ["wireless", "bluetooth", "wifi", "cordless"],
  waterproof:   ["waterproof", "water resistant", "ip68", "ip67"],
  budget:       [],  // handled via price
  premium:      ["premium", "pro", "ultra", "plus", "max"],
  music:        ["music", "audio", "sound", "bass", "hi-fi"],
  noise:        ["noise cancelling", "anc", "active noise"],
};

// ── Stopwords ──────────────────────────────────────────────────
const STOPWORDS = new Set([
  "best", "good", "top", "great", "nice", "cheap", "affordable",
  "suggest", "show", "find", "recommend", "need", "want", "looking",
  "for", "a", "an", "the", "some", "any", "please", "me", "i",
  "under", "below", "less", "than", "within", "upto", "up", "to",
  "budget", "price", "range", "rupees", "rs", "inr", "buy",
  "get", "give", "tell", "list", "what", "which", "where",
]);

// ── Parsed intent ──────────────────────────────────────────────
interface ParsedIntent {
  rawQuery: string;
  category?: CategoryEntry;
  confidence: Confidence;
  maxPrice?: number;
  useCases: string[];      // Detected use-case keys (e.g. ["gaming", "wireless"])
  keywords: string[];      // Residual keywords for scoring
  primaryTerms: string[];  // High-signal category terms found in query
}

// ── Budget extractor ───────────────────────────────────────────
const extractBudget = (query: string): number | undefined => {
  const normalized = query.replace(/₹/g, " ").replace(/,/g, "").toLowerCase();
  const pattern =
    /(?:under|below|less\s*than|upto|up\s*to|within|max|maximum|budget(?:\s+of)?|around|approx)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousand|lakh|l)?/gi;

  let best: number | undefined;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(normalized)) !== null) {
    const raw = parseFloat(match[1]);
    const tail = normalized.slice(match.index + match[0].length).trimStart();
    let amount = raw;

    if (/^k\b/.test(tail) || match[0].toLowerCase().endsWith("k")) {
      amount = raw * 1000;
    } else if (/^(?:lakh|l)\b/.test(tail)) {
      amount = raw * 100_000;
    } else if (raw > 0 && raw < 1000 && /k/.test(match[0])) {
      amount = raw * 1000;
    }

    if (amount >= 100 && amount <= 1_000_000) {
      best = amount;
      break;
    }
  }

  return best;
};

// ── Category detector ──────────────────────────────────────────
// Returns the best matching CategoryEntry and confidence.
// HIGH confidence = primary term found. LOW = only related term.
const detectCategory = (query: string): { entry: CategoryEntry; confidence: Confidence; primaryTerms: string[] } | undefined => {
  const lower = query.toLowerCase();

  let bestEntry: CategoryEntry | undefined;
  let bestConfidence: Confidence = "LOW";
  let bestPrimaryTerms: string[] = [];
  let bestScore = 0;

  for (const entry of CATEGORY_ENTRIES) {
    const foundPrimary = entry.primaryTerms.filter((t) => lower.includes(t));
    const foundRelated = entry.relatedTerms.filter((t) => lower.includes(t));
    const foundTrigger = entry.triggerTerms.filter((t) => lower.includes(t));

    const score = foundPrimary.length * 3 + foundRelated.length + foundTrigger.length * 2;

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
      bestConfidence = foundPrimary.length > 0 ? "HIGH" : "LOW";
      bestPrimaryTerms = foundPrimary;
    }
  }

  if (!bestEntry || bestScore === 0) return undefined;
  return { entry: bestEntry, confidence: bestConfidence, primaryTerms: bestPrimaryTerms };
};

// ── Use-case detector ──────────────────────────────────────────
const detectUseCases = (query: string): string[] => {
  const lower = query.toLowerCase();
  return Object.keys(USE_CASE_MAP).filter((key) => lower.includes(key));
};

// ── Keyword extractor ──────────────────────────────────────────
const extractKeywords = (query: string, exclude: string[]): string[] => {
  const excludeSet = new Set([...exclude.map((k) => k.toLowerCase())]);

  return query
    .toLowerCase()
    .replace(/[₹,]/g, " ")
    .split(/\s+/)
    .filter((t) => {
      if (t.length < 2) return false;
      if (STOPWORDS.has(t)) return false;
      if (excludeSet.has(t)) return false;
      if (/^\d+$/.test(t)) return false;
      return true;
    });
};

// ── Full intent parser ─────────────────────────────────────────
const parseIntent = (query: string): ParsedIntent => {
  const maxPrice = extractBudget(query);
  const cat = detectCategory(query);
  const useCases = detectUseCases(query);

  const excludeTerms = [
    ...(cat?.entry.triggerTerms ?? []),
    ...(cat?.entry.primaryTerms ?? []),
    ...(cat?.entry.relatedTerms ?? []),
    ...useCases,
  ];
  const keywords = extractKeywords(query, excludeTerms);

  return {
    rawQuery: query,
    category: cat?.entry,
    confidence: cat?.confidence ?? "LOW",
    maxPrice,
    useCases,
    keywords,
    primaryTerms: cat?.primaryTerms ?? [],
  };
};

// ── In-memory relevance scorer ─────────────────────────────────
// Scores a product against the parsed intent.
// Returns a numeric score — higher is more relevant.
type ScoredProduct = {
  score: number;
  product: Awaited<ReturnType<typeof findProductsStrict>>[number];
};

const scoreProduct = (
  product: Awaited<ReturnType<typeof findProductsStrict>>[number],
  intent: ParsedIntent
): number => {
  let score = 0;
  const name = product.name.toLowerCase();
  const brand = (product.brand ?? "").toLowerCase();
  const desc = (product.description ?? "").toLowerCase();
  const catSlug = (product.category?.slug ?? "").toLowerCase();
  const catName = (product.category?.name ?? "").toLowerCase();

  const allText = `${name} ${brand} ${desc} ${catSlug} ${catName}`;

  // ── 1. Primary keyword title/brand match (+100 / +70) ─────
  for (const term of intent.primaryTerms) {
    const t = term.toLowerCase();
    if (name.includes(t))  { score += 100; break; }
    if (brand.includes(t)) { score += 70;  break; }
  }

  // ── 2. Category slug exact match (+60) ────────────────────
  if (intent.category) {
    for (const slug of intent.category.dbSlugs) {
      if (catSlug.includes(slug) || catName.includes(slug)) {
        score += 60;
        break;
      }
    }
  }

  // ── 3. Description keyword match (+40) ────────────────────
  for (const term of intent.primaryTerms) {
    if (desc.includes(term.toLowerCase())) {
      score += 40;
      break;
    }
  }

  // ── 4. Residual keyword matches (+20 each) ────────────────
  for (const kw of intent.keywords) {
    const k = kw.toLowerCase();
    if (name.includes(k) || brand.includes(k) || desc.includes(k)) {
      score += 20;
    }
  }

  // ── 5. Use-case modifier matches (+30 each) ───────────────
  for (const useCase of intent.useCases) {
    const boostWords = USE_CASE_MAP[useCase] ?? [];
    for (const bw of boostWords) {
      if (allText.includes(bw.toLowerCase())) {
        score += 30;
        break;
      }
    }
  }

  // ── 6. Quality signal: rating (max ~20 pts at rating 5.0) ─
  score += Number(product.rating) * 4;

  // ── 7. Popularity signal: log scale (max ~12 pts) ─────────
  const reviews = product.reviewCount ?? 0;
  if (reviews > 0) {
    score += Math.min(Math.log10(reviews) * 3, 12);
  }

  return score;
};

// ── Brand diversity filter ─────────────────────────────────────
// Prevents "Apple×4 + Sony×1" result sets.
// Limits any single brand to max 2 results.
const diversifyByBrand = <T extends { brand: string | null }>(
  products: T[],
  maxPerBrand = 2
): T[] => {
  const brandCount: Record<string, number> = {};
  return products.filter((p) => {
    const brand = (p.brand ?? "unknown").toLowerCase();
    brandCount[brand] = (brandCount[brand] ?? 0) + 1;
    return brandCount[brand] <= maxPerBrand;
  });
};

// ── Response message generator ─────────────────────────────────
const generateMessage = (intent: ParsedIntent, count: number, budgetRelaxed = false): string => {
  if (count === 0) {
    const budgetNote = intent.maxPrice
      ? ` within your budget of ₹${intent.maxPrice.toLocaleString("en-IN")}`
      : "";
    return `I couldn't find any matching products${budgetNote}. Try broadening your search or adjusting your budget.`;
  }

  const parts: string[] = [];
  const { category, useCases, maxPrice } = intent;

  // If we relaxed the budget, lead with an explanation
  if (budgetRelaxed && maxPrice) {
    const fmt = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(maxPrice);
    const catLabel = category ? category.displayName : "products";
    return `I couldn't find ${catLabel} under ${fmt}. Here are the closest options currently available — these may be slightly above your budget but are highly rated:`;
  }

  // Opening line
  if (useCases.length > 0 && category) {
    const ucLabel = useCases.slice(0, 2).join(" & ");
    parts.push(`Here are the best ${ucLabel} ${category.displayName}`);
  } else if (category) {
    parts.push(`Here are our top-rated ${category.displayName}`);
  } else {
    parts.push(`Here are the best products matching your search`);
  }

  // Budget clause
  if (maxPrice) {
    const fmt = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(maxPrice);
    parts.push(`under ${fmt}`);
  }

  // Context-aware closing by category
  const categoryClosings: Record<string, string[]> = {
    headphones:      ["with excellent sound quality and battery life.", "loved by audiophiles and casual listeners alike."],
    mobiles:         ["with top camera performance and battery life.", "rated highly for performance and build quality."],
    laptops:         ["with strong performance and great displays.", "ideal for both work and everyday use."],
    smartwatches:    ["with comprehensive health tracking features.", "combining style with smart fitness capabilities."],
    footwear:        ["highly rated for comfort and durability.", "perfect for daily wear and active use."],
    "beauty-personal-care": ["trusted by thousands of customers for visible results.", "dermatologist-tested and highly reviewed."],
    "sports-fitness":       ["helping thousands reach their fitness goals.", "popular among fitness enthusiasts."],
    books:           ["with top reader reviews and timeless insights.", "perfect for knowledge seekers."],
    grocery:         ["fresh essentials from trusted brands.", "popular daily-use products with great value."],
    "home-kitchen":  ["built for durability and everyday kitchen use.", "top-rated by home cooks."],
    "toys-games":    ["fun for the whole family with great reviews.", "trusted by parents and kids alike."],
  };

  const targetSlug = category?.dbSlugs[0] ?? "";
  const closings = categoryClosings[targetSlug] ?? [
    "with strong ratings and customer reviews.",
    "offering excellent value for money.",
    "highly rated by verified buyers.",
  ];
  const closing = closings[Math.floor(Math.random() * closings.length)];

  return `${parts.join(" ")} — ${closing}`;
};

// ── Main service function ──────────────────────────────────────
export const getAIRecommendations = async (rawQuery: string) => {
  const trimmed = rawQuery.trim();

  if (!trimmed) throw ApiError.badRequest("Query cannot be empty");
  if (trimmed.length > 200) throw ApiError.badRequest("Query is too long (max 200 characters)");

  // ── Step 1: Parse intent ───────────────────────────────────
  const intent = parseIntent(trimmed);

  // ── Step 2: Fetch candidate products ──────────────────────
  let candidates: Awaited<ReturnType<typeof findProductsStrict>>;
  let budgetRelaxed = false;

  if (intent.category && intent.confidence === "HIGH") {
    // STRICT MODE: locked to detected category — guarantees precision
    candidates = await findProductsStrict({
      categorySlugs: intent.category.dbSlugs,
      keywords: intent.keywords,
      maxPrice: intent.maxPrice,
      strictCategory: true,
    });

    // If budget filter wiped out all results, retry without price constraint
    // and inform the user that options above their budget are shown
    if (candidates.length === 0 && intent.maxPrice) {
      candidates = await findProductsStrict({
        categorySlugs: intent.category.dbSlugs,
        keywords: intent.keywords,
        strictCategory: true,
      });
      budgetRelaxed = true;
    }

    // Safety: if strict returns 0 results (no products in category), fall back
    if (candidates.length === 0) {
      candidates = await findProductsFallback({
        keywords: [...intent.primaryTerms, ...intent.keywords],
        maxPrice: intent.maxPrice,
      });
    }
  } else {
    // FALLBACK MODE: broad keyword search
    const allKeywords = [
      ...(intent.category?.triggerTerms.slice(0, 3) ?? []),
      ...intent.primaryTerms,
      ...intent.keywords,
    ].filter(Boolean);

    candidates = await findProductsFallback({
      keywords: allKeywords.length > 0 ? allKeywords : undefined,
      maxPrice: intent.maxPrice,
    });
  }


  // ── Step 3: Score candidates in-memory ────────────────────
  const scored: ScoredProduct[] = candidates.map((p) => ({
    score: scoreProduct(p, intent),
    product: p,
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // ── Step 4: Apply brand diversity ─────────────────────────
  const diversified = diversifyByBrand(
    scored.map((s) => s.product),
    2
  );

  // ── Step 5: Return top 5 ──────────────────────────────────
  const products = diversified.slice(0, 5);

  // ── Step 6: Generate response message ─────────────────────
  const message = generateMessage(intent, products.length, budgetRelaxed);

  return { message, products };
};
