import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Download, ExternalLink } from "lucide-react";
import * as Icons from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PrivatePayService {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  pdf_url: string | null;
  pdf_url_2: string | null;
  pdf_label: string | null;
  pdf_label_2: string | null;
  image_url: string | null;
  external_url: string | null;
  icon_svg_url: string | null;
  icon_background: string | null;
  content: string | null;
  display_order: number | null;
}

const PrivatePaySection = () => {
  const [services, setServices] = useState<PrivatePayService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('private-pay-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'treatments'
        },
        () => {
          fetchServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("treatments")
      .select("*")
      .eq("service_type", "private_pay")
      .order("display_order", { ascending: true })
      .order("title", { ascending: true });

    if (!error && data) {
      setServices(data as PrivatePayService[]);
    }
    setLoading(false);
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return <Icons.Activity className="h-6 w-6" />;
    const Icon = (Icons as any)[iconName] || Icons.Activity;
    return <Icon className="h-6 w-6" />;
  };

  const handleDownloadPDF = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = url.split("/").pop() || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (loading) {
    return (
      <section id="private-pay" className="pt-2 pb-20 pattern-bg">
        <div className="container mx-auto px-4 text-center">
          <p>Loading services...</p>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <section id="private-pay" className="pt-2 pb-20 pattern-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 mt-[15px]">
          <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-4" />
          <h2 className="mb-4 text-maroon">View Our Private Pay Services</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The following specialized treatments are available as private pay services and are not covered by provincial insurance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {services.map((service) => (
            <Card
              key={service.id}
              className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-primary bg-[#f5f5f0] shrink-0">
                    {service.icon_svg_url ? (
                      <img src={service.icon_svg_url} alt="" className="h-6 w-6" />
                    ) : (
                      getIcon(service.icon)
                    )}
                  </div>
                  <CardTitle className="text-xl text-maroon">{service.title}</CardTitle>
                </div>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.slug && service.content && (
                    <Button
                      variant="ghost"
                      asChild
                      className="group transition-all hover:bg-secondary hover:text-white"
                    >
                      <Link to={`/treatment/${service.slug}`} className="flex items-center gap-2">
                        Learn More
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  )}
                  {service.pdf_url && (
                    <Button
                      onClick={() => handleDownloadPDF(service.pdf_url!)}
                      className="group transition-all hover:bg-secondary hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        {service.pdf_label || "Download PDF"}
                        <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                      </span>
                    </Button>
                  )}
                  {service.pdf_url_2 && (
                    <Button
                      onClick={() => handleDownloadPDF(service.pdf_url_2!)}
                      className="group transition-all hover:bg-secondary hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        {service.pdf_label_2 || "Download PDF"}
                        <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                      </span>
                    </Button>
                  )}
                  {service.external_url && (
                    <Button
                      asChild
                      className="group transition-all hover:bg-secondary hover:text-white"
                    >
                      <a
                        href={service.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Visit Website
                        <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrivatePaySection;
