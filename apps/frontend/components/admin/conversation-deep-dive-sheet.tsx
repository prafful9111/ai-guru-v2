"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  XCircle,
  Activity,
  Bot,
  User,
  MessagesSquare,
  FileBadge2
} from "lucide-react";

interface ConversationDeepDiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: any;
}

export function ConversationDeepDiveSheet({ open, onOpenChange, staff }: ConversationDeepDiveSheetProps) {
  if (!staff) return null;

  const mockTranscript = [
    { sender: "ai", text: "Hello Sarah. I'm Mr. Miller, the patient in bed 4. My chest feels really tight all of a sudden.", time: "10:01 AM" },
    { sender: "user", text: "Mr. Miller, I'm here. Can you tell me exactly where the pain is? Is it radiating anywhere?", time: "10:02 AM" },
    { sender: "ai", text: "It's right in the center... and spreading to my left arm. It hurts a lot.", time: "10:02 AM" },
    { sender: "user", text: "Okay, I'm calling for help right now and going to get an ECG. Try to stay calm.", time: "10:03 AM" },
    { sender: "ai", text: "Please hurry...", time: "10:03 AM" }
  ];

  const mockChecklist = [
    { text: "Identified patient by name", passed: true },
    { text: "Asked about pain radiation", passed: true },
    { text: "Called for immediate backup (Code Blue/RRT)", passed: true },
    { text: "Requested stat ECG", passed: true },
    { text: "Administered O2 or Aspirin per protocol", passed: false },
  ];

  const renderBadge = () => {
    switch(staff.status) {
      case "Green": return <Badge className="bg-emerald-500 hover:bg-emerald-600">SOP Master (Pass)</Badge>;
      case "Amber": return <Badge className="bg-amber-500 hover:bg-amber-600">Developing (Minor Misses)</Badge>;
      case "Red": return <Badge className="bg-red-500 hover:bg-red-600">High Risk (Failed)</Badge>;
      default: return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-slate-50 p-0">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 shadow-sm">
          <SheetHeader className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                  <FileBadge2 className="h-5 w-5 text-indigo-600" />
                  Assessment Deep Dive
                </SheetTitle>
                <SheetDescription className="mt-1">
                  Reviewing {staff.name}'s performance for <span className="font-semibold text-gray-700">{staff.scenario}</span>
                </SheetDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold tracking-tight text-gray-900">{staff.score}%</div>
                {renderBadge()}
              </div>
            </div>
            
            <div className="flex gap-4 text-sm text-gray-500 pt-2 border-t border-gray-50">
               <div><span className="font-medium text-gray-700">Department:</span> {staff.department}</div>
               <div><span className="font-medium text-gray-700">Date:</span> Oct 25, 2026</div>
               <div><span className="font-medium text-gray-700">Duration:</span> 4m 12s</div>
            </div>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Section: SOP Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="bg-slate-50 border-b border-gray-100 px-4 py-3 font-semibold text-gray-800 flex items-center gap-2">
               <CheckCircle2 className="h-4 w-4 text-emerald-600" />
               SOP Adherence Checklist
             </div>
             <div className="p-4 space-y-3">
               {mockChecklist.map((item, i) => (
                 <div key={i} className="flex items-start gap-3">
                   {item.passed ? (
                     <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                   ) : (
                     <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                   )}
                   <div>
                     <p className={`text-sm ${item.passed ? 'text-gray-700' : 'text-rose-700 font-medium'}`}>
                       {item.text}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Section: Sentiment Trend */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="bg-slate-50 border-b border-gray-100 px-4 py-3 font-semibold text-gray-800 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Activity className="h-4 w-4 text-blue-600" />
                 Patient Sentiment Trend
               </div>
               <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                 📉 Anger Decreased
               </Badge>
             </div>
             <div className="p-4 flex items-center justify-between">
               <div className="space-y-1">
                 <p className="text-sm font-medium text-gray-900">Initial State: <span className="text-rose-600">Highly Stressed</span></p>
                 <p className="text-xs text-gray-500">Patient started interaction with elevated anger levels.</p>
               </div>
               <div className="h-8 w-px bg-gray-200 mx-4 hidden sm:block"></div>
               <div className="space-y-1">
                 <p className="text-sm font-medium text-gray-900">Final State: <span className="text-emerald-600">Calm & Responsive</span></p>
                 <p className="text-xs text-gray-500">Effective de-escalation techniques successfully lowered stress.</p>
               </div>
             </div>
          </div>

          {/* Section: Full Transcript */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="bg-slate-50 border-b border-gray-100 px-4 py-3 font-semibold text-gray-800 flex items-center gap-2">
               <MessagesSquare className="h-4 w-4 text-indigo-600" />
               Full Conversation Transcript
             </div>
             <ScrollArea className="h-[300px] p-4">
                <div className="space-y-4">
                  {mockTranscript.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-[#2d87a4] text-white' : 'bg-rose-100 text-rose-600'}`}>
                        {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-[#2d87a4] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
             </ScrollArea>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
