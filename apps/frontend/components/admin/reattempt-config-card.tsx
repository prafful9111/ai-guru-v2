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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-slate-500" />
            Dynamic Re-Attempt Rules
          </h3>
          <p className="text-xs text-gray-500 mt-1">Configure automated retry logic for failing assessments.</p>
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-6 flex-1">
        <div className="flex items-center justify-between border-b border-gray-100 pb-5">
          <div className="space-y-0.5 max-w-[70%]">
             <Label htmlFor="auto-retry" className="text-sm font-medium text-gray-900">Auto-Retry Generation</Label>
             <p className="text-xs text-gray-500">
               If enabled, staff who score in the Amber category will automatically receive a new assessment link without admin approval.
             </p>
          </div>
          <Switch 
            id="auto-retry" 
            checked={autoRetry}
            onCheckedChange={setAutoRetry}
          />
        </div>

        <div className="space-y-4">
           <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Score Rule Inputs</Label>
           
           <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 items-center">
                 <div className="col-span-12 sm:col-span-5">
                    <p className="text-sm font-medium text-amber-700">Amber (Developing)</p>
                 </div>
                 <div className="col-span-12 sm:col-span-7 flex items-center gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Score b/w</span>
                    <Input defaultValue="60" className="h-8 w-16 text-xs text-center px-1" />
                    <span className="text-xs text-gray-500">-</span>
                    <Input defaultValue="75" className="h-8 w-16 text-xs text-center px-1" />
                    <span className="text-xs text-gray-500">%</span>
                 </div>
              </div>

              <div className="grid grid-cols-12 gap-3 items-center">
                 <div className="col-span-12 sm:col-span-5">
                    <p className="text-sm font-medium text-rose-700">Red (High Risk)</p>
                 </div>
                 <div className="col-span-12 sm:col-span-7 flex items-center gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Score &lt;</span>
                    <Input defaultValue="60" className="h-8 w-16 text-xs text-center px-1" />
                    <span className="text-xs text-gray-500">%</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-50 rounded p-3 mt-4 border border-slate-100">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Resulting Actions:</h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                 {autoRetry ? (
                   <li><span className="font-medium">Amber:</span> Allow 1 automatic retry</li>
                 ) : (
                   <li><span className="font-medium">Amber:</span> Admin must manually approve retry</li>
                 )}
                 <li><span className="font-medium">Red:</span> Triggers Supervisor Review mandatory</li>
              </ul>
           </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50/80 border-t border-gray-100 mt-auto flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-[#2d87a4] hover:bg-[#236b82] gap-2 h-8 text-xs font-medium">
          <Save className="h-3.5 w-3.5" />
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
