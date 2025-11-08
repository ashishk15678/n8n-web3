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
import { generateGoogleFormScript } from "./utils";

interface ManualTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({
  open,
  onOpenChange,
}: ManualTriggerDialogProps) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/workflows/google-form?workflowId=${workflowId}`;

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
          <DialogTitle>Google form trigger configuration</DialogTitle>
          <DialogDescription>
            Use this webhook url inside your Google Form's App script to trigger
            this workflow when form is submitted.
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
              <li>Open your google form</li>
              <li>Click the three dots menu =&gt; Script editor</li>
              <li>Copy and paste the script below</li>
              <li>Replace WEBHOOK_URL with webhook url above</li>
              <li>Save and click "Triggers" =&gt; Add Trigger</li>
              <li>Choose : Form form =&gt; on Form Submit =&gt; Save</li>
            </ol>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h4 className="font-medium text-sm"> Google Apps script : </h4>
            <Button
              type="button"
              variant={"outline"}
              onClick={async () => {
                try {
                  await window.navigator.clipboard.writeText(
                    generateGoogleFormScript(webhookUrl),
                  );
                  toast.success("Google form script succesfully copied.");
                } catch {
                  toast.error("Google form script failed to copy.");
                }
              }}
            >
              <ClipboardPenIcon className="size-4 " /> Copy Google Apps script
            </Button>
            <p className="text-xs text-muted-foreground">
              This script includes your webhook and handles form submissions
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
