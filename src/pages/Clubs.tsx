import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface Club {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  owner_id: string;
  created_at: string;
}

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    fetchClubs();

    return () => subscription.unsubscribe();
  }, []);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClubs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load clubs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto pt-8 pb-16">
          <div className="text-center">Loading clubs...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pt-8 pb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text">Clubs & Organizations</h1>
            <p className="text-muted-foreground mt-2">
              Discover clubs and organizations creating amazing events
            </p>
          </div>
          {user && (
            <Button onClick={() => window.location.href = "/club/create"}>
              <Plus className="w-4 h-4 mr-2" />
              Create Club
            </Button>
          )}
        </div>

        {clubs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Clubs Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a club and start organizing events!
              </p>
              {user && (
                <Button onClick={() => window.location.href = "/club/create"}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Club
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <Card key={club.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {club.logo_url ? (
                      <img 
                        src={club.logo_url} 
                        alt={club.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{club.name}</CardTitle>
                      <CardDescription className="text-sm">
                        Since {new Date(club.created_at).getFullYear()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {club.description || "No description available"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {club.website && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={club.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = `/club/${club.id}/events`}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Events
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clubs;