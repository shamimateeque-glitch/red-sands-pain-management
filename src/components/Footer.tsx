import { Mail, MapPin, Phone, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Logo + tagline */}
          <div>
            <img
              src={logo}
              alt="Red Sands Pain Management"
              className="h-16 mb-5 bg-white rounded-lg p-2 shadow-lg"
            />
            <p className="text-sm leading-relaxed text-secondary-foreground/80 max-w-xs">
              Providing comprehensive chronic pain management services in
              Charlottetown, Prince Edward Island.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white tracking-wide uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/#about" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <Link to="/team" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <a href="/#treatments" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Covered Services
                </a>
              </li>
              <li>
                <a href="/#private-pay" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Private Pay Services
                </a>
              </li>
              <li>
                <a href="/#contact" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white tracking-wide uppercase">
              Contact Us
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href="tel:+17823777813"
                className="flex items-center gap-3 text-secondary-foreground/80 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+1 782-377-7813</span>
              </a>
              <a
                href="tel:+19022001286"
                className="flex items-center gap-3 text-secondary-foreground/80 hover:text-primary transition-colors"
              >
                <Printer className="h-4 w-4 flex-shrink-0" />
                <span>Fax: 902-200-1286</span>
              </a>
              <a
                href="mailto:info@redsandspm.com"
                className="flex items-center gap-3 text-secondary-foreground/80 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@redsandspm.com</span>
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=199+Grafton+Street,+Charlottetown,+PE+C1A+1L2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-secondary-foreground/80 hover:text-primary transition-colors"
              >
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  LL-1, Polyclinic, 199 Grafton Street<br />
                  Charlottetown, PE C1A 1L2
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-secondary-foreground/60">
          <a
            href="https://ventura-solutions.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            &copy; 2025 Powered by Ventura Canada Inc, PEI
          </a>
          <a href="/auth" className="hover:text-primary transition-colors">
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
