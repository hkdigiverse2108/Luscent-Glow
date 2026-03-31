import { useState, useEffect } from "react";
import { Search, Heart, ShoppingBag, User, Menu, X, Gift, Package, Sparkles, LogOut } from "lucide-react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { categories, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);
  const { totalItems, clearCart } = useCart();
  const { wishlist, clearWishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, [location.pathname]); // Update on route change to catch login/logout

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    clearWishlist();
    clearCart(); // Clear local cart state on logout
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const response = await fetch(getApiUrl("/products/"));
        if (response.ok) {
          const data = await response.json();
          setFetchedProducts(data);
        }
      } catch (err) {
        console.error("Error fetching search data:", err);
      }
    };
    fetchSearchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = fetchedProducts.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const brandMatch = p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
        const categoryMatch = p.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const tagMatch = p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return nameMatch || brandMatch || categoryMatch || tagMatch;
      });
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, fetchedProducts]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    
    // If we are on the products page, update the URL instantly for real-time filtering
    if (location.pathname === "/products") {
      const newParams = new URLSearchParams(searchParams);
      if (val.trim()) {
        newParams.set("search", val.trim());
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams, { replace: true });
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim().length > 0) {
      if (location.pathname !== "/products") {
        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
        setSearchQuery("");
      } else {
        // Just close the search bar if we're already on products page and searching
        setSearchOpen(false);
      }
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs py-2 text-center tracking-widest uppercase font-body">
        Free Shipping on Orders Above ₹999 &nbsp;|&nbsp; Use Code <span className="text-gold font-semibold">GLOW15</span> for 15% Off
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background"
        }`}
      >
        {/* Main header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <h1 className="font-display text-2xl lg:text-3xl font-semibold tracking-wide text-foreground">
                Luscent <span className="text-gold">Glow</span>
              </h1>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  className="text-sm font-body font-medium text-foreground/80 hover:text-gold transition-colors tracking-wide uppercase"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                to="/offers"
                className="text-sm font-body font-medium text-foreground/80 hover:text-gold transition-colors tracking-wide uppercase relative group"
              >
                Offers
                <span className="absolute -top-3 -right-3 px-1 py-0.5 bg-rose-brand text-[8px] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">NEW</span>
              </Link>
              <Link
                to="/quiz"
                className="text-sm font-body font-bold text-gold hover:text-gold/80 transition-all tracking-wide uppercase px-4 py-2 bg-gold/5 rounded-full border border-gold/20"
              >
                Find Your Glow
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 lg:gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-foreground/70 hover:text-gold transition-colors"
              >
                <Search size={20} />
              </button>
              <Link to="/gift-cards" className="hidden lg:flex p-2 text-foreground/70 hover:text-gold transition-colors">
                <Gift size={20} />
              </Link>
              <Link to="/bulk-orders" className="hidden lg:flex p-2 text-foreground/70 hover:text-gold transition-colors">
                <Package size={20} />
              </Link>
              
              {user ? (
                <div className="flex items-center gap-2 group">
                  <div className="hidden lg:flex flex-col items-end mr-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Welcome</span>
                    <span className="text-xs text-primary font-bold line-clamp-1">{user.fullName.split(' ')[0]}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-foreground/70 hover:text-rose-brand transition-colors relative group"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="p-2 text-foreground/70 hover:text-gold transition-colors" title="Login / Register">
                  <User size={20} />
                </Link>
              )}

              <Link to="/wishlist" className="p-2 text-foreground/70 hover:text-gold transition-colors relative">
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="p-2 text-foreground/70 hover:text-gold transition-colors relative">
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border relative z-[70] overflow-visible"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="relative max-w-2xl mx-auto">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchKeyPress}
                    placeholder="Search for products, brands, categories..."
                    className="w-full pl-12 pr-4 py-3 bg-secondary rounded-full text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted-foreground"
                    autoFocus
                  />
                  
                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {searchQuery.trim().length > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl z-[80] shadow-2xl border border-border"
                      >
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                          <p className="text-[10px] font-body font-bold text-primary uppercase tracking-[0.2em] mb-4 px-2">
                            {searchResults.length > 0 ? "Top Results" : "No results found"}
                          </p>
                          <div className="space-y-2">
                            {searchResults.map((product) => (
                              <Link
                                key={product._id || product.id || Math.random().toString()}
                                to={`/product/${product._id || product.id}`}
                                onClick={() => {
                                  setSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-4 p-2 hover:bg-gold/5 rounded-2xl transition-colors group"
                              >
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                                  <img 
                                    src={product.image || "/placeholder-product.jpg"} 
                                    alt={product.name || "Product"} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-body font-bold text-primary group-hover:text-gold transition-colors line-clamp-1">
                                    {product.name || "Unnamed Treasure"}
                                  </h4>
                                  <p className="text-[10px] text-muted-foreground uppercase">{product.category || "Collection"}</p>
                                </div>
                                <p className="text-sm font-body font-bold text-primary">
                                  {product.price ? `₹${product.price.toLocaleString()}` : "Price TBD"}
                                </p>
                              </Link>
                            ))}
                          </div>
                          {searchResults.length > 0 && (
                            <Link
                              to={`/products?search=${encodeURIComponent(searchQuery)}`}
                              onClick={() => setSearchOpen(false)}
                              className="block text-center pt-4 mt-4 border-t border-gold/10 text-[10px] font-body font-bold text-gold uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
                            >
                              View All Collection
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category bar — visible on scroll */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="hidden lg:block border-t border-border overflow-hidden"
            >
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-center gap-8 py-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/products?category=${cat.slug}`}
                      className="text-xs font-body font-medium text-muted-foreground hover:text-gold transition-colors tracking-wider uppercase"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <Link
                    to="/products"
                    className="text-xs font-body font-medium text-muted-foreground hover:text-gold transition-colors tracking-wider uppercase"
                  >
                    All Products
                  </Link>
                  <Link
                    to="/quiz"
                    className="text-[10px] font-body font-bold text-gold hover:text-gold/80 transition-all tracking-widest uppercase ml-4"
                  >
                    Radiance Quiz
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display text-xl font-semibold">
                Luscent <span className="text-gold">Glow</span>
              </h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <X size={22} />
              </button>
            </div>
            <nav className="p-6 space-y-6">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-lg font-body font-medium text-foreground/80 hover:text-gold transition-colors tracking-wide"
                >
                  {cat.name}
                </Link>
              ))}
              <div className="border-t border-border pt-6 space-y-4">
                <Link 
                  to="/about" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block text-lg font-body font-medium text-foreground/80 hover:text-gold transition-colors tracking-wide"
                >
                  About Us
                </Link>
                <Link 
                  to="/quiz" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="flex items-center gap-3 text-gold font-bold"
                >
                  <Sparkles size={18} /> Radiance Quiz
                </Link>
                <Link to="/gift-cards" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-foreground/70">
                  <Gift size={18} /> Gift Cards
                </Link>
                <Link to="/bulk-orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-foreground/70">
                  <Package size={18} /> Bulk Orders for Corporate
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
