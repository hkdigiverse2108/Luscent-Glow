import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-2xl font-semibold">
              Luscent <span className="text-gold">Glow</span>
            </h3>
            <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-sm font-body">
              Elevate your beauty routine with our premium, cruelty-free cosmetics. 
              Crafted with love, powered by nature.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="https://instagram.com/hk_digiverse" target="_blank" rel="noreferrer" className="text-primary-foreground/50 hover:text-gold transition-colors"><Instagram size={18} /></a>
              <a href="https://facebook.com/luscentglow" target="_blank" rel="noreferrer" className="text-primary-foreground/50 hover:text-gold transition-colors"><Facebook size={18} /></a>
              <a href="https://youtube.com/luscentglow" target="_blank" rel="noreferrer" className="text-primary-foreground/50 hover:text-gold transition-colors"><Youtube size={18} /></a>
              <a href="https://twitter.com/luscentglow" target="_blank" rel="noreferrer" className="text-primary-foreground/50 hover:text-gold transition-colors"><Twitter size={18} /></a>
            </div>
            <div className="pt-2 space-y-2 text-sm text-primary-foreground/50 font-body">
              <a href="mailto:hello@luscentglow.com" className="hover:text-gold transition-colors flex items-center gap-2">📧 hello@luscentglow.com</a>
              <a href="tel:+919712663607" className="hover:text-gold transition-colors flex items-center gap-2">📞 +91 97126 63607</a>
            </div>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Information</h4>
            <nav className="space-y-2 text-sm font-body">
              <Link to="/about" className="block text-primary-foreground/60 hover:text-gold transition-colors">About Us</Link>
              <Link to="/contact" className="block text-primary-foreground/60 hover:text-gold transition-colors">Contact Us</Link>
              <Link to="/faq" className="block text-primary-foreground/60 hover:text-gold transition-colors">FAQ's</Link>
              <Link to="/offers" className="block text-primary-foreground/60 hover:text-gold transition-colors">Special Offers</Link>
              <Link to="/blogs" className="block text-primary-foreground/60 hover:text-gold transition-colors">Blogs</Link>
              <Link to="/track-order" className="block text-primary-foreground/60 hover:text-gold transition-colors">Track Your Order</Link>
              <Link to="/contact" className="block text-primary-foreground/60 hover:text-gold transition-colors">Careers</Link>
            </nav>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Policies</h4>
            <nav className="space-y-2 text-sm font-body">
              <Link to="/return-policy" className="block text-primary-foreground/60 hover:text-gold transition-colors">Return & Refund</Link>
              <Link to="/privacy-policy" className="block text-primary-foreground/60 hover:text-gold transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="block text-primary-foreground/60 hover:text-gold transition-colors">Terms & Conditions</Link>
              <Link to="/shipping-policy" className="block text-primary-foreground/60 hover:text-gold transition-colors">Shipping Policy</Link>
              <Link to="/cancellation-policy" className="block text-primary-foreground/60 hover:text-gold transition-colors">Cancellation Policy</Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Newsletter</h4>
            <p className="text-sm text-primary-foreground/60 font-body">Get exclusive offers & beauty tips straight to your inbox.</p>
            <div className="flex gap-0">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 bg-primary-foreground/10 text-sm font-body rounded-l-md focus:outline-none focus:ring-1 focus:ring-gold/50 placeholder:text-primary-foreground/30"
              />
              <button className="px-4 py-2.5 bg-gold text-primary font-body text-sm font-semibold rounded-r-md hover:bg-gold/90 transition-colors">
                <Mail size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-xs text-primary-foreground/40 font-body">
          © {new Date().getFullYear()} Luscent Glow. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
