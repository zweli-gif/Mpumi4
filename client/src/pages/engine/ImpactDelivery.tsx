import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { 
  Home as HomeIcon, 
  LayoutDashboard, 
  Cog, 
  Calendar, 
  CalendarDays, 
  Settings, 
  Loader2,
  Plus,
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronRight,
  User,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Link, useLocation } from "wouter";
import AppHeader from "@/components/AppHeader";

// Types
type TeamMember = {
  id: number;
  name: string;
  role: string;
  billingPlan: number[]; // 6 months of billing (R)
  costPlan: number[]; // 6 months of cost (R)
};

type Project = {
  id: number;
  name: string;
  status: "overperforming" | "on-track" | "issues";
  statusOwner: string;
  teamMembers: TeamMember[];
};

type Client = {
  id: number;
  name: string;
  projects: Project[];
};

// Mock data - 6 months starting from current month
const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

const initialClients: Client[] = [
  {
    id: 1,
    name: "Nedbank",
    projects: [
      {
        id: 1,
        name: "Mobile App Redesign",
        status: "on-track",
        statusOwner: "Thabo M.",
        teamMembers: [
          { id: 1, name: "Thabo Mokoena", role: "Lead Designer", billingPlan: [85000, 85000, 85000, 85000, 85000, 85000], costPlan: [55000, 55000, 55000, 55000, 55000, 55000] },
          { id: 2, name: "Naledi Khumalo", role: "UX Designer", billingPlan: [65000, 65000, 65000, 0, 0, 0], costPlan: [42000, 42000, 42000, 0, 0, 0] },
          { id: 3, name: "Junior Dev", role: "Developer", billingPlan: [45000, 45000, 45000, 45000, 45000, 45000], costPlan: [38000, 38000, 38000, 38000, 38000, 38000] },
        ]
      },
      {
        id: 2,
        name: "Brand Strategy",
        status: "overperforming",
        statusOwner: "Mpumi D.",
        teamMembers: [
          { id: 4, name: "Mpumi Dlamini", role: "Strategy Lead", billingPlan: [95000, 95000, 50000, 0, 0, 0], costPlan: [60000, 60000, 35000, 0, 0, 0] },
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Standard Bank",
    projects: [
      {
        id: 3,
        name: "Digital Transformation",
        status: "issues",
        statusOwner: "Bongani S.",
        teamMembers: [
          { id: 5, name: "Bongani Sithole", role: "Project Manager", billingPlan: [75000, 75000, 75000, 75000, 75000, 75000], costPlan: [65000, 65000, 65000, 65000, 65000, 65000] },
          { id: 6, name: "Senior Dev", role: "Tech Lead", billingPlan: [120000, 120000, 120000, 120000, 120000, 120000], costPlan: [85000, 85000, 85000, 85000, 85000, 85000] },
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Discovery",
    projects: [
      {
        id: 4,
        name: "Customer Portal",
        status: "on-track",
        statusOwner: "Naledi K.",
        teamMembers: [
          { id: 7, name: "Naledi Khumalo", role: "UX Lead", billingPlan: [70000, 70000, 70000, 70000, 70000, 70000], costPlan: [45000, 45000, 45000, 45000, 45000, 45000] },
          { id: 8, name: "Frontend Dev", role: "Developer", billingPlan: [55000, 55000, 55000, 55000, 55000, 55000], costPlan: [48000, 48000, 48000, 48000, 48000, 48000] },
        ]
      }
    ]
  }
];

// Calculate margin percentage
const calculateMargin = (billing: number, cost: number): number => {
  if (billing === 0) return 0;
  return Math.round(((billing - cost) / billing) * 100);
};

// Get margin color class
const getMarginColor = (margin: number): string => {
  if (margin < 20) return "text-red-600 bg-red-50";
  if (margin < 30) return "text-amber-600 bg-amber-50";
  return "text-green-600 bg-green-50";
};

// Get status icon and color
const getStatusDisplay = (status: string) => {
  switch (status) {
    case "overperforming":
      return { icon: TrendingUp, color: "text-green-600", bg: "bg-green-100", label: "Overperforming" };
    case "on-track":
      return { icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-100", label: "On Track" };
    case "issues":
      return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100", label: "Issues" };
    default:
      return { icon: Clock, color: "text-gray-600", bg: "bg-gray-100", label: "Unknown" };
  }
};

export default function ImpactDelivery() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [clients, setClients] = useState(initialClients);
  const [expandedClients, setExpandedClients] = useState<number[]>([1, 2, 3]);
  const [expandedProjects, setExpandedProjects] = useState<number[]>([1, 3, 4]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const toggleClient = (clientId: number) => {
    setExpandedClients(prev => 
      prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]
    );
  };

  const toggleProject = (projectId: number) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const updateProjectStatus = (clientId: number, projectId: number, newStatus: "overperforming" | "on-track" | "issues") => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          projects: client.projects.map(project => 
            project.id === projectId ? { ...project, status: newStatus } : project
          )
        };
      }
      return client;
    }));
    toast.success("Project status updated");
  };

  // Calculate totals
  const totalBilling = clients.reduce((sum, client) => 
    sum + client.projects.reduce((pSum, project) => 
      pSum + project.teamMembers.reduce((tSum, member) => 
        tSum + member.billingPlan.reduce((a, b) => a + b, 0), 0), 0), 0);

  const totalCost = clients.reduce((sum, client) => 
    sum + client.projects.reduce((pSum, project) => 
      pSum + project.teamMembers.reduce((tSum, member) => 
        tSum + member.costPlan.reduce((a, b) => a + b, 0), 0), 0), 0);

  const overallMargin = calculateMargin(totalBilling, totalCost);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/engine")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-xl font-bold text-foreground">Growth <span className="text-pink-500">F</span>arm</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {clients.length} Clients • {clients.reduce((sum, c) => sum + c.projects.length, 0)} Projects
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#5C4B3A] flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Impact Delivery
          </h2>
          <p className="text-muted-foreground text-sm">Client projects, team allocation, and financial tracking</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">6-Month Billing</p>
              <p className="text-lg font-bold">R{(totalBilling / 1000000).toFixed(1)}M</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">6-Month Cost</p>
              <p className="text-lg font-bold">R{(totalCost / 1000000).toFixed(1)}M</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Overall Margin</p>
              <p className={`text-lg font-bold ${overallMargin < 20 ? 'text-red-600' : overallMargin < 30 ? 'text-amber-600' : 'text-green-600'}`}>
                {overallMargin}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Projects with Issues</p>
              <p className="text-lg font-bold text-red-600">
                {clients.reduce((sum, c) => sum + c.projects.filter(p => p.status === "issues").length, 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Client/Project/Team Hierarchy */}
        <div className="space-y-3">
          {clients.map(client => (
            <Card key={client.id} className="overflow-hidden">
              {/* Client Header */}
              <Collapsible open={expandedClients.includes(client.id)} onOpenChange={() => toggleClient(client.id)}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center gap-2">
                      {expandedClients.includes(client.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <Building2 className="h-4 w-4 text-slate-600" />
                      <span className="font-semibold">{client.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  {/* Projects */}
                  {client.projects.map(project => (
                    <div key={project.id} className="border-t">
                      <Collapsible open={expandedProjects.includes(project.id)} onOpenChange={() => toggleProject(project.id)}>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 pl-8 bg-blue-50/50 cursor-pointer hover:bg-blue-50">
                            <div className="flex items-center gap-2">
                              {expandedProjects.includes(project.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <span className="font-medium text-sm">{project.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select 
                                value={project.status} 
                                onValueChange={(v) => updateProjectStatus(client.id, project.id, v as any)}
                              >
                                <SelectTrigger className={`h-7 w-32 text-xs ${getStatusDisplay(project.status).bg}`}>
                                  <div className="flex items-center gap-1">
                                    {(() => {
                                      const StatusIcon = getStatusDisplay(project.status).icon;
                                      return <StatusIcon className={`h-3 w-3 ${getStatusDisplay(project.status).color}`} />;
                                    })()}
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="overperforming">Overperforming</SelectItem>
                                  <SelectItem value="on-track">On Track</SelectItem>
                                  <SelectItem value="issues">Issues</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-[10px] text-muted-foreground">{project.statusOwner}</span>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          {/* Team Members Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-muted/30">
                                <tr>
                                  <th className="text-left p-2 pl-12 font-medium w-40">Team Member</th>
                                  <th className="text-left p-2 font-medium w-24">Role</th>
                                  <th className="text-center p-2 font-medium" colSpan={6}>Billing Plan (R)</th>
                                  <th className="text-center p-2 font-medium" colSpan={6}>Cost Plan (R)</th>
                                  <th className="text-center p-2 font-medium" colSpan={6}>Margin %</th>
                                </tr>
                                <tr className="bg-muted/20">
                                  <th className="p-1 pl-12"></th>
                                  <th className="p-1"></th>
                                  {months.map(m => <th key={`b-${m}`} className="p-1 text-center text-[10px] text-muted-foreground">{m}</th>)}
                                  {months.map(m => <th key={`c-${m}`} className="p-1 text-center text-[10px] text-muted-foreground">{m}</th>)}
                                  {months.map(m => <th key={`m-${m}`} className="p-1 text-center text-[10px] text-muted-foreground">{m}</th>)}
                                </tr>
                              </thead>
                              <tbody>
                                {project.teamMembers.map(member => (
                                  <tr key={member.id} className="border-t hover:bg-muted/20">
                                    <td className="p-2 pl-12">
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                        <span className="font-medium">{member.name}</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-muted-foreground">{member.role}</td>
                                    {/* Billing */}
                                    {member.billingPlan.map((billing, i) => (
                                      <td key={`b-${i}`} className="p-1 text-center">
                                        {billing > 0 ? `${(billing / 1000).toFixed(0)}k` : '-'}
                                      </td>
                                    ))}
                                    {/* Cost */}
                                    {member.costPlan.map((cost, i) => (
                                      <td key={`c-${i}`} className="p-1 text-center text-muted-foreground">
                                        {cost > 0 ? `${(cost / 1000).toFixed(0)}k` : '-'}
                                      </td>
                                    ))}
                                    {/* Margin */}
                                    {member.billingPlan.map((billing, i) => {
                                      const margin = calculateMargin(billing, member.costPlan[i]);
                                      return (
                                        <td key={`m-${i}`} className="p-1 text-center">
                                          {billing > 0 ? (
                                            <span className={`px-1 py-0.5 rounded text-[10px] font-medium ${getMarginColor(margin)}`}>
                                              {margin}%
                                            </span>
                                          ) : '-'}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                                {/* Project Totals */}
                                <tr className="border-t-2 bg-slate-50 font-medium">
                                  <td className="p-2 pl-12" colSpan={2}>Project Total</td>
                                  {months.map((_, i) => {
                                    const totalBilling = project.teamMembers.reduce((sum, m) => sum + m.billingPlan[i], 0);
                                    return (
                                      <td key={`tb-${i}`} className="p-1 text-center">
                                        {totalBilling > 0 ? `${(totalBilling / 1000).toFixed(0)}k` : '-'}
                                      </td>
                                    );
                                  })}
                                  {months.map((_, i) => {
                                    const totalCost = project.teamMembers.reduce((sum, m) => sum + m.costPlan[i], 0);
                                    return (
                                      <td key={`tc-${i}`} className="p-1 text-center text-muted-foreground">
                                        {totalCost > 0 ? `${(totalCost / 1000).toFixed(0)}k` : '-'}
                                      </td>
                                    );
                                  })}
                                  {months.map((_, i) => {
                                    const totalBilling = project.teamMembers.reduce((sum, m) => sum + m.billingPlan[i], 0);
                                    const totalCost = project.teamMembers.reduce((sum, m) => sum + m.costPlan[i], 0);
                                    const margin = calculateMargin(totalBilling, totalCost);
                                    return (
                                      <td key={`tm-${i}`} className="p-1 text-center">
                                        {totalBilling > 0 ? (
                                          <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${getMarginColor(margin)}`}>
                                            {margin}%
                                          </span>
                                        ) : '-'}
                                      </td>
                                    );
                                  })}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
        <div className="grid grid-cols-6 h-16">
          <Link href="/" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground">
            <HomeIcon className="h-5 w-5" />
            <span className="text-[10px]">Home</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px]">Dashboard</span>
          </Link>
          <Link href="/engine" className="flex flex-col items-center justify-center gap-1 text-primary">
            <Cog className="h-5 w-5" />
            <span className="text-[10px] font-medium">Engine</span>
          </Link>
          <Link href="/monthly" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground">
            <Calendar className="h-5 w-5" />
            <span className="text-[10px]">Monthly</span>
          </Link>
          <Link href="/weekly" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground">
            <CalendarDays className="h-5 w-5" />
            <span className="text-[10px]">Weekly</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
            <span className="text-[10px]">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
