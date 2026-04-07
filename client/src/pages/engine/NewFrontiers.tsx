import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit2,
  Loader2,
  Plus,
  Rocket,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import AppHeader from "@/components/AppHeader";
import { trpc } from "@/lib/trpc";
import { VentureEditModal } from "@/components/VentureEditModal";

function parseMetadata(value?: string | null) {
  if (!value) return {};

  try {
    return JSON.parse(value) as Record<string, any>;
  } catch {
    return {};
  }
}

function parseTags(value?: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

function formatCurrency(amount: number, compact = false) {
  if (!Number.isFinite(amount) || amount <= 0) return "R0";

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(amount);
}

function getDaysToRevenueLabel(value?: string) {
  if (!value || value === "0") return "Revenue generating";
  if (value === "180") return "6 months";
  if (value === "365") return "12 months";
  if (value === "730") return "2+ years";
  return `${value} days`;
}

function getStatusClasses(status: string) {
  switch (status) {
    case "Revenue generating":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Growth":
      return "bg-green-100 text-green-800 border-green-200";
    case "Launch":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Beta":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "MVP Development":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Validation":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "Scaling":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "Exited":
      return "bg-slate-100 text-slate-800 border-slate-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

const DEFAULT_VENTURE_STAGES = [
  { name: "Idea Dump", order: 1, probabilityWeight: 5, color: "#D4A5A5" },
  { name: "Concept", order: 2, probabilityWeight: 20, color: "#D4A5A5" },
  { name: "Discovery", order: 3, probabilityWeight: 40, color: "#D4A5A5" },
  { name: "MVP Build", order: 4, probabilityWeight: 60, color: "#D4A5A5" },
  { name: "Pilot", order: 5, probabilityWeight: 80, color: "#D4A5A5" },
  { name: "Live", order: 6, probabilityWeight: 90, color: "#4A7C59" },
  { name: "Scaling", order: 7, probabilityWeight: 100, color: "#4A7C59" },
];

const LEGACY_SAMPLE_VENTURES = [
  { name: "FinTech App", description: "Digital banking solution for SMEs", stage: "MVP", owner: "Thabo M." },
  { name: "AgriTech Platform", description: "Farm management and marketplace", stage: "Validation", owner: "Naledi K." },
  { name: "EdTech Solution", description: "Online learning for African schools", stage: "Ideation", owner: "Mpumi D." },
  { name: "HealthTech", description: "Telemedicine platform", stage: "Scale", owner: "Bongani S." },
  { name: "LogiTech", description: "Last-mile delivery optimization", stage: "Pilot", owner: "Zweli G." },
];

export default function NewFrontiers() {
  const { loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVenture, setEditingVenture] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newVenture, setNewVenture] = useState({
    title: "",
    description: "",
    stageId: "",
    value: "",
    burnRate: "",
    daysToRevenue: "0",
    status: "Ideation",
    tags: "",
  });

  const { data: venturesPipeline, isLoading } = trpc.pipelines.getCards.useQuery({ pipelineType: "ventures" });

  const createCardMutation = trpc.pipelines.createCard.useMutation({
    onSuccess: async () => {
      await utils.pipelines.getCards.invalidate({ pipelineType: "ventures" });
      toast.success("Venture created");
      setIsAddDialogOpen(false);
      setNewVenture({
        title: "",
        description: "",
        stageId: "",
        value: "",
        burnRate: "",
        daysToRevenue: "0",
        status: "Ideation",
        tags: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create venture");
    },
  });

  const createStageMutation = trpc.pipelines.createStage.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to set up venture stages");
    },
  });

  const moveCardMutation = trpc.pipelines.moveCard.useMutation({
    onSuccess: async () => {
      await utils.pipelines.getCards.invalidate({ pipelineType: "ventures" });
      toast.success("Venture stage updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to move venture");
    },
  });

  const deleteCardMutation = trpc.pipelines.deleteCard.useMutation({
    onSuccess: async () => {
      await utils.pipelines.getCards.invalidate({ pipelineType: "ventures" });
      toast.success("Venture deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete venture");
    },
  });

  const stages = venturesPipeline?.stages ?? [];
  const ventures = venturesPipeline?.cards ?? [];

  const ventureCards = useMemo(
    () =>
      ventures.map((venture) => {
        const metadata = parseMetadata(venture.metadata);
        return {
          ...venture,
          metadata,
          tagsList: parseTags(venture.tags),
          burnRate: Number(metadata.burnRate || 0),
          valuation: Number(venture.value || 0),
          status: metadata.status || "Ideation",
          daysToRevenue: String(metadata.daysToRevenue || "0"),
        };
      }),
    [ventures],
  );

  const totalPortfolioValue = ventureCards.reduce((sum, venture) => sum + venture.valuation, 0);
  const totalBurnRate = ventureCards.reduce((sum, venture) => sum + venture.burnRate, 0);
  const revenueGeneratingCount = ventureCards.filter(
    (venture) => venture.daysToRevenue === "0" || venture.status === "Revenue generating",
  ).length;
  const pilotOrBetterCount = ventureCards.filter((venture) => {
    const stage = stages.find((item) => item.id === venture.stageId);
    return stage ? stage.order >= 5 : false;
  }).length;

  const handleCreateVenture = async () => {
    if (!newVenture.title.trim()) {
      toast.error("Please enter a venture name");
      return;
    }

    if (stages.length === 0) {
      for (const stage of DEFAULT_VENTURE_STAGES) {
        await createStageMutation.mutateAsync({
          pipelineType: "ventures",
          name: stage.name,
          order: stage.order,
          probabilityWeight: stage.probabilityWeight,
          color: stage.color,
        });
      }

      await utils.pipelines.getCards.invalidate({ pipelineType: "ventures" });
      await utils.pipelines.getStages.invalidate({ pipelineType: "ventures" });
      toast.success("Default venture stages created. Click create venture again to add your first venture.");
      return;
    }

    const fallbackStageId = stages[0]?.id;
    const stageId = Number(newVenture.stageId || fallbackStageId);
    if (!stageId) {
      toast.error("No venture stages are configured yet");
      return;
    }

    const tags = newVenture.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    await createCardMutation.mutateAsync({
      stageId,
      title: newVenture.title.trim(),
      description: newVenture.description.trim() || undefined,
      value: newVenture.value.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      metadata: {
        ...(newVenture.burnRate ? { burnRate: Number(newVenture.burnRate) } : {}),
        daysToRevenue: newVenture.daysToRevenue,
        status: newVenture.status,
      },
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Button variant="ghost" size="sm" className="w-fit px-0 text-muted-foreground" onClick={() => navigate("/engine")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to engine
            </Button>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#5C4B3A] flex items-center gap-2">
                <Rocket className="h-7 w-7 text-purple-600" />
                New Frontiers
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Comprehensive ventures portfolio using the live ventures pipeline data.
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Venture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add new venture</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Venture name</label>
                  <Input
                    value={newVenture.title}
                    onChange={(e) => setNewVenture({ ...newVenture, title: e.target.value })}
                    placeholder="e.g. Briansfomo"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newVenture.description}
                    onChange={(e) => setNewVenture({ ...newVenture, description: e.target.value })}
                    placeholder="Brief description"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Starting stage</label>
                    <Select
                      value={newVenture.stageId}
                      onValueChange={(value) => setNewVenture({ ...newVenture, stageId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage.id} value={String(stage.id)}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valuation (R)</label>
                    <Input
                      type="number"
                      value={newVenture.value}
                      onChange={(e) => setNewVenture({ ...newVenture, value: e.target.value })}
                      placeholder="5000000"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly burn</label>
                    <Input
                      type="number"
                      value={newVenture.burnRate}
                      onChange={(e) => setNewVenture({ ...newVenture, burnRate: e.target.value })}
                      placeholder="50000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Days to revenue</label>
                    <Select
                      value={newVenture.daysToRevenue}
                      onValueChange={(value) => setNewVenture({ ...newVenture, daysToRevenue: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Revenue generating</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">6 months</SelectItem>
                        <SelectItem value="365">12 months</SelectItem>
                        <SelectItem value="730">2+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={newVenture.status}
                      onValueChange={(value) => setNewVenture({ ...newVenture, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ideation">Ideation</SelectItem>
                        <SelectItem value="Validation">Validation</SelectItem>
                        <SelectItem value="MVP Development">MVP Development</SelectItem>
                        <SelectItem value="Beta">Beta</SelectItem>
                        <SelectItem value="Launch">Launch</SelectItem>
                        <SelectItem value="Growth">Growth</SelectItem>
                        <SelectItem value="Revenue generating">Revenue generating</SelectItem>
                        <SelectItem value="Scaling">Scaling</SelectItem>
                        <SelectItem value="Exited">Exited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    value={newVenture.tags}
                    onChange={(e) => setNewVenture({ ...newVenture, tags: e.target.value })}
                    placeholder="proptech, education"
                  />
                </div>

                <Button
                  onClick={handleCreateVenture}
                  className="w-full"
                  disabled={createCardMutation.isPending || createStageMutation.isPending}
                >
                  {createCardMutation.isPending || createStageMutation.isPending ? "Creating..." : "Create venture"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Active Ventures</p>
              <p className="mt-2 text-2xl font-semibold">{ventureCards.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Portfolio Value</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalPortfolioValue, true)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Monthly Burn</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalBurnRate, true)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Pilot or Better</p>
              <p className="mt-2 text-2xl font-semibold text-green-700">{pilotOrBetterCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Full venture list</CardTitle>
          </CardHeader>
          <CardContent>
            {ventureCards.length === 0 ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No ventures found in the live ventures pipeline yet.
                </div>
                <Card className="border border-amber-200 bg-amber-50/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Legacy sample ventures</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      These are the prototype ventures from the older mock New Frontiers page. They are read-only and separate from the live ventures pipeline.
                    </p>
                    {LEGACY_SAMPLE_VENTURES.map((venture) => (
                      <div key={venture.name} className="rounded-lg border border-amber-200 bg-white/80 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{venture.name}</p>
                          <Badge variant="outline">{venture.stage}</Badge>
                          <Badge variant="secondary">{venture.owner}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{venture.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                {ventureCards.map((venture) => {
                  const stage = stages.find((item) => item.id === venture.stageId);
                  const runwayMonths =
                    venture.valuation > 0 && venture.burnRate > 0
                      ? Math.floor(venture.valuation / venture.burnRate)
                      : 0;

                  return (
                    <Card key={venture.id} className="overflow-hidden border border-slate-200">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-foreground">{venture.title}</h3>
                              <Badge variant="outline" className={getStatusClasses(venture.status)}>
                                {venture.status}
                              </Badge>
                              {stage && <Badge variant="outline">Stage: {stage.name}</Badge>}
                              <Badge variant="outline">{getDaysToRevenueLabel(venture.daysToRevenue)}</Badge>
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {venture.description || "No description added yet."}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {venture.tagsList.length > 0 ? (
                                venture.tagsList.map((tag) => (
                                  <Badge key={tag} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">No tags</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Select
                              value={String(venture.stageId)}
                              onValueChange={(value) => moveCardMutation.mutate({ cardId: venture.id, newStageId: Number(value) })}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {stages.map((stageItem) => (
                                  <SelectItem key={stageItem.id} value={String(stageItem.id)}>
                                    {stageItem.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Link href={`/venture/${venture.id}`}>
                              <Button variant="outline">Open</Button>
                            </Link>

                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingVenture(venture);
                                setIsEditOpen(true);
                              }}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete venture?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove {venture.title} from the ventures pipeline.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteCardMutation.mutate({ id: venture.id })}>
                                    Delete venture
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-4">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-muted-foreground">Valuation</p>
                            <p className="mt-2 text-base font-semibold">{formatCurrency(venture.valuation)}</p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-muted-foreground">Monthly burn</p>
                            <p className="mt-2 text-base font-semibold">{formatCurrency(venture.burnRate, true)}</p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-muted-foreground">Runway</p>
                            <p className="mt-2 text-base font-semibold">
                              {runwayMonths > 0 ? `${runwayMonths} months` : "Not available"}
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-muted-foreground">Owner</p>
                            <p className="mt-2 flex items-center gap-1 text-base font-semibold">
                              <User className="h-4 w-4 text-slate-400" />
                              {venture.ownerId ? `User #${venture.ownerId}` : "Unassigned"}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl bg-purple-50 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs text-purple-700">Commercial readiness</p>
                              <p className="mt-1 text-sm font-medium text-purple-950">
                                {getDaysToRevenueLabel(venture.daysToRevenue)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-purple-700">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-xs">
                                {venture.daysToRevenue === "0" ? "Already generating revenue" : `${revenueGeneratingCount} revenue-generating ventures in portfolio`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <VentureEditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingVenture(null);
        }}
        venture={editingVenture}
      />
    </div>
  );
}
