import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ClubDetailsForm } from "@/components/auth/ClubDetailsForm";
import { BoardMemberForm, BoardMember } from "@/components/clubs/BoardMemberForm";
import { AchievementForm, Achievement } from "@/components/clubs/AchievementForm";

const ClubCreateMultiStep = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const { toast } = useToast();

  // Club details
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [clubType, setClubType] = useState("");
  const [customType, setCustomType] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [clubLogo, setClubLogo] = useState<File | null>(null);

  // Board members and achievements
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const steps = [
    { id: 1, title: "Club Details", description: "Basic information about your club" },
    { id: 2, title: "Board Members", description: "Add your leadership team" },
    { id: 3, title: "Achievements", description: "Showcase your accomplishments" }
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (!profile || profile.role !== 'club') {
      toast({
        title: "Access Denied",
        description: "Only club accounts can create clubs.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    setUser({ ...user, ...profile });
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!clubName || !description || !clubType || !contactEmail) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
          return false;
        }
        if (clubType === 'other' && !customType) {
          toast({
            title: "Missing Information",
            description: "Please specify the custom club type.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 2:
        const invalidMembers = boardMembers.filter(member => !member.name);
        if (invalidMembers.length > 0) {
          toast({
            title: "Invalid Board Members",
            description: "Please fill in the name for all board members or remove empty ones.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 3:
        const invalidAchievements = achievements.filter(achievement => !achievement.title);
        if (invalidAchievements.length > 0) {
          toast({
            title: "Invalid Achievements",
            description: "Please fill in the title for all achievements or remove empty ones.",
            variant: "destructive",
          });
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const createClub = async () => {
    if (!user || !validateStep()) return;

    setLoading(true);
    
    try {
      // Create club
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .insert({
          name: clubName,
          description: description,
          club_type: (clubType === 'other' ? 'other' : clubType) as 'academic' | 'sports' | 'cultural' | 'technical' | 'social' | 'professional' | 'other',
          custom_type: clubType === 'other' ? customType : null,
          contact_email: contactEmail,
          contact_phone: contactPhone || null,
          website: website || null,
          owner_id: user.user_id
        })
        .select()
        .single();

      if (clubError) throw clubError;

      // Create board members
      if (boardMembers.length > 0) {
        try {
          const boardMemberInserts = boardMembers.map(member => ({
            club_id: clubData.id,
            name: member.name,
            position: member.position || null,
            email: member.email || null,
            year_in_college: member.year_in_college || null,
            joined_date: member.joined_date
          }));

          const { error: boardError } = await (supabase as any)
            .from('board_members')
            .insert(boardMemberInserts);

          if (boardError) console.error("Error creating board members:", boardError);
        } catch (err) {
          console.error("Board members creation failed:", err);
        }
      }

      // Create achievements
      if (achievements.length > 0) {
        try {
          const achievementInserts = achievements.map(achievement => ({
            club_id: clubData.id,
            title: achievement.title,
            description: achievement.description || null,
            date_achieved: achievement.date_achieved || null
          }));

          const { error: achievementError } = await (supabase as any)
            .from('achievements')
            .insert(achievementInserts);

          if (achievementError) console.error("Error creating achievements:", achievementError);
        } catch (err) {
          console.error("Achievements creation failed:", err);
        }
      }

      toast({
        title: "Success!",
        description: "Club created successfully!"
      });
      
      navigate('/clubs');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create club",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  if (!user || user.role !== 'club') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardContent className="text-center py-12">
            <p>Checking permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Create Your Club</CardTitle>
            <CardDescription className="text-center">
              Set up your club profile to start creating and managing events
            </CardDescription>
            <div className="mt-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex justify-center mt-4 space-x-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep > step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : currentStep === step.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <ClubDetailsForm
                clubName={clubName}
                setClubName={setClubName}
                description={description}
                setDescription={setDescription}
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
                clubLogo={clubLogo}
                setClubLogo={setClubLogo}
              />
            )}

            {currentStep === 2 && (
              <BoardMemberForm
                boardMembers={boardMembers}
                setBoardMembers={setBoardMembers}
              />
            )}

            {currentStep === 3 && (
              <AchievementForm
                achievements={achievements}
                setAchievements={setAchievements}
              />
            )}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={createClub} disabled={loading}>
                  {loading ? "Creating Club..." : "Create Club"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClubCreateMultiStep;