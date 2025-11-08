"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardPenIcon, MoveRightIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface ManualTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({
  open,
  onOpenChange,
}: ManualTriggerDialogProps) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/workflows/stripe?workflowId=${workflowId}`;

  const copytoClipboard = async () => {
    try {
      await window.navigator.clipboard.writeText(webhookUrl);
      toast.success("Copied webhook url to clipboard");
    } catch {
      toast.error("Cannot copy webhook url to clipboard");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe trigger configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook url into your stripe dashboard to trigger
            when an event is captured.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                id="webhook-url"
                className="font-mono"
                value={webhookUrl}
              />
              <Button
                size={"icon"}
                className=""
                type="button"
                variant={"outline"}
                onClick={copytoClipboard}
              >
                <ClipboardPenIcon />{" "}
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup Instructions : </h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Open your stripe dashboard</li>
              <li>Go to Developers =&gt; webhooks</li>
              <li>Click "Add Endpoint"</li>
              <li>Paste the webhook url above</li>
              <li>
                Select events to listen for (eg. payment_intent.succeeded)
              </li>
              <li>Copy and save the signing secret.</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
