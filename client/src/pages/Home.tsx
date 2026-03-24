import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Home as HomeIcon, TrendingUp, Users, Target, PartyPopper, Plus, Check, Clock, AlertCircle, Loader2, ArrowRight, Heart, Sprout, Rocket, Shield, Compass, MessageSquare, Save, Calendar, CalendarDays, Settings, LayoutDashboard, Cog } from "lucide-react";
import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { toast } from "sonner";
import { Link } from "wouter";
import AppHeader from "@/components/AppHeader";

// Strategic Objective Icons Component - used at end of activity names
const StrategicObjectiveIcon = ({ objective, size = "sm" }: { objective?: string; size?: "sm" | "md" }) => {
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const iconMap: Record<string, { icon: React.ReactNode; color: string; abbrev: string }> = {
    "Community Growth": { icon: <Users className={sizeClass} />, color: "text-green-600 bg-green-100", abbrev: "CG" },
    "Impact Delivery": { icon: <Target className={sizeClass} />, color: "text-blue-600 bg-blue-100", abbrev: "ID" },
    "New Frontiers": { icon: <Rocket className={sizeClass} />, color: "text-purple-600 bg-purple-100", abbrev: "NF" },
    "Stewardship": { icon: <Shield className={sizeClass} />, color: "text-amber-600 bg-amber-100", abbrev: "ST" },
    "Purpose & Platform": { icon: <Compass className={sizeClass} />, color: "text-rose-600 bg-rose-100", abbrev: "PP" },
  };
  
  if (!objective) return null;
  
  const config = iconMap[objective] || { icon: <Sprout className={sizeClass} />, color: "text-gray-600 bg-gray-100", abbrev: "?" };
  
  return (
    <span 
      className={`inline-flex items-center justify-center rounded px-1 py-0.5 ${config.color}`} 
      title={objective}
    >
      {config.icon}
    </span>
  );
};

// Helper to get wellbeing word based on health score (replaces emojis)
function getWellbeingWord(score: number | null | undefined): string {
  if (!score) return "Steady";
  if (score >= 80) return "Thriving";
  if (score >= 60) return "Steady";
  return "Struggling";
}

