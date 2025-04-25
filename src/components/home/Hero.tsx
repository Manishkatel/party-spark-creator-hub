
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-party-purple/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-party-pink/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
            <span className="block">Create unforgettable</span>
            <span className="block mt-2 gradient-text">events with ease</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto text-xl text-muted-foreground sm:max-w-3xl">
            Design beautiful event pages, manage RSVPs, and connect with your guests.
            The simplest way to bring people together.
          </p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <Link to="/create">
                <Button size="lg" className="w-full">
                  Create Event
                </Button>
              </Link>
              <Link to="/templates">
                <Button variant="outline" size="lg" className="w-full">
                  Browse Templates
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
