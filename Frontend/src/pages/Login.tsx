import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  ChevronLeft, 
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

type ViewState = "login" | "signup" | "forgot-password" | "verify-otp" | "new-password";

const Login = () => {
  const [view, setView] = useState<ViewState>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [prevView, setPrevView] = useState<ViewState | null>(null);
  const navigate = useNavigate();
  const { syncCart } = useCart();
  const { syncWithServer: syncWishlist } = useWishlist();
  const { login: authLogin } = useAuth();

  // Track the flow to know where to return or proceed
  const handleBack = () => {
    if (view === "verify-otp") {
      setView(prevView || "login");
    } else if (view === "new-password") {
      setView("verify-otp");
    } else {
      setView("login");
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let endpoint = "";
      let payload = {};

      if (view === "login") {
        endpoint = getApiUrl("/auth/signin");
        payload = { mobileNumber, password };
      } else if (view === "signup") {
        endpoint = getApiUrl("/auth/signup");
        payload = { fullName, mobileNumber, email, password };
      } else if (view === "forgot-password") {
        endpoint = getApiUrl("/auth/forgot-password");
        payload = { mobileNumber };
      } else if (view === "verify-otp") {
        if (prevView === "forgot-password") {
          // For password reset, we don't call verify-otp yet.
          // We wait until the final reset-password step to verify the OTP.
          setView("new-password");
          setLoading(false);
          return;
        }
        endpoint = getApiUrl("/auth/verify-otp");
        payload = { mobileNumber, otp: otpValue };
      } else if (view === "new-password") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
        endpoint = getApiUrl("/auth/reset-password");
        payload = { mobileNumber, otp: otpValue, newPassword: password };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Catch non-JSON responses (like server crashes or 404s with plain text)
      const contentType = response.headers.get("content-type");
      let data: any = {};
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server error: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Something went wrong");
      }

      setPrevView(view);

      if (view === "login") {
        if (data.status === "unverified") {
          setView("verify-otp");
          toast.info(data.message);
        } else {
          toast.success("Login Successful!");
          authLogin(data.user);
          navigate("/");
        }
      } else if (view === "signup") {
        setView("verify-otp");
        toast.success("Account created! Please verify your mobile.");
      } else if (view === "forgot-password") {
        setView("verify-otp");
        toast.success("OTP sent for password reset.");
      } else if (view === "verify-otp") {
        toast.success("Verification successful!");
        navigate("/login"); 
        setView("login");
      } else if (view === "new-password") {
        toast.success("Password updated successfully!");
        setView("login");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1,
        ease: [0.22, 1, 0.36, 1] as any
      }
    },
    exit: { 
      opacity: 0, 
      scale: 1.05,
      y: -10,
      transition: { duration: 0.3 }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex bg-charcoal selection:bg-gold/30 font-body overflow-hidden">
      {/* Visual Canvas: Ambient background with soft parallax-like feel */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden border-r border-gold/10">
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-transparent to-charcoal/80 z-10" />
        <div className="absolute inset-0 bg-charcoal/20 z-10" />
        
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <img 
            src="/auth-bg.png" 
            alt="Luxury Boutique" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="relative z-20 text-center space-y-8 px-12">
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="mb-4"
          >
            <span className="text-gold/60 text-xs uppercase font-light tracking-[0.5em]">Essence of Beauty</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="font-display text-8xl text-white font-light leading-none"
          >
            Luscent <span className="text-gold-light italic">Glow</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="max-w-md mx-auto space-y-6"
          >
            <p className="text-white/60 text-lg font-light leading-relaxed tracking-wide">
              Where luxury meets science. Step into your personalized beauty sanctuary.
            </p>
            <div className="h-[1px] w-24 bg-gold/30 mx-auto" />
          </motion.div>
        </div>

        {/* Brand Accents */}
        <div className="absolute bottom-12 left-12 z-20 flex flex-col gap-2">
          <div className="flex gap-4 text-gold/40 text-[10px] tracking-[0.3em] uppercase">
            <span>Bespoke Care</span>
            <span>•</span>
            <span>Pure Essence</span>
          </div>
        </div>
      </div>

      {/* Auth Portal: Structured Glassmorphism */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-y-auto bg-charcoal">
        
        <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
          <Link to="/" className="flex items-center gap-3 text-white/40 hover:text-gold transition-all duration-500 group">
            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-gold/50 transition-colors">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold">Back to Home</span>
          </Link>
        </div>

        <div className="w-full max-w-md bg-white/[0.02] border border-white/5 p-8 lg:p-12 rounded-3xl backdrop-blur-xl shadow-2xl">
          <AnimatePresence mode="wait">
            {/* --- SIGN IN FLOW --- */}
            {view === "login" && (
              <motion.div
                key="login"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-10"
              >
                <div className="space-y-3 text-center">
                  <motion.span variants={childVariants} className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">Login</motion.span>
                  <motion.h2 variants={childVariants} className="text-4xl lg:text-5xl font-display text-white font-medium">Welcome Back</motion.h2>
                  <motion.p variants={childVariants} className="text-white/40 font-light text-sm tracking-wide">Enter your details to access your account.</motion.p>
                </div>

                <form onSubmit={handleAction} className="space-y-8">
                  <div className="space-y-6">
                    <motion.div variants={childVariants} className="space-y-2 group">
                      <Label htmlFor="mobile" className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold group-focus-within:text-gold transition-colors">Mobile Number</Label>
                      <div className="relative group/field">
                        <Smartphone className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/field:text-gold transition-all duration-500" size={18} />
                        <Input 
                          id="mobile"
                          type="tel" 
                          placeholder="+91 00000 00000"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="bg-transparent border-0 border-b border-white/10 rounded-none text-white pl-12 h-12 focus:border-gold transition-all duration-500 placeholder:text-white/5 ring-0 focus-visible:ring-0"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={childVariants} className="space-y-2 group">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold group-focus-within:text-gold transition-colors">Password</Label>
                        <button 
                          type="button"
                          onClick={() => setView("forgot-password")}
                          className="text-[10px] text-gold/50 hover:text-gold uppercase tracking-widest transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative group/field">
                        <KeyRound className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/field:text-gold transition-all duration-500" size={18} />
                        <Input 
                          id="password"
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-transparent border-0 border-b border-white/10 rounded-none text-white pl-12 h-12 focus:border-gold transition-all duration-500 placeholder:text-white/5 ring-0 focus-visible:ring-0"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div variants={childVariants} className="pt-4">
                    <Button 
                      className="w-full h-14 bg-gold hover:bg-gold-light text-primary font-bold tracking-[0.2em] uppercase transition-all duration-500 shadow-ethereal"
                      disabled={loading}
                      type="submit"
                    >
                      {loading ? "Decrypting..." : (
                        <span className="flex items-center gap-3">
                          Sign In <ArrowRight size={18} />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>

                <motion.div variants={childVariants} className="pt-8 text-center border-t border-white/5">
                  <p className="text-white/30 text-[10px] font-light tracking-widest uppercase">
                    Don't have an account?{" "}
                    <button 
                      onClick={() => setView("signup")}
                      className="text-gold font-bold hover:text-white transition-colors underline underline-offset-4"
                    >
                      Sign Up
                    </button>
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* --- SIGN UP FLOW --- */}
            {view === "signup" && (
              <motion.div
                key="signup"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-10"
              >
                <div className="space-y-3 text-center">
                  <motion.span variants={childVariants} className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">Register</motion.span>
                  <motion.h2 variants={childVariants} className="text-4xl lg:text-5xl font-display text-white font-medium">Create Account</motion.h2>
                  <motion.p variants={childVariants} className="text-white/40 font-light text-sm">Join the Luscent Glow community today.</motion.p>
                </div>

                <form onSubmit={handleAction} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5">
                    <motion.div variants={childVariants} className="space-y-2 group">
                      <Label className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={18} />
                        <Input 
                          placeholder="Aura Radiance"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-transparent border-0 border-b border-white/10 rounded-none text-white pl-12 h-12 focus:border-gold transition-all duration-500 placeholder:text-white/5 ring-0 focus-visible:ring-0"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={childVariants} className="space-y-2 group">
                      <Label className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Mobile Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={18} />
                        <Input 
                          type="tel"
                          placeholder="+91 00000 00000"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="bg-transparent border-0 border-b border-white/10 rounded-none text-white pl-12 h-12 focus:border-gold transition-all duration-500 placeholder:text-white/5 ring-0 focus-visible:ring-0"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={childVariants} className="space-y-2 group">
                      <Label className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={18} />
                        <Input 
                          type="email"
                          placeholder="aura@radiance.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-transparent border-0 border-b border-white/10 rounded-none text-white pl-12 h-12 focus:border-gold transition-all duration-500 placeholder:text-white/5 ring-0 focus-visible:ring-0"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={childVariants} className="space-y-2 group">
                      <Label className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={18} />
                        <Input 
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-transparent border-0 border-b border-white/10 rounded-none text-white pl-12 h-12 focus:border-gold transition-all duration-500 placeholder:text-white/5 ring-0 focus-visible:ring-0"
                          required
                        />
                      </div>
                    </motion.div>
                  </div>

                  <motion.div variants={childVariants} className="pt-6">
                    <Button 
                      className="w-full h-14 bg-gold hover:bg-gold-light text-primary font-bold tracking-[0.2em] uppercase transition-all duration-500"
                      disabled={loading}
                      type="submit"
                    >
                      {loading ? "Creating Account..." : "Sign Up"}
                    </Button>
                  </motion.div>
                </form>

                <motion.div variants={childVariants} className="pt-6 text-center border-t border-white/5">
                  <p className="text-white/30 text-[10px] font-light tracking-widest uppercase">
                    Already have an account?{" "}
                    <button 
                      onClick={() => setView("login")}
                      className="text-gold font-bold hover:text-white transition-colors underline underline-offset-4"
                    >
                      Sign In
                    </button>
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* --- FORGOT PASSWORD FLOW --- */}
            {view === "forgot-password" && (
              <motion.div
                key="forgot"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-10"
              >
                <div className="space-y-3 text-center">
                  <motion.span variants={childVariants} className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">Reset Password</motion.span>
                  <motion.h2 variants={childVariants} className="text-4xl lg:text-5xl font-display text-white font-medium">Forgot Password</motion.h2>
                  <motion.p variants={childVariants} className="text-white/40 font-light text-sm">Enter your mobile number to reset your password.</motion.p>
                </div>

                <form onSubmit={handleAction} className="space-y-10">
                  <motion.div variants={childVariants} className="space-y-4 group">
                    <Label className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={18} />
                      <Input 
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="bg-transparent border-0 border-b border-white/10 rounded-none text-white pl-12 h-12 focus:border-gold transition-all duration-500 placeholder:text-white/5 ring-0 focus-visible:ring-0"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={childVariants} className="space-y-4">
                    <Button 
                      className="w-full h-14 bg-gold hover:bg-gold-light text-primary font-bold tracking-[0.2em] uppercase"
                      disabled={loading}
                      type="submit"
                    >
                      Send OTP
                    </Button>
                    <button 
                      type="button"
                      onClick={() => setView("login")}
                      className="w-full text-center text-white/30 text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
                    >
                      Return to Entry
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {/* --- OTP VERIFICATION FLOW --- */}
            {view === "verify-otp" && (
              <motion.div
                key="otp"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-12 text-center"
              >
                <div className="space-y-4">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                    className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold/20"
                  >
                    <ShieldCheck className="text-gold" size={32} />
                  </motion.div>
                  <motion.h2 variants={childVariants} className="text-4xl lg:text-5xl font-display text-white font-medium">Verification</motion.h2>
                  <motion.p variants={childVariants} className="text-white/40 font-light text-xs tracking-widest leading-loose">
                    Enter the OTP sent to <br/>
                    <span className="text-gold font-bold font-body tracking-widest">{mobileNumber || "+91 ••••• ••042"}</span>
                  </motion.p>
                </div>

                <form onSubmit={handleAction} className="space-y-10">
                  <motion.div variants={childVariants} className="flex flex-col items-center gap-8">
                    <InputOTP 
                      maxLength={6}
                      value={otpValue}
                      onChange={(value) => setOtpValue(value)}
                    >
                      <InputOTPGroup className="gap-3">
                        <InputOTPSlot index={0} className="w-12 h-16 bg-white/5 border-white/10 text-white text-2xl focus:border-gold rounded-none transition-all duration-300" />
                        <InputOTPSlot index={1} className="w-12 h-16 bg-white/5 border-white/10 text-white text-2xl focus:border-gold rounded-none transition-all duration-300" />
                        <InputOTPSlot index={2} className="w-12 h-16 bg-white/5 border-white/10 text-white text-2xl focus:border-gold rounded-none transition-all duration-300" />
                        <InputOTPSlot index={3} className="w-12 h-16 bg-white/5 border-white/10 text-white text-2xl focus:border-gold rounded-none transition-all duration-300" />
                        <InputOTPSlot index={4} className="w-12 h-16 bg-white/5 border-white/10 text-white text-2xl focus:border-gold rounded-none transition-all duration-300" />
                        <InputOTPSlot index={5} className="w-12 h-16 bg-white/5 border-white/10 text-white text-2xl focus:border-gold rounded-none transition-all duration-300" />
                      </InputOTPGroup>
                    </InputOTP>
                    
                    <div className="flex flex-col gap-4 w-full">
                      <Button 
                        className="w-full h-14 bg-gold hover:bg-gold-light text-primary font-bold tracking-[0.2em] uppercase transition-all duration-500"
                        disabled={loading}
                        type="submit"
                      >
                        {loading ? "Verifying..." : "Verify OTP"}
                      </Button>
                      <button type="button" className="text-gold/40 text-[10px] uppercase tracking-[0.2em] hover:text-gold transition-colors duration-500 font-bold">
                        Resend OTP (59s)
                      </button>
                    </div>
                  </motion.div>
                </form>

                <motion.button 
                   variants={childVariants}
                   onClick={handleBack}
                   className="text-white/20 text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors font-bold"
                >
                  Change Mobile Number
                </motion.button>
              </motion.div>
            )}

            {/* --- NEW PASSWORD FLOW --- */}
            {view === "new-password" && (
              <motion.div
                key="new-pass"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-10"
              >
                <div className="space-y-3 text-center">
                  <motion.span variants={childVariants} className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">New Password</motion.span>
                  <motion.h2 variants={childVariants} className="text-4xl lg:text-5xl font-display text-white font-medium">Update Password</motion.h2>
                  <motion.p variants={childVariants} className="text-white/40 font-light text-sm tracking-wide">Create a strong new password for your account.</motion.p>
                </div>

                <form onSubmit={handleAction} className="space-y-8">
                  <div className="space-y-6">
                    <motion.div variants={childVariants} className="space-y-2 group">
                      <Label className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={18} />
                        <Input 
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-transparent border-0 border-b border-white/10 rounded-none text-white pl-12 h-12 focus:border-gold transition-all duration-500 placeholder:text-white/5 ring-0 focus-visible:ring-0"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={childVariants} className="space-y-2 group">
                      <Label className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={18} />
                        <Input 
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-transparent border-0 border-b border-white/10 rounded-none text-white pl-12 h-12 focus:border-gold transition-all duration-500 placeholder:text-white/5 ring-0 focus-visible:ring-0"
                          required
                        />
                      </div>
                    </motion.div>
                  </div>

                  <motion.div variants={childVariants} className="pt-4">
                    <Button 
                      className="w-full h-14 bg-gold hover:bg-gold-light text-primary font-bold tracking-[0.2em] uppercase transition-all duration-500"
                      disabled={loading}
                      type="submit"
                    >
                      Reset Password
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Decorative Watermark */}
        <div className="absolute bottom-12 text-center w-full left-0 opacity-[0.03] text-[8px] uppercase tracking-[1em] text-white pointer-events-none font-light">
          Luscent Glow • Est. 2024 • Excellence In Every Drop
        </div>
      </div>
    </div>
  );
};

export default Login;
