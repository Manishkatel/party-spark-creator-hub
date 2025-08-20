import { Users, ArrowRight, Star, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useState } from "react";

// Mock featured clubs data
const featuredClubs = [
  {
    id: "1",
    name: "Computer Science Club",
    description: "Building the future through code. Weekly hackathons, tech talks, and career prep.",
    members: 284,
    category: "Technology",
    rating: 4.8,
    upcomingEvents: 3
  },
  {
    id: "2",
    name: "Photography Society", 
    description: "Capture moments that matter. Photo walks, workshops, and exhibitions.",
    members: 156,
    category: "Arts",
    rating: 4.6,
    upcomingEvents: 2
  },
  {
    id: "3",
    name: "Debate Team",
    description: "Sharpen your argumentation skills. Compete in tournaments and improve public speaking.",
    members: 89,
    category: "Academic",
    rating: 4.9,
    upcomingEvents: 4
  },
  {
    id: "4",
    name: "Hiking Club",
    description: "Explore the great outdoors. Weekend trips, nature photography, and outdoor adventures.",
    members: 203,
    category: "Outdoor",
    rating: 4.7,
    upcomingEvents: 1
  }
];

const ClubsSection = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [ratingFilter, setRatingFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Rating");

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Arts': 'bg-purple-100 text-purple-800', 
      'Academic': 'bg-green-100 text-green-800',
      'Outdoor': 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredAndSortedClubs = featuredClubs
    .filter(club => {
      if (categoryFilter !== "All" && club.category !== categoryFilter) return false;
      if (ratingFilter === "4.5+" && club.rating < 4.5) return false;
      if (ratingFilter === "4.0+" && club.rating < 4.0) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Rating":
          return b.rating - a.rating;
        case "Members":
          return b.members - a.members;
        case "Events":
          return b.upcomingEvents - a.upcomingEvents;
        default:
          return 0;
      }
    });

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Popular Clubs</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Join communities that match your interests and make lasting connections
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
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

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Ratings</SelectItem>
              <SelectItem value="4.5+">4.5+ Stars</SelectItem>
              <SelectItem value="4.0+">4.0+ Stars</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rating">Sort by Rating</SelectItem>
              <SelectItem value="Members">Sort by Members</SelectItem>
              <SelectItem value="Events">Sort by Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {filteredAndSortedClubs.map((club) => (
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
                
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{club.rating}</span>
                  </div>
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