import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  PiggyBank,
  Shield
} from "lucide-react";
import { Link, useLocation } from "wouter";
import AppHeader from "@/components/AppHeader";

// Mock finance data
const financeData = {
  ytdRevenue: 1800000,
  annualTarget: 24000000,
  cashReserves: 410000,
  cashTarget: 1000000,
  taxLiability: 320000,
  taxTarget: 0,
  monthlyExpenses: [
    { category: "Salaries", amount: 450000, budget: 500000 },
    { category: "Operations", amount: 85000, budget: 100000 },
    { category: "Marketing", amount: 45000, budget: 60000 },
    { category: "Technology", amount: 35000, budget: 40000 },
    { category: "Office", amount: 25000, budget: 30000 },
  ],
  outstandingInvoices: [
    { client: "Nedbank", amount: 150000, dueDate: "2026-02-15", status: "pending" },
    { client: "Standard Bank", amount: 85000, dueDate: "2026-02-10", status: "overdue" },
    { client: "Discovery", amount: 45000, dueDate: "2026-02-28", status: "pending" },
  ]
};

export default function Stewardship() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [data, setData] = useState(financeData);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentMonth = new Date().getMonth();
  const shouldBeAt = (data.annualTarget / 12) * (currentMonth + 1);
  const revenueProgress = (data.ytdRevenue / data.annualTarget) * 100;
  const cashProgress = (data.cashReserves / data.cashTarget) * 100;

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
          <Badge variant="outline">Jan 2026</Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#5C4B3A] flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-600" />
            Stewardship
          </h2>
          <p className="text-muted-foreground">Financial health and resource stewardship</p>
        </div>

        {/* Key Metrics Bars */}
        <div className="space-y-4">
          {/* YTD Revenue Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">YTD Revenue</span>
                </div>
                <span className="text-sm text-muted-foreground">Should be R{(shouldBeAt / 1000000).toFixed(1)}M</span>
              </div>
              <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                {/* Target line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-800 z-10"
                  style={{ left: `${(shouldBeAt / data.annualTarget) * 100}%` }}
                />
                {/* Progress bar */}
                <div 
                  className="h-full bg-[#8B4513] rounded-lg flex items-center justify-start pl-3"
                  style={{ width: `${revenueProgress}%` }}
                >
                  <span className="text-white font-bold text-sm">R{(data.ytdRevenue / 1000000).toFixed(1)}M</span>
                </div>
                {/* End label */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600">
                  R{(data.annualTarget / 1000000).toFixed(0)}M Annual
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>R0</span>
                <span>R24M</span>
              </div>
            </CardContent>
          </Card>

          {/* Cash Reserves Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Cash Reserves</span>
                </div>
                <span className="text-sm text-muted-foreground">Target R1M (Dec)</span>
              </div>
              <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                {/* Progress bar */}
                <div 
                  className="h-full bg-blue-600 rounded-lg flex items-center justify-start pl-3"
                  style={{ width: `${cashProgress}%` }}
                >
                  <span className="text-white font-bold text-sm">R{(data.cashReserves / 1000).toFixed(0)}k</span>
                </div>
                {/* Target marker */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600">
                  R1M target
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>R0</span>
                <span>R1M</span>
              </div>
            </CardContent>
          </Card>

          {/* Tax Liability Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-red-600" />
                  <span className="font-semibold">Tax Liability</span>
                </div>
                <span className="text-sm text-muted-foreground">Target R0</span>
              </div>
              <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                {/* Progress bar (reversed - starts from right) */}
                <div 
                  className="h-full bg-red-500 rounded-lg flex items-center justify-end pr-3"
                  style={{ width: `${(data.taxLiability / 500000) * 100}%` }}
                >
                  <span className="text-white font-bold text-sm">R{(data.taxLiability / 1000).toFixed(0)}k</span>
                </div>
                {/* Zero target */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-medium text-green-600">
                  R0 target
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>R0 (target)</span>
                <span>R500k</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.monthlyExpenses.map((expense, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{expense.category}</span>
                    <span className={expense.amount > expense.budget ? "text-red-600" : "text-green-600"}>
                      R{(expense.amount / 1000).toFixed(0)}k / R{(expense.budget / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${expense.amount > expense.budget ? "bg-red-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min((expense.amount / expense.budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Outstanding Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.outstandingInvoices.map((invoice, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{invoice.client}</p>
                    <p className="text-xs text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R{(invoice.amount / 1000).toFixed(0)}k</p>
                    <Badge variant={invoice.status === "overdue" ? "destructive" : "outline"} className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Total Outstanding: <span className="font-bold">R{(data.outstandingInvoices.reduce((sum, i) => sum + i.amount, 0) / 1000).toFixed(0)}k</span>
            </p>
          </CardContent>
        </Card>
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
