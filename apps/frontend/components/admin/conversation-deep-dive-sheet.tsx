"use client";

import React from "react";
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
    { sender: "ai", text: "It's right in the center... and spreading to my left arm. It hurts a lot. Why is this taking so long?!", time: "10:02 AM" },
    { sender: "user", text: "I understand you're scared, Mr. Miller. I'm hitting the call button for help right now and going to get an ECG. Try to stay calm.", time: "10:03 AM" },
    { sender: "ai", text: "Okay... please hurry...", time: "10:03 AM" }
  ];

  const mockChecklist = [
    { text: "Identified patient by name", passed: true, category: "Critical" },
    { text: "Asked about pain radiation", passed: true, category: "Critical" },
    { text: "Called for immediate backup (Code Blue/RRT)", passed: true, category: "Critical" },
    { text: "Requested stat ECG", passed: true, category: "Critical" },
    { text: "Administered O2 or Aspirin per protocol", passed: false, category: "Critical" },
    { text: "Maintained de-escalating tone", passed: true, category: "Soft Skills" },
  ];

  const renderStatus = () => {
    switch(staff.status) {
      case "Green": return <div className="text-[12px] font-bold text-emerald-600 uppercase tracking-widest leading-none">SOP Master (Pass)</div>;
      case "Amber": return <div className="text-[12px] font-bold text-amber-600 uppercase tracking-widest leading-none">Developing (Minor Miss)</div>;
      case "Red": return <div className="text-[12px] font-bold text-red-600 uppercase tracking-widest leading-none">High Risk (Fail)</div>;
      default: return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto bg-slate-50 p-0 border-l border-slate-200">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <SheetHeader className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <SheetTitle className="text-[16px] font-bold flex items-center gap-2 text-slate-900 leading-tight">
                  <FileBadge2 className="h-4 w-4 text-slate-500" />
                  Assessment Deep Dive
                </SheetTitle>
                <SheetDescription className="text-[12px] text-slate-500 leading-relaxed">
                  Reviewing {staff.name}'s performance for <span className="font-semibold text-slate-800">{staff.scenario}</span>
                </SheetDescription>
              </div>
              <div className="text-right flex flex-col items-end gap-1.5">
                <div className="text-3xl font-black tracking-tighter text-slate-900 leading-none">{staff.score}<span className="text-xl text-slate-500 font-bold">%</span></div>
                {renderStatus()}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
               <div><span className="font-semibold text-slate-700">Department:</span> {staff.department}</div>
               <div><span className="font-semibold text-slate-700">Date:</span> Oct 25, 2026</div>
               <div><span className="font-semibold text-slate-700">Duration:</span> 4m 12s</div>
            </div>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Section: SOP Checklist */}
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
               <CheckCircle2 className="h-4 w-4 text-slate-500" />
               <h4 className="text-[13px] font-semibold text-slate-800 tracking-tight">SOP Adherence Checklist</h4>
             </div>
             <div className="p-0">
               <div className="divide-y divide-slate-100">
                 {mockChecklist.map((item, i) => (
                   <div key={i} className="flex items-start gap-3 p-3.5 hover:bg-slate-50/50 transition-colors">
                     {item.passed ? (
                       <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                     ) : (
                       <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                     )}
                     <div className="flex-1">
                       <p className={`text-[12px] ${item.passed ? 'text-slate-700 font-medium' : 'text-red-700 font-bold'}`}>
                         {item.text}
                       </p>
                     </div>
                     <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-medium whitespace-nowrap shadow-none h-5 px-1.5 text-[9px] uppercase tracking-widest">
                       {item.category}
                     </Badge>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* Section: Sentiment Trend Graph */}
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col">
             <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Activity className="h-4 w-4 text-slate-500" />
                 <h4 className="text-[13px] font-semibold text-slate-800 tracking-tight">Patient Sentiment Trend</h4>
               </div>
               <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 border-emerald-200 bg-emerald-50/50 px-2 py-0.5 h-auto">
                 De-Escalation Successful
               </Badge>
             </div>
             <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="space-y-0.5">
                    <p className="text-[12px] font-semibold text-slate-900 leading-tight">Initial State: <span className="text-red-600">Highly Stressed</span></p>
                    <p className="text-[11px] text-slate-500">Bot anger peaked early in conversation.</p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-[12px] font-semibold text-slate-900 leading-tight">Final State: <span className="text-emerald-600">Calm/Responsive</span></p>
                    <p className="text-[11px] text-slate-500">Stress lowered after reassurance.</p>
                  </div>
                </div>

                {/* SVG Graph */}
                <div className="w-full h-24 mt-4 relative bg-slate-50/50 rounded-sm border border-slate-100">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 inset-y-2 flex flex-col justify-between z-0 pointer-events-none">
                    <div className="w-full border-t border-slate-200 border-dashed h-0" />
                    <div className="w-full border-t border-slate-200 border-dashed h-0" />
                    <div className="w-full border-t border-slate-200 border-dashed h-0" />
                  </div>
                  {/* Visual Line */}
                  <svg className="w-full h-full relative z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      d="M0 15 C 30 15, 60 85, 100 85"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3.5"
                      vectorEffect="non-scaling-stroke"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Labels */}
                  <span className="absolute top-1 right-2 text-[9px] font-bold uppercase tracking-widest text-red-500 bg-white/80 px-1 py-0.5 rounded shadow-sm">Furious</span>
                  <span className="absolute bottom-1 right-2 text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-white/80 px-1 py-0.5 rounded shadow-sm">Calm</span>
                </div>
             </div>
          </div>

          {/* Section: Full Transcript */}
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col">
             <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
               <MessagesSquare className="h-4 w-4 text-slate-500" />
               <h4 className="text-[13px] font-semibold text-slate-800 tracking-tight">Full Conversation Transcript</h4>
             </div>
             <ScrollArea className="h-[320px] bg-slate-50/30">
                <div className="p-5 space-y-5">
                  {mockTranscript.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${msg.sender === 'user' ? 'bg-slate-800 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>
                        {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                        <div className={`px-3.5 py-2.5 rounded-lg text-[12px] shadow-sm leading-relaxed ${msg.sender === 'user' ? 'bg-slate-800 text-slate-50 border border-slate-900 rounded-tr-sm' : 'bg-white border text-slate-700 border-slate-200 rounded-tl-sm'}`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">{msg.time} • {msg.sender === 'user' ? 'Staff' : 'AI Bot'}</span>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">End of Session</span>
                  </div>
                </div>
             </ScrollArea>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
