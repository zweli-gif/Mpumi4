import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  Rocket,
  Car,
  DollarSign,
  User
} from "lucide-react";
import { Link, useLocation } from "wouter";
import AppHeader from "@/components/AppHeader";

// Stage gates for ventures
const STAGE_GATES = [
  { id: "ideation", name: "Ideation", position: 0 },
  { id: "validation", name: "Validation", position: 1 },
  { id: "mvp", name: "MVP", position: 2 },
  { id: "pilot", name: "Pilot", position: 3 },
  { id: "scale", name: "Scale", position: 4 },
  { id: "exit", name: "Exit", position: 5 },
];

// Venture type
type Venture = {
  id: number;
  name: string;
  description: string;
  currentStage: string;
  budgetTotal: number; // Total budget in R
  budgetSpent: number; // Amount spent so far
  budgetTarget: number; // Where we should be at this point
  owner: string;
};

// Mock ventures data
const initialVentures: Venture[] = [
  { 
    id: 1, 
    name: "FinTech App", 
    description: "Digital banking solution for SMEs",
    currentStage: "mvp", 
    budgetTotal: 2500000, 
    budgetSpent: 1850000,
    budgetTarget: 1500000,
    owner: "Thabo M."
  },
  { 
    id: 2, 
    name: "AgriTech Platform", 
    description: "Farm management and marketplace",
    currentStage: "validation", 
    budgetTotal: 1800000, 
    budgetSpent: 420000,
    budgetTarget: 500000,
    owner: "Naledi K."
  },
  { 
    id: 3, 
    name: "EdTech Solution", 
    description: "Online learning for African schools",
    currentStage: "ideation", 
    budgetTotal: 1200000, 
    budgetSpent: 85000,
    budgetTarget: 100000,
    owner: "Mpumi D."
  },
  { 
    id: 4, 
    name: "HealthTech", 
    description: "Telemedicine platform",
    currentStage: "scale", 
    budgetTotal: 4000000, 
    budgetSpent: 3200000,
    budgetTarget: 3500000,
    owner: "Bongani S."
  },
  { 
    id: 5, 
    name: "LogiTech", 
    description: "Last-mile delivery optimization",
    currentStage: "pilot", 
    budgetTotal: 2000000, 
    budgetSpent: 1100000,
    budgetTarget: 1200000,
    owner: "Zweli G."
  },
];

// Car icon component for stage indicator
const CarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-purple-600">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);

