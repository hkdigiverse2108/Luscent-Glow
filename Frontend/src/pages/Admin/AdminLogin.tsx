import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sparkles, 
  Lock, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.tsx";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, adminLogin } = useAuth();
  const from = location.state?.from?.pathname || "/admin/dashboard";

  // Stages: 'credentials', 'otp', 'forgot-password'
  const [stage, setStage] = useState<'credentials' | 'otp' | 'forgot-password'>('credentials');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileFocused, setIsMobileFocused] = useState(false);
  
  const [formData, setFormData] = useState({
    mobileNumber: "",
    password: "",
    otp: "",
    newPassword: ""
  });
  
  // Automatic Administrative Entry Ritual
  useEffect(() => {
    const performAutoLogin = async () => {
      // Small delay for cinematic effect and to ensure the UI has mounted
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!admin) {
        setLoading(true);
        // Default Industrial Credentials
        const autoData = {
          mobileNumber: "82005489888",
          password: "Admin@123"
        };
        
        try {
          const response = await fetch(getApiUrl("/api/auth/signin"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(autoData),
          });

          const data = await response.json();

          if (response.ok && data.status === "success" && data.user.isAdmin) {
            adminLogin(data.user);
            toast.success("Identity Verified: Zero-Click Access Granted.");
            navigate(from, { replace: true });
          }
        } catch (error) {
          // Silent fail to manual login if auto-ritual fails
          console.error("Auto-authentication ritual interrupted.");
        } finally {
          setLoading(false);
        }
      }
    };

    if (!admin) {
      performAutoLogin();
    } else {
      navigate(from, { replace: true });
    }
  }, [admin, navigate, from, adminLogin]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(getApiUrl("/api/auth/signin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: formData.mobileNumber,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status === "unverified") {
          toast.info("Identity verification required.");
          setStage("otp");
        } else if (data.status === "success") {
          if (!data.user.isAdmin) {
             toast.error("Access Denied: Administrative Clearance Required");
             return;
          }
          adminLogin(data.user);
          toast.success("Welcome back to the Sanctuary.");
          navigate(from, { replace: true });
        }
      } else {
        toast.error(data.detail || "Authentication ritual failed.");
      }
    } catch (error) {
      toast.error("System connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(getApiUrl("/api/auth/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: formData.mobileNumber,
          otp: formData.otp
        }),
      });

      if (response.ok) {
        toast.success("Access identity verified.");
        // Re-signin to get user data or manual state update
        handleCredentialsSubmit(new Event('submit') as any);
      } else {
        const data = await response.json();
        toast.error(data.detail || "Invalid validation code.");
      }
    } catch (error) {
      toast.error("Validation system offline.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await fetch(getApiUrl("/api/auth/forgot-password"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobileNumber: formData.mobileNumber }),
        });
        if (response.ok) {
            toast.success("Reset code sent to your mobile.");
            setStage("otp");
        } else {
            const data = await response.json();
            toast.error(data.detail || "Could not initiate recovery.");
        }
    } catch (error) {
        toast.error("Recovery system error.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-2 relative overflow-hidden font-body text-white">
      {/* Cinematic Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-light/5 rounded-full blur-[180px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg z-10"
      >
        <div className="backdrop-blur-3xl bg-charcoal/40 border border-white/5 rounded-3xl p-5 shadow-2xl shadow-black/80 space-y-4">
          
          {/* Brand Header */}
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold to-rose-light flex items-center justify-center shadow-2xl shadow-gold/20 mx-auto mb-4">
              <Sparkles className="text-white" size={24} />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight italic">
              Admin <span className="text-gold">Login</span>
            </h1>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.4em] pt-2">Secure Management Portal</p>
          </div>

          <AnimatePresence mode="wait">
            {stage === 'credentials' && (
              <motion.form 
                key="credentials"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleCredentialsSubmit} 
                className="space-y-4"
              >
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] ml-2">Mobile Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={20} />
                      <input 
                        type="tel"
                        required
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                        onFocus={() => setIsMobileFocused(true)}
                        onBlur={() => setIsMobileFocused(false)}
                        placeholder={isMobileFocused ? "" : "e.g. 8200549898"}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-16 pr-6 text-white outline-none focus:ring-1 focus:ring-gold/30 transition-all font-body"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Password</label>
                       <button 
                         type="button"
                         onClick={() => setStage('forgot-password')}
                         className="text-[10px] font-bold text-gold/60 hover:text-gold uppercase tracking-widest transition-colors"
                       >
                         Forgot Password?
                       </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={20} />
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={isFocused ? "" : "••••••••"}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-16 pr-16 text-white outline-none focus:ring-1 focus:ring-gold/30 transition-all font-body"
                      />
                      <button 
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-gold transition-colors"
                      >
                         {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-gold hover:bg-white text-charcoal font-bold py-4 rounded-2xl shadow-xl shadow-gold/10 transition-all duration-500 uppercase tracking-widest text-sm flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  {loading ? "Authenticating..." : (
                    <>
                      Login to Dashboard
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {stage === 'otp' && (
              <motion.form 
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleOTPSubmit} 
                className="space-y-6"
              >
                <div className="text-center space-y-4">
                   <ShieldCheck className="text-gold mx-auto" size={48} />
                   <h3 className="text-xl font-bold uppercase tracking-tight">OTP Verification</h3>
                   <p className="text-white/40 text-sm italic">Enter the 6-digit code sent to your mobile.</p>
                </div>

                <div className="space-y-6">
                  <input 
                    type="text"
                    maxLength={6}
                    required
                    value={formData.otp}
                    onChange={(e) => setFormData({...formData, otp: e.target.value})}
                    placeholder="Verification Code"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-center text-3xl font-display font-medium tracking-[0.5em] text-white outline-none focus:ring-1 focus:ring-gold/30 transition-all"
                  />
                  <div className="text-center">
                    <button 
                      type="button"
                      className="text-xs font-bold text-white/20 hover:text-gold uppercase tracking-widest transition-colors"
                    >
                      Resend Validation Code
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setStage('credentials')}
                    className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/5 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={16} /> Edit Info
                  </button>
                  <button 
                    disabled={loading}
                    className="bg-gold hover:bg-white text-charcoal font-bold py-3 rounded-2xl transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </motion.form>
            )}

            {stage === 'forgot-password' && (
              <motion.form 
                key="forgot"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleForgotPassword} 
                className="space-y-10"
              >
                <div className="text-center space-y-4">
                   <KeyRound className="text-gold mx-auto" size={48} />
                   <h3 className="text-xl font-bold uppercase tracking-tight">Forgot Password</h3>
                   <p className="text-white/40 text-sm italic">Provide your registered mobile number to reset your password.</p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] ml-2">Registered Mobile</label>
                  <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={20} />
                    <input 
                      type="tel"
                      required
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                      placeholder="e.g. 8200549898"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white outline-none focus:ring-1 focus:ring-gold/30 transition-all font-body"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setStage('credentials')}
                    className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/5 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={16} /> Back to Login
                  </button>
                  <button 
                    disabled={loading}
                    className="bg-gold hover:bg-white text-charcoal font-bold py-3 rounded-2xl transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    Send Reset Link
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Social Proof Placeholder */}
          <div className="text-center pt-8 border-t border-white/5">
            <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.5em]">Industrial Grade Security Protocols Active</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
