import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Calendar, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  category: string;
  members: number;
  
  upcomingEvents: number;
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
    created_at: "2024-01-15T10:00:00Z",
    category: "Technology",
    members: 284,
    
    upcomingEvents: 3
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
    created_at: "2024-02-10T14:30:00Z",
    category: "Arts",
    members: 156,
    
    upcomingEvents: 2
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
    created_at: "2024-03-05T09:15:00Z",
    category: "Outdoor",
    members: 203,
    
    upcomingEvents: 1
  },
  {
    id: "4",
    name: "Academic Excellence Club",
    description: "Dedicated to promoting academic achievement and providing study groups, tutoring, and academic support to all students.",
    logo_url: "",
    contact_email: "info@academicexcellence.edu",
    contact_phone: "+1 (555) 234-5678",
    website: "https://academicexcellence.edu",
    owner_id: "user4",
    created_at: "2024-01-20T11:00:00Z",
    category: "Academic",
    members: 89,
    
    upcomingEvents: 4
  }
];

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Rating");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchClubs();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setProfile(profileData);
    }
  };

  const fetchClubs = async () => {
    try {
      const { data: clubsData, error } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clubs:', error);
        // Fall back to mock data if there's an error
        setClubs(mockClubs);
      } else {
        // Transform data to match Club interface
        const transformedClubs = clubsData?.map(club => ({
          ...club,
          category: club.club_type === 'other' ? (club.custom_type || 'Other') : club.club_type,
          members: 0, // You can add a query to count members later
          upcomingEvents: 0 // You can add a query to count upcoming events later
        })) || [];
        
        setClubs([...transformedClubs, ...mockClubs]);
      }
    } catch (error) {
      console.error('Error:', error);
      setClubs(mockClubs);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Arts': 'bg-purple-100 text-purple-800', 
      'Academic': 'bg-green-100 text-green-800',
      'Outdoor': 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredAndSortedClubs = clubs
    .filter(club => {
      if (categoryFilter !== "All" && club.category !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Members":
          return b.members - a.members;
        case "Events":
          return b.upcomingEvents - a.upcomingEvents;
        default:
          return 0;
      }
    });

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
          {user && profile?.role === 'club' && (
            <Button onClick={() => navigate("/club/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Club
            </Button>
          )}
          {user && profile?.role !== 'club' && (
            <Button 
              variant="outline" 
              onClick={() => {
                toast({
                  title: "Access Restricted",
                  description: "Only club accounts can create clubs. Please sign in with a club account.",
                  variant: "destructive",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Club
            </Button>
          )}
          {!user && (
            <Button onClick={() => navigate("/auth")}>
              <Plus className="w-4 h-4 mr-2" />
              Sign In to Create Club
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Arts">Arts</SelectItem>
              <SelectItem value="Academic">Academic</SelectItem>
              <SelectItem value="Outdoor">Outdoor</SelectItem>
            </SelectContent>
          </Select>


          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Members">Sort by Members</SelectItem>
              <SelectItem value="Events">Sort by Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredAndSortedClubs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Clubs Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a club and start organizing events!
              </p>
              {user && profile?.role === 'club' && (
                <Button onClick={() => navigate("/club/create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Club
                </Button>
              )}
              {!user && (
                <Button onClick={() => navigate("/auth")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Sign In to Create Club
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedClubs.map((club) => (
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
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{club.name}</CardTitle>
                        <Badge className={getCategoryColor(club.category)} variant="secondary">
                          {club.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {club.members} members • Since {new Date(club.created_at).getFullYear()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {club.description || "No description available"}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-muted-foreground">
                      {club.upcomingEvents} upcoming events
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/club/${club.id}`)}
                      className="w-full"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      View Club
                    </Button>
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