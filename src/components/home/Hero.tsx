import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to events page with search query
    window.location.href = `/events?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
            <span className="block">Discover University</span>
            <span className="block mt-2 gradient-text">Events & Clubs</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto text-xl text-muted-foreground sm:max-w-3xl">
            Find exciting events, join clubs, and connect with fellow students. 
            Never miss out on what's happening on campus.
          </p>
          
          {/* Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search events, clubs, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-full border-2 border-border focus:border-primary"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6"
              >
                Search
              </Button>
            </form>
          </div>

          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-3 sm:gap-5">
              <Link to="/events">
                <Button size="lg" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Browse Events
                </Button>
              </Link>
              <Link to="/clubs">
                <Button variant="outline" size="lg" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  View Clubs
                </Button>
              </Link>
              <Link to="/create">
                <Button variant="secondary" size="lg" className="w-full">
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;