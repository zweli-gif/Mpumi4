import React, { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Format large numbers for display in circles
function formatValue(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num >= 100) {
    return num.toFixed(0);
  } else if (num >= 10) {
    return num.toFixed(1);
  } else {
    return num.toFixed(2);
  }
}

// Format unit for display (with short forms for money)
function formatUnit(unit: string): string {
  const lowerUnit = unit.toLowerCase();
  
  // Money units
  if (lowerUnit.includes('zar') || lowerUnit.includes('rand')) {
    return 'ZAR';
  }
  if (lowerUnit.includes('usd') || lowerUnit.includes('dollar')) {
    return 'USD';
  }
  
  // Other common units
  if (lowerUnit.includes('percent') || unit === '%') {
    return '%';
  }
  if (lowerUnit.includes('count') || lowerUnit.includes('number')) {
    return '#';
  }
  if (lowerUnit.includes('day')) {
    return 'days';
  }
  
  return unit;
}

// Progress wheel component
function ProgressWheel({ 
  progress, 
  target, 
  size = 32,
  strokeWidth = 3,
  isYTD = false,
  onClick,
  editable = false
}: { 
  progress: number; 
  target: string; 
  size?: number; 
  strokeWidth?: number;
  isYTD?: boolean;
  onClick?: () => void;
  editable?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressValue = Math.min(Math.max(progress, 0), 100);
  const offset = circumference - (progressValue / 100) * circumference;

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`} 
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressValue >= 80 ? "#10b981" : progressValue >= 50 ? "#f59e0b" : "#ef4444"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {/* Target value in center */}
      <div className={`absolute inset-0 flex items-center justify-center ${isYTD ? 'text-[7px]' : 'text-[6px]'} font-semibold text-gray-700`}>
        {formatValue(target)}
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: 'ok' | 'check' | 'save' }) {
  const config = {
    ok: { label: 'OK', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    check: { label: 'Check', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    save: { label: 'Save', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  };

  const { label, bg, text, border } = config[status];

  return (
    <div className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-semibold ${bg} ${text} ${border} border`}>
      {label}
    </div>
  );
}

