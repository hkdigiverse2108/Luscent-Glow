export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  date: string;
  category: "Rituals" | "Ingredients" | "Lifestyle" | "Sustainability";
  image: string;
  readTime: string;
  featured?: boolean;
  relatedProducts?: string[];
}

export const blogCategories = ["All", "Rituals", "Ingredients", "Lifestyle", "Sustainability"];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Art of the 10-Step Morning Glow Ritual",
    excerpt: "Discover the meditative sequence of layering that transforms your skin from dull to luminous before your first cup of coffee.",
    content: `
      <p>In the quiet moments before the world wakes, your skincare routine can be more than just a task—it can be a sanctuary. The 10-step morning glow ritual is designed not just for topical radiance, but for mental clarity and a grounded start to your day.</p>
      
      <h3>Step 1: Oil-Based Cleanser (The Purification)</h3>
      <p>Even in the morning, your skin has accumulated sebum and nightly treatments. Start with a gentle oil cleanser like our 24K Gold Cleansing Balm. Massage it in upward circular motions to stimulate lymphatic drainage.</p>
      
      <h3>Step 2: Water-Based Cleanser (The Refresh)</h3>
      <p>Follow up with a pH-balanced foaming cleanser to remove any remaining residue. This "double cleanse" ensures your canvas is perfectly pristine.</p>
      
      <h3>Step 3: Exfoliating Toner (The Refiner)</h3>
      <p>Twice a week, substitute your regular toner with a gentle AHA/BHA formula to sweep away dead skin cells that block your glow.</p>
      
      <blockquote class="bg-gold/5 border-l-4 border-gold p-8 my-10 italic font-display text-2xl text-foreground">
        "Consistency is the secret ingredient in every radiant transformation. Your skin is a canvas that requires daily devotion."
      </blockquote>

      <h3>Step 4: Hydrating Essence (The Foundation)</h3>
      <p>Essences are the heart of Korean beauty. They provide a thin layer of hydration that preps the skin to absorb the heavier serums to follow.</p>
      
      <h3>Step 5: Targeted Serum (The Specialist)</h3>
      <p>Whether you're targeting hyperpigmentation with Vitamin C or fine lines with Peptides, this is the step where you address your specific concerns.</p>
    `,
    author: "Elena Vance",
    date: "March 28, 2026",
    category: "Rituals",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop",
    readTime: "8 min read",
    featured: true,
    relatedProducts: ["2", "7", "11"]
  },
  {
    id: "2",
    title: "Gold-Infused Skincare: Ancient Secret or Modern Science?",
    excerpt: "We dive deep into the molecular benefits of colloidal gold and why it's the centerpiece of our Radiance collection.",
    content: `
      <p>Throughout history, gold has been revered not just for its beauty, but for its purported healing properties. In ancient Egypt, Queen Cleopatra was whispered to have slept in a mask of gold to preserve her youthful visage. Today, modern dermatology is finally catching up with the ancients.</p>
      
      <h3>What is Colloidal Gold?</h3>
      <p>Colloidal gold consists of microscopic particles of gold suspended in a liquid. Unlike solid gold, these particles are small enough to interact with the skin's surface at a molecular level.</p>

      <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&h=600&fit=crop" alt="Premium Gold Serums" class="w-full rounded-3xl my-12 shadow-2xl" />
      
      <h3>The Anti-Inflammatory Powerhouse</h3>
      <p>Gold is inherently anti-inflammatory. For those with sensitive skin or redness, gold particles can help soothe irritation and promote a more even skin tone. By reducing inflammation, it also protects the collagen in your skin from premature breakdown.</p>
      
      <h3>Electromagnetic Balance</h3>
      <p>Some researchers suggest that gold can help rebalance the skin's natural electrical current. This subtle interaction is thought to improve cellular communication, leading to faster renewal and a more "energetic" appearance—the literal gold glow.</p>
    `,
    author: "Dr. Marcus Chen",
    date: "March 24, 2026",
    category: "Ingredients",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=600&fit=crop",
    readTime: "12 min read",
    relatedProducts: ["2", "4", "3"]
  },
  {
    id: "3",
    title: "Sustainable Luxury: Our Journey to Zero-Waste Packaging",
    excerpt: "How we're redefining premium beauty by eliminating plastic and embracing glass and mycelium alternatives.",
    content: `
      <p>Luxury has long been associated with excess. Oversized boxes, plastic wraps, and heavy disposables were once signs of prestige. But at Lucsent Glow, we believe the ultimate luxury is a future where our beauty doesn't cost the Earth its health.</p>
      
      <h3>The Glass Renaissance</h3>
      <p>We've transitioned 90% of our primary containers to high-grade, infinitely recyclable glass. Not only is glass better for the environment, but it also preserves the potency of our botanical ingredients by blocking UV light and preventing chemical leaching.</p>
      
      <h3>Mycelium: Nature's Styrofoam</h3>
      <p>Instead of bubble wrap and plastic inserts, your next order will arrive nestled in mycelium—the root structure of mushrooms. This material is fully compostable in your garden within 45 days, returning nutrients to the soil instead of clogging oceans.</p>
    `,
    author: "Sarah Jenkins",
    date: "March 15, 2026",
    category: "Sustainability",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
    readTime: "6 min read",
    relatedProducts: ["9", "7", "6"]
  }
];
