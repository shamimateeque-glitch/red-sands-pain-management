import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            Ready to Take Control of Your Pain?
          </h2>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 h-auto"
            asChild
          >
            <a href="mailto:info@redsandspm.com" className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Us
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
