import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface VentureEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  venture: {
    id: number;
    title: string;
    description?: string | null;
    value?: string | null;
    metadata?: string | null;
  } | null;
  onSuccess?: () => void;
}

export function VentureEditModal({ isOpen, onClose, venture, onSuccess }: VentureEditModalProps) {
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    value: "",
    burnRate: "",
    daysToRevenue: "0",
    status: "Ideation",
  });

  const [isLoading, setIsLoading] = useState(false);

  const updateCardMutation = trpc.pipelines.updateCard.useMutation({
    onSuccess: async () => {
      await utils.pipelines.getCards.invalidate({ pipelineType: "ventures" });
      toast.success("Venture updated successfully");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update venture");
    },
  });

  // Parse metadata when venture changes
  useEffect(() => {
    if (venture) {
      let metadata: Record<string, any> = {};
      if (venture.metadata) {
        try {
          metadata = JSON.parse(venture.metadata);
        } catch {
          metadata = {};
        }
      }
      setFormData({
        title: venture.title || "",
        description: venture.description || "",
        value: venture.value || "",
        burnRate: metadata.burnRate?.toString() || "",
        daysToRevenue: metadata.daysToRevenue || "0",
        status: metadata.status || "Ideation",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        value: "",
        burnRate: "",
        daysToRevenue: "0",
        status: "Ideation",
      });
    }
  }, [venture, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!venture) return;

    setIsLoading(true);

    try {
      await updateCardMutation.mutateAsync({
        id: venture.id,
        title: formData.title || undefined,
        description: formData.description || undefined,
        value: formData.value || undefined,
        burnRate: formData.burnRate ? parseFloat(formData.burnRate) : undefined,
        daysToRevenue: formData.daysToRevenue || undefined,
        status: formData.status || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Venture</DialogTitle>
          <DialogDescription>Update venture details and metrics</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Venture Name */}
          <div className="space-y-2">
            <Label htmlFor="title">Venture Name</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., FinTech Platform"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the venture"
              rows={3}
            />
          </div>

          {/* Valuation/Value */}
          <div className="space-y-2">
            <Label htmlFor="value">Valuation (R)</Label>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="e.g., 5000000"
            />
          </div>

          {/* Burn Rate */}
          <div className="space-y-2">
            <Label htmlFor="burnRate">Monthly Burn Rate (R)</Label>
            <Input
              id="burnRate"
              type="number"
              value={formData.burnRate}
              onChange={(e) => setFormData({ ...formData, burnRate: e.target.value })}
              placeholder="e.g., 50000"
            />
          </div>

          {/* Days to Revenue */}
          <div className="space-y-2">
            <Label htmlFor="daysToRevenue">Days to Revenue</Label>
            <Select value={formData.daysToRevenue} onValueChange={(value) => setFormData({ ...formData, daysToRevenue: value })}>
              <SelectTrigger id="daysToRevenue">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Revenue Generating</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="180">6 Months</SelectItem>
                <SelectItem value="365">12 Months</SelectItem>
                <SelectItem value="730">2+ Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ideation">Ideation</SelectItem>
                <SelectItem value="Validation">Validation</SelectItem>
                <SelectItem value="MVP Development">MVP Development</SelectItem>
                <SelectItem value="Beta">Beta</SelectItem>
                <SelectItem value="Launch">Launch</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="Revenue generating">Revenue Generating</SelectItem>
                <SelectItem value="Scaling">Scaling</SelectItem>
                <SelectItem value="Exited">Exited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
