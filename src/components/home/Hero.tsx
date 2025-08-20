import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SearchAndFilter from "./SearchAndFilter";

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-usm-gold/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-usm-gold-light/20 rounded-full blur-3xl" />
      
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              <span className="block text-usm-black">Discover University</span>
              <span className="block mt-2 gradient-text">Events & Clubs</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-muted-foreground sm:max-w-3xl">
              Find exciting events, join clubs, and connect with fellow Golden Eagles. 
              Never miss out on what's happening at USM.
            </p>
          
          {/* Enhanced Search and Filter */}
          <div className="mt-10">
            <SearchAndFilter />
          </div>

          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;