import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PRPDetail = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div className="max-w-6xl">
              <h1 className="mb-4">Platelet Rich Plasma (PRP) Injections</h1>
              <p className="text-xl text-muted-foreground">
                Medical evidence is showing that the injections of PRP in certain painful conditions are superior to Cortisone injections. This service is not covered by the Province.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6 prose-headings:text-foreground prose-headings:font-semibold prose-headings:mb-4 prose-headings:mt-8 first:prose-headings:mt-0 prose-strong:text-foreground prose-strong:font-semibold prose-ul:space-y-3 prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-li:text-foreground prose-li:leading-relaxed prose-li:pl-2">
                    <p>
                      Platelet-Rich Plasma (PRP) is a treatment that uses your own blood cells to help promote healing and reduce pain. A small sample of your blood is taken. It is spun in a machine to concentrate platelets (healing cells). The PRP is injected into the painful area. Platelets release growth factors that may help repair damaged tissues such as tendons, ligaments, and joints.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Information Document */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Patient Information Document</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Download our comprehensive patient information guide for detailed information about this treatment.
                  </p>
                  <Button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = "/documents/RSPM PRP Final-updated.pdf";
                      link.download = "RSPM PRP Final-updated.pdf";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Back to Home Button */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto text-center">
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-primary text-primary hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-colors"
              >
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Contact us to learn more about this treatment or to schedule a consultation.
                Remember, patients must have a referral to be seen by the specialists at the clinic.
              </p>
              <Button size="lg" asChild>
                <a href="mailto:info@redsandspm.com">Email Us</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PRPDetail;