export default function NewFrontiers() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [ventures, setVentures] = useState(initialVentures);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVenture, setNewVenture] = useState({ 
    name: "", 
    description: "",
    currentStage: "ideation", 
    budgetTotal: "", 
    owner: "" 
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const addVenture = () => {
    if (!newVenture.name || !newVenture.budgetTotal) {
      toast.error("Please fill in venture name and budget");
      return;
    }
    const venture: Venture = {
      id: Math.max(...ventures.map(v => v.id)) + 1,
      name: newVenture.name,
      description: newVenture.description,
      currentStage: newVenture.currentStage,
      budgetTotal: parseInt(newVenture.budgetTotal),
      budgetSpent: 0,
      budgetTarget: 0,
      owner: newVenture.owner || "Unassigned",
    };
    setVentures([...ventures, venture]);
    setNewVenture({ name: "", description: "", currentStage: "ideation", budgetTotal: "", owner: "" });
    setIsAddDialogOpen(false);
    toast.success("Venture added");
  };

  const updateVentureStage = (ventureId: number, newStage: string) => {
    setVentures(ventures.map(v => 
      v.id === ventureId ? { ...v, currentStage: newStage } : v
    ));
    toast.success("Stage updated");
  };

  // Get stage position (0-5)
  const getStagePosition = (stageId: string): number => {
    const stage = STAGE_GATES.find(s => s.id === stageId);
    return stage ? stage.position : 0;
  };

  // Calculate burn rate status
  const getBurnStatus = (spent: number, target: number): { color: string; label: string } => {
    const ratio = spent / target;
    if (ratio <= 0.9) return { color: "bg-green-500", label: "Under budget" };
    if (ratio <= 1.1) return { color: "bg-amber-500", label: "On budget" };
    return { color: "bg-red-500", label: "Over budget" };
  };

  // Calculate totals
  const totalBudget = ventures.reduce((sum, v) => sum + v.budgetTotal, 0);
  const totalSpent = ventures.reduce((sum, v) => sum + v.budgetSpent, 0);

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Venture
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Venture</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Venture Name</label>
                  <Input 
                    value={newVenture.name} 
                    onChange={(e) => setNewVenture({...newVenture, name: e.target.value})}
                    placeholder="Venture name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input 
                    value={newVenture.description} 
                    onChange={(e) => setNewVenture({...newVenture, description: e.target.value})}
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Starting Stage</label>
                  <Select value={newVenture.currentStage} onValueChange={(v) => setNewVenture({...newVenture, currentStage: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGE_GATES.map(stage => (
                        <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Budget (R)</label>
                  <Input 
                    type="number"
                    value={newVenture.budgetTotal} 
                    onChange={(e) => setNewVenture({...newVenture, budgetTotal: e.target.value})}
                    placeholder="Total budget"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <Input 
                    value={newVenture.owner} 
                    onChange={(e) => setNewVenture({...newVenture, owner: e.target.value})}
                    placeholder="Team member"
                  />
                </div>
                <Button onClick={addVenture} className="w-full">Add Venture</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#5C4B3A] flex items-center gap-2">
            <Rocket className="h-6 w-6 text-purple-600" />
            New Frontiers
          </h2>
          <p className="text-muted-foreground text-sm">Venture portfolio with stage gates and burn rate tracking</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Active Ventures</p>
              <p className="text-lg font-bold">{ventures.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Total Budget</p>
              <p className="text-lg font-bold">R{(totalBudget / 1000000).toFixed(1)}M</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-lg font-bold">R{(totalSpent / 1000000).toFixed(1)}M</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">In Scale/Exit</p>
              <p className="text-lg font-bold text-green-600">
                {ventures.filter(v => v.currentStage === "scale" || v.currentStage === "exit").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ventures List */}
        <div className="space-y-4">
          {ventures.map(venture => {
            const stagePosition = getStagePosition(venture.currentStage);
            const burnStatus = getBurnStatus(venture.budgetSpent, venture.budgetTarget);
            const spentPercent = (venture.budgetSpent / venture.budgetTotal) * 100;
            const targetPercent = (venture.budgetTarget / venture.budgetTotal) * 100;

            return (
              <Card key={venture.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Venture Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{venture.name}</h3>
                      <p className="text-sm text-muted-foreground">{venture.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {venture.owner}
                      </Badge>
                      <Select 
                        value={venture.currentStage} 
                        onValueChange={(v) => updateVentureStage(venture.id, v)}
                      >
                        <SelectTrigger className="h-7 w-28 text-xs bg-purple-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGE_GATES.map(stage => (
                            <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Stage Gates Bar */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Stage Progress</p>
                    <div className="relative">
                      {/* Stage bar background */}
                      <div className="h-8 bg-slate-100 rounded-full flex overflow-hidden">
                        {STAGE_GATES.map((stage, i) => (
                          <div 
                            key={stage.id}
                            className={`flex-1 flex items-center justify-center text-[10px] font-medium border-r border-white last:border-r-0 ${
                              i <= stagePosition ? 'bg-purple-200 text-purple-800' : 'text-slate-400'
                            }`}
                          >
                            {stage.name}
                          </div>
                        ))}
                      </div>
                      {/* Car indicator */}
                      <div 
                        className="absolute top-0 transition-all duration-300"
                        style={{ 
                          left: `calc(${(stagePosition / (STAGE_GATES.length - 1)) * 100}% - 12px)`,
                          transform: 'translateY(-8px)'
                        }}
                      >
                        <CarIcon />
                      </div>
                    </div>
                  </div>

                  {/* Burn Rate Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground">Burn Rate</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${burnStatus.color === 'bg-red-500' ? 'border-red-300 text-red-600' : burnStatus.color === 'bg-amber-500' ? 'border-amber-300 text-amber-600' : 'border-green-300 text-green-600'}`}>
                          {burnStatus.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          R{(venture.budgetSpent / 1000000).toFixed(2)}M / R{(venture.budgetTotal / 1000000).toFixed(2)}M
                        </span>
                      </div>
                    </div>
                    <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
                      {/* Spent bar */}
                      <div 
                        className={`absolute left-0 top-0 h-full ${burnStatus.color} transition-all duration-300`}
                        style={{ width: `${Math.min(spentPercent, 100)}%` }}
                      />
                      {/* Target line */}
                      <div 
                        className="absolute top-0 h-full w-0.5 bg-slate-800"
                        style={{ left: `${targetPercent}%` }}
                      />
                      {/* Target label */}
                      <div 
                        className="absolute top-0 text-[9px] font-medium text-slate-600 bg-white px-1 rounded"
                        style={{ left: `${targetPercent}%`, transform: 'translateX(-50%) translateY(-100%)' }}
                      >
                        Target
                      </div>
                      {/* Budget total on right */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-600">
                        R{(venture.budgetTotal / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
