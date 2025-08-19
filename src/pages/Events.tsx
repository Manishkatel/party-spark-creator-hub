import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  club: string;
  attendees: number;
  price: number;
  category: string;
}

// Mock events data - in a real app this would come from API
const allMockEvents: Event[] = [
  {
    id: "1",
    title: "Tech Career Fair 2024",
    description: "Meet top tech companies and discover internship opportunities. Network with recruiters from Google, Microsoft, and more.",
    date: "2024-03-15T14:00:00Z",
    location: "Engineering Building, Hall A",
    club: "Computer Science Club",
    attendees: 234,
    price: 0,
    category: "Career"
  },
  {
    id: "2",
    title: "Spring Music Festival",
    description: "Live performances by student bands and local artists. Food trucks, games, and good vibes all day long.",
    date: "2024-03-20T18:00:00Z",
    location: "Campus Quad",
    club: "Music Society",
    attendees: 156,
    price: 15,
    category: "Entertainment"
  },
  {
    id: "3",
    title: "Research Symposium",
    description: "Student research presentations across all disciplines. Showcase your work and learn from peers.",
    date: "2024-03-18T09:00:00Z",
    location: "Academic Center",
    club: "Graduate Student Association",
    attendees: 89,
    price: 0,
    category: "Academic"
  },
  {
    id: "4",
    title: "Sustainability Workshop",
    description: "Learn practical tips for sustainable living on campus. DIY projects and eco-friendly initiatives.",
    date: "2024-03-22T15:30:00Z",
    location: "Environmental Science Building",
    club: "Green Campus Initiative",
    attendees: 67,
    price: 5,
    category: "Workshop"
  },
  {
    id: "5",
    title: "Basketball Tournament",
    description: "Inter-department basketball championship. Cheer for your department and enjoy the competition.",
    date: "2024-03-25T16:00:00Z",
    location: "Sports Complex",
    club: "Athletic Department",
    attendees: 312,
    price: 0,
    category: "Sports"
  },
  {
    id: "6",
    title: "Art Gallery Opening",
    description: "Showcase of student artwork from this semester. Wine, cheese, and creative conversations.",
    date: "2024-03-28T19:00:00Z",
    location: "Arts Building Gallery",
    club: "Art Students Union",
    attendees: 94,
    price: 10,
    category: "Arts"
  }
];

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get search query from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }

    // Simulate loading
    setTimeout(() => {
      setEvents(allMockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.club.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || event.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Career': 'bg-blue-100 text-blue-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Academic': 'bg-green-100 text-green-800',
      'Workshop': 'bg-orange-100 text-orange-800',
      'Sports': 'bg-red-100 text-red-800',
      'Arts': 'bg-pink-100 text-pink-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto pt-8 pb-16">
          <div className="text-center">Loading events...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pt-8 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">University Events</h1>
          <p className="text-muted-foreground mb-6">
            Discover and join exciting events happening on campus
          </p>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events, clubs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new events.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCategoryColor(event.category)} variant="secondary">
                      {event.category}
                    </Badge>
                    {event.price === 0 ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        FREE
                      </Badge>
                    ) : (
                      <Badge variant="outline">${event.price}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="text-sm">
                    by {event.club}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm line-clamp-3">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {event.attendees} interested
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Details
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => {
                      toast({
                        title: "Interest Registered!",
                        description: `You're now interested in "${event.title}"`,
                      });
                    }}>
                      Join Event
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

export default Events;