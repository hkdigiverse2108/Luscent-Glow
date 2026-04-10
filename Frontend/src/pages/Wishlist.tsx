import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight, ChevronLeft, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const Wishlist = () => {
  const { wishlist, clearWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const moveAllToBag = () => {
    wishlist.forEach(product => {
      addItem({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: 1
      });
    });
    // Clear wishlist after moving
    clearWishlist(); 
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Header />
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
            <div className="space-y-2">
              <Link to="/products" className="inline-flex items-center gap-2 text-gold hover:gap-3 transition-all text-[10px] md:text-sm font-body font-bold uppercase tracking-widest mb-2 md:mb-4">
                <ChevronLeft size={16} /> Back to Collection
              </Link>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground tracking-tight leading-[1.1]">
                My <span className="italic font-normal">Wishlist</span>
              </h1>
            </div>
            {wishlist.length > 0 && (
              <div className="flex items-center gap-4 md:gap-6">
                <button 
                  onClick={moveAllToBag}
                  className="px-5 md:px-6 py-2.5 bg-gold text-primary-foreground text-[9px] md:text-[10px] font-body font-bold uppercase tracking-[0.2em] rounded-full hover:bg-gold/90 transition-all shadow-lg hover:shadow-gold/20 flex-1 sm:flex-none whitespace-nowrap"
                >
                  Move All to Bag
                </button>
                <button 
                  onClick={clearWishlist}
                  className="text-[9px] md:text-[10px] font-body font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors whitespace-nowrap"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {wishlist.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 lg:py-40 bg-white/50 border border-white rounded-[3rem] shadow-ethereal backdrop-blur-sm"
            >
              <div className="w-24 h-24 bg-rose/5 rounded-full flex items-center justify-center mx-auto mb-8 text-rose/40">
                <Heart size={40} strokeWidth={1} />
              </div>
              <h2 className="font-display text-3xl font-light mb-6 text-foreground">Your wishlist is empty</h2>
              <p className="text-muted-foreground font-body mb-10 max-w-md mx-auto leading-relaxed">
                Save the items you love and they'll wait here until you are ready to shop.
              </p>
              <Link 
                to="/products"
                className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-full font-body font-bold uppercase tracking-[0.15em] text-xs hover:bg-gold transition-all duration-500 shadow-xl hover:shadow-gold/20"
              >
                Explore Collection <ArrowRight size={18} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-12 lg:gap-x-10 lg:gap-y-16">
              <AnimatePresence mode="popLayout">
                {wishlist.map((product) => (
                  <motion.div
                    key={product._id || product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="group"
                  >
                    <div className="relative">
                      <ProductCard product={product} />
                      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                        <button 
                          onClick={() => toggleWishlist(product)}
                          className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-rose hover:bg-rose hover:text-white transition-all transform hover:scale-110"
                          title="Remove from Wishlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        addItem({
                          id: product._id || product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          category: product.category,
                          quantity: 1
                        });
                        toggleWishlist(product); // Move typically implies removing from wishlist
                      }}
                      className="w-full mt-4 py-3 bg-secondary text-foreground text-[10px] font-body font-bold uppercase tracking-widest rounded-xl hover:bg-gold hover:text-white transition-all border border-gold/10"
                    >
                      <ShoppingBag size={14} className="inline mr-2" /> Move to Bag
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          
          {wishlist.length > 0 && (
            <div className="mt-16 md:mt-24 p-8 md:p-12 bg-gold/5 rounded-[2.5rem] md:rounded-[3rem] border border-gold/10 text-center">
              <h3 className="font-display text-xl md:text-2xl font-light mb-4">Ready to checkout?</h3>
              <p className="text-muted-foreground font-body mb-8 max-w-sm mx-auto text-xs md:text-sm leading-relaxed italic">
                "Your saved items are waiting. Move them to your bag to complete your purchase."
              </p>
              <Link 
                to="/cart"
                className="inline-flex items-center gap-2 text-[10px] md:text-sm font-body font-bold uppercase tracking-widest text-gold hover:gap-3 transition-all"
              >
                Go to Shopping Bag <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Wishlist;
