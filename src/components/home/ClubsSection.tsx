import { useState, useEffect } from "react";
import { Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

// Mock featured clubs data as fallback
const featuredClubs = [
  {
    id: "1",
    name: "Computer Science Club",
    description: "Building the future through code. Weekly hackathons, tech talks, and career prep.",
    members: 284,
    category: "Technology",
    upcomingEvents: 3,
    logo_url: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    owner_id: "",
    created_at: ""
  },
  {
    id: "2",
    name: "Photography Society", 
    description: "Capture moments that matter. Photo walks, workshops, and exhibitions.",
    members: 156,
    category: "Arts",
    upcomingEvents: 2,
    logo_url: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    owner_id: "",
    created_at: ""
  },
  {
    id: "3",
    name: "Debate Team",
    description: "Sharpen your argumentation skills. Compete in tournaments and improve public speaking.",
    members: 89,
    category: "Academic",
    upcomingEvents: 4,
    logo_url: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    owner_id: "",
    created_at: ""
  },
  {
    id: "4",
    name: "Hiking Club",
    description: "Explore the great outdoors. Weekend trips, nature photography, and outdoor adventures.",
    members: 203,
    category: "Outdoor",
    upcomingEvents: 1,
    logo_url: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    owner_id: "",
    created_at: ""
  }
];

const ClubsSection = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const { data: clubsData, error } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching clubs:', error);
        setClubs(featuredClubs);
      } else {
        const transformedClubs = clubsData?.map(club => ({
          ...club,
          category: club.club_type === 'other' ? (club.custom_type || 'Other') : club.club_type,
          members: Math.floor(Math.random() * 300), // Mock data for now
          upcomingEvents: Math.floor(Math.random() * 5) // Mock data for now
        })) || [];
        
        const allClubs = [...transformedClubs, ...featuredClubs];
        setClubs(allClubs.slice(0, 4)); // Show only first 4 clubs
      }
    } catch (error) {
      console.error('Error:', error);
      setClubs(featuredClubs);
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

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading clubs...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Popular Clubs</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Join communities that match your interests and make lasting connections
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {clubs.map((club) => (
            <Card key={club.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {club.logo_url ? (
                      <img 
                        src={club.logo_url} 
                        alt={club.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <Badge className={getCategoryColor(club.category)} variant="secondary">
                    {club.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{club.name}</CardTitle>
                <CardDescription className="text-sm">
                  {club.members} members
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <p className="text-muted-foreground mb-4 text-sm line-clamp-3 flex-grow">
                  {club.description || "No description available"}
                </p>
                
                <div className="flex items-center justify-center mb-4 text-sm">
                  <span className="text-muted-foreground">
                    {club.upcomingEvents} upcoming events
                  </span>
                </div>

                <Link to={`/club/${club.id}`} className="mt-auto">
                  <Button variant="outline" size="sm" className="w-full">
                    View Club
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/clubs">
            <Button size="lg" variant="outline">
              Browse All Clubs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ClubsSection;