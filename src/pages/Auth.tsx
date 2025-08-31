import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { ProfilePictureUpload } from "@/components/auth/ProfilePictureUpload";
import { InterestsSelection } from "@/components/auth/InterestsSelection";
import { ClubDetailsForm } from "@/components/auth/ClubDetailsForm";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"regular" | "club">("regular");
  const [signinRole, setSigninRole] = useState<"regular" | "club">("regular");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  
  // Multi-step signup states
  const [signupStep, setSignupStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  
  // Club details states
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [clubType, setClubType] = useState("");
  const [customType, setCustomType] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user is signed in, redirect to home
        if (session?.user) {
          navigate('/');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleBasicSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    // Move to next step
    setSignupStep(2);
  };

  const handleCompleteSignup = async () => {
    // Validate required fields for club users
    if (role === "club" && (!clubName || !clubDescription || !clubType || !contactEmail)) {
      toast({
        title: "Error",
        description: "Please fill in all required club details",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Clean up existing state
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            interests: role === "regular" ? interests : [],
            club_name: role === "club" ? clubName : "",
            club_description: role === "club" ? clubDescription : "",
            club_type: role === "club" ? clubType : "",
            custom_type: role === "club" ? customType : "",
            contact_email: role === "club" ? contactEmail : "",
            contact_phone: role === "club" ? contactPhone : "",
            website: role === "club" ? website : ""
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create club record if club user
        if (role === "club") {
          const { error: clubError } = await supabase
            .from('clubs')
            .insert({
              name: clubName,
              description: clubDescription,
              club_type: clubType === 'other' ? 'other' : clubType,
              custom_type: clubType === 'other' ? customType : null,
              contact_email: contactEmail,
              contact_phone: contactPhone || null,
              website: website || null,
              owner_id: data.user.id
            });

          if (clubError) {
            console.error("Error creating club:", clubError);
          }
        }

        toast({
          title: "Success!",
          description: "Account created successfully! Welcome aboard!",
        });
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
          navigate(role === "club" ? "/club-dashboard" : "/");
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setSignupStep(1);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up existing state
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if the user's role matches the selected signin role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (profile && profile.role !== signinRole) {
          toast({
            title: "Wrong Account Type",
            description: `This account is registered as a ${profile.role} user. Please select the correct account type.`,
            variant: "destructive",
          });
          
          // Sign out the user since role doesn't match
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        toast({
          title: "Success!",
          description: "Signed in successfully!",
        });
        // Navigation will be handled by auth state change
      }
    } catch (error: any) {
      let errorMessage = "Failed to sign in";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Event Platform</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showSigninPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowSigninPassword(!showSigninPassword)}
                    >
                      {showSigninPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <RadioGroup value={signinRole} onValueChange={(value) => setSigninRole(value as "regular" | "club")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="signin-regular" />
                      <Label htmlFor="signin-regular" className="cursor-pointer">
                        <div className="font-medium">Regular User</div>
                        <div className="text-sm text-muted-foreground">Join events and discover clubs</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="club" id="signin-club" />
                      <Label htmlFor="signin-club" className="cursor-pointer">
                        <div className="font-medium">Club/Organization</div>
                        <div className="text-sm text-muted-foreground">Create and manage events for your club</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              {signupStep === 1 && (
                <form onSubmit={handleBasicSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Minimum 6 characters"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Re-enter your password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Account Type</Label>
                    <RadioGroup value={role} onValueChange={(value) => setRole(value as "regular" | "club")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="regular" id="regular" />
                        <Label htmlFor="regular" className="cursor-pointer">
                          <div className="font-medium">Regular User</div>
                          <div className="text-sm text-muted-foreground">Join events and discover clubs</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="club" id="club" />
                        <Label htmlFor="club" className="cursor-pointer">
                          <div className="font-medium">Club/Organization</div>
                          <div className="text-sm text-muted-foreground">Create and manage events for your club</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <ProfilePictureUpload 
                    onImageChange={setProfilePicture} 
                    fullName={fullName}
                  />
                  
                  <Button type="submit" className="w-full">
                    Continue
                  </Button>
                </form>
              )}

              {signupStep === 2 && (
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToStep1}
                    className="mb-4 p-0 h-auto"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  {role === "regular" ? (
                    <InterestsSelection
                      selectedInterests={interests}
                      onInterestsChange={setInterests}
                    />
                  ) : (
                    <ClubDetailsForm
                      clubName={clubName}
                      setClubName={setClubName}
                      description={clubDescription}
                      setDescription={setClubDescription}
                      clubType={clubType}
                      setClubType={setClubType}
                      customType={customType}
                      setCustomType={setCustomType}
                      contactEmail={contactEmail}
                      setContactEmail={setContactEmail}
                      contactPhone={contactPhone}
                      setContactPhone={setContactPhone}
                      website={website}
                      setWebsite={setWebsite}
                    />
                  )}

                  <Button 
                    onClick={handleCompleteSignup} 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Complete Sign Up"}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;