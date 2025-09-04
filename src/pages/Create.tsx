
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EventForm from "@/components/events/EventForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Create = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Get pre-selected club from navigation state
  const selectedClubId = location.state?.selectedClubId;

  useEffect(() => {
    checkAuthAndFetchClubs();
  }, []);

  const checkAuthAndFetchClubs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (!profile || profile.role !== 'club') {
      toast({
        title: "Access Denied",
        description: "Only club accounts can create events.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    setUser({ ...user, ...profile });

    // Fetch user's clubs
    const { data: clubsData } = await supabase
      .from('clubs')
      .select('*')
      .eq('owner_id', user.id);
    
    setClubs(clubsData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto pt-8">
          <Card>
            <CardContent className="text-center py-12">
              <p>Loading...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'club') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto pt-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Only club accounts can create events. Please sign in with a club account or create one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Return to Home
              </Button>
              <Button onClick={() => navigate('/club/create')} className="w-full">
                Create Club Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (clubs.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto pt-8">
          <Card>
            <CardHeader>
              <CardTitle>No Clubs Found</CardTitle>
              <CardDescription>
                You need to create a club before you can create events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => navigate('/club/create')} className="w-full">
                Create Your First Club
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pt-8 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Create New Event</h1>
          <p className="text-xl text-muted-foreground">
            Fill out the details for your event below
          </p>
        </div>
        
        <EventForm clubs={clubs} user={user} />
      </div>
    </Layout>
  );
};

export default Create;
