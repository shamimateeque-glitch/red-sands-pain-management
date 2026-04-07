import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, ArrowLeft } from "lucide-react";
import TreatmentsList from "@/components/admin/TreatmentsList";
import TreatmentForm from "@/components/admin/TreatmentForm";
import BatchIconGenerator from "@/components/admin/BatchIconGenerator";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBatchGenerator, setShowBatchGenerator] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
          <h1 className="text-2xl font-bold">Treatment Management</h1>
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
      </main>
    </div>
  );
};

export default Admin;
