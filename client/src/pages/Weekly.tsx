import { useLocation } from "wouter";
import AppHeader from "@/components/AppHeader";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Home,
  LayoutDashboard,
  Cog,
  Settings,
  Calendar,
  CalendarDays,
  Plus,
  Trash2,
  Loader2,
  Check,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Archive,
  Save,
  Star,
  Pencil,
  X,
  Target,
  Users,
  Rocket,
  Wallet,
  Building2,
  UserPlus,
  Phone
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

// Strategic objective icons and colors
const STRATEGIC_OBJECTIVES: Record<string, { icon: typeof Target; color: string; bgColor: string }> = {
  "Community Growth": { icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
  "Impact Delivery": { icon: Target, color: "text-green-600", bgColor: "bg-green-50" },
  "New Frontiers": { icon: Rocket, color: "text-purple-600", bgColor: "bg-purple-50" },
  "Stewardship": { icon: Wallet, color: "text-amber-600", bgColor: "bg-amber-50" },
  "Purpose & Platform": { icon: Building2, color: "text-rose-600", bgColor: "bg-rose-50" },
};

// Activity row for editing
interface ActivityRow {
  id?: number;
  activity: string;
  dueDay: typeof DAYS[number];
  dependency: string;
  partnerId: number | undefined;
  partnerRole: "partner" | "helper" | undefined;
  goalId: number | undefined;
  status: "pending" | "done" | "delayed" | "deprioritised";
  isPriority: boolean;
  isNew: boolean;
  isModified: boolean;
}

const createEmptyRow = (): ActivityRow => ({
  activity: "",
  dueDay: "Monday",
  dependency: "",
  partnerId: undefined,
  partnerRole: undefined,
  goalId: undefined,
  status: "pending",
  isPriority: false,
  isNew: true,
  isModified: false,
});

// Get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default function Weekly() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  
  const currentDate = new Date();
  const [weekNumber, setWeekNumber] = useState(getWeekNumber(currentDate));
  const [year, setYear] = useState(currentDate.getFullYear());
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Edit rows state
  const [editRows, setEditRows] = useState<ActivityRow[]>([]);
  
  // Queries
  const { data: myActivities, isLoading: activitiesLoading, refetch: refetchActivities } = 
    trpc.weeklyActivities.getMine.useQuery({ weekNumber, year });
  const { data: assignedActivities, refetch: refetchAssigned } = 
    trpc.weeklyActivities.getAssigned.useQuery({ weekNumber, year });
  const { data: allUsers } = trpc.users.getAll.useQuery();
  const { data: annualGoals } = trpc.goals.getAnnual.useQuery({ year });
  
  // Mutations
  const createMutation = trpc.weeklyActivities.create.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to add activity");
    }
  });
  
  const updateMutation = trpc.weeklyActivities.update.useMutation({
    onSuccess: () => {
      refetchActivities();
      refetchAssigned();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update activity");
    }
  });
  
  const deleteMutation = trpc.weeklyActivities.delete.useMutation({
    onSuccess: () => {
      toast.success("Activity deleted");
      refetchActivities();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete activity");
    }
  });
  
  // Count current priorities (from existing activities)
  const priorityCount = myActivities?.filter(a => a.isPriority && a.status !== "done" && a.status !== "deprioritised").length || 0;
  
  // Filter activities
  const activeActivities = myActivities?.filter(a => a.status !== "done" && a.status !== "deprioritised") || [];
  const archivedActivities = myActivities?.filter(a => a.status === "done" || a.status === "deprioritised") || [];
  
  // Process assigned activities - transform them with proper naming
  const processedAssignedActivities = useMemo(() => {
    if (!assignedActivities) return [];
    
    return assignedActivities.map((item: any) => {
      const activity = item.weekly_activities || item.weeklyActivities || item;
      const creator = item.users || {};
      const creatorName = creator.name?.split(" ")[0] || "Someone";
      
      // Transform activity name based on role
      let displayName = activity.activity;
      if (activity.partnerRole === "partner") {
        displayName = `Encourage ${creatorName} to ${activity.activity}`;
      } else if (activity.partnerRole === "helper") {
        displayName = `Call ${creatorName} to find out help needed with ${activity.activity}`;
      }
      
      return {
        ...activity,
        displayName,
        creatorName,
        isAssigned: true,
      };
    }).filter((a: any) => a.status !== "done" && a.status !== "deprioritised");
  }, [assignedActivities]);
  
  // Group activities by strategic objective (including assigned ones)
  const activitiesByObjective = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    // Add own activities
    activeActivities.forEach(activity => {
      const linkedGoal = annualGoals?.find(g => g.id === activity.monthlyGoalId);
      const objective = linkedGoal?.strategicObjective || "Unassigned";
      
      if (!grouped[objective]) {
        grouped[objective] = [];
      }
      grouped[objective].push({ ...activity, isAssigned: false });
    });
    
    // Add assigned activities
    processedAssignedActivities.forEach((activity: any) => {
      const linkedGoal = annualGoals?.find(g => g.id === activity.monthlyGoalId);
      const objective = linkedGoal?.strategicObjective || "Unassigned";
      
      if (!grouped[objective]) {
        grouped[objective] = [];
      }
      grouped[objective].push(activity);
    });
    
    // Sort objectives in a specific order
    const orderedObjectives = ["Community Growth", "Impact Delivery", "New Frontiers", "Stewardship", "Purpose & Platform", "Unassigned"];
    const sortedGrouped: Record<string, any[]> = {};
    
    orderedObjectives.forEach(obj => {
      if (grouped[obj] && grouped[obj].length > 0) {
        sortedGrouped[obj] = grouped[obj];
      }
    });
    
    // Add any remaining objectives not in the order
    Object.keys(grouped).forEach(obj => {
      if (!sortedGrouped[obj]) {
        sortedGrouped[obj] = grouped[obj];
      }
    });
    
    return sortedGrouped;
  }, [activeActivities, processedAssignedActivities, annualGoals]);
  
  // Enter edit mode - populate with existing activities + empty rows
  const enterEditMode = () => {
    const existingRows: ActivityRow[] = (myActivities || [])
      .filter(a => a.status !== "done" && a.status !== "deprioritised")
      .map(a => ({
        id: a.id,
        activity: a.activity,
        dueDay: (a.dueDay || "Monday") as typeof DAYS[number],
        dependency: a.dependency || "",
        partnerId: a.accountabilityPartnerId || undefined,
        partnerRole: (a.partnerRole as "partner" | "helper" | undefined) || undefined,
        goalId: a.monthlyGoalId || undefined,
        status: a.status as "pending" | "done" | "delayed" | "deprioritised",
        isPriority: a.isPriority || false,
        isNew: false,
        isModified: false,
      }));
    
    // Add 5 empty rows for new entries
    const emptyRows = [createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow()];
    
    setEditRows([...existingRows, ...emptyRows]);
    setIsEditMode(true);
  };
  
  // Update a row
  const updateRow = (index: number, field: keyof ActivityRow, value: any) => {
    setEditRows(prev => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value, isModified: true };
      
      // If partnerId is cleared, also clear partnerRole
      if (field === "partnerId" && !value) {
        newRows[index].partnerRole = undefined;
      }
      
      return newRows;
    });
  };
  
  // Add more rows
  const addMoreRows = () => {
    setEditRows(prev => [
      ...prev,
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow(),
    ]);
  };
  
  // Delete a row
  const deleteRow = (index: number) => {
    const row = editRows[index];
    if (row.id) {
      deleteMutation.mutate({ id: row.id });
    }
    setEditRows(prev => prev.filter((_, i) => i !== index));
  };
  
  // Save all changes and exit edit mode
  const saveAllAndExit = async () => {
    const newPriorityCount = editRows.filter(r => r.isPriority && r.activity.trim() && r.status !== "done" && r.status !== "deprioritised").length;
    if (newPriorityCount > 3) {
      toast.error("Maximum 3 priorities allowed. Please unmark some priorities.");
      return;
    }
    
    try {
      for (const row of editRows) {
        if (!row.activity.trim()) continue;
        
        if (row.isNew) {
          await createMutation.mutateAsync({
            activity: row.activity,
            dueDay: row.dueDay,
            dependency: row.dependency || undefined,
            accountabilityPartnerId: row.partnerId,
            partnerRole: row.partnerId ? row.partnerRole : undefined,
            monthlyGoalId: row.goalId,
            isPriority: row.isPriority,
            weekNumber,
            year,
          });
        } else if (row.isModified && row.id) {
          await updateMutation.mutateAsync({
            id: row.id,
            activity: row.activity,
            dueDay: row.dueDay,
            dependency: row.dependency || undefined,
            accountabilityPartnerId: row.partnerId,
            partnerRole: row.partnerId ? row.partnerRole : null,
            monthlyGoalId: row.goalId,
            isPriority: row.isPriority,
            status: row.status,
          });
        }
      }
      
      toast.success("Activities saved");
      await refetchActivities();
      await refetchAssigned();
      setIsEditMode(false);
    } catch (error) {
      // Error handled by mutations
    }
  };
  
  // Cancel edit mode
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditRows([]);
  };
  
  // Toggle priority in view mode (only for own activities)
  const togglePriority = (id: number, currentPriority: boolean) => {
    if (!currentPriority && priorityCount >= 3) {
      toast.error("Maximum 3 priorities allowed. Unmark another priority first.");
      return;
    }
    updateMutation.mutate({ id, isPriority: !currentPriority });
  };
  
  // Update status in view mode (only for own activities)
  const updateStatus = (id: number, status: "pending" | "done" | "delayed" | "deprioritised") => {
    updateMutation.mutate({ id, status });
  };
  
  // Navigate weeks
  const prevWeek = () => {
    if (weekNumber === 1) {
      setWeekNumber(52);
      setYear(year - 1);
    } else {
      setWeekNumber(weekNumber - 1);
    }
  };
  
  const nextWeek = () => {
    if (weekNumber === 52) {
      setWeekNumber(1);
      setYear(year + 1);
    } else {
      setWeekNumber(weekNumber + 1);
    }
  };
  
  // Get partner name
  const getPartnerName = (partnerId: number | null) => {
    if (!partnerId) return "";
    const partner = allUsers?.find(u => u.id === partnerId);
    return partner?.name?.split(" ")[0] || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <AppHeader />

      {/* Main Content */}
      <main className="container py-4 space-y-3">
        {isEditMode ? (
          /* ============ EDIT MODE ============ */
          <Card>
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit Activities
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-8">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveAllAndExit} className="h-8 bg-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-2 pt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-center py-1.5 px-1 font-medium w-8">★</th>
                      <th className="text-left py-1.5 px-2 font-medium">Activity</th>
                      <th className="text-left py-1.5 px-1 font-medium w-24">Goal</th>
                      <th className="text-left py-1.5 px-1 font-medium w-14">Due</th>
                      <th className="text-left py-1.5 px-1 font-medium w-16">Assign</th>
                      <th className="text-left py-1.5 px-1 font-medium w-14">Role</th>
                      <th className="text-left py-1.5 px-1 font-medium w-16">Status</th>
                      <th className="text-center py-1.5 px-1 font-medium w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editRows.map((row, index) => (
                      <tr key={index} className={`border-b ${row.isPriority ? "bg-amber-50" : ""}`}>
                        <td className="py-1 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => updateRow(index, "isPriority", !row.isPriority)}
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              row.isPriority 
                                ? "border-amber-500 bg-amber-500 text-white" 
                                : "border-gray-300 hover:border-amber-400"
                            }`}
                          >
                            {row.isPriority && <Star className="h-2.5 w-2.5" />}
                          </button>
                        </td>
                        <td className="py-0.5 px-1">
                          <Input
                            placeholder="Activity..."
                            value={row.activity}
                            onChange={(e) => updateRow(index, "activity", e.target.value)}
                            className="h-6 text-xs border-0 bg-transparent focus-visible:ring-1 px-1"
                          />
                        </td>
                        <td className="py-0.5 px-1">
                          <Select 
                            value={row.goalId?.toString() || "none"} 
                            onValueChange={(v) => updateRow(index, "goalId", v && v !== "none" ? parseInt(v) : undefined)}
                          >
                            <SelectTrigger className="h-5 text-[10px] border-0 bg-transparent px-0">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">-</SelectItem>
                              {annualGoals?.map(g => (
                                <SelectItem key={g.id} value={g.id.toString()}>
                                  {g.goalName.length > 20 ? g.goalName.substring(0, 18) + "..." : g.goalName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-0.5 px-1">
                          <Select value={row.dueDay} onValueChange={(v) => updateRow(index, "dueDay", v)}>
                            <SelectTrigger className="h-5 text-[10px] border-0 bg-transparent px-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS.map(day => (
                                <SelectItem key={day} value={day}>{day.substring(0, 3)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-0.5 px-1">
                          <Select 
                            value={row.partnerId?.toString() || "none"} 
                            onValueChange={(v) => updateRow(index, "partnerId", v && v !== "none" ? parseInt(v) : undefined)}
                          >
                            <SelectTrigger className="h-5 text-[10px] border-0 bg-transparent px-0">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">-</SelectItem>
                              {allUsers?.filter(u => u.id !== user?.id).map(u => (
                                <SelectItem key={u.id} value={u.id.toString()}>{u.name?.split(" ")[0]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-0.5 px-1">
                          {row.partnerId ? (
                            <Select 
                              value={row.partnerRole || "none"} 
                              onValueChange={(v) => updateRow(index, "partnerRole", v && v !== "none" ? v : undefined)}
                            >
                              <SelectTrigger className="h-5 text-[10px] border-0 bg-transparent px-0">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">-</SelectItem>
                                <SelectItem value="partner">Partner</SelectItem>
                                <SelectItem value="helper">Helper</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-[10px] text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-0.5 px-1">
                          <Select value={row.status} onValueChange={(v) => updateRow(index, "status", v)}>
                            <SelectTrigger className="h-5 text-[10px] border-0 bg-transparent px-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                              <SelectItem value="delayed">Delayed</SelectItem>
                              <SelectItem value="deprioritised">Depri</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-0.5 px-1 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-destructive hover:text-destructive"
                            onClick={() => deleteRow(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="ghost" onClick={addMoreRows} className="w-full mt-1 h-6 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add Rows
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* ============ VIEW MODE - Clean White Paper ============ */
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="py-2 px-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Week {weekNumber} Tasks
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={enterEditMode}
                  className="h-7 px-2"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {activitiesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : Object.keys(activitiesByObjective).length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground text-sm mb-3">No tasks for this week</p>
                  <Button onClick={enterEditMode} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Tasks
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {Object.entries(activitiesByObjective).map(([objective, activities]) => {
                    const objConfig = STRATEGIC_OBJECTIVES[objective] || { 
                      icon: Target, 
                      color: "text-gray-600", 
                      bgColor: "bg-gray-50" 
                    };
                    const Icon = objConfig.icon;
                    
                    return (
                      <div key={objective}>
                        {/* Section Header */}
                        <div className={`px-3 py-1.5 ${objConfig.bgColor} border-b border-gray-100`}>
                          <div className="flex items-center gap-1.5">
                            <Icon className={`h-3 w-3 ${objConfig.color}`} />
                            <span className={`text-[11px] font-medium ${objConfig.color}`}>
                              {objective}
                            </span>
                            <span className="text-[10px] text-gray-400 ml-1">
                              ({activities.length})
                            </span>
                          </div>
                        </div>
                        
                        {/* Activities */}
                        <div className="bg-white">
                          {activities.map((activity: any) => {
                            const isAssigned = activity.isAssigned;
                            
                            return (
                              <div 
                                key={`${activity.id}-${isAssigned ? 'assigned' : 'own'}`}
                                className={`flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                                  isAssigned 
                                    ? "bg-indigo-50/50" 
                                    : activity.isPriority 
                                      ? "bg-amber-50/40" 
                                      : ""
                                }`}
                              >
                                {/* Priority Star - only for own activities */}
                                {isAssigned ? (
                                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                    {activity.partnerRole === "partner" ? (
                                      <UserPlus className="h-3 w-3 text-indigo-500" />
                                    ) : (
                                      <Phone className="h-3 w-3 text-indigo-500" />
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => togglePriority(activity.id, activity.isPriority || false)}
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                      activity.isPriority 
                                        ? "border-amber-500 bg-amber-500 text-white" 
                                        : "border-gray-300 hover:border-amber-400"
                                    }`}
                                  >
                                    {activity.isPriority && <Star className="h-2.5 w-2.5" />}
                                  </button>
                                )}
                                
                                {/* Activity Text */}
                                <div className="flex-1 min-w-0">
                                  <span className={`text-xs ${
                                    isAssigned 
                                      ? "text-indigo-700" 
                                      : activity.status === "delayed" 
                                        ? "text-orange-700" 
                                        : "text-gray-800"
                                  }`}>
                                    {isAssigned ? activity.displayName : activity.activity}
                                  </span>
                                  {isAssigned && (
                                    <span className="ml-1.5 text-[9px] text-indigo-500 font-medium">
                                      (from {activity.creatorName})
                                    </span>
                                  )}
                                </div>
                                
                                {/* Due Day */}
                                <span className="text-[10px] text-gray-400 shrink-0">
                                  {activity.dueDay?.substring(0, 3)}
                                </span>
                                
                                {/* Partner (only for own activities) */}
                                {!isAssigned && activity.accountabilityPartnerId && (
                                  <span className="text-[10px] text-gray-400 shrink-0">
                                    w/ {getPartnerName(activity.accountabilityPartnerId)}
                                    {activity.partnerRole && (
                                      <span className="ml-0.5 text-indigo-500">
                                        ({activity.partnerRole === "partner" ? "P" : "H"})
                                      </span>
                                    )}
                                  </span>
                                )}
                                
                                {/* Status - only editable for own activities */}
                                {isAssigned ? (
                                  <span className={`h-5 px-1.5 text-[9px] rounded shrink-0 flex items-center ${
                                    activity.status === "pending" ? "bg-indigo-100 text-indigo-600" :
                                    activity.status === "delayed" ? "bg-orange-100 text-orange-700" :
                                    "bg-gray-100 text-gray-600"
                                  }`}>
                                    {activity.status}
                                  </span>
                                ) : (
                                  <Select 
                                    value={activity.status} 
                                    onValueChange={(v) => updateStatus(activity.id, v as any)}
                                  >
                                    <SelectTrigger className={`h-5 w-14 text-[9px] border rounded px-1.5 shrink-0 ${
                                      activity.status === "pending" ? "bg-gray-100 text-gray-600 border-gray-200" :
                                      activity.status === "delayed" ? "bg-orange-100 text-orange-700 border-orange-200" :
                                      "bg-gray-100 text-gray-600 border-gray-200"
                                    }`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="done">Done</SelectItem>
                                      <SelectItem value="delayed">Delayed</SelectItem>
                                      <SelectItem value="deprioritised">Depri</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Archived Activities */}
        {!isEditMode && archivedActivities.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="py-1.5 px-3">
              <CardTitle className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Archive className="h-3 w-3" />
                Done ({archivedActivities.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2 pt-0">
              <div className="space-y-0.5">
                {archivedActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    {activity.status === "done" ? (
                      <Check className="h-2.5 w-2.5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-2.5 w-2.5 text-gray-400 shrink-0" />
                    )}
                    <span className="line-through truncate">{activity.activity}</span>
                  </div>
                ))}
                {archivedActivities.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{archivedActivities.length - 5} more
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>


    </div>
  );
}
