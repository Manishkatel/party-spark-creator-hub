import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Users, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    // Check for user in localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('currentUser');
      setUser(null);
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-usm-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold gradient-text">Golden Eagles Events</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link to="/" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link to="/events" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium">
                Events
              </Link>
              <Link to="/clubs" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Clubs
              </Link>
              {user && (
                <>
                  {user.role === 'club' && (
                    <Link to="/create" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium">
                      Create Event
                    </Link>
                  )}
                  <Link to="/my-events" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium">
                    My Events
                  </Link>
                </>
              )}
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="default" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="text-foreground hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className="text-foreground hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              to="/clubs" 
              className="text-foreground hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="w-4 h-4 mr-2" />
              Clubs
            </Link>
            {user && (
              <>
                {user.role === 'club' && (
                  <Link 
                    to="/create" 
                    className="text-foreground hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Event
                  </Link>
                )}
                <Link 
                  to="/my-events" 
                  className="text-foreground hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Events
                </Link>
                <div className="px-3 py-2 text-sm text-muted-foreground border-t flex items-center justify-between">
                  <span>{user.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-1"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-foreground hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  <LogOut className="w-4 h-4 mr-2 inline" />
                  Sign Out
                </button>
              </>
            )}
            {!user && (
              <div className="pt-2 space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full justify-start"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Dark Mode
                    </>
                  )}
                </Button>
                <Button variant="default" className="w-full" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;