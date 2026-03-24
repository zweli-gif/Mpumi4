import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, MapPin, Target, Heart, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  
  const [formData, setFormData] = useState({
    birthplace: "",
    lifePurpose: "",
    personalGoal: "",
    skillMastering: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfileMutation = trpc.users.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Welcome to Growth Farm!");
      // Use window.location for a hard redirect to ensure state is refreshed
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save profile");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    updateProfileMutation.mutate({
      birthplace: formData.birthplace,
      lifePurpose: formData.lifePurpose,
      personalGoal: formData.personalGoal,
      skillMastering: formData.skillMastering,
    });
  };



  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Welcome to Growth <span className="text-pink-500">F</span>arm, {user?.name?.split(" ")[0] || "Team Member"}!
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Let's get to know you better. This helps your team understand who you are beyond work.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="birthplace" className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-pink-500" />
                Where were you born?
              </Label>
              <Input
                id="birthplace"
                placeholder="e.g., Johannesburg, South Africa"
                value={formData.birthplace}
                onChange={(e) => setFormData({ ...formData, birthplace: e.target.value })}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifePurpose" className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4 text-pink-500" />
                What is your life purpose?
              </Label>
              <Textarea
                id="lifePurpose"
                placeholder="What drives you? What legacy do you want to leave?"
                value={formData.lifePurpose}
                onChange={(e) => setFormData({ ...formData, lifePurpose: e.target.value })}
                rows={3}
                className="text-base resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalGoal" className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-pink-500" />
                What is your personal goal for this year?
              </Label>
              <Textarea
                id="personalGoal"
                placeholder="What do you want to achieve personally in 2026?"
                value={formData.personalGoal}
                onChange={(e) => setFormData({ ...formData, personalGoal: e.target.value })}
                rows={2}
                className="text-base resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillMastering" className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-pink-500" />
                What skill are you currently mastering?
              </Label>
              <Input
                id="skillMastering"
                placeholder="e.g., Public speaking, Data analysis, Leadership"
                value={formData.skillMastering}
                onChange={(e) => setFormData({ ...formData, skillMastering: e.target.value })}
                className="text-base"
              />
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-xs bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Let's Go!"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
