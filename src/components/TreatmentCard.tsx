import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";

interface TreatmentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  slug: string;
  pdfUrl?: string;
  imageUrl?: string;
  iconBackground?: string;
  iconSvgUrl?: string;
}

const TreatmentCard = ({ title, description, icon, slug, pdfUrl, iconSvgUrl, iconBackground }: TreatmentCardProps) => {
  const handleDownloadPDF = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = url.split('/').pop() || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-primary shrink-0"
            style={{
              backgroundColor: iconBackground && iconBackground !== 'white'
                ? (iconBackground === 'transparent' ? 'transparent' : iconBackground)
                : '#f5f5f0'
            }}
          >
            {iconSvgUrl ? (
              <img src={iconSvgUrl} alt={`${title} icon`} className="w-8 h-8 object-contain" />
            ) : (
              icon
            )}
          </div>
          <CardTitle className="text-xl text-maroon">{title}</CardTitle>
        </div>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="ghost" asChild className="group flex-1 transition-all hover:bg-secondary hover:text-white">
            <Link to={`/treatment/${slug}`} className="flex items-center gap-2">
              Learn More
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          {pdfUrl && (
            <Button
              onClick={() => handleDownloadPDF(pdfUrl)}
              className="group flex-1 transition-all hover:bg-secondary hover:text-white"
            >
              <span className="flex items-center gap-2">
                Download PDF
                <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
              </span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TreatmentCard;
