import { useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  Coins,
  Edit2,
  Gauge,
  Layers3,
  Rocket,
  TrendingUp,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { VentureEditModal } from "@/components/VentureEditModal";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import NotFound from "./NotFound";

function parseJsonObject(value?: string | null) {
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

function formatDate(value?: string | Date | null) {
  if (!value) return "Not set";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

function getDaysToRevenueLabel(value?: string) {
  if (!value || value === "0") return "Revenue generating";
  if (value === "180") return "6 months";
  if (value === "365") return "12 months";
  if (value === "730") return "2+ years";
  return `${value} days`;
}

export default function VentureDetail() {
  const [, navigate] = useLocation();
  const [isMatched, params] = useRoute("/venture/:id");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const ventureId = Number(params?.id);

  const { data: venturesPipeline, isLoading } = trpc.pipelines.getCards.useQuery({ pipelineType: "ventures" });

  const venture = useMemo(
    () => venturesPipeline?.cards.find((card) => card.id === ventureId) ?? null,
    [ventureId, venturesPipeline?.cards],
  );

  const stage = useMemo(
    () => venturesPipeline?.stages.find((item) => item.id === venture?.stageId) ?? null,
    [venture?.stageId, venturesPipeline?.stages],
  );

  if (!isMatched || Number.isNaN(ventureId)) {
    return <NotFound />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <AppHeader />
        <main className="container py-10">
          <Card className="border-0 bg-white/70">
            <CardContent className="p-8 text-sm text-muted-foreground">Loading venture...</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!venture) {
    return <NotFound />;
  }

  const metadata = parseJsonObject(venture.metadata);
  const tags = parseTags(venture.tags);
  const valuation = Number(venture.value || 0);
  const burnRate = Number(metadata.burnRate || 0);
  const runwayMonths = valuation > 0 && burnRate > 0 ? Math.floor(valuation / burnRate) : 0;
  const daysToRevenue = String(metadata.daysToRevenue || "0");
  const status = metadata.status || "Ideation";
  const needsRunwayAttention = runwayMonths > 0 && runwayMonths < 6;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <AppHeader />

      <main className="container py-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Button variant="ghost" size="sm" className="w-fit px-0 text-muted-foreground" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={getStatusClasses(status)}>
                  {status}
                </Badge>
                {stage && <Badge variant="outline">Stage: {stage.name}</Badge>}
                <Badge variant="outline">{getDaysToRevenueLabel(daysToRevenue)}</Badge>
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">{venture.title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {venture.description || "Add a short narrative for this venture so the team can quickly understand what it does and where it needs support."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Button onClick={() => setIsEditOpen(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit venture
            </Button>
          </div>
        </div>

        {needsRunwayAttention && (
          <Card className="border-amber-200 bg-amber-50/90">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-amber-900">
              <Gauge className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                Runway is under 6 months at the current burn rate. This venture may need immediate revenue or cost actions.
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-0 bg-white/70">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="h-4 w-4 text-[#8b7355]" />
                Valuation
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{formatCurrency(valuation)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Stored as the venture card value</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-pink-600" />
                Monthly burn
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{formatCurrency(burnRate, true)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Current estimated monthly spend</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Rocket className="h-4 w-4 text-purple-600" />
                Runway
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {runwayMonths > 0 ? `${runwayMonths} months` : "Not available"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Derived from valuation and burn rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4 text-blue-600" />
                Days to revenue
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{getDaysToRevenueLabel(daysToRevenue)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Commercial readiness estimate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-0 bg-white/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Venture profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-[#faf6ef] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stage</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{stage?.name || "Unassigned"}</p>
                </div>
                <div className="rounded-xl bg-[#f7f0fb] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{status}</p>
                </div>
                <div className="rounded-xl bg-[#eef7f5] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Owner</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {venture.ownerId ? `User #${venture.ownerId}` : "Not assigned"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f7f6ee] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Due date</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{formatDate(venture.dueDate)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-foreground">Description</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {venture.description || "This venture does not have a written description yet."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Operational notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <Layers3 className="mt-0.5 h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No tags added yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <CalendarClock className="mt-0.5 h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Timeline</p>
                  <p className="mt-2 text-sm text-muted-foreground">Created {formatDate(venture.createdAt)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Last updated {formatDate(venture.updatedAt)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Last moved {formatDate(venture.movedAt)}</p>
                </div>
              </div>

              <div className="rounded-xl bg-pink-50 p-4">
                <p className="text-sm font-medium text-foreground">Next useful upgrade</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  If you want this page to become a full venture management hub, the next step would be adding milestones, linked activities, and founder notes under this profile.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <VentureEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        venture={venture}
      />
    </div>
  );
}
