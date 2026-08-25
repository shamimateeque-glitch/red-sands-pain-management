import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles, ArrowLeft } from "lucide-react";
import TreatmentsList from "@/components/admin/TreatmentsList";
import TreatmentForm from "@/components/admin/TreatmentForm";
import BatchIconGenerator from "@/components/admin/BatchIconGenerator";
import TeamList from "@/components/admin/TeamList";
import TeamForm from "@/components/admin/TeamForm";
import ReviewsList from "@/components/admin/ReviewsList";
import ReviewForm from "@/components/admin/ReviewForm";
import type { TeamMember } from "@/types/team";
import type { ServiceReview } from "@/types/review";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Treatments section state
  const [showForm, setShowForm] = useState(false);
  const [showBatchGenerator, setShowBatchGenerator] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Team section state
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [teamRefreshKey, setTeamRefreshKey] = useState(0);

  // Reviews section state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ServiceReview | null>(null);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: isAdmin, error } = await supabase
      .rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });

    if (error) {
      console.error("Error checking admin status:", error);
      toast.error("Error checking permissions. Please try again.");
      navigate("/");
      return;
    }

    if (!isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Treatments handlers
  const handleEdit = (treatment: any) => {
    setEditingTreatment(treatment);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTreatment(null);
  };

  const handleSave = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Team handlers
  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowTeamForm(true);
  };

  const handleTeamFormClose = () => {
    setShowTeamForm(false);
    setEditingMember(null);
  };

  const handleTeamSave = () => {
    setTeamRefreshKey((prev) => prev + 1);
  };

  // Review handlers
  const handleEditReview = (review: ServiceReview) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewFormClose = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleReviewSave = () => {
    setReviewRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Site Management</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              View Main Page
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="treatments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="treatments">Treatments</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Treatments */}
          <TabsContent value="treatments">
            {showForm ? (
              <TreatmentForm
                treatment={editingTreatment}
                onClose={handleFormClose}
                onSave={handleSave}
              />
            ) : showBatchGenerator ? (
              <BatchIconGenerator onClose={() => setShowBatchGenerator(false)} />
            ) : (
              <>
                <div className="mb-6 flex gap-2">
                  <Button onClick={() => setShowForm(true)}>
                    Add New Treatment
                  </Button>
                  <Button
                    onClick={() => setShowBatchGenerator(true)}
                    variant="secondary"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Batch Generate Icons
                  </Button>
                </div>
                <TreatmentsList key={refreshKey} onEdit={handleEdit} />
              </>
            )}
          </TabsContent>

          {/* Team */}
          <TabsContent value="team">
            {showTeamForm ? (
              <TeamForm
                member={editingMember}
                onClose={handleTeamFormClose}
                onSave={handleTeamSave}
              />
            ) : (
              <>
                <div className="mb-6 flex gap-2">
                  <Button onClick={() => setShowTeamForm(true)}>
                    Add Team Member
                  </Button>
                </div>
                <TeamList key={teamRefreshKey} onEdit={handleEditMember} />
              </>
            )}
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            {showReviewForm ? (
              <ReviewForm
                review={editingReview}
                onClose={handleReviewFormClose}
                onSave={handleReviewSave}
              />
            ) : (
              <>
                <div className="mb-6 flex gap-2">
                  <Button onClick={() => setShowReviewForm(true)}>
                    Add Review
                  </Button>
                </div>
                <ReviewsList key={reviewRefreshKey} onEdit={handleEditReview} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
