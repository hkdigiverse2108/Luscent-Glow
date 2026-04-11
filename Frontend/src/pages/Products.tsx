import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { categories, Product, products } from "@/data/products";
import SEO from "@/components/SEO";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiUrl } from "@/lib/api";

const priceRanges = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1000", min: 500, max: 1000 },
  { label: "₹1000 – ₹2000", min: 1000, max: 2000 },
  { label: "Above ₹2000", min: 2000, max: Infinity },
];

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
  { label: "Newest", value: "newest" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>(categories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state with URL search params (Fix for second category navigation)
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch(getApiUrl("/api/products/")),
          fetch(getApiUrl("/api/categories/"))
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setFetchedProducts(data.length > 0 ? data : products);
        } else {
          setFetchedProducts(products);
        }

        if (catRes.ok) {
          const cats = await catRes.json();
          if (cats.length > 0) setDynamicCategories(cats);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching project data:", err);
        setFetchedProducts(products);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  let filtered = fetchedProducts;

  if (selectedCategory) {
    filtered = filtered.filter((p) => p.category === selectedCategory);
  }

  if (searchParam) {
    const query = searchParam.toLowerCase();
    filtered = filtered.filter((p) => 
      p.name?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }
  if (selectedPriceRange !== null) {
    const range = priceRanges[selectedPriceRange];
    filtered = filtered.filter((p) => p.price >= range.min && p.price < range.max);
  }

  if (sortBy === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  if (sortBy === "newest") filtered = [...filtered].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedPriceRange(null);
    if (searchParam) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("search");
      setSearchParams(newParams);
    }
  };

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4 text-foreground">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("category");
              setSearchParams(newParams);
            }}
            className={`block w-full text-left text-sm font-body py-1.5 px-3 rounded-md transition-colors ${
              !selectedCategory ? "bg-gold/10 text-gold font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Products
          </button>
          {dynamicCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSearchParams({ category: cat.slug })}
              className={`block w-full text-left text-sm font-body py-1.5 px-3 rounded-md transition-colors ${
                selectedCategory === cat.slug ? "bg-gold/10 text-gold font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4 text-foreground">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map((range, i) => (
            <button
              key={i}
              onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
              className={`block w-full text-left text-sm font-body py-1.5 px-3 rounded-md transition-colors ${
                selectedPriceRange === i ? "bg-gold/10 text-gold font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {(selectedCategory || selectedPriceRange !== null) && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 text-sm font-body text-destructive hover:underline"
        >
          <X size={14} /> Clear All Filters
        </button>
      )}
    </div>
  );

  const currentCategory = selectedCategory ? dynamicCategories.find(c => c.slug === selectedCategory) : null;
  const pageSEO = currentCategory?.seo || {
    title: selectedCategory ? `${currentCategory?.name || "Category"} | Luscent Glow` : "All Products | Luscent Glow",
    description: selectedCategory ? `Explore our premium ${currentCategory?.name || "Category"} collection.` : "Discover our full range of botanical skincare rituals."
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO seo={pageSEO} />
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
        {/* Breadcrumb */}
        <p className="text-[10px] md:text-xs font-body font-bold text-muted-foreground mb-4 md:md-6 tracking-widest opacity-70">
          Home / {selectedCategory ? dynamicCategories.find((c) => c.slug === selectedCategory)?.name : "All Products"}
          {searchParam && <span className="text-gold font-medium"> / Searching for "{searchParam}"</span>}
        </p>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                Showing <span className="text-foreground font-semibold">{filtered.length}</span> products
              <div className="flex items-center justify-between sm:justify-end gap-3 order-1 sm:order-2">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-secondary text-primary rounded-full text-xs font-body font-bold uppercase tracking-widest border border-border/50 hover:bg-gold hover:text-white transition-all"
                >
                  <SlidersHorizontal size={14} /> Filter
                </button>
                <div className="relative min-w-[160px]">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-gold/20 rounded-full h-11 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal shadow-sm hover:border-gold/40 transition-all focus:ring-gold/10">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-gold/10 rounded-[1.5rem] shadow-ethereal overflow-hidden">
                      {sortOptions.map((opt) => (
                        <SelectItem 
                          key={opt.value} 
                          value={opt.value}
                          className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70 focus:bg-gold/5 focus:text-gold py-3 px-6 cursor-pointer"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-secondary animate-pulse rounded-[2rem]" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-rose/5 rounded-[3rem] border border-rose/10">
                <p className="font-display text-xl text-rose/70 mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="text-sm font-body font-bold text-rose uppercase tracking-widest hover:opacity-80 transition-opacity">
                  Refresh Page
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product._id || product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="font-display text-2xl text-muted-foreground">No products found</p>
                <button onClick={clearFilters} className="mt-4 text-sm font-body text-gold hover:underline">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-primary/40 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-background z-50 p-6 overflow-y-auto lg:hidden shadow-2xl border-r border-gold/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-xl font-semibold">Filters</h2>
                <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
              </div>
              <FilterSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
