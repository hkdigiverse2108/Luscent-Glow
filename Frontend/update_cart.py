import re

file_path = r"c:\Users\HP\Downloads\Lucsent_glow\Frontend\src\pages\Cart.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Make sure to add import { load } from '@cashfreepayments/cashfree-js';
import_stmt = """import { useAuth } from "@/context/AuthContext";
import { load } from '@cashfreepayments/cashfree-js';"""

content = content.replace('import { useAuth } from "@/context/AuthContext";', import_stmt)

new_handle_complete = """  const handleCompletePurchase = async () => {
    const guestId = localStorage.getItem("luscent-glow-guest-id");
    const identifier = user?.mobileNumber || guestId || "Guest";
    
    setIsPlacingOrder(true);
    try {
      const orderData = {
        userMobile: identifier,
        userName: user?.fullName || "Guest",
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedShade: item.selectedShade,
          selectedSize: item.selectedSize,
          metadata: item.metadata
        })),
        totalAmount: subtotal + shipping - discountAmount - giftCardDiscount,
        appliedGiftCardCode: appliedGiftCard?.code || null,
        giftCardDiscount: giftCardDiscount || 0,
        paymentStatus: "Pending",
        shippingAddress: user?.shippingAddress || { street: "Not Provided", city: "Update in Profile", state: "N/A", zipCode: "000000" }
      };

      const response = await fetch(getApiUrl("/api/payments/initiate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.gateway === "cashfree" && data.paymentSessionId) {
          // Initialize Cashfree
          try {
            // First fetch the creds to know mode, or we can assume we check the current URL
            // A more robust way is for initiate API to return mode. I'll just use sandbox for now or if data.mode is returned.
            const cashfree = await load({ mode: "sandbox" }); // Can be dynamic if we return it from API
            let checkoutOptions = {
                paymentSessionId: data.paymentSessionId,
                redirectTarget: "_modal",
            };
            
            cashfree.checkout(checkoutOptions).then(async (result: any) => {
                if(result.error){
                    toast.error(result.error.message || "Payment was cancelled or failed.");
                    setIsPlacingOrder(false);
                }
                if(result.redirect){
                    console.log("Redirection...");
                }
                if(result.paymentDetails){
                    // verify cashfree payment on our backend
                    const verifyResponse = await fetch(getApiUrl("/api/payments/verify"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            gateway: "cashfree",
                            merchantTransactionId: data.merchantTransactionId
                        }),
                    });

                    const verifyData = await verifyResponse.json();
                    if (verifyResponse.ok && verifyData.success) {
                        toast.success("Payment successful! Curating your ritual...");
                        clearCart();
                        navigate(`/order-success?orderNumber=${data.orderNumber}`);
                    } else {
                        toast.error("Signature verification failed. Please contact support.");
                        setIsPlacingOrder(false);
                    }
                }
            });
          } catch(err) {
             console.error("Cashfree init error:", err);
             toast.error("Failed to load payment portal.");
             setIsPlacingOrder(false);
          }
        } 
        else if (data.gateway === "razorpay" && data.razorpayOrderId) {
          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: "INR",
            name: "Luscent Glow",
            description: "Ritual Selection Purchase",
            image: "/logo.png",
            order_id: data.razorpayOrderId,
            handler: async function (response: any) {
              try {
                const verifyResponse = await fetch(getApiUrl("/api/payments/verify"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    gateway: "razorpay",
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    merchantTransactionId: data.merchantTransactionId
                  }),
                });

                const verifyData = await verifyResponse.json();
                if (verifyResponse.ok && verifyData.success) {
                  toast.success("Payment successful! Curating your ritual...");
                  clearCart();
                  navigate(`/order-success?orderNumber=${data.orderNumber}`);
                } else {
                  toast.error("Signature verification failed. Please contact support.");
                  setIsPlacingOrder(false);
                }
              } catch (err) {
                console.error("Verification error:", err);
                toast.error("Could not verify your payment ritual.");
                setIsPlacingOrder(false);
              }
            },
            prefill: {
              name: user?.fullName || "",
              email: user?.email || "",
              contact: user?.mobileNumber || ""
            },
            theme: {
              color: "#B68F4C"
            },
            modal: {
              ondismiss: function() {
                 setIsPlacingOrder(false);
              }
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          console.error("Payment initiation error:", data);
          toast.error("Payment gateway is currently offline.");
          setIsPlacingOrder(false);
        }
      } else {
        toast.error(data.message || "Payment initiation failed.");
        setIsPlacingOrder(false);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Could not reach our fulfillment center.");
      setIsPlacingOrder(false);
    }
  };"""

content = re.sub(r'  const handleCompletePurchase = async \(\) => \{.*?  \};(\n\n  const freeShippingThreshold)', new_handle_complete + r'\1', content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
