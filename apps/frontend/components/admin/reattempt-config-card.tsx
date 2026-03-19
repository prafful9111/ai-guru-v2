"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, Settings2 } from "lucide-react";
import toast from "react-hot-toast";

export function ReattemptConfigCard() {
  const [autoRetry, setAutoRetry] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Re-Attempt configuration saved successfully");
    }, 600);
  };

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden flex flex-col h-full w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-slate-500" />
          <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">
            Dynamic Rules
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-5 flex-1 w-full">
        {/* Toggle auto retry */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1 max-w-[75%]">
             <Label htmlFor="auto-retry" className="text-[12px] font-semibold text-slate-800 leading-tight">Auto-Retry Generation</Label>
             <p className="text-[11px] text-slate-500 leading-relaxed">
               If enabled, staff who score in the Amber category receive an automated retry link without admin approval.
             </p>
          </div>
          <Switch 
            id="auto-retry" 
            checked={autoRetry}
            onCheckedChange={setAutoRetry}
            className="scale-90 data-[state=checked]:bg-slate-800"
          />
        </div>

        {/* Score inputs */}
        <div className="space-y-4">
           <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score Rule Thresholds</Label>
           
           <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                 <div className="w-full sm:w-[50%]">
                    <p className="text-[12px] font-semibold text-amber-700">Amber (Developing)</p>
                 </div>
                 <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">Score b/w</span>
                    <Input defaultValue="60" className="h-7 w-12 text-[12px] text-center px-1 border-slate-200 focus-visible:ring-slate-400" />
                    <span className="text-[11px] text-slate-500">-</span>
                    <Input defaultValue="75" className="h-7 w-12 text-[12px] text-center px-1 border-slate-200 focus-visible:ring-slate-400" />
                    <span className="text-[11px] text-slate-500">%</span>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                 <div className="w-full sm:w-[50%]">
                    <p className="text-[12px] font-semibold text-red-700">Red (High Risk)</p>
                 </div>
                 <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">Score &lt;</span>
                    <Input defaultValue="60" className="h-7 w-12 text-[12px] text-center px-1 border-slate-200 focus-visible:ring-slate-400" />
                    <span className="text-[11px] text-slate-500 mx-[14px]"></span>
                    <span className="text-[11px] text-slate-500">%</span>
                 </div>
              </div>
           </div>

           {/* Result summary */}
           <div className="bg-slate-50 rounded border border-slate-200 p-3 mt-4">
              <h4 className="text-[11px] font-semibold text-slate-700 mb-1.5">Resulting Actions:</h4>
              <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside">
                 {autoRetry ? (
                   <li><span className="font-semibold">Amber:</span> Allow 1 automatic retry</li>
                 ) : (
                   <li><span className="font-semibold">Amber:</span> Requires manual admin override</li>
                 )}
                 <li><span className="font-semibold">Red:</span> Mandatory Supervisor Review</li>
              </ul>
           </div>
        </div>
      </div>

      {/* Footer / Action */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 mt-auto">
        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          size="sm" 
          className="w-full bg-slate-800 hover:bg-slate-700 text-white gap-2 h-8 text-[12px] font-medium"
        >
          <Save className="h-3.5 w-3.5" />
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
