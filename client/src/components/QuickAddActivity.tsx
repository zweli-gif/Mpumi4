import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { trpc as trpcHook } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface QuickAddActivityProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddActivity({ open, onOpenChange }: QuickAddActivityProps) {
  const { data: user } = trpcHook.auth.me.useQuery();
  const [activityName, setActivityName] = useState("");
  const [dueDay, setDueDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday">("Monday");
  const [partnerId, setPartnerId] = useState<string>("");
  const [partnerRole, setPartnerRole] = useState<"partner" | "helper" | "">("");

  const utils = trpc.useUtils();
  const { data: teamMembers } = trpc.users.getAll.useQuery();
  
  const createActivity = trpc.weeklyActivities.create.useMutation({
    onSuccess: () => {
      toast.success("Activity added!");
      utils.weeklyActivities.getAll.invalidate();
      utils.weeklyActivities.getAssigned.invalidate();
      onOpenChange(false);
      // Reset form
      setActivityName("");
      setDueDay("Monday");
      setPartnerId("");
      setPartnerRole("");
    },
    onError: (error) => {
      toast.error(`Failed to add activity: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (!activityName.trim()) {
      toast.error("Activity name is required");
      return;
    }

    // Get current week number
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const year = now.getFullYear();

    createActivity.mutate({
      activity: activityName.trim(),
      dueDay: dueDay,
      accountabilityPartnerId: partnerId && partnerId !== "none" ? parseInt(partnerId) : undefined,
      partnerRole: (partnerId && partnerId !== "none" && partnerRole) ? partnerRole as "partner" | "helper" : undefined,
      dependency: undefined,
      monthlyGoalId: undefined,
      isPriority: false,
      weekNumber,
      year,
    });
  };

  // Filter out current user from partner selection
  const availablePartners = teamMembers?.filter(m => m.id !== user?.id) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Add Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity-name">Activity Name *</Label>
            <Input
              id="activity-name"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-day">Due Day *</Label>
            <Select value={dueDay} onValueChange={(value) => setDueDay(value as any)}>
              <SelectTrigger id="due-day">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monday">Monday</SelectItem>
                <SelectItem value="Tuesday">Tuesday</SelectItem>
                <SelectItem value="Wednesday">Wednesday</SelectItem>
                <SelectItem value="Thursday">Thursday</SelectItem>
                <SelectItem value="Friday">Friday</SelectItem>
                <SelectItem value="Saturday">Saturday</SelectItem>
                <SelectItem value="Sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner">Accountability Partner</Label>
            <Select value={partnerId} onValueChange={setPartnerId}>
              <SelectTrigger id="partner">
                <SelectValue placeholder="Select partner (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {availablePartners.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {partnerId && partnerId !== "none" && (
            <div className="space-y-2">
              <Label htmlFor="partner-role">Partner Type</Label>
              <Select value={partnerRole} onValueChange={(value) => setPartnerRole(value as "partner" | "helper" | "")}>
                <SelectTrigger id="partner-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="helper">Helper</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createActivity.isPending}
              className="bg-[#ec4899] hover:bg-[#db2777] text-white"
            >
              {createActivity.isPending ? "Adding..." : "Add Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
