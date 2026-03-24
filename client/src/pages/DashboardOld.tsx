import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Home, Users, Loader2, ArrowLeft, LayoutDashboard, Cog, Calendar, CalendarDays, Settings, TrendingUp, Rocket, Palette, AlertTriangle, DollarSign, Banknote, Receipt, CheckCircle2, Clock, AlertCircle, XCircle, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import AppHeader from "@/components/AppHeader";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VentureEditModal } from "@/components/VentureEditModal";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenture, setEditingVenture] = useState<any>(null);
  const [isVentureEditOpen, setIsVentureEditOpen] = useState(false);
  const [ventureRefreshKey, setVentureRefreshKey] = useState(0);

  // Get current week number
  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  // Get date range for a given week
  function getWeekDateRange(weekNumber: number, year: number): { start: Date; end: Date } {
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    
    const start = new Date(ISOweekStart);
    const end = new Date(ISOweekStart);
    end.setDate(end.getDate() + 6);
    
    return { start, end };
  }

  // Format date range for display
  function formatDateRange(start: Date, end: Date): string {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }

  const now = new Date();
  const currentWeekNumber = getWeekNumber(now);
  const year = now.getFullYear();
  const displayWeek = selectedWeek ?? currentWeekNumber;

  // Queries
  const { data: teamHealth } = trpc.health.getTeamOverview.useQuery();
  const { data: bdPipeline } = trpc.pipelines.getCards.useQuery({ pipelineType: "bd" });
  const { data: venturesPipeline } = trpc.pipelines.getCards.useQuery({ pipelineType: "ventures" });
  const { data: studioPipeline } = trpc.pipelines.getCards.useQuery({ pipelineType: "studio" });
  const { data: clientsPipeline } = trpc.pipelines.getCards.useQuery({ pipelineType: "clients" });
  const { data: weeklyOverview } = trpc.weeklyActivities.getDashboardOverview.useQuery({ weekNumber: displayWeek, year });

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
        <Card className="w-full max-w-md p-6">
          <h2 className="text-2xl font-bold mb-4">Growth Farm Dashboard</h2>
          <Button asChild className="w-full">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate BD Pipeline metrics by stage
  const bdStages = bdPipeline?.stages || [];
  const bdCards = bdPipeline?.cards || [];
  const getStageMetrics = (stageName: string) => {
    const stage = bdStages.find(s => s.name === stageName);
    const cards = bdCards.filter(c => c.stageId === stage?.id);
    const value = cards.reduce((sum, card) => sum + parseFloat(card.value || "0"), 0);
    return { count: cards.length, value };
  };

  const leadMetrics = getStageMetrics("Lead");
  const qualifiedMetrics = getStageMetrics("Qualified");
  const proposalMetrics = getStageMetrics("Proposal");
  const negotiationMetrics = getStageMetrics("Negotiation");
  const wonMetrics = getStageMetrics("Won");
  const lostMetrics = getStageMetrics("Lost");

  // Finance metrics (mock data - would come from database)
  const ytdRevenue = 1800000; // R1.8M
  const revenueTarget = 24000000; // R24M
  const cashReserves = 410000; // R410k
  const cashTarget = 1000000; // R1M
  const taxLiability = 320000; // R320k

  // Calculate where we should be (2/12 months = ~16.7% of target)
  const monthProgress = new Date().getMonth() + 1; // Current month (1-12)
  const shouldBeRevenue = (revenueTarget / 12) * monthProgress;

  // Ventures metrics
  const venturesCards = venturesPipeline?.cards || [];
  const totalBurnRate = venturesCards.reduce((sum, v) => {
    try {
      const meta = v.metadata ? JSON.parse(v.metadata) : {};
      const burn = parseFloat(meta.burnRate || "0");
      return sum + burn;
    } catch { return sum; }
  }, 0);
  const revenueGenerating = venturesCards.filter(v => {
    try {
      const meta = v.metadata ? JSON.parse(v.metadata) : {};
      return meta.daysToRevenue === "0" || meta.status === "Revenue generating";
    } catch { return false; }
  }).length;

  // Studio metrics
  const studioCards = studioPipeline?.cards || [];
  const onTrackProjects = studioCards.filter(p => {
    try {
      const meta = p.metadata ? JSON.parse(p.metadata) : {};
      return meta.status === "On Track";
    } catch { return false; }
  }).length;
  const atRiskProjects = studioCards.filter(p => {
    try {
      const meta = p.metadata ? JSON.parse(p.metadata) : {};
      return meta.status === "At Risk";
    } catch { return false; }
  }).length;

  // Client relationship types
  const clientStages = clientsPipeline?.stages || [];
  const clientCards = clientsPipeline?.cards || [];
  const getClientsByType = (typeName: string) => {
    const stage = clientStages.find(s => s.name === typeName);
    const cards = clientCards.filter(c => c.stageId === stage?.id);
    const value = cards.reduce((sum, card) => sum + parseFloat(card.value || "0"), 0);
    return { count: cards.length, value };
  };

  const activeClients = getClientsByType("Active");
  const prospectClients = getClientsByType("Prospect");
  const atRiskClients = getClientsByType("At Risk");
  const churnedClients = getClientsByType("Churned");

  // Alerts
  const alerts = [];
  if (atRiskClients.count > 0) {
    alerts.push({ type: "danger", message: `${atRiskClients.count} client(s) at risk - R${(atRiskClients.value / 1000).toFixed(0)}K at stake` });
  }
  if ((teamHealth?.overallScore || 0) < 60) {
    alerts.push({ type: "warning", message: "Team health below 60% - schedule check-ins" });
  }
  if (ytdRevenue < shouldBeRevenue * 0.75) {
    alerts.push({ type: "warning", message: `Revenue behind target - should be R${(shouldBeRevenue / 1000000).toFixed(1)}M` });
  }
  if (atRiskProjects > 0) {
    alerts.push({ type: "warning", message: `${atRiskProjects} studio project(s) at risk` });
  }

  // Get activities for selected status filter
  const getActivitiesByStatus = (status: string) => {
    if (!weeklyOverview) return [];
    return weeklyOverview.activities.filter((item: any) => item.weeklyActivities.status === status);
  };

  const weekDateRange = getWeekDateRange(displayWeek, year);
  const dateRangeStr = formatDateRange(weekDateRange.start, weekDateRange.end);

  // Generate week options (current week and 12 weeks back/forward)
  const weekOptions = [];
  for (let i = -12; i <= 12; i++) {
    const week = currentWeekNumber + i;
    const y = year + (week > 52 ? 1 : week < 1 ? -1 : 0);
    const w = week > 52 ? week - 52 : week < 1 ? week + 52 : week;
    const range = getWeekDateRange(w, y);
    const label = `Week ${w} (${formatDateRange(range.start, range.end)})`;
    weekOptions.push({ week: w, year: y, label });
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header with Navigation */}
      <AppHeader />

      {/* Main Content - Compact Single Screen */}
      <main className="container py-3 space-y-3">
        {/* Row 1: Team Health + Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Team Health Circle */}
          <Card className="bg-[#d4c4a8]/30 border-0">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="relative">
                <svg className="w-14 h-14 -rotate-90">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#e5ddd0" strokeWidth="4" />
                  <circle 
                    cx="28" cy="28" r="24" fill="none" 
                    stroke="#8b7355" strokeWidth="4"
                    strokeDasharray={`${(teamHealth?.overallScore || 0) * 1.5} 150`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {teamHealth?.overallScore || 0}%
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Team Health</p>
                <p className="text-sm font-medium">{teamHealth?.team.filter(m => (m.currentHealthScore || 0) > 0).length || 0} of {teamHealth?.team.length || 0} checked in</p>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="md:col-span-2 border-0 bg-white/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium">Alerts</span>
              </div>
              {alerts.length > 0 ? (
                <div className="space-y-1">
                  {alerts.slice(0, 3).map((alert, i) => (
                    <div key={i} className={`text-xs px-2 py-1 rounded ${
                      alert.type === "danger" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {alert.message}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-green-600">All systems healthy ✓</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Finance Bars */}
        <Card className="border-0 bg-white/50">
          <CardContent className="p-3 space-y-3">
            {/* YTD Revenue Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-[#8b7355]" />
                  <span className="text-xs font-medium">YTD Revenue</span>
                </div>
                <span className="text-xs text-muted-foreground">Should be R{(shouldBeRevenue / 1000000).toFixed(1)}M</span>
              </div>
              <div className="relative h-6 bg-gray-200 rounded overflow-hidden">
                <div 
                  className="absolute h-full bg-[#8b7355] rounded-r"
                  style={{ width: `${(ytdRevenue / revenueTarget) * 100}%` }}
                />
                <div 
                  className="absolute h-full w-0.5 bg-gray-600"
                  style={{ left: `${(shouldBeRevenue / revenueTarget) * 100}%` }}
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                  R{(ytdRevenue / 1000000).toFixed(1)}M
                </span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                  R{(revenueTarget / 1000000).toFixed(0)}M Annual
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>R0</span>
                <span>R24M</span>
              </div>
            </div>

            {/* Cash Reserves Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1">
                  <Banknote className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium">Cash Reserves</span>
                </div>
                <span className="text-xs text-muted-foreground">Target R1M (Dec)</span>
              </div>
              <div className="relative h-6 bg-gray-200 rounded overflow-hidden">
                <div 
                  className="absolute h-full bg-blue-500 rounded-r"
                  style={{ width: `${(cashReserves / cashTarget) * 100}%` }}
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                  R{(cashReserves / 1000).toFixed(0)}k
                </span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                  R1M target
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>R0</span>
                <span>R1M</span>
              </div>
            </div>

            {/* Tax Liability Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1">
                  <Receipt className="h-3 w-3 text-red-600" />
                  <span className="text-xs font-medium">Tax Liability</span>
                </div>
                <span className="text-xs text-muted-foreground">Target R0</span>
              </div>
              <div className="relative h-6 bg-gray-200 rounded overflow-hidden">
                <div 
                  className="absolute h-full bg-red-500 rounded-r"
                  style={{ width: `${(taxLiability / 500000) * 100}%` }}
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                  R{(taxLiability / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>R0</span>
                <span>R500k</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Row 3: BD Pipeline */}
        <Card className="border-0 bg-white/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-4 w-4 text-[#8b7355]" />
              <span className="text-xs font-medium">BD Pipeline</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {[
                { name: "Lead", metrics: leadMetrics, color: "bg-blue-100 border-blue-300" },
                { name: "Qualified", metrics: qualifiedMetrics, color: "bg-cyan-100 border-cyan-300" },
                { name: "Proposal", metrics: proposalMetrics, color: "bg-purple-100 border-purple-300" },
                { name: "Negotiation", metrics: negotiationMetrics, color: "bg-orange-100 border-orange-300" },
                { name: "Won", metrics: wonMetrics, color: "bg-green-100 border-green-300" },
                { name: "Lost", metrics: lostMetrics, color: "bg-red-100 border-red-300" },
              ].map((stage) => (
                <div key={stage.name} className={`p-2 rounded border ${stage.color}`}>
                  <p className="text-[10px] font-medium text-center">{stage.name}</p>
                  <p className="text-xl font-bold text-center">{stage.metrics.count}</p>
                  <p className="text-[10px] text-center text-muted-foreground">
                    R{(stage.metrics.value / 1000).toFixed(0)}K
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Row 4: Team Weekly Activities Overview */}
        {weeklyOverview && (
          <Card className="border-0 bg-white/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#8b7355]" />
                  <span className="text-xs font-medium">Team Weekly Activities</span>
                </div>
                
                {/* Week Selector */}
                <Select value={selectedWeek?.toString() || ""} onValueChange={(val) => {
                  const [w, y] = val.split('-');
                  setSelectedWeek(parseInt(w));
                }}>
                  <SelectTrigger className="w-48 h-8 text-xs">
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekOptions.map((opt) => (
                      <SelectItem key={`${opt.week}-${opt.year}`} value={`${opt.week}-${opt.year}`}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-muted-foreground mb-3">{dateRangeStr}</p>
              
              {/* Status Summary */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button
                  onClick={() => {
                    setSelectedStatus("pending");
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded bg-blue-50 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <p className="text-[10px] font-medium text-blue-900">Pending</p>
                  </div>
                  <p className="text-lg font-bold text-blue-900">{weeklyOverview.statusSummary.pending}</p>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedStatus("done");
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded bg-green-50 border border-green-200 hover:bg-green-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <p className="text-[10px] font-medium text-green-900">Done</p>
                  </div>
                  <p className="text-lg font-bold text-green-900">{weeklyOverview.statusSummary.done}</p>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedStatus("delayed");
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded bg-amber-50 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    <p className="text-[10px] font-medium text-amber-900">Delayed</p>
                  </div>
                  <p className="text-lg font-bold text-amber-900">{weeklyOverview.statusSummary.delayed}</p>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedStatus("deprioritised");
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded bg-red-50 border border-red-200 hover:bg-red-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <XCircle className="h-3 w-3 text-red-600" />
                    <p className="text-[10px] font-medium text-red-900">Deprioritised</p>
                  </div>
                  <p className="text-lg font-bold text-red-900">{weeklyOverview.statusSummary.deprioritised}</p>
                </button>
              </div>

              {/* Priority Activities */}
              {weeklyOverview.priorityActivities.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium mb-2 text-pink-600">⭐ Priority Activities ({weeklyOverview.priorityActivities.length})</p>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {weeklyOverview.priorityActivities.slice(0, 5).map((item: any) => (
                      <div key={item.weeklyActivities.id} className="text-xs p-1.5 bg-pink-50 rounded border border-pink-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-pink-900">{item.users.name}</p>
                            <p className="text-pink-700 truncate">{item.weeklyActivities.activity}</p>
                          </div>
                          <Badge variant="outline" className="text-[9px] ml-2 whitespace-nowrap">
                            {item.weeklyActivities.dueDay}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Day Distribution */}
              <div>
                <p className="text-xs font-medium mb-2">Activities by Due Day</p>
                <div className="grid grid-cols-7 gap-1">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="text-center p-1 rounded bg-gray-100">
                      <p className="text-[9px] font-medium text-gray-600">{day.slice(0, 3)}</p>
                      <p className="text-sm font-bold text-gray-900">{(weeklyOverview.dueDayDistribution as any)[day] || 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedStatus && selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Activities - Week {displayWeek}
              </DialogTitle>
              <DialogDescription>
                {dateRangeStr}
              </DialogDescription>
            </DialogHeader>

            {selectedStatus && weeklyOverview && (
              <div className="space-y-3">
                {getActivitiesByStatus(selectedStatus).length > 0 ? (
                  getActivitiesByStatus(selectedStatus).map((item: any) => (
                    <Card key={item.weeklyActivities.id} className="border">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{item.weeklyActivities.activity}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Created by: <span className="font-medium">{item.users.name}</span>
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {item.weeklyActivities.dueDay}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <p className="font-medium capitalize">{item.weeklyActivities.status}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Priority</p>
                              <p className="font-medium">{item.weeklyActivities.isPriority ? "Yes ⭐" : "No"}</p>
                            </div>
                          </div>

                          {item.weeklyActivities.accountabilityPartnerId && (
                            <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                              <p className="text-muted-foreground">Assigned Team Member</p>
                              <p className="font-medium text-blue-900">
                                {item.weeklyActivities.partnerRole === "partner" ? "Partner: " : "Helper: "}
                                {/* Note: Would need to fetch partner name from database */}
                                ID: {item.weeklyActivities.accountabilityPartnerId}
                              </p>
                            </div>
                          )}

                          {item.weeklyActivities.dependency && (
                            <div className="text-xs bg-amber-50 p-2 rounded border border-amber-200">
                              <p className="text-muted-foreground">Dependency</p>
                              <p className="font-medium text-amber-900">{item.weeklyActivities.dependency}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No activities with this status</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Row 5: Ventures, Studio, Clients */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Ventures */}
          <Card className="border-0 bg-white/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium">Ventures</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Revenue Generating:</span>
                  <span className="font-bold">{revenueGenerating}/{venturesCards.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Burn Rate:</span>
                  <span className="font-bold">R{(totalBurnRate / 1000).toFixed(0)}k/mo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Studio */}
          <Card className="border-0 bg-white/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-pink-600" />
                <span className="text-xs font-medium">Studio</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>On Track:</span>
                  <span className="font-bold text-green-600">{onTrackProjects}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>At Risk:</span>
                  <span className="font-bold text-red-600">{atRiskProjects}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clients */}
          <Card className="border-0 bg-white/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium">Clients</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {[
                  { name: "Active", count: activeClients.count, color: "text-green-600" },
                  { name: "Prospect", count: prospectClients.count, color: "text-blue-600" },
                  { name: "At Risk", count: atRiskClients.count, color: "text-red-600" },
                  { name: "Churned", count: churnedClients.count, color: "text-gray-600" },
                ].map((type) => (
                  <div key={type.name} className={`p-2 rounded border ${type.color}`}>
                    <p className="text-[10px] font-medium text-center">{type.name}</p>
                    <p className="text-xl font-bold text-center">{type.count}</p>
                    <p className="text-[10px] text-center text-muted-foreground">
                      R{(type.count > 0 ? type.count * 50000 / 1000 : 0).toFixed(0)}K
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

    </div>
  );
}
