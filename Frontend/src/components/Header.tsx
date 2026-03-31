import { useState, useEffect } from "react";
import { Search, Heart, ShoppingBag, User, Menu, X, Gift, Package, Sparkles, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { categories, Product, products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext.tsx";
import LogoutConfirmation from "./auth/LogoutConfirmation.tsx";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Removed local user handling as it's now in AuthContext

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const response = await fetch(getApiUrl("/products/"));
        if (response.ok) {
          const data = await response.json();
          setFetchedProducts(data.length > 0 ? data : products);
        } else {
          setFetchedProducts(products);
        }
      } catch (err) {
        console.error("Error fetching search data, using local fallback:", err);
        setFetchedProducts(products);
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
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background"
        }`}
      >
        {/* Top bar */}
        <div className="bg-primary text-primary-foreground text-[10px] lg:text-xs py-2 text-center tracking-widest uppercase font-body relative group/banner">
          Free Shipping on Orders Above ₹999 &nbsp;|&nbsp; Use Code <span className="text-gold font-semibold">GLOW15</span> for 15% Off
          &nbsp;&nbsp; | &nbsp;&nbsp;
          <Link to="/quiz" className="text-gold font-bold hover:text-white transition-colors">Find Your Glow</Link>
        </div>
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

            {/* Logo and Shop by Category */}
            <div className="flex items-center gap-14">
              <Link to="/" className="flex items-center gap-2">
                <h1 className="font-display text-2xl lg:text-3xl font-semibold tracking-wide text-foreground">
                  Luscent <span className="text-gold">Glow</span>
                </h1>
              </Link>

              {/* Shop by Category Hover Dropdown */}
              <div className="hidden lg:block relative group py-2">
                <button className="flex items-center gap-3 text-[13px] font-body font-bold text-charcoal/90 hover:text-gold uppercase tracking-[0.25em] transition-all duration-500 py-2 group-hover:text-gold">
                  Categories                 
                </button>
                
                <div className="absolute top-full -left-4 w-64 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 z-[100]">
                  <div className="bg-white border border-border/80 shadow-2xl rounded-2xl overflow-hidden py-3">
                    <div className="space-y-0.5">
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/products?category=${cat.slug}`}
                          className="block px-6 py-3 text-[11px] font-body font-bold text-charcoal/80 uppercase tracking-widest hover:text-gold hover:bg-gold/5 transition-all duration-300"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-border/60 mt-3 pt-2">
                      <Link
                        to="/products"
                        className="block text-center px-6 py-3 text-[10px] font-body font-black text-gold hover:opacity-80 transition-all duration-300 uppercase tracking-[0.3em]"
                      >
                        Explore All
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                <div className="relative group p-2">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="hidden lg:flex flex-col items-end mr-1">
                      <span className="text-xs text-primary font-bold line-clamp-1">{user.fullName.split(' ')[0]}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-charcoal transition-all duration-500 shadow-sm overflow-hidden">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display font-medium text-sm">{user.fullName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>

                  {/* Hover Dropdown */}
                  <div className="absolute top-[calc(100%-5px)] right-0 w-64 pt-6 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 z-50">
                    <div className="bg-white border border-gold/10 rounded-[2rem] shadow-ethereal overflow-hidden">
                      <div className="px-6 py-6 border-b border-gold/10 bg-gold/5">
                        <h4 className="text-sm font-display font-bold text-charcoal truncate">{user.fullName}</h4>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest hover:text-gold hover:bg-gold/5 rounded-2xl transition-all">
                          <User size={14} /> Profile
                        </Link>
                        <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest hover:text-gold hover:bg-gold/5 rounded-2xl transition-all">
                          <Package size={14} /> Orders
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest hover:text-gold hover:bg-gold/5 rounded-2xl transition-all">
                          <Heart size={14} /> Wishlist
                        </Link>
                        <button 
                          onClick={() => setIsLogoutDialogOpen(true)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-body font-bold text-rose-brand uppercase tracking-widest hover:bg-rose-brand/5 rounded-2xl transition-all text-left"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </div>
                  </div>
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

        {/* Category bar — visible only at top, hidden on scroll */}
        <AnimatePresence>
          {!scrolled && (
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
                    to="/offers"
                    className="text-sm font-body font-bold text-gold hover:text-gold/80 transition-all tracking-wide uppercase px-4 py-2 bg-gold/5 rounded-full border border-gold/20"
                  >
                    Offers
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation 
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={() => {
          logout();
          setIsLogoutDialogOpen(false);
          navigate("/");
        }}
      />

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
                  to="/contact" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block text-lg font-body font-medium text-foreground/80 hover:text-gold transition-colors tracking-wide"
                >
                  Contact Us
                </Link>
                <Link 
                  to="/faq" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block text-lg font-body font-medium text-foreground/80 hover:text-gold transition-colors tracking-wide"
                >
                  FAQ's
                </Link>
                <Link 
                  to="/track-order" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block text-lg font-body font-medium text-foreground/80 hover:text-gold transition-colors tracking-wide"
                >
                  Track Order
                </Link>
                <Link 
                  to="/blogs" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block text-lg font-body font-medium text-foreground/80 hover:text-gold transition-colors tracking-wide"
                >
                  Journal
                </Link>
                <Link 
                  to="/quiz" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="flex items-center gap-3 text-gold font-bold py-2"
                >
                  <Sparkles size={18} /> Radiance Quiz
                </Link>
                <div className="pt-4 space-y-4">
                  <Link to="/gift-cards" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-foreground/70 text-sm">
                    <Gift size={18} /> Gift Cards
                  </Link>
                  <Link to="/bulk-orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-foreground/70 text-sm">
                    <Package size={18} /> Bulk Orders for Corporate
                  </Link>
                </div>
                
                <div className="pt-6 border-t border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Policies</p>
                  <div className="grid grid-cols-1 gap-3">
                    <Link to="/privacy-policy" onClick={() => setMobileMenuOpen(false)} className="text-xs text-muted-foreground hover:text-gold">Privacy Policy</Link>
                    <Link to="/terms-and-conditions" onClick={() => setMobileMenuOpen(false)} className="text-xs text-muted-foreground hover:text-gold">Terms & Conditions</Link>
                    <Link to="/return-policy" onClick={() => setMobileMenuOpen(false)} className="text-xs text-muted-foreground hover:text-gold">Return & Refund</Link>
                  </div>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
