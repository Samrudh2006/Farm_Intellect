import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AshokaChakra } from "@/components/ui/ashoka-chakra";
import { Heart, Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => (
  <footer className="bg-card/80 backdrop-blur-sm border-t border-border relative overflow-hidden">
    {/* Subtle pattern overlay */}
    <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48L3N2Zz4=')]" />

    <div className="container mx-auto px-4 py-12 relative z-10">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <AshokaChakra size={28} animate={false} />
            <span className="text-lg font-bold text-foreground font-heading">Smart Crop Advisory</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Empowering Indian farmers with AI-driven intelligence for sustainable and profitable agriculture. 🇮🇳
          </p>
          <div className="flex gap-3 pt-2">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 hover:scale-110">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Dashboard", href: "/farmer/dashboard" },
              { label: "Weather", href: "/farmer/weather" },
              { label: "Advisory", href: "/farmer/advisory" },
              { label: "Market Prices", href: "/merchant/market-prices" },
              { label: "Knowledge Hub", href: "/farmer/knowledge" },
              { label: "Forum", href: "/farmer/forum" },
            ].map((link) => (
              <Link key={link.href} to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors story-link">
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="font-semibold text-foreground mb-4">Contact</h4>
          <div className="space-y-3">
            {[
              { icon: Mail, text: "support@samrudh.in" },
              { icon: Phone, text: "+91 1800-XXX-XXXX" },
              { icon: MapPin, text: "India" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-primary/70" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="tricolor-bar h-0.5 rounded-full mb-6" />

      {/* Copyright */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p className="flex items-center gap-1">
          Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> in India 🇮🇳
        </p>
        <p className="text-destructive font-medium">
          © 2025 Samrudh. All Rights Reserved.
        </p>
      </div>
    </div>

    {/* Bottom tricolor */}
    <div className="tricolor-bar h-1.5" />
  </footer>
);
