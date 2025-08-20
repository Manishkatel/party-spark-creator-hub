import { Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Mock featured clubs data
const featuredClubs = [
  {
    id: "1",
    name: "Computer Science Club",
    description: "Building the future through code. Weekly hackathons, tech talks, and career prep.",
    members: 284,
    category: "Technology",
    upcomingEvents: 3
  },
  {
    id: "2",
    name: "Photography Society", 
    description: "Capture moments that matter. Photo walks, workshops, and exhibitions.",
    members: 156,
    category: "Arts",
    upcomingEvents: 2
  },
  {
    id: "3",
    name: "Debate Team",
    description: "Sharpen your argumentation skills. Compete in tournaments and improve public speaking.",
    members: 89,
    category: "Academic",
    upcomingEvents: 4
  },
  {
    id: "4",
    name: "Hiking Club",
    description: "Explore the great outdoors. Weekend trips, nature photography, and outdoor adventures.",
    members: 203,
    category: "Outdoor",
    upcomingEvents: 1
  }
];

const ClubsSection = () => {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Arts': 'bg-purple-100 text-purple-800', 
      'Academic': 'bg-green-100 text-green-800',
      'Outdoor': 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

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
          {featuredClubs.map((club) => (
            <Card key={club.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
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
                  {club.description}
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