// Helper to get wellbeing word color class
function getWellbeingColor(score: number | null | undefined): string {
  if (!score) return "text-yellow-600";
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

// Helper to get health color class
function getHealthColor(score: number | null | undefined): string {
  if (!score) return "text-muted-foreground";
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

// Helper to get initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Mock data for celebrator reactions (in real app, this would come from DB)
const getCelebratorEmojis = (celebrationId: number): string[] => {
  const reactions: Record<number, string[]> = {
    1: ["🎉", "❤️", "🙌"],
    2: ["🔥", "💪", "🎊"],
    3: ["🚀", "⭐", "👏"],
    4: ["🏆", "🎯", "💯"],
  };
  return reactions[celebrationId] || ["👏", "🎉"];
};

// Helper to format user name (fallback if name is missing)
const formatUserName = (name: string | null | undefined): string => {
  return name || "Team Member";
};

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false);
  const [celebrationDialogOpen, setCelebrationDialogOpen] = useState(false);
  const [checkinScore, setCheckinScore] = useState(75);
  const [checkinMood, setCheckinMood] = useState<"happy" | "neutral" | "sad">("happy");
  const [checkinEnergy, setCheckinEnergy] = useState<"High" | "Med" | "Low">("Med");
  const [checkinNotes, setCheckinNotes] = useState("");
  const [lowWellbeingDialogOpen, setLowWellbeingDialogOpen] = useState(false);

  const [celebrationTitle, setCelebrationTitle] = useState("");
  const [celebrationDescription, setCelebrationDescription] = useState("");
  const [celebrationCategory, setCelebrationCategory] = useState<"deal" | "birthday" | "milestone" | "project" | "personal">("milestone");
  const [celebrationIcon, setCelebrationIcon] = useState("🎉");
  
  // CEO Reflection state
  const [ceoReflectionDialogOpen, setCeoReflectionDialogOpen] = useState(false);
  const [ceoReflectionContent, setCeoReflectionContent] = useState("");

  const utils = trpc.useUtils();

  // Get current week number (ISO week) - use useMemo to stabilize
  const { currentWeekNum, currentYear } = useMemo(() => {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { currentWeekNum: weekNum, currentYear: now.getFullYear() };
  }, []);

  // Queries
  const { data: teamHealth, isLoading: teamHealthLoading } = trpc.health.getTeamOverview.useQuery();
  const { data: weeklyPriorities } = trpc.weeklyActivities.getPriorities.useQuery({ weekNumber: currentWeekNum, year: currentYear });
  const { data: celebrations, isLoading: celebrationsLoading } = trpc.celebrations.getRecent.useQuery({ limit: 10 });
  const { data: ceoReflection, isLoading: ceoReflectionLoading } = trpc.ceoReflections.getCurrentWeek.useQuery();
  const { data: annualGoals } = trpc.goals.getAnnual.useQuery({ year: currentYear });

  // Mutations
  const submitCheckin = trpc.health.submitCheckin.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Health check-in submitted!");
      setCheckinDialogOpen(false);
      utils.health.getTeamOverview.invalidate();
      setCheckinNotes("");
      
      // Show low wellbeing notification if score is below 60%
      if (variables.score < 60) {
        setLowWellbeingDialogOpen(true);
      }
    },
    onError: (error) => {
      toast.error(`Failed to submit check-in: ${error.message}`);
    },
  });

  const createCelebration = trpc.celebrations.create.useMutation({
    onSuccess: () => {
      toast.success("Celebration added!");
      setCelebrationDialogOpen(false);
      utils.celebrations.getRecent.invalidate();
      setCelebrationTitle("");
      setCelebrationDescription("");
      setCelebrationCategory("milestone");
      setCelebrationIcon("🎉");
    },
    onError: (error) => {
      toast.error(`Failed to add celebration: ${error.message}`);
    },
  });

  const updatePriority = trpc.priorities.update.useMutation({
    onSuccess: () => {
      toast.success("Priority updated!");
      utils.priorities.getCurrentWeek.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update priority: ${error.message}`);
    },
  });

  const upsertCeoReflection = trpc.ceoReflections.upsert.useMutation({
    onSuccess: () => {
      toast.success("CEO reflection updated!");
      setCeoReflectionDialogOpen(false);
      utils.ceoReflections.getCurrentWeek.invalidate();
      setCeoReflectionContent("");
    },
    onError: (error) => {
      toast.error(`Failed to update reflection: ${error.message}`);
    },
  });

  // Handlers
  const handleCheckinSubmit = () => {
    submitCheckin.mutate({
      score: checkinScore,
      mood: checkinMood,
      energyLevel: checkinEnergy,
      notes: checkinNotes || undefined,
    });
  };

  const handleCelebrationSubmit = () => {
    if (!celebrationTitle) {
      toast.error("Please enter a title");
      return;
    }

    createCelebration.mutate({
      title: celebrationTitle,
      description: celebrationDescription || undefined,
      category: celebrationCategory,
      icon: celebrationIcon,
      celebrationDate: new Date(),
    });
  };

  const handleTogglePriority = (priorityId: number, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    updatePriority.mutate({
      id: priorityId,
      status: newStatus as any,
    });
  };

  const handleCeoReflectionSubmit = () => {
    if (!ceoReflectionContent.trim()) {
      toast.error("Please enter your reflection");
      return;
    }

    upsertCeoReflection.mutate({
      content: ceoReflectionContent,
    });
  };

  const handleEditCeoReflection = () => {
    setCeoReflectionContent(ceoReflection?.content || "");
    setCeoReflectionDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Mpumi - Growth Farm</CardTitle>
            <CardDescription>Please sign in to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Get current week number (ISO week)
  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  const currentWeek = getWeekNumber(now);

  // Calculate trend
  const previousScore = 73; // TODO: Get from historical data
  const scoreTrend = teamHealth ? teamHealth.overallScore - previousScore : 0;

  // Get priorities grouped by user (from weekly activities)
  // The query returns joined data with weeklyActivities and users tables
  const prioritiesByUser = weeklyPriorities?.reduce((acc, item) => {
    // Access the weeklyActivities data from the joined result
    const activity = (item as any).weeklyActivities || item;
    const userId = activity.userId;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(activity);
    return acc;
  }, {} as Record<number, any[]>) || {};

  // Get strategic objective from annual goals linked via monthly goal
  const getStrategicObjective = (monthlyGoalId: number | null): string => {
    if (!monthlyGoalId || !annualGoals) return "";
    const goal = annualGoals.find(g => g.id === monthlyGoalId);
    return goal?.strategicObjective || "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <AppHeader />

      {/* Low Wellbeing Support Dialog */}
      <Dialog open={lowWellbeingDialogOpen} onOpenChange={setLowWellbeingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              We Care About You
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert className="border-rose-200 bg-rose-50">
              <Heart className="h-4 w-4 text-rose-500" />
              <AlertDescription className="text-sm text-rose-800">
                We are so sorry you are feeling this way. Given your self-reported wellbeing rating, the CEO will schedule time to speak with you this week. You are not required to reveal anything you are not comfortable sharing.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={() => setLowWellbeingDialogOpen(false)}>
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="container py-6 pb-24 space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Good {now.getHours() < 12 ? "Morning" : now.getHours() < 18 ? "Afternoon" : "Evening"}, Growth Farm Team
          </h2>
          <p className="text-muted-foreground">{format(now, "EEEE, d MMMM yyyy")}</p>
        </div>

        {/* Team Health Pulse */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Health Pulse
              </CardTitle>
            </div>
            <CardDescription>
              Week {currentWeek}, {now.getFullYear()} ({format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamHealthLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Overall Score */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Team Health</p>
                    <p className="text-3xl font-bold">{teamHealth?.overallScore}%</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={scoreTrend >= 0 ? "default" : "destructive"} className="mb-1">
                      {scoreTrend >= 0 ? "+" : ""}{scoreTrend}% from last week
                    </Badge>
                    <p className="text-xs text-muted-foreground">Week {currentWeek}, {now.getFullYear()}</p>
                  </div>
                </div>

                {/* Team Members with Priorities */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {teamHealth?.team.map((member) => {
                    const memberPriorities = prioritiesByUser[member.userId] || [];
                    const top3Priorities = memberPriorities.slice(0, 3);
                    const isCurrentUser = user?.id === member.userId;
                    const isLowWellbeing = (member.currentHealthScore || 0) < 60;
                    
                    return (
                      <div 
                        key={member.userId} 
                        className={`compact-card space-y-3 ${isLowWellbeing ? 'border-rose-200 bg-rose-50/30' : ''}`}
                      >
                        {/* Member Header */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatarUrl || undefined} />
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{member.name}</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${getHealthColor(member.currentHealthScore)}`}>
                                {member.currentHealthScore}%
                              </span>
                              <span className={`text-xs font-medium ${getWellbeingColor(member.currentHealthScore)}`}>
                                {getWellbeingWord(member.currentHealthScore)}
                              </span>
                            </div>
                          </div>
                          {isCurrentUser && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="shrink-0"
                              onClick={() => setCheckinDialogOpen(true)}
                            >
                              Check In
                            </Button>
                          )}
                        </div>

                        {/* Low Wellbeing Indicator */}
                        {isLowWellbeing && (
                          <div className="flex items-center gap-1 text-xs text-rose-600">
                            <Heart className="h-3 w-3" />
                            <span>CEO support scheduled</span>
                          </div>
                        )}

                        {/* Top 3 Priorities with Strategic Objective Icons */}
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This Week</p>
                          {top3Priorities.length > 0 ? (
                            <ul className="space-y-1">
                              {top3Priorities.map((activity: any) => {
                                const objective = getStrategicObjective(activity.monthlyGoalId);
                                return (
                                  <li 
                                    key={activity.id} 
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <span className="mt-0.5 h-3 w-3 rounded-full bg-amber-500 shrink-0 flex items-center justify-center">
                                      <span className="text-[8px] text-white font-bold">★</span>
                                    </span>
                                    <span className="line-clamp-2 flex-1">{activity.activity}</span>
                                    {objective && <StrategicObjectiveIcon objective={objective} />}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No priorities set</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-in Dialog */}
        <Dialog open={checkinDialogOpen} onOpenChange={setCheckinDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Weekly Wellbeing Check-In</DialogTitle>
              <DialogDescription>How are you feeling coming into this week?</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Wellbeing Score: {checkinScore}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={checkinScore}
                  onChange={(e) => setCheckinScore(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Struggling</span>
                  <span>Steady</span>
                  <span>Thriving</span>
                </div>
                {checkinScore < 60 && (
                  <p className="text-xs text-rose-600">
                    A score below 60% will notify the CEO for a supportive check-in.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>How would you describe your holistic wellbeing?</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={checkinMood === "happy" ? "default" : "outline"}
                    onClick={() => setCheckinMood("happy")}
                    className="flex-1"
                  >
                    Thriving
                  </Button>
                  <Button
                    type="button"
                    variant={checkinMood === "neutral" ? "default" : "outline"}
                    onClick={() => setCheckinMood("neutral")}
                    className="flex-1"
                  >
                    Steady
                  </Button>
                  <Button
                    type="button"
                    variant={checkinMood === "sad" ? "default" : "outline"}
                    onClick={() => setCheckinMood("sad")}
                    className="flex-1"
                  >
                    Struggling
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Energy Level</Label>
                <Select value={checkinEnergy} onValueChange={(v) => setCheckinEnergy(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Med">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={checkinNotes}
                  onChange={(e) => setCheckinNotes(e.target.value)}
                  placeholder="Any thoughts or concerns..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCheckinSubmit} disabled={submitCheckin.isPending}>
                {submitCheckin.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Check-In
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Celebrations & Wins */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PartyPopper className="h-5 w-5" />
                Celebrations & Wins
              </CardTitle>
              <Dialog open={celebrationDialogOpen} onOpenChange={setCelebrationDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-foreground">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Yours
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Celebration</DialogTitle>
                    <DialogDescription>Share a win or milestone with the team</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="celebration-title">Title</Label>
                      <Input
                        id="celebration-title"
                        value={celebrationTitle}
                        onChange={(e) => setCelebrationTitle(e.target.value)}
                        placeholder="What are we celebrating?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="celebration-description">Description</Label>
                      <Textarea
                        id="celebration-description"
                        value={celebrationDescription}
                        onChange={(e) => setCelebrationDescription(e.target.value)}
                        placeholder="Tell us more about this win..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="celebration-category">Category</Label>
                        <Select value={celebrationCategory} onValueChange={(v) => setCelebrationCategory(v as any)}>
                          <SelectTrigger id="celebration-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deal">Deal</SelectItem>
                            <SelectItem value="birthday">Birthday</SelectItem>
                            <SelectItem value="milestone">Milestone</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="celebration-icon">Icon</Label>
                        <Input
                          id="celebration-icon"
                          value={celebrationIcon}
                          onChange={(e) => setCelebrationIcon(e.target.value)}
                          placeholder="🎉"
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCelebrationSubmit} disabled={createCelebration.isPending}>
                      {createCelebration.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Add Celebration
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {celebrationsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : celebrations && celebrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {celebrations.slice(0, 4).map((celebration) => {
                  const posterName = formatUserName(celebration.createdByName);
                  const celebratorEmojis = getCelebratorEmojis(celebration.id);
                  
                  return (
                    <div key={celebration.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      <span className="text-2xl">{celebration.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{celebration.title}</p>
                        {celebration.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{celebration.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            Posted by <span className="font-medium">{posterName}</span> · {format(new Date(celebration.celebrationDate), "MMM d")}
                          </p>
                          <div className="flex items-center gap-0.5">
                            {celebratorEmojis.map((emoji, idx) => (
                              <span key={idx} className="text-sm">{emoji}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No celebrations yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top of Mind from CEO this Week */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Top of Mind from CEO this Week
              </CardTitle>
              {user?.role === 'admin' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleEditCeoReflection}
                >
                  {ceoReflection ? "Edit" : "Add"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {ceoReflectionLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : ceoReflection ? (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-foreground">{ceoReflection.content}</p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {user?.role === 'admin' 
                  ? "Click 'Add' to share your thoughts with the team this week" 
                  : "CEO reflections coming soon"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* CEO Reflection Dialog */}
        <Dialog open={ceoReflectionDialogOpen} onOpenChange={setCeoReflectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>CEO Reflection for This Week</DialogTitle>
              <DialogDescription>
                Share your top-of-mind thoughts with the team (max ~10 lines)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ceo-reflection">Your Message</Label>
                <Textarea
                  id="ceo-reflection"
                  value={ceoReflectionContent}
                  onChange={(e) => setCeoReflectionContent(e.target.value)}
                  placeholder="What's on your mind this week? Share your reflections, priorities, or thoughts with the team..."
                  rows={8}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCeoReflectionDialogOpen(false);
                  setCeoReflectionContent("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCeoReflectionSubmit} 
                disabled={upsertCeoReflection.isPending}
              >
                {upsertCeoReflection.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {ceoReflection ? "Update" : "Publish"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>


    </div>
  );
}
