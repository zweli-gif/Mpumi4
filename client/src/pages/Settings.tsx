import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { 
  Home as HomeIcon, 
  CalendarDays, 
  Calendar, 
  Target, 
  Settings as SettingsIcon, 
  Users, 
  Building2, 
  Compass, 
  Plus, 
  Edit2, 
  Trash2,
  Loader2,
  Shield,
  Rocket,
  LayoutDashboard,
  Cog,
  Save,
  Pencil
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import React from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import AppHeader from "@/components/AppHeader";

// Team member type for editing
type TeamMember = {
  id: number;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  jobTitle: string | null;
  birthplace: string | null;
  lifePurpose: string | null;
  personalGoal: string | null;
  skillMastering: string | null;
  currentHealthScore: number | null;
};

// Strategic objective icons and colors
const OBJECTIVE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  "Community Growth": { icon: Users, color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200" },
  "Impact Delivery": { icon: Target, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
  "New Frontiers": { icon: Rocket, color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200" },
  "Stewardship": { icon: Shield, color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" },
  "Purpose & Platform": { icon: Compass, color: "text-rose-600", bgColor: "bg-rose-50 border-rose-200" },
};

// Initial departments
const INITIAL_DEPARTMENTS = [
  { id: "venture-studio", name: "Venture Studio", description: "Ideating and incubating new ventures" },
  { id: "design-studio", name: "Design Studio", description: "User acquisition and retention services" },
  { id: "investment-arm", name: "Investment Arm", description: "Strategic investments in portfolio companies" },
  { id: "advisory", name: "Advisory", description: "Consulting and advisory services" },
];

// Progress wheel component with target in center
function ProgressWheel({ 
  progress, 
  target, 
  unit, 
  size = 60,
  isYTDOnTrack = true 
}: { 
  progress: number; 
  target: string;
  unit: string;
  size?: number;
  isYTDOnTrack?: boolean;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;
  
  // Color based on whether we're meeting YTD target
  const getColor = () => {
    if (progress >= 75) return isYTDOnTrack ? "#22c55e" : "#22c55e"; // green
    if (progress >= 60) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };
  
  // Format target for display
  const formatTarget = (val: string, u: string) => {
    const num = parseFloat(val);
    if (u === "R" || u === "ZAR") {
      if (num >= 1000000) return `R${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `R${(num / 1000).toFixed(0)}K`;
      return `R${num}`;
    }
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return `${num}${u === "%" ? "%" : ""}`;
  };
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="5"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[9px] font-bold text-gray-700 leading-tight">
          {formatTarget(target, unit)}
        </span>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("team");
  
  // Team member editing state
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"user" | "admin">("user");
  const [newMemberJobTitle, setNewMemberJobTitle] = useState("");
  
  // KPI editing state
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editingGoalData, setEditingGoalData] = useState<{
    goalName: string;
    targetValue: string;
    targetUnit: string;
    ownerName: string;
  } | null>(null);
  
  // Departments state
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [editingDepartment, setEditingDepartment] = useState<typeof INITIAL_DEPARTMENTS[0] | null>(null);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDescription, setNewDeptDescription] = useState("");
  
  // Company info state
  const [companyName, setCompanyName] = useState("Growth Farm");
  const [companyTagline, setCompanyTagline] = useState("Building Africa's largest venture studio");
  const [companyMission, setCompanyMission] = useState("To create and incubate transformative ventures that drive sustainable growth across Africa, while nurturing a community of innovative entrepreneurs.");
  const [companyInfoChanged, setCompanyInfoChanged] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-indexed

  // Queries
  const { data: allUsers, isLoading: usersLoading, refetch: refetchUsers } = trpc.users.getAll.useQuery();
  const { data: allSettings } = trpc.settings.getAll.useQuery();
  const { data: annualGoals, isLoading: goalsLoading, refetch: refetchGoals } = trpc.goals.getAnnual.useQuery({ year: currentYear });
  const { data: monthlyData, refetch: refetchMonthly } = trpc.goals.getAllMonthlyForYear.useQuery({ year: currentYear });
  const { data: strategicObjectives, isLoading: objectivesLoading, refetch: refetchObjectives } = trpc.strategicObjectives.getAll.useQuery({ year: currentYear });
  
  // Strategic objective editing state
  const [editingObjectiveId, setEditingObjectiveId] = useState<number | null>(null);
  const [editingObjectiveName, setEditingObjectiveName] = useState("");
  const [editingObjectiveWeight, setEditingObjectiveWeight] = useState(0);
  const [addObjectiveDialogOpen, setAddObjectiveDialogOpen] = useState(false);
  const [newObjectiveName, setNewObjectiveName] = useState("");
  const [newObjectiveWeight, setNewObjectiveWeight] = useState(20);
  
  // Mutations
  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("Team member updated successfully");
      refetchUsers();
      setMemberDialogOpen(false);
      setEditingMember(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update team member");
    }
  });
  
  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Team member removed");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove team member");
    }
  });
  
  const inviteUserMutation = trpc.users.invite.useMutation({
    onSuccess: () => {
      toast.success("Team member invited successfully");
      refetchUsers();
      setInviteDialogOpen(false);
      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberRole("user");
      setNewMemberJobTitle("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to invite team member");
    }
  });
  
  const saveSettingMutation = trpc.settings.save.useMutation({
    onSuccess: () => {
      toast.success("Settings saved");
      setCompanyInfoChanged(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save settings");
    }
  });

  const updateGoalMutation = trpc.goals.update.useMutation({
    onSuccess: () => {
      toast.success("Goal updated");
      refetchGoals();
      setEditingGoalId(null);
      setEditingGoalData(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update goal");
    }
  });

  const createGoalMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      toast.success("Goal created");
      refetchGoals();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create goal");
    }
  });

  const deleteGoalMutation = trpc.goals.delete.useMutation({
    onSuccess: () => {
      toast.success("Goal deleted");
      refetchGoals();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete goal");
    }
  });

  const updateObjectiveMutation = trpc.strategicObjectives.update.useMutation({
    onSuccess: () => {
      toast.success("Objective updated");
      refetchObjectives();
      setEditingObjectiveId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update objective");
    }
  });

  const createObjectiveMutation = trpc.strategicObjectives.create.useMutation({
    onSuccess: () => {
      toast.success("Objective created");
      refetchObjectives();
      setAddObjectiveDialogOpen(false);
      setNewObjectiveName("");
      setNewObjectiveWeight(20);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create objective");
    }
  });

  const deleteObjectiveMutation = trpc.strategicObjectives.delete.useMutation({
    onSuccess: () => {
      toast.success("Objective deleted");
      refetchObjectives();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete objective");
    }
  });
  
  // Load company info from settings
  useEffect(() => {
    if (allSettings) {
      const nameS = allSettings.find((s: any) => s.settingKey === "company_name");
      const taglineS = allSettings.find((s: any) => s.settingKey === "company_tagline");
      const missionS = allSettings.find((s: any) => s.settingKey === "company_mission");
      if (nameS) setCompanyName(nameS.settingValue);
      if (taglineS) setCompanyTagline(taglineS.settingValue);
      if (missionS) setCompanyMission(missionS.settingValue);
    }
  }, [allSettings]);

  // Group goals by strategic objective
  const goalsByObjective = useMemo(() => {
    if (!annualGoals) return {};
    const groups: Record<string, typeof annualGoals> = {};
    annualGoals.forEach(goal => {
      if (!groups[goal.strategicObjective]) {
        groups[goal.strategicObjective] = [];
      }
      groups[goal.strategicObjective].push(goal);
    });
    return groups;
  }, [annualGoals]);

  // Get icon component from icon name
  const getIconComponent = (iconName: string): React.ElementType => {
    const iconMap: Record<string, React.ElementType> = {
      Users, Target, Rocket, Shield, Compass,
    };
    return iconMap[iconName] || Target;
  };

  // Calculate total weight from objectives
  const totalWeight = useMemo(() => {
    if (!strategicObjectives) return 0;
    return strategicObjectives.reduce((sum, obj) => sum + (obj.weight || 0), 0);
  }, [strategicObjectives]);

  // Start editing an objective
  const startEditingObjective = (obj: any) => {
    setEditingObjectiveId(obj.id);
    setEditingObjectiveName(obj.name);
    setEditingObjectiveWeight(obj.weight);
  };

  // Save objective edit
  const saveObjectiveEdit = () => {
    if (!editingObjectiveId) return;
    updateObjectiveMutation.mutate({
      id: editingObjectiveId,
      name: editingObjectiveName,
      weight: editingObjectiveWeight,
    });
  };

  // Add new objective
  const addNewObjective = () => {
    if (!newObjectiveName.trim()) {
      toast.error("Please enter an objective name");
      return;
    }
    const maxOrder = strategicObjectives?.reduce((max, obj) => Math.max(max, obj.displayOrder || 0), 0) || 0;
    createObjectiveMutation.mutate({
      name: newObjectiveName,
      weight: newObjectiveWeight,
      year: currentYear,
      displayOrder: maxOrder + 1,
    });
  };

  // Get YTD actual for a goal from monthly data
  const getYTDActual = (goalId: number) => {
    if (!monthlyData) return 0;
    const goalMonthly = monthlyData.filter(m => m.monthlyTargets.goalId === goalId);
    return goalMonthly.reduce((sum, m) => sum + parseFloat(m.monthlyTargets.actualValue || "0"), 0);
  };

  // Get YTD target for a goal (sum of monthly targets up to current month)
  const getYTDTarget = (goalId: number) => {
    if (!monthlyData) return 0;
    const goalMonthly = monthlyData.filter(m => 
      m.monthlyTargets.goalId === goalId && 
      m.monthlyTargets.month <= currentMonth
    );
    return goalMonthly.reduce((sum, m) => sum + parseFloat(m.monthlyTargets.targetValue || "0"), 0);
  };

  // Calculate YTD progress percentage
  const getYTDProgress = (goalId: number, annualTarget: string) => {
    const ytdActual = getYTDActual(goalId);
    const annual = parseFloat(annualTarget);
    if (annual === 0) return 0;
    return Math.round((ytdActual / annual) * 100);
  };

  // Check if YTD is on track
  const isYTDOnTrack = (goalId: number, annualTarget: string) => {
    const ytdActual = getYTDActual(goalId);
    const ytdTarget = getYTDTarget(goalId);
    if (ytdTarget === 0) return true;
    return (ytdActual / ytdTarget) >= 0.75; // On track if at least 75% of YTD target
  };
  
  // Save company info
  const saveCompanyInfo = () => {
    saveSettingMutation.mutate({ key: "company_name", value: companyName });
    saveSettingMutation.mutate({ key: "company_tagline", value: companyTagline });
    saveSettingMutation.mutate({ key: "company_mission", value: companyMission });
  };

  // Open member editing dialog
  const openMemberDialog = (member: any) => {
    setEditingMember({
      id: member.id,
      name: member.name || "",
      email: member.email || "",
      role: member.role || "user",
      jobTitle: member.jobTitle || "",
      birthplace: member.birthplace || "",
      lifePurpose: member.lifePurpose || "",
      personalGoal: member.personalGoal || "",
      skillMastering: member.skillMastering || "",
      currentHealthScore: member.currentHealthScore || 75,
    });
    setMemberDialogOpen(true);
  };
  
  // Save member changes
  const saveMember = () => {
    if (!editingMember) return;
    updateUserMutation.mutate({
      id: editingMember.id,
      name: editingMember.name || undefined,
      email: editingMember.email || undefined,
      role: editingMember.role,
      jobTitle: editingMember.jobTitle || undefined,
      birthplace: editingMember.birthplace || undefined,
      lifePurpose: editingMember.lifePurpose || undefined,
      personalGoal: editingMember.personalGoal || undefined,
      skillMastering: editingMember.skillMastering || undefined,
    });
  };
  
  // Invite new member
  const inviteMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      toast.error("Please enter name and email");
      return;
    }
    inviteUserMutation.mutate({
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      jobTitle: newMemberJobTitle || undefined,
    });
  };

  // Start editing a goal
  const startEditingGoal = (goal: any) => {
    setEditingGoalId(goal.id);
    setEditingGoalData({
      goalName: goal.goalName,
      targetValue: goal.targetValue,
      targetUnit: goal.targetUnit,
      ownerName: goal.ownerName || "",
    });
  };

  // Save goal edits
  const saveGoalEdit = () => {
    if (!editingGoalId || !editingGoalData) return;
    updateGoalMutation.mutate({
      id: editingGoalId,
      ...editingGoalData,
    });
  };

  // Add new goal to an objective
  const addGoalToObjective = (objective: string) => {
    createGoalMutation.mutate({
      strategicObjective: objective,
      goalName: "New KPI",
      targetValue: "0",
      targetUnit: "#",
      year: currentYear,
    });
  };
  
  // Department functions
  const openDepartmentDialog = (dept?: typeof INITIAL_DEPARTMENTS[0]) => {
    if (dept) {
      setEditingDepartment(dept);
      setNewDeptName(dept.name);
      setNewDeptDescription(dept.description);
    } else {
      setEditingDepartment(null);
      setNewDeptName("");
      setNewDeptDescription("");
    }
    setDepartmentDialogOpen(true);
  };
  
  const saveDepartment = () => {
    if (!newDeptName.trim()) {
      toast.error("Please enter a department name");
      return;
    }
    
    if (editingDepartment) {
      setDepartments(prev => prev.map(d => 
        d.id === editingDepartment.id 
          ? { ...d, name: newDeptName, description: newDeptDescription }
          : d
      ));
      toast.success("Department updated");
    } else {
      const newDept = {
        id: `dept-${Date.now()}`,
        name: newDeptName,
        description: newDeptDescription,
      };
      setDepartments(prev => [...prev, newDept]);
      toast.success("Department added");
    }
    setDepartmentDialogOpen(false);
  };
  
  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    toast.success("Department removed");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <AppHeader />

      {/* Main Content */}
      <main className="container px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className={`grid w-full ${user?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="team" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Team
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Annual Goals
            </TabsTrigger>
            <TabsTrigger value="company" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              Company
            </TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="access" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Access
              </TabsTrigger>
            )}
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Team Members</CardTitle>
                    <CardDescription className="text-xs">Manage your Growth Farm team</CardDescription>
                  </div>
                  {user?.role === 'admin' && (
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-3 w-3 mr-1" />
                          Invite
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>Add a new member to Growth Farm</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="invite-name">Full Name *</Label>
                          <Input 
                            id="invite-name" 
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="e.g., John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invite-email">Email *</Label>
                          <Input 
                            id="invite-email" 
                            type="email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            placeholder="e.g., john@growthfarm.co"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invite-role">Role</Label>
                          <Select value={newMemberRole} onValueChange={(v) => setNewMemberRole(v as "user" | "admin")}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invite-job">Job Title</Label>
                          <Input 
                            id="invite-job" 
                            value={newMemberJobTitle}
                            onChange={(e) => setNewMemberJobTitle(e.target.value)}
                            placeholder="e.g., Product Manager"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={inviteMember} disabled={inviteUserMutation.isPending}>
                          {inviteUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Send Invite
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="py-2">
                {usersLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allUsers?.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatarUrl || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                              {member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{member.name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground">{member.email || 'No email'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                            {member.role === 'admin' ? 'Admin' : 'Member'}
                          </Badge>
                          {user?.role === 'admin' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openMemberDialog(member)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                          {user?.role === 'admin' && member.id !== user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove {member.name || 'this member'} from Growth Farm.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteUserMutation.mutate({ id: member.id })}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Member Edit Dialog */}
          <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Team Member</DialogTitle>
                <DialogDescription>Update profile information</DialogDescription>
              </DialogHeader>
              {editingMember && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input 
                        id="edit-name" 
                        value={editingMember.name || ""}
                        onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input 
                        id="edit-email" 
                        type="email"
                        value={editingMember.email || ""}
                        onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-role">Role</Label>
                      <Select 
                        value={editingMember.role} 
                        onValueChange={(v) => setEditingMember({...editingMember, role: v as "user" | "admin"})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-job">Job Title</Label>
                      <Input 
                        id="edit-job" 
                        value={editingMember.jobTitle || ""}
                        onChange={(e) => setEditingMember({...editingMember, jobTitle: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-birthplace">Birthplace</Label>
                    <Input 
                      id="edit-birthplace" 
                      value={editingMember.birthplace || ""}
                      onChange={(e) => setEditingMember({...editingMember, birthplace: e.target.value})}
                      placeholder="Where are you from?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-purpose">Life Purpose</Label>
                    <Textarea 
                      id="edit-purpose" 
                      value={editingMember.lifePurpose || ""}
                      onChange={(e) => setEditingMember({...editingMember, lifePurpose: e.target.value})}
                      placeholder="What drives you?"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-goal">Personal Goal for 2026</Label>
                    <Textarea 
                      id="edit-goal" 
                      value={editingMember.personalGoal || ""}
                      onChange={(e) => setEditingMember({...editingMember, personalGoal: e.target.value})}
                      placeholder="What do you want to achieve this year?"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-skill">Skill You're Mastering</Label>
                    <Input 
                      id="edit-skill" 
                      value={editingMember.skillMastering || ""}
                      onChange={(e) => setEditingMember({...editingMember, skillMastering: e.target.value})}
                      placeholder="What skill are you developing?"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={saveMember} disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Annual Goals Tab - New Design */}
          <TabsContent value="goals" className="space-y-4">
            {/* Total Weight Indicator */}
            {user?.role === 'admin' && (
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Total Weight:</span>
                  <Badge variant={totalWeight === 100 ? "default" : "destructive"} className="text-xs">
                    {totalWeight}%
                  </Badge>
                  {totalWeight !== 100 && (
                    <span className="text-xs text-muted-foreground">(should equal 100%)</span>
                  )}
                </div>
                <Dialog open={addObjectiveDialogOpen} onOpenChange={setAddObjectiveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Objective
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Strategic Objective</DialogTitle>
                      <DialogDescription>
                        Create a new strategic objective for {currentYear}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Objective Name</Label>
                        <Input
                          value={newObjectiveName}
                          onChange={(e) => setNewObjectiveName(e.target.value)}
                          placeholder="e.g., Innovation Hub"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Weight (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={newObjectiveWeight}
                          onChange={(e) => setNewObjectiveWeight(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addNewObjective} disabled={createObjectiveMutation.isPending}>
                        {createObjectiveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Add Objective
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {goalsLoading || objectivesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4">
                {strategicObjectives?.map((objective) => {
                  const IconComponent = getIconComponent(objective.icon || "Target");
                  const goals = goalsByObjective[objective.name] || [];
                  const isEditing = editingObjectiveId === objective.id;
                  
                  return (
                    <Card key={objective.id} className={`border-2 ${objective.bgColor || 'bg-gray-50 border-gray-200'}`}>
                      <CardHeader className="py-3 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className={`h-5 w-5 ${objective.color || 'text-gray-600'}`} />
                            {isEditing ? (
                              <Input
                                value={editingObjectiveName}
                                onChange={(e) => setEditingObjectiveName(e.target.value)}
                                className="h-7 text-sm w-40"
                              />
                            ) : (
                              <CardTitle className="text-base">{objective.name}</CardTitle>
                            )}
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={editingObjectiveWeight}
                                  onChange={(e) => setEditingObjectiveWeight(parseInt(e.target.value) || 0)}
                                  className="h-7 text-sm w-16"
                                />
                                <span className="text-xs">%</span>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs font-semibold">
                                {objective.weight}%
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {user?.role === 'admin' && (
                              <>
                                {isEditing ? (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={saveObjectiveEdit}
                                      disabled={updateObjectiveMutation.isPending}
                                    >
                                      {updateObjectiveMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Save className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => setEditingObjectiveId(null)}
                                    >
                                      <span className="text-xs">✕</span>
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => startEditingObjective(objective)}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Objective?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will permanently delete "{objective.name}" and all its KPIs.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => deleteObjectiveMutation.mutate({ id: objective.id })}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 text-xs"
                                  onClick={() => addGoalToObjective(objective.name)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add KPI
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        {goals.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No KPIs defined. Click "Add KPI" to create one.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {goals.map((goal) => {
                              const ytdProgress = getYTDProgress(goal.id, goal.targetValue);
                              const onTrack = isYTDOnTrack(goal.id, goal.targetValue);
                              const isEditing = editingGoalId === goal.id;
                              
                              return (
                                <div 
                                  key={goal.id} 
                                  className="flex items-center gap-3 p-2 bg-white/80 rounded-lg border"
                                >
                                  {/* Progress Wheel */}
                                  <ProgressWheel 
                                    progress={ytdProgress}
                                    target={goal.targetValue}
                                    unit={goal.targetUnit}
                                    size={56}
                                    isYTDOnTrack={onTrack}
                                  />
                                  
                                  {/* KPI Info */}
                                  <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                      <div className="space-y-2">
                                        <Input
                                          value={editingGoalData?.goalName || ""}
                                          onChange={(e) => setEditingGoalData(prev => prev ? {...prev, goalName: e.target.value} : null)}
                                          className="h-7 text-sm"
                                          placeholder="KPI Name"
                                        />
                                        <div className="flex gap-2">
                                          <Input
                                            value={editingGoalData?.targetValue || ""}
                                            onChange={(e) => setEditingGoalData(prev => prev ? {...prev, targetValue: e.target.value} : null)}
                                            className="h-7 text-sm w-24"
                                            placeholder="Target"
                                          />
                                          <Select 
                                            value={editingGoalData?.targetUnit || "#"} 
                                            onValueChange={(v) => setEditingGoalData(prev => prev ? {...prev, targetUnit: v} : null)}
                                          >
                                            <SelectTrigger className="h-7 w-16 text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="#">#</SelectItem>
                                              <SelectItem value="%">%</SelectItem>
                                              <SelectItem value="R">R</SelectItem>
                                              <SelectItem value="ZAR">ZAR</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <Input
                                            value={editingGoalData?.ownerName || ""}
                                            onChange={(e) => setEditingGoalData(prev => prev ? {...prev, ownerName: e.target.value} : null)}
                                            className="h-7 text-sm flex-1"
                                            placeholder="Owner"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <p className="font-medium text-sm truncate">
                                          {goal.goalName}
                                          <span className="text-muted-foreground font-normal ml-1">
                                            ({goal.targetUnit === "R" || goal.targetUnit === "ZAR" ? "ZAR" : goal.targetUnit})
                                          </span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Owner: {goal.ownerName || "Unassigned"}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex items-center gap-1">
                                    {isEditing ? (
                                      <>
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          className="h-7 w-7"
                                          onClick={saveGoalEdit}
                                          disabled={updateGoalMutation.isPending}
                                        >
                                          {updateGoalMutation.isPending ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Save className="h-3 w-3" />
                                          )}
                                        </Button>
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          className="h-7 w-7"
                                          onClick={() => { setEditingGoalId(null); setEditingGoalData(null); }}
                                        >
                                          <span className="text-xs">✕</span>
                                        </Button>
                                      </>
                                    ) : user?.role === 'admin' ? (
                                      <>
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          className="h-7 w-7"
                                          onClick={() => startEditingGoal(goal)}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button 
                                              size="icon" 
                                              variant="ghost" 
                                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Delete KPI?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will permanently delete "{goal.goalName}" and all its monthly targets.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction 
                                                onClick={() => deleteGoalMutation.mutate({ id: goal.id })}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                              >
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Company Information</CardTitle>
                    <CardDescription className="text-xs">Growth Farm organizational details</CardDescription>
                  </div>
                  {user?.role === 'admin' && companyInfoChanged && (
                    <Button size="sm" onClick={saveCompanyInfo} disabled={saveSettingMutation.isPending}>
                      {saveSettingMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                      Save
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 py-2">
                <div className="space-y-1">
                  <Label className="text-xs">Company Name</Label>
                  <Input 
                    value={companyName}
                    onChange={(e) => { setCompanyName(e.target.value); setCompanyInfoChanged(true); }}
                    className="h-8 text-sm"
                    disabled={user?.role !== 'admin'}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tagline</Label>
                  <Input 
                    value={companyTagline}
                    onChange={(e) => { setCompanyTagline(e.target.value); setCompanyInfoChanged(true); }}
                    className="h-8 text-sm"
                    disabled={user?.role !== 'admin'}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Mission Statement</Label>
                  <Textarea 
                    value={companyMission}
                    onChange={(e) => { setCompanyMission(e.target.value); setCompanyInfoChanged(true); }}
                    rows={2}
                    className="text-sm"
                    disabled={user?.role !== 'admin'}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Business Units</CardTitle>
                    <CardDescription className="text-xs">Departments and divisions</CardDescription>
                  </div>
                  {user?.role === 'admin' && (
                    <Button size="sm" variant="outline" onClick={() => openDepartmentDialog()}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{dept.name}</p>
                        <p className="text-xs text-muted-foreground">{dept.description}</p>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDepartmentDialog(dept)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deleteDepartment(dept.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Tab (Admin only) */}
          {user?.role === 'admin' && (
            <TabsContent value="access" className="space-y-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-600" />
                    Admin Access Management
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Grant or revoke admin privileges. Admins can set KPI targets, assign owners, and manage team settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-2 space-y-4">
                  {/* Admins */}
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Admins</p>
                    <div className="space-y-2">
                      {allUsers?.filter((m: any) => m.role === 'admin').map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatarUrl || undefined} />
                              <AvatarFallback className="bg-amber-200 text-amber-800 text-xs font-medium">
                                {member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{member.name || 'Unnamed'}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          {member.id !== user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-xs h-7 text-destructive border-destructive hover:bg-destructive/10">
                                  Remove Admin
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove admin privileges?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {member.name || member.email} will become a regular member and lose access to admin features.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => updateUserMutation.mutate({ id: member.id, role: 'user' })}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove Admin
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          {member.id === user?.id && (
                            <Badge variant="outline" className="text-xs text-amber-700 border-amber-400">You</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Regular members */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Members</p>
                    <div className="space-y-2">
                      {allUsers?.filter((m: any) => m.role !== 'admin').map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatarUrl || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                {member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{member.name || 'Unnamed'}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-xs h-7">
                                Make Admin
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Grant admin privileges?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {member.name || member.email} will be able to set KPI targets, assign owners, and manage team settings.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => updateUserMutation.mutate({ id: member.id, role: 'admin' })}
                                >
                                  Grant Admin
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                      {allUsers?.filter((m: any) => m.role !== 'admin').length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">All team members are admins.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Department Dialog */}
          <Dialog open={departmentDialogOpen} onOpenChange={setDepartmentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDepartment ? "Edit Department" : "Add Department"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Department Name</Label>
                  <Input 
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    placeholder="e.g., Marketing"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={newDeptDescription}
                    onChange={(e) => setNewDeptDescription(e.target.value)}
                    placeholder="Brief description of the department"
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={saveDepartment}>
                  {editingDepartment ? "Update" : "Add"} Department
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Tabs>
      </main>


    </div>
  );
}
