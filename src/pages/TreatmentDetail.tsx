import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Treatment {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  pdf_url: string | null;
  image_url: string | null;
}

const TreatmentDetail = () => {
  const { slug } = useParams();
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [loading, setLoading] = useState(true);

  const handleDownloadPDF = async (pdfUrl: string) => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfUrl.split('/').pop() || 'treatment-information.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (slug) {
      fetchTreatment();
    }
  }, [slug]);

  const fetchTreatment = async () => {
    const { data, error } = await supabase
      .from("treatments")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!error && data) {
      setTreatment(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading treatment information...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4">Treatment Not Found</h1>
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
              <h1 className="mb-4">{treatment.title}</h1>
              <p className="text-xl text-muted-foreground">
                {treatment.description}
              </p>
            </div>
          </div>
        </section>

        {/* Content Section with Image and Details Side by Side */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-[600px_1fr] gap-12">
                {/* Image Column */}
                {treatment.image_url && (
                  <div className="lg:sticky lg:top-24 self-start">
                    <img
                      src={treatment.image_url}
                      alt={treatment.title}
                      className="w-full max-w-[600px] rounded-lg shadow-2xl border-2 border-primary/10"
                    />
                  </div>
                )}

                {/* Content Column */}
                <div className={!treatment.image_url ? 'md:col-span-2' : ''}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Treatment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-lg max-w-none 
                          prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6 
                          prose-headings:text-foreground prose-headings:font-semibold prose-headings:mb-4 prose-headings:mt-8 first:prose-headings:mt-0
                          prose-strong:text-foreground prose-strong:font-semibold
                          prose-em:text-foreground prose-em:italic
                          prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                          prose-ul:space-y-3 prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                          prose-ol:space-y-3 prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                          prose-li:text-foreground prose-li:leading-relaxed prose-li:pl-2
                          prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic prose-blockquote:pl-6 prose-blockquote:my-6
                          prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded
                          prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-6
                          [&>p:empty]:my-4"
                        dangerouslySetInnerHTML={{ __html: treatment.content }}
                      />
                    </CardContent>
                  </Card>

                  {/* Download PDF Section */}
                  {treatment.pdf_url && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Patient Information Document</CardTitle>
                      </CardHeader>
                      <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Download our comprehensive patient information guide for detailed information about this treatment.
                      </p>
                      <Button 
                        onClick={() => handleDownloadPDF(treatment.pdf_url!)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
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

export default TreatmentDetail;
