import { useState, useEffect } from "react";
import { Search, Heart, ShoppingBag, User, Menu, X, Gift, Package, Sparkles, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { categories, Product, products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext.tsx";
import LogoutConfirmation from "./auth/LogoutConfirmation.tsx";
import AdminCategoryModal from "./Header/AdminCategoryModal.tsx";
import AdminBrandingModal from "./Header/AdminBrandingModal.tsx";
import { Edit2, Plus, Settings } from "lucide-react";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { totalItems, productCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Dynamic Content State
  const [dynamicCategories, setDynamicCategories] = useState<any[]>(categories);
  const [branding, setBranding] = useState<any>({
    logoText: "Luscent Glow",
    logoImage: null,
    useImage: false
  });
  const [globalSettings, setGlobalSettings] = useState<any>({
    whatsappNumber: "919537150942",
    storeName: "Luscent Glow",
    supportEmail: "hello@luscentglow.com",
    supportPhone: "+91 97126 63607",
    announcementText: "FREE SHIPPING ABOVE ₹999 | USE CODE GLOW15",
    copyrightText: "© 2026 Luscent Glow. All rights reserved."
  });

  // Admin UI State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const response = await fetch(getApiUrl("/api/products/"));
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

    const fetchHeaderData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch(getApiUrl("/api/categories/?hide_empty=true")),
          fetch(getApiUrl("/api/branding/"))
        ]);

        if (catRes.ok) {
          const cats = await catRes.json();
          if (cats.length > 0) setDynamicCategories(cats);
        }
        if (brandRes.ok) {
          const brand = await brandRes.json();
          setBranding(brand);
        }
        
        const globalRes = await fetch(getApiUrl("/api/settings/global/"));
        if (globalRes.ok) {
          const global = await globalRes.json();
          setGlobalSettings((prev: any) => ({ ...prev, ...global }));
        }
      } catch (err) {
        console.error("Error fetching header data:", err);
      }
    };

    fetchSearchData();
    fetchHeaderData();
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
        {/* Top bar - Scrolling Marquee */}
        <div className="bg-primary text-primary-foreground text-[8px] md:text-[10px] lg:text-xs py-2 px-2 md:px-4 tracking-[0.3em] uppercase font-body relative group/banner overflow-hidden whitespace-nowrap">
          <div className="animate-marquee flex items-center">
            {/* Main Content Set */}
            <div className="flex items-center gap-6 md:gap-12 px-6 md:px-12 font-bold whitespace-nowrap">
              <span>{globalSettings.announcementText || "Welcome to Luscent Glow Store"}</span>
            </div>
            {/* Duplicate for Seamless Loop */}
            <div className="flex items-center gap-6 md:gap-12 px-6 md:px-12 font-bold whitespace-nowrap">
              <span>{globalSettings.announcementText || "Welcome to Luscent Glow Store"}</span>
            </div>
            {/* Triplicate to ensure full screen coverage on ultra-wide */}
            <div className="flex items-center gap-6 md:gap-12 px-6 md:px-12 font-bold whitespace-nowrap">
              <span>{globalSettings.announcementText || "Welcome to Luscent Glow Store"}</span>
            </div>
          </div>
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
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-14">
              <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center transform active:scale-95 transition-transform group">
                  {branding.useImage && branding.logoImage ? (
                    <img 
                      src={getAssetUrl(branding.logoImage)} 
                      alt={branding.logoText} 
                      className="h-8 md:h-10 lg:h-12 w-auto object-contain"
                    />
                  ) : (
                    <h1 className="font-display text-[15px] xs:text-lg md:text-2xl lg:text-3xl font-semibold tracking-wide text-foreground whitespace-nowrap">
                      {branding.logoText.split(' ')[0]} <span className="text-gold">{branding.logoText.split(' ').slice(1).join(' ')}</span>
                    </h1>
                  )}
                </Link>
                
                {user?.isAdmin && (
                  <button 
                    onClick={() => setIsBrandingModalOpen(true)}
                    className="p-1.5 rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-white transition-all duration-500 shadow-sm"
                    title="Edit Brand Identity"
                  >
                    <Settings size={12} />
                  </button>
                )}
              </div>

              {/* Shop by Category Hover Dropdown — Hidden until scrolled (Header-2) */}
              <AnimatePresence>
                {scrolled && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="hidden lg:block relative group py-2"
                  >
                    <button className="flex items-center gap-3 text-[13px] font-body font-bold text-charcoal/90 hover:text-gold uppercase tracking-[0.25em] transition-all duration-500 py-2 group-hover:text-gold">
                      Categories                 
                    </button>
                    
                    <div className="absolute top-full -left-4 w-66 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 z-[100]">
                      <div className="bg-white border border-gold/10 shadow-ethereal rounded-2xl overflow-hidden py-2">
                        <div className="space-y-0.5">
                          {dynamicCategories.map((cat) => (
                            <div key={cat.slug} className="group/item relative flex items-center">
                              <Link
                                to={`/products?category=${cat.slug}`}
                                className="flex-1 block px-6 py-2 text-[11px] font-body font-bold text-charcoal/80 uppercase tracking-widest hover:text-gold hover:bg-gold/5 transition-all duration-300"
                              >
                                {cat.name}
                              </Link>
                              {user?.isAdmin && (
                                <button 
                                  onClick={() => { setSelectedCategory(cat); setIsCategoryModalOpen(true); }}
                                  className="absolute right-4 p-1.5 opacity-0 group-hover/item:opacity-100 hover:text-gold transition-all"
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {user?.isAdmin && (
                          <div className="border-t border-gold/10 mt-2 pt-2 px-6">
                            <button 
                              onClick={() => { setSelectedCategory(null); setIsCategoryModalOpen(true); }}
                              className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gold/30 text-[9px] font-bold text-gold uppercase tracking-[0.2em] rounded-xl hover:bg-gold/5 transition-all"
                            >
                              <Plus size={12} /> Add Category
                            </button>
                          </div>
                        )}
                        <div className="border-t border-border/60 mt-2 pt-1.5">
                          <Link
                            to="/products"
                            className="block text-center px-6 py-2.5 text-[10px] font-body font-black text-gold hover:opacity-80 transition-all duration-300 uppercase tracking-[0.3em]"
                          >
                            Explore All
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-0">
              <div className="relative group flex flex-col items-center">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-foreground/70 hover:text-gold transition-colors"
                >
                  <Search size={20} />
                </button>
                <span className="absolute top-full mt-[-2px] opacity-0 group-hover:opacity-100 transition-all duration-300 text-[8px] font-black uppercase tracking-[0.1em] text-gold pointer-events-none">Search</span>
              </div>

              <div className="relative group flex flex-col items-center hidden sm:flex">
                <Link to="/gift-cards" className="p-2 text-foreground/70 hover:text-gold transition-colors">
                  <Gift size={20} />
                </Link>
                <span className="absolute top-full mt-[-2px] opacity-0 group-hover:opacity-100 transition-all duration-300 text-[8px] font-black uppercase tracking-[0.1em] text-gold pointer-events-none">Gifts</span>
              </div>

              <div className="relative group flex flex-col items-center hidden md:flex">
                <Link to="/bulk-orders" className="p-2 text-foreground/70 hover:text-gold transition-colors">
                  <Package size={20} />
                </Link>
                <span className="absolute top-full mt-[-2px] opacity-0 group-hover:opacity-100 transition-all duration-300 text-[8px] font-black uppercase tracking-[0.1em] text-gold pointer-events-none">Bulk</span>
              </div>
              
              <div className="relative group flex flex-col items-center">
                {user ? (
                  <div className="relative p-2">
                    <div className="flex items-center gap-3 cursor-pointer">
                      <div className="hidden lg:flex flex-col items-end mr-1">
                        <span className="text-xs text-primary font-bold line-clamp-1">{user.fullName.split(' ')[0]}</span>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-charcoal transition-all duration-500 shadow-sm overflow-hidden">
                        {user.profilePicture ? (
                          <img src={getAssetUrl(user.profilePicture)} alt={user.fullName} className="w-full h-full object-cover" />
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
                  <Link to="/login" className="p-2 text-foreground/70 hover:text-gold transition-colors">
                    <User size={20} />
                  </Link>
                )}
                <span className="absolute top-full mt-[-2px] opacity-0 group-hover:opacity-100 transition-all duration-300 text-[8px] font-black uppercase tracking-[0.1em] text-gold pointer-events-none">Account</span>
              </div>

              <div className="relative group flex flex-col items-center">
                <Link to="/wishlist" className="p-1.5 md:p-2 text-foreground/70 hover:text-gold transition-colors relative">
                  <Heart size={20} />
                  {wishlist.length > 0 && (
                    <span className="absolute top-0 right-0 md:-top-0.5 md:-right-0.5 w-3.5 h-3.5 md:w-4 md:h-4 bg-gold text-primary-foreground text-[8px] md:text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <span className="absolute top-full mt-[-2px] opacity-0 group-hover:opacity-100 transition-all duration-300 text-[8px] font-black uppercase tracking-[0.1em] text-gold pointer-events-none">Wishlist</span>
              </div>
              
              <div className="relative group flex flex-col items-center">
                <Link to="/cart" id="cart-icon-ref" className="p-1.5 xs:p-2 text-foreground/70 hover:text-gold transition-colors relative">
                  <ShoppingBag size={20} className="w-5 h-5" />
                  {productCount > 0 && (
                    <span className="absolute top-0 right-0 md:-top-0.5 md:-right-0.5 w-3.5 h-3.5 md:w-4 md:h-4 bg-gold text-primary-foreground text-[8px] md:text-[10px] font-bold rounded-full flex items-center justify-center">
                      {productCount}
                    </span>
                  )}
                </Link>
                <span className="absolute top-full mt-[-2px] opacity-0 group-hover:opacity-100 transition-all duration-300 text-[8px] font-black uppercase tracking-[0.1em] text-gold pointer-events-none">Bag</span>
              </div>
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
                    placeholder="Search products..."
                    className="w-full pl-11 pr-4 py-3.5 bg-secondary rounded-2xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted-foreground transition-all"
                    autoFocus
                  />
                  
                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {searchQuery.trim().length > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl z-[80] shadow-2xl border border-border/50 max-h-[80vh] overflow-hidden flex flex-col"
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
                                    src={getAssetUrl(product.image) || "/placeholder-product.jpg"} 
                                    alt={product.name || "Product"} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-body font-bold text-primary group-hover:text-gold transition-colors line-clamp-1">
                                    {product.name || "Unnamed Product"}
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
                              View All Products
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
                  {dynamicCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/products?category=${cat.slug}`}
                      className="text-xs font-body font-medium text-muted-foreground hover:text-gold transition-colors tracking-wider uppercase flex items-center gap-2"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {user?.isAdmin && (
                     <button 
                       onClick={() => { setSelectedCategory(null); setIsCategoryModalOpen(true); }}
                       className="p-1 rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-white transition-all shadow-sm"
                     >
                       <Plus size={12} />
                     </button>
                  )}
                  <Link
                    to="/quiz"
                    className="flex items-center gap-2 text-xs font-body font-black text-white px-5 py-2 bg-charcoal rounded-full border border-charcoal hover:bg-gold hover:border-gold transition-all tracking-widest uppercase shadow-lg shadow-charcoal/10"
                  >
                    <Sparkles size={12} className="text-gold" />
                    Find Your Glow
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

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm z-[60] bg-background lg:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-gold/10">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <h2 className="font-display text-xl font-semibold">
                    Luscent <span className="text-gold">Glow</span>
                  </h2>
                </Link>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground/70 active:scale-90 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {/* User section in mobile menu */}
                <div className="mb-10">
                  {user ? (
                    <div className="flex items-center gap-4 p-4 bg-gold/5 rounded-[1.5rem] border border-gold/10 overflow-hidden">
                      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-sm overflow-hidden flex-shrink-0 animate-in fade-in zoom-in duration-500">
                        {user.profilePicture ? (
                          <img src={getAssetUrl(user.profilePicture)} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display font-medium text-lg">{user.fullName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-display font-bold text-foreground truncate">{user.fullName}</p>
                        <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">{user.email}</p>
                        <div className="flex gap-4 mt-2">
                          <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-[10px] font-black text-gold uppercase tracking-widest hover:opacity-70 transition-opacity">My Account</Link>
                          <button onClick={() => { setMobileMenuOpen(false); setIsLogoutDialogOpen(true); }} className="text-[10px] font-black text-rose-brand uppercase tracking-widest hover:opacity-70 transition-opacity">Logout</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-5 bg-charcoal text-white rounded-[1.5rem] shadow-xl shadow-charcoal/10 group overflow-hidden relative"
                    >
                      <div className="relative z-10">
                        <p className="text-[10px] font-body font-bold uppercase tracking-[0.25em] mb-1 opacity-70">Welcome to Luscent</p>
                        <p className="text-lg font-display font-bold">Sign In / Register</p>
                      </div>
                      <User size={24} className="opacity-10 absolute -right-2 -bottom-2 w-16 h-16 transform group-hover:scale-110 transition-transform duration-700" />
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative z-10 group-hover:bg-gold transition-colors duration-500">
                        <User size={18} />
                      </div>
                    </Link>
                  )}
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-5">Shop By Category</p>
                    <div className="grid grid-cols-1 gap-1">
                      {dynamicCategories.map((cat) => (
                        <div key={cat.slug} className="flex items-center gap-3">
                          <Link
                            to={`/products?category=${cat.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1 flex items-center justify-between py-2.5 px-4 text-base font-body font-medium text-foreground hover:bg-gold/5 rounded-2xl transition-all border-b border-border/30 last:border-0 active:bg-gold/10"
                          >
                            {cat.name}
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                              <ChevronDown size={14} className="-rotate-90 text-muted-foreground" />
                            </div>
                          </Link>
                          {user?.isAdmin && (
                            <button 
                              onClick={() => { setMobileMenuOpen(false); setSelectedCategory(cat); setIsCategoryModalOpen(true); }}
                              className="p-4 text-gold"
                            >
                              <Edit2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                      <Link
                        to="/products"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2.5 px-4 text-base font-body font-bold text-gold hover:bg-gold/5 rounded-2xl transition-all active:bg-gold/10"
                      >
                        Explore All Products
                      </Link>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-5">More</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/gift-cards" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-2xl border border-border/50">
                        <Gift size={16} className="text-gold" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Gifts</span>
                      </Link>
                      <Link to="/bulk-orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-2xl border border-border/50">
                        <Package size={16} className="text-gold" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Bulk</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-border bg-secondary/20">
                 <div className="flex gap-4 mb-4">
                    <Link to="/policy/privacy-policy" onClick={() => setMobileMenuOpen(false)} className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Privacy</Link>
                    <Link to="/policy/terms-and-conditions" onClick={() => setMobileMenuOpen(false)} className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Terms</Link>
                 </div>
                 <p className="text-[10px] text-muted-foreground italic">{globalSettings.copyrightText}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin CRDU Modals */}
      <AdminCategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
        onSuccess={() => {
          // Trigger re-fetch or manual update
          const fetchHeaderData = async () => {
            try {
              const [catRes, brandRes] = await Promise.all([
                fetch(getApiUrl("/api/categories/?hide_empty=true")),
                fetch(getApiUrl("/api/branding/"))
              ]);
      
              if (catRes.ok) {
                const cats = await catRes.json();
                if (cats.length > 0) setDynamicCategories(cats);
              }
              if (brandRes.ok) {
                const brand = await brandRes.json();
                setBranding(brand);
              }
            } catch (err) {
              console.error("Error fetching header data:", err);
            }
          };
          fetchHeaderData();
        }}
      />

      <AdminBrandingModal 
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        branding={branding}
        onSuccess={() => {
           const fetchBranding = async () => {
             const res = await fetch(getApiUrl("/api/branding/"));
             if (res.ok) {
               const data = await res.json();
               setBranding(data);
             }
           };
           fetchBranding();
        }}
      />
    </>
  );
};

export default Header;
