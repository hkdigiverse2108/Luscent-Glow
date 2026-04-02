import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, ChevronRight, Package, 
  Truck, CheckCircle2, Clock, 
  ExternalLink, Search, Archive,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedShade?: string;
  selectedSize?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Processing" | "Quality Check" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
}

const statusConfig = {
  "Processing": { icon: <Clock size={16} />, color: "text-blue-500", bg: "bg-blue-500/10", step: 1 },
  "Quality Check": { icon: <Archive size={16} />, color: "text-purple-500", bg: "bg-purple-500/10", step: 2 },
  "Shipped": { icon: <Truck size={16} />, color: "text-gold", bg: "bg-gold/10", step: 3 },
  "Delivered": { icon: <CheckCircle2 size={16} />, color: "text-green-500", bg: "bg-green-500/10", step: 4 },
  "Cancelled": { icon: <Package size={16} />, color: "text-rose-500", bg: "bg-rose-500/10", step: 0 },
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const guestId = localStorage.getItem("luscent-glow-guest-id");
      const identifier = user?.mobileNumber || guestId;
      
      if (!identifier) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(getApiUrl(`/orders/?userMobile=${encodeURIComponent(identifier)}`));
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Header />
      
      <main className="container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gold">
                <ShoppingBag size={16} />
                <span className="text-[10px] font-body font-bold uppercase tracking-[0.3em]">Ritual History</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-charcoal tracking-tight lowercase leading-[1.1]">
                your <span className="text-gradient-gold italic font-light">orders.</span>
              </h1>
            </div>

            <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-gold transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search order number or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gold/10 rounded-2xl py-4 pl-12 pr-4 font-body text-sm outline-none focus:border-gold/30 transition-all shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-secondary/40 animate-pulse rounded-[2.5rem]" />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-10">
              {filteredOrders.map((order, idx) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[2.5rem] border border-gold/10 shadow-ethereal overflow-hidden group"
                >
                  {/* Order Top Bar */}
                  <div className="p-8 lg:px-12 border-b border-gold/5 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest mb-1">Order Number</p>
                        <p className="font-display text-lg font-semibold text-charcoal">{order.orderNumber}</p>
                      </div>
                      <div className="hidden sm:block h-8 w-[1px] bg-gold/10" />
                      <div>
                        <p className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest mb-1">Ritual Date</p>
                        <p className="font-body text-sm text-charcoal">
                          {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig[order.status]?.bg || "bg-secondary"} ${statusConfig[order.status]?.color || "text-charcoal"}`}>
                      {statusConfig[order.status]?.icon}
                      <span className="text-[10px] font-body font-bold uppercase tracking-widest">{order.status}</span>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-8 lg:p-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <div className="space-y-6">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-6 group/item cursor-pointer">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover/item:scale-110 duration-500" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <h4 className="font-display text-lg font-semibold text-charcoal group-hover/item:text-gold transition-colors">{item.name}</h4>
                              <p className="text-xs font-body text-muted-foreground">
                                {item.quantity} x ₹{item.price.toLocaleString()}
                                {item.selectedShade && <span className="mx-2">•</span>}
                                {item.selectedShade}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-8">
                        {/* Fulfillment Tracker */}
                        <div className="relative pt-2">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-secondary" />
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(statusConfig[order.status]?.step / 4) * 100}%` }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gold"
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                          <div className="relative flex justify-between">
                            {[1, 2, 3, 4].map((step) => (
                              <div 
                                key={step} 
                                className={`w-3 h-3 rounded-full border-2 transition-colors duration-500 ${
                                  step <= statusConfig[order.status]?.step ? "bg-gold border-gold" : "bg-white border-secondary"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between mt-4 text-[8px] font-body font-bold text-muted-foreground uppercase tracking-widest">
                            <span>Processing</span>
                            <span>Shipped</span>
                            <span>Delivered</span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between pt-4 border-t border-gold/5">
                          <div>
                            <p className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest mb-1">Grand Total</p>
                            <p className="font-display text-2xl font-bold text-charcoal">₹{order.totalAmount.toLocaleString()}</p>
                          </div>
                          <button className="flex items-center gap-2 text-gold hover:text-charcoal transition-colors group/link">
                            <span className="text-[10px] font-body font-bold uppercase tracking-widest">Track Ritual</span>
                            <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 bg-white rounded-[3rem] border border-gold/10 shadow-ethereal"
            >
              <div className="w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center mx-auto mb-8 text-gold/20">
                <Archive size={48} />
              </div>
              <h2 className="font-display text-3xl font-bold text-charcoal mb-4 lowercase">your archive is <span className="italic font-light text-gold/60">untouched.</span></h2>
              <p className="text-muted-foreground font-body max-w-sm mx-auto mb-12 italic">
                Every ritual begins with a single selection. Discover your first curated treasure today.
              </p>
              <button onClick={() => window.location.href = "/products"} className="px-10 py-5 bg-charcoal text-white rounded-full text-[10px] font-body font-bold uppercase tracking-[0.25em] hover:bg-gold hover:text-charcoal transition-all shadow-xl">
                Begin Exploration
              </button>
            </motion.div>
          )}

          {/* Customer Support Integration */}
          <div className="mt-24 p-12 bg-charcoal rounded-[3rem] text-center space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10 space-y-6">
                <h3 className="font-display text-3xl text-white">Need guidance on your <span className="text-gold italic">shipment?</span></h3>
                <p className="text-white/60 font-body text-sm max-w-lg mx-auto">
                  Our concierge team is available 24/7 to provide real-time updates on your curated selections.
                </p>
                <div className="flex flex-wrap justify-center gap-6 pt-4">
                  <button className="px-8 py-4 bg-gold text-charcoal rounded-full text-[10px] font-body font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl">
                    Contact Concierge
                  </button>
                  <button className="px-8 py-4 border border-white/20 text-white rounded-full text-[10px] font-body font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                    Help Center
                  </button>
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Orders;
