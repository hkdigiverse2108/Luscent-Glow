import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Twitter, Mail, Loader2, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [footer, setFooter] = useState<any>(null);
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooter();
  }, []);

  const fetchFooter = async () => {
    try {
      const [footerRes, settingsRes] = await Promise.all([
        fetch(getApiUrl("/api/footer/")),
        fetch(getApiUrl("/api/settings/global/"))
      ]);

      if (footerRes.ok) {
        const data = await footerRes.json();
        setFooter(data);
      } else {
        // Fallback for footer structure
        setFooter({
          brandDescription: "Elevate your beauty routine with our premium, cruelty-free cosmetics. Crafted with love, powered by nature.",
          socials: [
            { platform: "Instagram", url: "https://instagram.com/hk_digiverse" },
            { platform: "Facebook", url: "https://facebook.com/luscentglow" },
            { platform: "Youtube", url: "https://youtube.com/luscentglow" },
            { platform: "Twitter", url: "https://twitter.com/luscentglow" }
          ],
          email: "hello@luscentglow.com",
          phone: "+91 97126 63607",
          columns: [
            {
              title: "Information",
              links: [
                { label: "About Us", path: "/about" },
                { label: "Contact Us", path: "/contact" },
                { label: "Track Order", path: "https://shiprocket.co/tracking" },
                { label: "Blogs", path: "/blogs" },
                { label: "FAQ's", path: "/faq" }
              ]
            },
            {
              title: "Policies",
              links: [
                { label: "Privacy Policy", path: "/policy/privacy-policy" },
                { label: "Terms & Conditions", path: "/policy/terms-and-conditions" }
              ]
            }
          ],
          newsletterTitle: "Beauty Line",
          newsletterSubtitle: "Curated aesthetics & beauty tips straight to your inbox.",
          copyrightText: `© ${new Date().getFullYear()} Luscent Glow. All rights reserved.`
        });
      }

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setGlobalSettings(settings);
      }
    } catch (error) {
      console.error("Footer/Settings fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl("/api/newsletter/subscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Thank you for subscribing!");
        setEmail("");
      } else {
        toast.error(data.detail || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Could not connect to the server. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !footer) {
    return (
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 flex items-center justify-center">
           <Loader2 className="animate-spin text-gold/30" size={32} />
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 pt-16 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-2xl font-semibold">
              Luscent <span className="text-gold">Glow</span>
            </h3>
            <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-sm font-body">
              {footer.brandDescription}
            </p>
            <div className="flex items-center gap-4 pt-2">
              {footer.socials.map((social: any) => (
                <a 
                  key={social.platform}
                  href={social.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-primary-foreground/50 hover:text-gold transition-colors"
                >
                  {social.platform === "Instagram" && <Instagram size={18} />}
                  {social.platform === "Facebook" && <Facebook size={18} />}
                  {social.platform === "Youtube" && <Youtube size={18} />}
                  {social.platform === "Twitter" && <Twitter size={18} />}
                </a>
              ))}
            </div>
            <div className="pt-2 space-y-2 text-sm text-primary-foreground/50 font-body">
              <a 
                href={`mailto:${footer.email}`} 
                className="hover:text-gold hover:underline transition-all flex items-center gap-2 cursor-pointer w-fit"
              >
                <Mail size={14} className="opacity-60" /> {footer.email}
              </a>
              <a 
                href={`tel:${footer.phone}`} 
                className="hover:text-gold hover:underline transition-all flex items-center gap-2 cursor-pointer w-fit"
              >
                <Phone size={14} className="opacity-60" /> {footer.phone}
              </a>
            </div>
          </div>

          {/* Dynamic Columns */}
          {footer.columns.map((column: any) => (
            <div key={column.title} className="space-y-4">
              <h4 className="font-display text-lg font-semibold">{column.title}</h4>
              <nav className="space-y-2 text-sm font-body">
                {column.links.map((link: any) => {
                  const isExternal = link.path.startsWith('http') || link.path.startsWith('mailto:') || link.path.startsWith('tel:');
                  
                  if (isExternal) {
                    return (
                      <a 
                        key={link.label}
                        href={link.path}
                        target={link.path.startsWith('http') ? "_blank" : undefined}
                        rel={link.path.startsWith('http') ? "noopener noreferrer" : undefined}
                        className="block text-primary-foreground/60 hover:text-gold transition-colors"
                      >
                        {link.label}
                      </a>
                    );
                  }

                  return (
                    <Link 
                      key={link.label}
                      to={
                        ["privacy-policy", "terms-and-conditions", "return-policy", "shipping-policy", "cancellation-policy"].includes(link.path.replace(/^\//, ""))
                          ? `/policy/${link.path.replace(/^\//, "")}`
                          : link.path
                      } 
                      className="block text-primary-foreground/60 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Newsletter Section */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold italic text-gold">{footer.newsletterTitle}</h4>
            <p className="text-sm text-primary-foreground/60 font-body italic">{footer.newsletterSubtitle}</p>
            <form onSubmit={handleSubscribe} className="flex gap-0">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-2.5 bg-primary-foreground/10 text-sm font-body rounded-l-xl focus:outline-none focus:ring-1 focus:ring-gold/50 placeholder:text-primary-foreground/30 transition-all"
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gold text-primary font-body text-sm font-semibold rounded-r-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center text-xs text-primary-foreground/40 font-body">
          {globalSettings?.copyrightText || footer.copyrightText}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