export default function Monthly() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  // Edit dialog state
  const [editDialog, setEditDialog] = React.useState<{
    open: boolean;
    goalId: number;
    month: number;
    currentValue: string;
    unit: string;
    goalName: string;
  } | null>(null);
  const [editValue, setEditValue] = React.useState('');
  
  // Fetch goals with status
  const { data: goalsWithStatus, isLoading: goalsLoading } = trpc.goals.getWithStatus.useQuery({ year: currentYear });
  
  // Fetch strategic objectives for colors/styling
  const { data: objectives } = trpc.strategicObjectives.getAll.useQuery({ year: currentYear });
  
  // Fetch monthly targets
  const { data: monthlyTargetsData } = trpc.goals.getAllMonthlyForYear.useQuery({ year: currentYear });
  const monthlyTargets = monthlyTargetsData?.map(t => t.monthlyTargets);
  
  // Update mutation
  const utils = trpc.useUtils();
  const updateMutation = trpc.goals.updateMonthlyActualByGoalMonth.useMutation({
    onSuccess: () => {
      utils.goals.getAllMonthlyForYear.invalidate({ year: currentYear });
      utils.goals.getWithStatus.invalidate({ year: currentYear });
      setEditDialog(null);
      setEditValue('');
      toast.success('Monthly actual value updated');
    },
    onError: () => {
      toast.error('Failed to update value');
    },
  });

  // Group goals by strategic objective
  const groupedGoals = useMemo(() => {
    if (!goalsWithStatus) return {};
    
    return goalsWithStatus.reduce((acc, goal) => {
      const objective = goal.strategicObjective;
      if (!acc[objective]) {
        acc[objective] = [];
      }
      acc[objective].push(goal);
      return acc;
    }, {} as Record<string, typeof goalsWithStatus>);
  }, [goalsWithStatus]);

  // Get objective styling
  const getObjectiveStyle = (objectiveName: string) => {
    const objective = objectives?.find(o => o.name === objectiveName);
    return {
      bgColor: objective?.bgColor || 'bg-gray-50 border-gray-200',
      color: objective?.color || 'text-gray-700',
      weight: objective?.weight || 0,
    };
  };

  // Calculate monthly progress for a goal
  const getMonthlyProgress = (goalId: number, month: number) => {
    const target = monthlyTargets?.find((t: any) => t.goalId === goalId && t.month === month);
    if (!target) return { progress: 0, target: '-' };
    
    const targetValue = parseFloat(target.targetValue);
    const actualValue = parseFloat(target.actualValue || '0');
    const progress = targetValue > 0 ? (actualValue / targetValue) * 100 : 0;
    
    return { progress, target: target.targetValue };
  };

  // Calculate YTD progress for a goal
  const getYTDProgress = (goalId: number) => {
    const goalTargets = monthlyTargets?.filter(t => t.goalId === goalId) || [];
    const totalTarget = goalTargets.reduce((sum, t) => sum + parseFloat(t.targetValue), 0);
    const totalActual = goalTargets.reduce((sum, t) => sum + parseFloat(t.actualValue || '0'), 0);
    const progress = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
    
    return { progress, target: totalTarget.toFixed(0) };
  };

  // Handle circle click
  const handleCircleClick = (goalId: number, month: number, goalName: string, unit: string) => {
    // Only allow editing current and previous month
    if (month !== currentMonth && month !== currentMonth - 1) {
      return;
    }
    
    const target = monthlyTargets?.find((t: any) => t.goalId === goalId && t.month === month);
    const currentValue = target?.actualValue || '0';
    
    setEditDialog({
      open: true,
      goalId,
      month,
      currentValue,
      unit: formatUnit(unit),
      goalName,
    });
    setEditValue(currentValue);
  };
  
  // Handle save
  const handleSave = () => {
    if (!editDialog) return;
    
    updateMutation.mutate({
      goalId: editDialog.goalId,
      month: editDialog.month,
      year: currentYear,
      actualValue: editValue,
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    if (!goalsWithStatus || !monthlyTargets) {
      toast.error('No data to export');
      return;
    }

    // Build CSV content
    let csv = 'Strategic Objective,KPI,Unit,Owner,Status,';
    csv += MONTHS.join(',') + ',YTD\n';

    Object.entries(groupedGoals).forEach(([objectiveName, goals]) => {
      const style = getObjectiveStyle(objectiveName);
      
      goals.forEach((goal: any) => {
        const ytd = getYTDProgress(goal.id);
        const row = [
          `${objectiveName} (${style.weight}%)`,
          goal.goalName,
          formatUnit(goal.targetUnit),
          goal.ownerName || '-',
          goal.status.toUpperCase(),
        ];

        // Add monthly values
        MONTHS.forEach((_, monthIndex) => {
          const { target } = getMonthlyProgress(goal.id, monthIndex + 1);
          row.push(target);
        });

        // Add YTD
        row.push(ytd.target);

        csv += row.map(cell => `\"${cell}\"`).join(',') + '\n';
      });
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `monthly-goals-${currentYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Monthly goals exported successfully');
  };

  if (goalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-[#ec4899]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      
      <div className="container py-4 px-6">
        {/* Year and Export button */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{currentYear}</h1>
          <Button
            onClick={() => exportToExcel()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </Button>
        </div>

        {/* Spreadsheet table */}
        <div className="space-y-6">
          {Object.entries(groupedGoals).map(([objectiveName, goals]) => {
            const style = getObjectiveStyle(objectiveName);
            
            return (
              <div key={objectiveName} className={`border rounded-lg overflow-hidden ${style.bgColor}`}>
                {/* Objective header */}
                <div className="px-4 py-2 border-b bg-white/50">
                  <h2 className={`text-sm font-semibold ${style.color}`}>
                    {objectiveName} ({style.weight}%)
                  </h2>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-white/30">
                        <th className="px-3 py-2 text-left font-medium text-gray-600 w-[200px]">KPI</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 w-[80px]">Unit</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 w-[100px]">Owner</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 w-[70px]">Status</th>
                        {MONTHS.map(month => (
                          <th key={month} className="px-2 py-2 text-center font-medium text-gray-600 w-[50px]">{month}</th>
                        ))}
                        <th className="px-3 py-2 text-center font-medium text-gray-600 w-[60px]">YTD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goals.map((goal, idx) => {
                        const ytd = getYTDProgress(goal.id);
                        
                        return (
                          <tr key={goal.id} className={`border-b last:border-b-0 ${idx % 2 === 0 ? 'bg-white/60' : 'bg-white/30'}`}>
                            <td className="px-3 py-3 text-gray-900 font-medium">{goal.goalName}</td>
                            <td className="px-3 py-3 text-[#ec4899] font-semibold">{formatUnit(goal.targetUnit)}</td>
                            <td className="px-3 py-3 text-gray-700">{goal.ownerName || '-'}</td>
                            <td className="px-3 py-3 text-center">
                              <StatusBadge status={goal.status} />
                            </td>
                            {MONTHS.map((_, monthIndex) => {
                              const month = monthIndex + 1;
                              const { progress, target } = getMonthlyProgress(goal.id, month);
                              const isEditable = month === currentMonth || month === currentMonth - 1;
                              
                              return (
                                <td key={monthIndex} className="px-2 py-3 text-center">
                                  <div className="flex justify-center">
                                    <ProgressWheel 
                                      progress={progress} 
                                      target={target} 
                                      size={32} 
                                      strokeWidth={3}
                                      editable={isEditable}
                                      onClick={() => isEditable && handleCircleClick(goal.id, month, goal.goalName, goal.targetUnit)}
                                    />
                                  </div>
                                </td>
                              );
                            })}
                            <td className="px-3 py-3 text-center">
                              <div className="flex justify-center">
                                <ProgressWheel progress={ytd.progress} target={ytd.target} size={44} strokeWidth={4} isYTD />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {Object.keys(groupedGoals).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No KPIs defined for {currentYear}. Add goals in Settings → Annual Goals.</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditDialog(null)}>
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">{editDialog.goalName}</h3>
            <p className="text-sm text-gray-600 mb-4">{MONTHS[editDialog.month - 1]} {currentYear}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Value ({editDialog.unit})
                </label>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
                  placeholder="Enter value"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditDialog(null)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="bg-[#ec4899] hover:bg-[#db2777]"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
