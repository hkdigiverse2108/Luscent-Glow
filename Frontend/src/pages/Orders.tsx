import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Search, Star, 
  MapPin, Package, Truck, 
  CheckCircle2, Clock, Archive, XCircle,
  Info, Navigation, Sparkles,
  SearchIcon, Calendar, Filter, ExternalLink
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useNavigate } from "react-router-dom";
import ReviewModal from "@/components/ReviewModal";
import OrderDetailsModal from "@/components/OrderDetailsModal";

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
  id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Processing" | "Quality Check" | "Shipped" | "Delivered" | "Cancelled" | "Pending Payment";
  createdAt: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

const statusConfig = {
  "Processing": { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-muted-foreground/10" },
  "Quality Check": { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  "Shipped": { color: "text-gold", bg: "bg-gold/5", border: "border-gold/20" },
  "Delivered": { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  "Cancelled": { color: "text-destructive", bg: "bg-destructive/5", border: "border-destructive/10" },
  "Pending Payment": { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
};

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{id: string, name: string, image: string} | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | undefined>(undefined);
  const [existingReview, setExistingReview] = useState<any | null>(null);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  const fetchData = async () => {
    try {
      const guestId = localStorage.getItem("luscent-glow-guest-id");
      const identifier = user?.mobileNumber || guestId;
      
      if (!identifier) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch Orders
      const orderRes = await fetch(getApiUrl(`/api/orders/?userMobile=${identifier}`));
      if (orderRes.ok) {
        const data = await orderRes.json();
        setOrders(Array.isArray(data) ? data : []);
      }

      // Fetch User Reviews
      if (user?.mobileNumber) {
        const reviewRes = await fetch(getApiUrl(`/api/reviews/user/${user.mobileNumber}`));
        if (reviewRes.ok) {
          const reviews = await reviewRes.json();
          setUserReviews(Array.isArray(reviews) ? reviews : []);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenReview = (item: OrderItem, orderNumber: string) => {
    const review = getReviewForItem(item.productId, orderNumber);
    setSelectedProductForReview({
      id: item.productId,
      name: item.name,
      image: item.image
    });
    setSelectedOrderNumber(orderNumber);
    setExistingReview(review);
    setIsReviewModalOpen(true);
  };

  const getReviewForItem = (productId: string, orderNumber: string, productName?: string) => {
    const strProductId = productId.toString();
    const cleanItemName = productName?.toLowerCase().trim();
    
    // 1. Try perfect match (Product + this specific Order)
    const exactMatch = userReviews.find(r => 
      (r.productId === strProductId || r.productId?.toString() === strProductId) && 
      (r.orderNumber === orderNumber)
    );
    if (exactMatch) return exactMatch;

    // 2. Try ID match regardless of Order (Product-Centric)
    const idMatch = userReviews.find(r => 
      (r.productId === strProductId || r.productId?.toString() === strProductId)
    );
    if (idMatch) return idMatch;

    // 3. ULTIMATE FALLBACK: Name-Based matching (Handling Legacy/Technical ID mismatches)
    if (cleanItemName) {
      return userReviews.find(r => 
        r.productName?.toLowerCase().trim() === cleanItemName ||
        r.productId?.toString().toLowerCase().trim() === cleanItemName
      );
    }

    return null;
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to cancel ritual #${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/orders/${orderId}/cancel`), {
        method: "POST"
      });
      
      if (response.ok) {
        toast.success("Ritual cancelled successfully.");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Cancellation failed.");
      }
    } catch (error) {
      toast.error("Process connection failed.");
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Header />
      
      <main className="pt-28 pb-32 md:pt-36">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Navigation Back Ritual */}
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-gold transition-all mb-8"
          >
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-gold group-hover:bg-gold/5 transition-all">
              <ChevronLeft size={16} />
            </div>
            Back to Sanctuary
          </button>

          {/* Professional Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-display font-bold text-charcoal">Your Orders</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">Track and manage your rituals</p>
            </div>

            <div className="relative w-full md:w-80">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search by order ID or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-border rounded-xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-1 ring-gold/20 focus:border-gold transition-all shadow-sm"
              />
            </div>
          </div>

          {loading ? (
             <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-white border border-border animate-pulse rounded-2xl" />
                ))}
             </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-8">
              {filteredOrders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-border rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Card Header Strip */}
                  <div className="px-6 py-4 bg-muted/20 border-b border-border flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Order Placed</p>
                        <p className="text-xs font-bold text-charcoal">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                      </div>
                      <div className="h-8 w-px bg-border hidden sm:block" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Amount</p>
                        <p className="text-xs font-bold text-charcoal">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1 text-right">Order ID</p>
                      <p className="text-xs font-bold text-charcoal tracking-wide">#{order.orderNumber}</p>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      {/* Products List - Left Span */}
                      <div className="md:col-span-8 space-y-8">
                        {order.items.map((item, i) => {
                          const hasReview = !!getReviewForItem(item.productId, order.orderNumber, item.name);
                          return (
                            <div key={i} className="flex gap-6 sm:gap-8 group/item">
                              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-xl border border-border overflow-hidden p-2 flex-shrink-0 transition-transform group-hover/item:scale-105">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 space-y-2">
                                {i === 0 && (
                                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig[order.status]?.border} ${statusConfig[order.status]?.bg} ${statusConfig[order.status]?.color} mb-1`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{order.status}</span>
                                  </div>
                                )}
                                <h3 className="text-lg font-display font-bold text-charcoal line-clamp-1 group-hover/item:text-gold transition-colors">{item.name}</h3>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                  <span className="flex items-center gap-1"><Package size={14} /> Qty: {item.quantity}</span>
                                  <span className="text-charcoal font-bold">₹{item.price.toLocaleString()}</span>
                                </div>
                                {order.status === "Delivered" && (
                                  <button 
                                    onClick={() => handleOpenReview(item, order.orderNumber)}
                                    className={`text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 mt-1 ${
                                      hasReview ? "text-gold hover:text-charcoal" : "text-muted-foreground hover:text-gold"
                                    }`}
                                  >
                                    <Star size={12} className={hasReview ? "fill-gold" : ""} /> 
                                    {hasReview ? "Edit Review" : "Review Item"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Grid - Right Span */}
                      <div className="md:col-span-4 flex flex-col gap-3 h-fit md:sticky md:top-4">
                        <button 
                          onClick={() => {
                            const hasRealTracking = order.trackingNumber && order.trackingNumber.toLowerCase() !== 'processing' && order.trackingNumber.trim() !== '';
                            if (order.trackingUrl || hasRealTracking) {
                              window.open(order.trackingUrl || `https://shiprocket.co/tracking/${order.trackingNumber}`, '_blank');
                            } else {
                              navigate(`/track-order?orderId=${order.orderNumber}&auto=true`);
                            }
                          }}
                          className={`w-full py-3 text-xs font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${
                            order.status === 'Cancelled'
                            ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                            : order.status === 'Shipped' 
                              ? "bg-gold text-charcoal hover:bg-gold/80" 
                              : "bg-charcoal text-white hover:bg-charcoal/80"
                          }`}
                          disabled={order.status === 'Cancelled'}
                        >
                          {order.status === 'Cancelled' ? (
                            <>
                              <Archive size={14} />
                              Cancelled
                            </>
                          ) : (
                            <>
                              <ExternalLink size={14} />
                              {order.status === 'Shipped' ? 'Track on Shiprocket' : 'Track Order'}
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedOrderForDetails(order);
                            setIsDetailsModalOpen(true);
                          }}
                          className="w-full py-3 bg-white border border-border text-charcoal text-xs font-bold rounded-xl hover:bg-muted transition-all active:scale-[0.98]"
                        >
                          Order Details
                        </button>
                        
                        {(order.status === "Processing" || order.status === "Quality Check") && (
                          <button 
                            onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                            className="w-full py-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest"
                          >
                            <XCircle size={14} />
                            Cancel Ritual
                          </button>
                        )}
                        
                        <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
                           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Order Summary</p>
                           <div className="flex justify-between items-center">
                              <span className="text-xs text-charcoal font-medium">{order.items.length} Product(s)</span>
                              <span className="text-sm font-bold text-charcoal">₹{order.totalAmount.toLocaleString()}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white border border-border rounded-3xl shadow-sm">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
                <Archive size={40} />
              </div>
              <h2 className="text-2xl font-display font-bold text-charcoal mb-2">No Orders Found</h2>
              <p className="text-sm text-muted-foreground mb-8">You haven't placed any orders with this ritual yet.</p>
              <button 
                onClick={() => navigate("/products")}
                className="px-10 py-3.5 bg-charcoal text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold transition-all"
              >
                Shop Now
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        product={selectedProductForReview!}
        user={{
          mobileNumber: user?.mobileNumber || "",
          fullName: user?.fullName || "Guest User"
        }}
        orderNumber={selectedOrderNumber}
        existingReview={existingReview}
        onSuccess={fetchData}
      />

      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        order={selectedOrderForDetails!}
      />
    </div>
  );
};

export default Orders;
