import { Mail, MapPin, Phone, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div>
            <img src={logo} alt="Red Sands Pain Management" className="h-16 mb-4 bg-white rounded-lg p-2 shadow-lg" />
            <p className="text-secondary-foreground/80">
              Providing comprehensive chronic pain management services in Charlottetown, Prince Edward Island.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <div className="space-y-3">
              <a href="tel:+17823777813" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                +1 782-377-7813
              </a>
              <a href="mailto:info@redsandspm.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                info@redsandspm.com
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=199+Grafton+Street,+Charlottetown,+PE+C1A+1L2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-primary transition-colors"
              >
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>
                  LL-1, Polyclinic, 199 Grafton Street<br />
                  Charlottetown, PE C1A 1L2
                </span>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Connect With Us</h3>
            <p className="text-secondary-foreground/80 mb-4">
              Follow us on social media for updates and health tips
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-maroon flex items-center justify-center transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-maroon flex items-center justify-center transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-maroon flex items-center justify-center transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-maroon flex items-center justify-center transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 flex justify-between items-center text-sm text-secondary-foreground/60">
          <a
            href="https://ventura-solutions.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            &copy; 2025 Powered by Ventura Canada Inc, PEI
          </a>
          <a href="/auth" className="text-xs hover:text-primary transition-colors">Admin</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
