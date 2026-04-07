import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CorticosteroidRisks = () => {
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
              <h1 className="mb-4">Risks of Corticosteroid Injections</h1>
              <p className="text-xl text-muted-foreground">
                Important information about the risks associated with repeated Cortisone injections.
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
                      Cortisone has an established role in Chronic Pain Management. This medicine is injected under ultrasound or X-ray guidance in your joints or around your spinal cord and nerves to reduce pain and treat the underlying causes.
                    </p>
                    <p>
                      Excessive or repeated Cortisone injections have many unwanted side effects, especially if you are Diabetic or immunocompromised.
                    </p>
                    <p>
                      Please see the leaflet below for additional information on the Risks associated with repeated Cortisone injections.
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
                    Please see the leaflet here for additional information on the Risks associated with repeated Cortisone injections.
                  </p>
                  <Button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = "/documents/RSPM - Patient Information - Risks of Repeated Corticosteoids (updated).pdf";
                      link.download = "RSPM - Patient Information - Risks of Repeated Corticosteoids (updated).pdf";
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
                Contact us to learn more or to schedule a consultation.
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

export default CorticosteroidRisks;
