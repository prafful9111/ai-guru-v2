import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, Send, FileText, CheckCircle2, AlertOctagon } from "lucide-react";
import toast from "react-hot-toast";

interface ActionHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: any; // Mock staff data
}

export function ActionHistorySheet({ open, onOpenChange, staff }: ActionHistorySheetProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState([
    {
      id: 1,
      type: "auto",
      action: "System sent Gentle Reminder notification to staff",
      date: "Oct 21, 2026 - 09:00 AM",
      icon: <Send className="h-4 w-4" />
    },
    {
      id: 2,
      type: "auto",
      action: "System sent Warning notification to staff (CC: Unit Manager)",
      date: "Oct 25, 2026 - 09:00 AM",
      icon: <Send className="h-4 w-4" />
    },
    {
      id: 3,
      type: "system",
      action: "Staff clicked link but did not complete assessment.",
      date: "Oct 25, 2026 - 11:32 AM",
      icon: <Clock className="h-4 w-4" />
    }
  ]);

  if (!staff) return null;

  const handleAddNote = () => {
    if (!note.trim()) return;
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      setHistory([
        ...history,
        {
          id: Date.now(),
          type: "manual",
          action: `Admin Note: ${note} (Escalation Timer Paused)`,
          date: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          icon: <FileText className="h-4 w-4" />
        }
      ]);
      setNote("");
      setIsSubmitting(false);
      toast.success("Manual override applied and log updated.");
    }, 600);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <SheetTitle className="text-xl">Action History</SheetTitle>
              <SheetDescription>
                Detailed log book and timeline for {staff.name}.
              </SheetDescription>
            </div>
            {staff.tier === "Escalated" && (
              <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 uppercase tracking-wider text-[10px]">
                <AlertOctagon className="h-3 w-3 mr-1" />
                Non-Compliant
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
             <h4 className="text-sm font-semibold text-gray-900">Staff Profile</h4>
             <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                   <p className="text-gray-500">Department</p>
                   <p className="font-medium text-gray-900">{staff.department}</p>
                </div>
                <div>
                   <p className="text-gray-500">Overdue By</p>
                   <p className="font-medium text-rose-600">{staff.daysOverdue} Days</p>
                </div>
                <div>
                   <p className="text-gray-500">Current Tier</p>
                   <p className="font-medium text-gray-900">{staff.tier}</p>
                </div>
                <div>
                   <p className="text-gray-500">Assignment</p>
                   <p className="font-medium text-gray-900">{staff.module}</p>
                </div>
             </div>
          </div>

          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-semibold text-gray-900 flex justify-between items-center">
              Event Log Book
              <span className="text-xs font-normal text-gray-500">{history.length} records</span>
            </h4>
            
            <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-2">
              {history.map((item, idx) => (
                <div key={item.id} className="relative pl-6">
                  <span className={`absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white
                      ${item.type === 'manual' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                    `}>
                    {item.type === 'manual' ? <CheckCircle2 className="h-3 w-3" /> : item.icon}
                  </span>
                  <div className="flex flex-col space-y-1">
                    <p className={`text-sm ${item.type === 'manual' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {item.action}
                    </p>
                    <time className="text-xs text-gray-400">{item.date}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Manual Override</h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="note" className="text-xs text-gray-500">Admin Note (Pauses systemic escalation)</Label>
                <Textarea 
                  id="note" 
                  placeholder="e.g. Staff on medical leave starting Oct 26. Extend deadline by 14 days." 
                  className="resize-none h-20 bg-gray-50"
                  value={note}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleAddNote} 
                disabled={!note.trim() || isSubmitting} 
                className="w-full bg-[#2d87a4] hover:bg-[#236b82]"
              >
                {isSubmitting ? "Saving & Pausing Timer..." : "Save Note & Pause Timer"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
