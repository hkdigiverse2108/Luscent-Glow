export interface Product {
  id: string;
  _id?: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  tags: string[];
  shades?: string[];
  sizes?: string[];
  isNew?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  description?: string;
  ingredients?: string;
  howToUse?: string;
}

export const categories = [
  { name: "Makeup", slug: "makeup", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop" },
  { name: "Skincare", slug: "skincare", image: "https://images.unsplash.com/photo-1570194065650-d99fb4ee7b5a?w=400&h=400&fit=crop" },
  { name: "Hair Care", slug: "haircare", image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop" },
  { name: "Fragrances", slug: "fragrances", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop" },
  { name: "Bath & Body", slug: "bath-body", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop" },
  { name: "Nails", slug: "nails", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop" },
];

// Public assets are now served from the /assets directory

export const products: Product[] = [
  {
    id: "1", name: "Velvet Matte Lipstick", brand: "Luscent Glow", price: 899, originalPrice: 1299, discount: 31,
    rating: 4.5, reviewCount: 2341, category: "makeup", tags: ["lips", "matte"],
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop",
    shades: ["Rose Petal", "Berry Crush", "Nude Bliss", "Crimson Red"],
    isTrending: true, isBestSeller: true,
    description: "A luxuriously smooth matte lipstick that glides on effortlessly, delivering rich, full-coverage color that lasts all day.",
    ingredients: "Isododecane, Dimethicone, Trimethylsiloxysilicate, Nylon-611/Dimethicone Copolymer",
    howToUse: "Apply directly from the bullet or use a lip brush for precision. Start from the center and work outward."
  },
  {
    id: "2", name: "Hydra Glow Serum", brand: "Luscent Glow", price: 1499, originalPrice: 1999, discount: 25,
    rating: 4.8, reviewCount: 1856, category: "skincare", tags: ["serum", "hydration"],
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop",
    sizes: ["30ml", "50ml"], isNew: true, isTrending: true,
    description: "An ultra-lightweight serum infused with hyaluronic acid and vitamin C for a dewy, luminous glow.",
    ingredients: "Isododecane, Dimethicone, Trimethylsiloxysilicate, Nylon-611/Dimethicone Copolymer",
    howToUse: "Apply directly from the bullet or use a lip brush for precision. Start from the center and work outward."
  },
  {
    id: "3", name: "Silk Foundation SPF 30", brand: "Luscent Glow", price: 1899, originalPrice: 2499, discount: 24,
    rating: 4.6, reviewCount: 987, category: "makeup", tags: ["face", "foundation"],
    image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=500&h=500&fit=crop",
    shades: ["Ivory", "Sand", "Honey", "Caramel", "Mocha", "Espresso"],
    isBestSeller: true,
  },
  {
    id: "4", name: "Rose Gold Eyeshadow Palette", brand: "Luscent Glow", price: 2199, originalPrice: 2999, discount: 27,
    rating: 4.7, reviewCount: 1523, category: "makeup", tags: ["eyes", "palette"],
    image: "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=500&h=500&fit=crop",
    isTrending: true, isNew: true,
  },
  {
    id: "5", name: "Midnight Bloom Perfume", brand: "Luscent Glow", price: 3499, originalPrice: 4499, discount: 22,
    rating: 4.9, reviewCount: 743, category: "fragrances", tags: ["perfume", "floral"],
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500&h=500&fit=crop",
    sizes: ["30ml", "50ml", "100ml"], isNew: true,
  },
  {
    id: "6", name: "Keratin Repair Shampoo", brand: "Luscent Glow", price: 699, originalPrice: 899, discount: 22,
    rating: 4.3, reviewCount: 2104, category: "haircare", tags: ["shampoo", "repair"],
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&h=500&fit=crop",
    sizes: ["250ml", "500ml"],
  },
  {
    id: "7", name: "Vitamin C Day Cream", brand: "Luscent Glow", price: 1199, originalPrice: 1599, discount: 25,
    rating: 4.4, reviewCount: 1678, category: "skincare", tags: ["moisturizer", "vitamin-c"],
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500&h=500&fit=crop",
    isBestSeller: true,
  },
  {
    id: "8", name: "Gel Nail Polish Set", brand: "Luscent Glow", price: 799, originalPrice: 1099, discount: 27,
    rating: 4.2, reviewCount: 892, category: "nails", tags: ["gel", "nail-polish"],
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=500&fit=crop",
    shades: ["Cherry", "Blush", "Nude", "Plum", "Coral"],
  },
  {
    id: "9", name: "Body Butter — Vanilla Orchid", brand: "Luscent Glow", price: 599, originalPrice: 799, discount: 25,
    rating: 4.6, reviewCount: 1345, category: "bath-body", tags: ["body", "moisturizer"],
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&h=500&fit=crop",
    sizes: ["200ml", "400ml"], isTrending: true,
  },
  {
    id: "10", name: "Precision Brow Pencil", brand: "Luscent Glow", price: 499, originalPrice: 699, discount: 29,
    rating: 4.5, reviewCount: 2789, category: "makeup", tags: ["brows", "pencil"],
    image: "https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=500&h=500&fit=crop",
    shades: ["Blonde", "Brunette", "Dark Brown", "Black"], isBestSeller: true,
  },
  {
    id: "11", name: "Retinol Night Serum", brand: "Luscent Glow", price: 1799,
    rating: 4.7, reviewCount: 1102, category: "skincare", tags: ["serum", "anti-aging"],
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&h=500&fit=crop",
    sizes: ["30ml", "50ml"], isNew: true,
  },
  {
    id: "12", name: "Volumizing Mascara", brand: "Luscent Glow", price: 649, originalPrice: 849, discount: 24,
    rating: 4.4, reviewCount: 3201, category: "makeup", tags: ["eyes", "mascara"],
    image: "/assets/products/mascara-premium.png",
    isTrending: true, isBestSeller: true,
  },
];

// Public assets are now served from the /assets directory

export const heroSlides = [
  {
    image: "/assets/hero/hero-1.png",
    title: "Radiance Reimagined",
    subtitle: "Experience the pinnacle of luxury skincare with our gold-infused collection designed to illuminate your unique glow.",
    cta: "Discover the Collection",
    link: "/products"
  },
  {
    image: "/assets/hero/hero-2.png",
    title: "The Science of Glow",
    subtitle: "Bespoke beauty ritual curated for your skin's unique journey to perfection. Sophistication in every drop.",
    cta: "Explore Our Rituals",
    link: "/products"
  },
  {
    image: "/assets/hero/hero-3.png",
    title: "Timeless Elegance",
    subtitle: "Where science meets pure elegance. Discover our Silk Foundation range that feels like a second skin.",
    cta: "Shop The Look",
    link: "/products?category=makeup"
  },
];

export const instagramPosts = [
  { image: "/assets/instagram/post1.png", link: "https://www.instagram.com/hk_digiverse/", caption: "Celebrating our 3rd Grand Opening! Proud moment for the entire HK DigiVerse family. ✨ #HKDigiverse #Growth" },
  { image: "/assets/instagram/post2.png", link: "https://www.instagram.com/hk_digiverse/", caption: "Strategic collaboration with Surat Diamond Bourse (SDB) – empowering industries with transformative digital solutions. 💎 #TechInnovation" },
  { image: "/assets/instagram/post3.png", link: "https://www.instagram.com/hk_digiverse/", caption: "Innovative App Development: Creating seamless digital experiences for smart event management. 📱 #AppDev #HKDigiverse" },
  { image: "/assets/instagram/post4.png", link: "https://www.instagram.com/hk_digiverse/", caption: "Our luxury workspace – where innovation meets elegant design. Transforming businesses one line of code at a time. 💻 #WorkplaceDesign" },
  { image: "/assets/instagram/post5.png", link: "https://www.instagram.com/hk_digiverse/", caption: "Digital Transformation: Empowering your business to grow smarter and faster with cutting-edge tech. 🚀 #DigitalSuccess" },
  { image: "/assets/instagram/post6.png", link: "https://www.instagram.com/hk_digiverse/", caption: "Future of Retail: Immersive Jewelry Shopping experience with AR/VR integration. ✨ #TechLifestyle #Surat" },
];
