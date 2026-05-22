import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-4" />
          <h2 className="mb-4 text-maroon">Get In Touch</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to take the first step toward relief? Contact us today to discuss your treatment options.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="tel:+17823777813" className="text-primary hover:underline font-medium">
                +1 782-377-7813
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Printer className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Fax</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="tel:+19022001286" className="text-primary hover:underline font-medium">
                +1 902-200-1286
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:info@redsandspm.com" className="text-primary hover:underline font-medium">
                info@redsandspm.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="https://www.google.com/maps/search/?api=1&query=LL-1,+Polyclinic,+199+Grafton+Street,+Charlottetown,+PE+C1A+1L2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium text-sm block"
              >
                LL-1, Polyclinic, 199 Grafton Street<br />
                Charlottetown, PE C1A 1L2
              </a>
            </CardContent>
          </Card>

        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-accent/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="space-y-4">
              <CardTitle className="text-2xl md:text-3xl">Need a Referral?</CardTitle>
              <CardDescription className="text-base md:text-lg leading-relaxed">
                All patients need a referral to have an appointment with our pain specialists. Your Family doctor or Nurse practitioner, any other physician, even your physiotherapist or Chiropractor can refer you to Provincial Pain Management services.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <Button
                asChild
                size="lg"
                className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <a href="mailto:info@redsandspm.com">Email Us</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
