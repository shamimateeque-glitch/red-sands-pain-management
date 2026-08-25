import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Phone, LogOut, ChevronDown, Stethoscope, CreditCard, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isGeneralInfoOpen, setIsGeneralInfoOpen] = useState(false);
  const [isMobileGeneralInfoOpen, setIsMobileGeneralInfoOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const servicesRef = useRef<HTMLDivElement>(null);
  const generalInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Track scroll for sticky nav shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
      if (generalInfoRef.current && !generalInfoRef.current.contains(event.target as Node)) {
        setIsGeneralInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    if (session) {
      await checkAdminStatus(session.user.id);
    }
  };

  const checkAdminStatus = async (userId: string) => {
    const { data: isAdminUser, error } = await supabase
      .rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });

    if (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      return;
    }

    setIsAdmin(isAdminUser || false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path.replace("/#", "/"));
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/#about" },
    { name: "Team", path: "/team" },
  ];

  const navLinkClass = (path: string) =>
    `nav-link relative text-sm font-medium tracking-wide uppercase transition-colors ${
      isActive(path) ? "text-primary" : "text-foreground hover:text-primary"
    }`;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-md border-b border-border/50"
          : "bg-background/95 backdrop-blur border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="Red Sands Pain Management" className="h-16 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={navLinkClass(link.path)}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </a>
            ))}
            {/* Our Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className={`nav-link relative flex items-center gap-1 text-sm font-medium tracking-wide uppercase transition-colors ${
                  isServicesOpen ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                Our Services
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                {isServicesOpen && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </button>
              <div
                className={`absolute top-full left-0 mt-3 w-56 bg-background/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-xl py-1.5 z-50 transition-all duration-200 origin-top ${
                  isServicesOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <a
                  href="/#treatments"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:text-primary hover:bg-muted/60 border-l-2 border-transparent hover:border-primary transition-all"
                  onClick={() => setIsServicesOpen(false)}
                >
                  <Stethoscope className="h-4 w-4 text-primary/70" />
                  Covered Services
                </a>
                <div className="mx-3 border-t border-border/50" />
                <a
                  href="/#private-pay"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:text-primary hover:bg-muted/60 border-l-2 border-transparent hover:border-primary transition-all"
                  onClick={() => setIsServicesOpen(false)}
                >
                  <CreditCard className="h-4 w-4 text-primary/70" />
                  Private Pay Services
                </a>
              </div>
            </div>
            {/* FAQs Dropdown */}
            <div className="relative" ref={generalInfoRef}>
              <button
                onClick={() => setIsGeneralInfoOpen(!isGeneralInfoOpen)}
                className={`nav-link relative flex items-center gap-1 text-sm font-medium tracking-wide uppercase transition-colors ${
                  isGeneralInfoOpen ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                FAQs
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isGeneralInfoOpen ? 'rotate-180' : ''}`} />
                {isGeneralInfoOpen && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </button>
              <div
                className={`absolute top-full left-0 mt-3 w-72 bg-background/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-xl py-1.5 z-50 transition-all duration-200 origin-top ${
                  isGeneralInfoOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <Link
                  to="/treatment/risks-of-corticosteroid-injections"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:text-primary hover:bg-muted/60 border-l-2 border-transparent hover:border-primary transition-all"
                  onClick={() => setIsGeneralInfoOpen(false)}
                >
                  <AlertTriangle className="h-4 w-4 text-primary/70" />
                  Risks of Corticosteroid Injections
                </Link>
              </div>
            </div>
            <a
              href="/resources"
              className={navLinkClass("/resources")}
            >
              Resources
              {isActive("/resources") && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
            </a>
            <a
              href="/#contact"
              className={navLinkClass("/#contact")}
            >
              Contact
            </a>
            {isAdmin && (
              <Link
                to="/admin"
                className={navLinkClass("/admin")}
              >
                Admin
                {isActive("/admin") && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            )}
            {isLoggedIn && (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
            <Button asChild>
              <a href="tel:+17823777813" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +1 782-377-7813
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={`block py-2.5 px-3 rounded-lg text-sm font-medium tracking-wide transition-colors ${
                  isActive(link.path) ? "text-primary bg-primary/5" : "text-foreground hover:text-primary hover:bg-muted/60"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            {/* Mobile Our Services */}
            <div>
              <button
                onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg text-sm font-medium tracking-wide text-foreground hover:text-primary hover:bg-muted/60 transition-colors"
              >
                Our Services
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isMobileServicesOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-4 space-y-1 py-1">
                  <a
                    href="/#treatments"
                    className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-foreground hover:text-primary hover:bg-muted/60 transition-colors"
                    onClick={() => { setIsOpen(false); setIsMobileServicesOpen(false); }}
                  >
                    <Stethoscope className="h-4 w-4 text-primary/70" />
                    Covered Services
                  </a>
                  <a
                    href="/#private-pay"
                    className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-foreground hover:text-primary hover:bg-muted/60 transition-colors"
                    onClick={() => { setIsOpen(false); setIsMobileServicesOpen(false); }}
                  >
                    <CreditCard className="h-4 w-4 text-primary/70" />
                    Private Pay Services
                  </a>
                </div>
              </div>
            </div>
            {/* Mobile FAQs */}
            <div>
              <button
                onClick={() => setIsMobileGeneralInfoOpen(!isMobileGeneralInfoOpen)}
                className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg text-sm font-medium tracking-wide text-foreground hover:text-primary hover:bg-muted/60 transition-colors"
              >
                FAQs
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMobileGeneralInfoOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isMobileGeneralInfoOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-4 space-y-1 py-1">
                  <Link
                    to="/treatment/risks-of-corticosteroid-injections"
                    className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-foreground hover:text-primary hover:bg-muted/60 transition-colors"
                    onClick={() => { setIsOpen(false); setIsMobileGeneralInfoOpen(false); }}
                  >
                    <AlertTriangle className="h-4 w-4 text-primary/70" />
                    Risks of Corticosteroid Injections
                  </Link>
                </div>
              </div>
            </div>
            <a
              href="/resources"
              className={`block py-2.5 px-3 rounded-lg text-sm font-medium tracking-wide transition-colors ${
                isActive("/resources") ? "text-primary bg-primary/5" : "text-foreground hover:text-primary hover:bg-muted/60"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Resources
            </a>
            <a
              href="/#contact"
              className="block py-2.5 px-3 rounded-lg text-sm font-medium tracking-wide text-foreground hover:text-primary hover:bg-muted/60 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </a>
            {isAdmin && (
              <Link
                to="/admin"
                className={`block py-2.5 px-3 rounded-lg text-sm font-medium tracking-wide transition-colors ${
                  isActive("/admin") ? "text-primary bg-primary/5" : "text-foreground hover:text-primary hover:bg-muted/60"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            )}
            {isLoggedIn && (
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
            <Button asChild className="w-full">
              <a href="tel:+17823777813" className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                +1 782-377-7813
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
