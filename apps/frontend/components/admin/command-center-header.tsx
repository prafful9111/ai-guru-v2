import React, { Suspense } from "react";
import { Search, Filter, SlidersHorizontal, Download, User } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STAFF_SCENARIOS: Record<string, string[]> = {
  "EMP-09231": ["delayed-doctor", "calming-anxious"], // Michael
  "EMP-04821": ["outside-food"], // Priya
  "EMP-05512": ["angry-overcharged", "breaking-bad-news", "cold-food"], // Alisha
  "EMP-01124": ["visiting-hours"], // Robert
  "EMP-03882": [], // Lisa
  "EMP-06771": ["delayed-doctor"], // Tom
};

const MOCK_STAFF_LIST = [
  { id: "EMP-09231", name: "Michael Chang", batches: ["BATCH-2026-03-20"] },
  { id: "EMP-04821", name: "Priya Sharma", batches: ["BATCH-2026-03-20", "BATCH-2026-03-19"] },
  { id: "EMP-05512", name: "Alisha Davis", batches: ["BATCH-2026-03-19"] },
  { id: "EMP-01124", name: "Robert Jones", batches: ["BATCH-2026-03-20"] },
  { id: "EMP-03882", name: "Lisa Smith", batches: ["BATCH-2026-03-20"] },
  { id: "EMP-06771", name: "Tom Kumar", batches: ["BATCH-2026-03-19"] },
];

const ALL_SCENARIOS = [
  { value: "delayed-doctor", label: "Delayed doctor appointment" },
  { value: "outside-food", label: "Outside food request" },
  { value: "calming-anxious", label: "Calming an anxious patient" },
  { value: "angry-overcharged", label: "Angry patient overcharged" },
  { value: "breaking-bad-news", label: "Breaking a bad news" },
  { value: "visiting-hours", label: "Out of visiting hours" },
  { value: "cold-food", label: "Cold and late food" }
];

function CommandCenterHeaderInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dynamicBatches, setDynamicBatches] = React.useState<{id: string; name: string}[]>([]);
  React.useEffect(() => {
    const fetchBatches = () => {
       try {
         const stored = JSON.parse(localStorage.getItem("mockBatches") || "[]");
         setDynamicBatches(stored.reverse());
       } catch(e) {}
    };
    fetchBatches();
    window.addEventListener("bulk-upload-success", fetchBatches);
    return () => window.removeEventListener("bulk-upload-success", fetchBatches);
  }, []);
  
  // Active parameters
  const currentStaff = searchParams.get("staff") || "all-staff";
  const currentBatch = searchParams.get("batch") || "all-batches";
  const currentDept = searchParams.get("dept") || "all-dept";
  const currentUnit = searchParams.get("unit") || "all-unit";
  const currentType = searchParams.get("type") || "all-type";
  const currentDate = searchParams.get("date") || "last-30";

  const handleParamChange = (key: string, val: string, defaultVal: string) => {
    const params = new URLSearchParams(searchParams);
    if (val === defaultVal) {
      params.delete(key);
    } else {
      params.set(key, val);
    }
    
    // Automatically reset Assessment if switching staff member causes a conflict
    if (key === "staff" && val !== "all-staff") {
      const allowed = STAFF_SCENARIOS[val] || [];
      const activeType = params.get("type");
      if (activeType && activeType !== "all-type" && !allowed.includes(activeType)) {
        params.delete("type");
      }
    }
    
    // Auto-reset staff if switching batch logic conflicts
    if (key === "batch") {
       if (val === "all-batches") {
          params.delete("staff");
       } else if (val !== "individual" && val !== "all-batches") {
          const staffInNewBatch = MOCK_STAFF_LIST.filter(s => s.batches.includes(val) || val.startsWith("batch"));
          if (!staffInNewBatch.find(s => s.id === params.get("staff"))) {
             params.delete("staff");
          }
       }
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const availableScenarios = currentStaff === "all-staff" 
    ? ALL_SCENARIOS 
    : ALL_SCENARIOS.filter(s => STAFF_SCENARIOS[currentStaff]?.includes(s.value));
    
  let availableStaff = MOCK_STAFF_LIST;
  if (currentBatch === "all-batches") {
     availableStaff = [];
  } else if (currentBatch !== "individual") {
     // Filter by batch inclusion (or just show some for dynamically generated batches)
     availableStaff = MOCK_STAFF_LIST.filter(s => s.batches.includes(currentBatch) || !currentBatch.startsWith("BATCH"));
  }

  return (
    <div className="sticky top-[73px] z-20 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 mb-6 shadow-sm shadow-slate-100/50">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 mr-2 py-1">
        <Filter className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Global Filters</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 ml-auto">
         {/* Training Group Filter (Moved before Staff logically) */}
         <Select value={currentBatch} onValueChange={(v) => handleParamChange("batch", v, "all-batches")}>
           <SelectTrigger className="h-8 w-[120px] sm:w-[150px] border-slate-200 bg-white text-[12px] font-medium text-slate-700">
             <SelectValue placeholder="Training Group" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all-batches">All Training Groups</SelectItem>
             <SelectItem value="individual">Individual User Focus</SelectItem>
             <SelectItem value="BATCH-2026-03-20">Group: 2026-03-20 (20 users)</SelectItem>
             <SelectItem value="BATCH-2026-03-19">Group: 2026-03-19 (15 users)</SelectItem>
             {dynamicBatches.map(b => (
               <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
             ))}
           </SelectContent>
         </Select>

         <Select value={currentStaff} onValueChange={(v) => handleParamChange("staff", v, "all-staff")} disabled={currentBatch === "all-batches"}>
             <SelectTrigger className="h-8 w-[130px] sm:w-[150px] border-slate-200 bg-white text-[12px] font-medium text-slate-700">
               <div className="flex items-center gap-1.5">
                 <User className="h-3.5 w-3.5 text-slate-400" />
                 <SelectValue placeholder={currentBatch === "all-batches" ? "Select Group First" : "Staff Member"} />
               </div>
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all-staff">All Staff</SelectItem>
               {availableStaff.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
               ))}
             </SelectContent>
           </Select>

         <Select value={currentDept} onValueChange={(v) => handleParamChange("dept", v, "all-dept")}>
          <SelectTrigger className="h-8 w-[110px] sm:w-[130px] border-slate-200 bg-white text-[12px] font-medium text-slate-700">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-dept">All Depts</SelectItem>
            <SelectItem value="cardiology">Cardiology</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="icu">ICU</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currentUnit} onValueChange={(v) => handleParamChange("unit", v, "all-unit")}>
          <SelectTrigger className="h-8 w-[110px] sm:w-[120px] border-slate-200 bg-white text-[12px] font-medium text-slate-700">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-unit">All Units</SelectItem>
            <SelectItem value="unit-a">Unit A (East)</SelectItem>
            <SelectItem value="unit-b">Unit B (West)</SelectItem>
            <SelectItem value="unit-icu">ICU Wing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currentType} onValueChange={(v) => handleParamChange("type", v, "all-type")}>
          <SelectTrigger className="h-8 w-[120px] sm:w-[140px] border-slate-200 bg-white text-[12px] font-medium text-slate-700">
            <SelectValue placeholder="Assessment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-type">All Scenarios</SelectItem>
            {availableScenarios.map(scen => (
               <SelectItem key={scen.value} value={scen.value}>{scen.label}</SelectItem>
            ))}
            {currentStaff !== "all-staff" && availableScenarios.length === 0 && (
               <SelectItem value="none" disabled>No modules assigned</SelectItem>
            )}
          </SelectContent>
        </Select>

        <Select value={currentDate} onValueChange={(v) => handleParamChange("date", v, "last-30")}>
          <SelectTrigger className="h-8 w-[120px] sm:w-[140px] border-slate-200 bg-white text-[12px] font-medium text-slate-700 data-[state=open]:ring-1">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <SelectValue placeholder="Date Range" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="last-7">Last 7 Days</SelectItem>
            <SelectItem value="last-30">Last 30 Days</SelectItem>
            <SelectItem value="this-quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block"></div>
        
        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-slate-200 text-slate-600 text-[12px] font-medium bg-white">
           <Download className="h-3.5 w-3.5 text-slate-400" />
           <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  );
}

export function CommandCenterHeader() {
  return (
    <Suspense fallback={<div className="h-[65px] bg-white border-b" />}>
      <CommandCenterHeaderInner />
    </Suspense>
  );
}
