import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

// Mock clubs data
const mockClubs: Club[] = [
  {
    id: "1",
    name: "Tech Innovators Club",
    description: "A community of technology enthusiasts and innovators working on cutting-edge projects and sharing knowledge about the latest tech trends.",
    logo_url: "",
    contact_email: "contact@techinnovators.com",
    contact_phone: "+1 (555) 123-4567",
    website: "https://techinnovators.com",
    owner_id: "user1",
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    name: "Creative Arts Society",
    description: "Bringing together artists, designers, and creative minds to collaborate on artistic projects and showcase local talent.",
    logo_url: "",
    contact_email: "hello@creativeartsoc.org",
    contact_phone: "+1 (555) 987-6543",
    website: "https://creativeartsoc.org",
    owner_id: "user2",
    created_at: "2024-02-10T14:30:00Z"
  },
  {
    id: "3",
    name: "Adventure Seekers",
    description: "For those who love outdoor activities, hiking, camping, and exploring nature. Join us for exciting adventures and outdoor events.",
    logo_url: "",
    contact_email: "adventures@seekers.com",
    contact_phone: "+1 (555) 456-7890",
    website: "https://adventureseekers.com",
    owner_id: "user3",
    created_at: "2024-03-05T09:15:00Z"
  }
];

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Simulate loading clubs
    setTimeout(() => {
      setClubs(mockClubs);
      setLoading(false);
    }, 1000);
  }, []);

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
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "Club events page will be available soon!",
                          });
                        }}
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