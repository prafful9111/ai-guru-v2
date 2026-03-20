import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export const STANDARD_SCENARIOS_VERSIONED = [
  "Delayed doctor appointment (v1) - Beginner",
  "Delayed doctor appointment (v2) - Intermediate",
  "Outside food request from patient (v1) - Beginner",
  "Outside food request from patient (v2) - Intermediate",
  "Calming an anxious patient (v1) - Beginner",
  "Calming an anxious patient (v2) - Advanced",
  "Angry patient overcharged (v1) - Intermediate",
  "Angry patient overcharged (v2) - Advanced",
  "Breaking a bad news (v1) - Intermediate",
  "Breaking a bad news (v2) - Expert",
  "Patient requesting outside of visiting hours to meet a patient (v1) - Beginner",
  "Patient requesting outside of visiting hours to meet a patient (v2) - Intermediate",
  "Cold and late food (v1) - Beginner",
  "Cold and late food (v2) - Intermediate"
];

// Helper to parse the base scenario name, version, and difficulty
const parseScenario = (str: string) => {
  const match = str.match(/^(.*?) \((v\d+)\) - (.*?)$/);
  if (match) {
     return { baseName: match[1], version: match[2], difficulty: match[3], id: str };
  }
  return { baseName: str, version: "", difficulty: "", id: str };
};

// Autogenerate groups from the standard list array
export const SCENARIO_GROUPS = STANDARD_SCENARIOS_VERSIONED.reduce((acc, curr) => {
  const parsed = parseScenario(curr);
  let group = acc.find(g => g.name === parsed.baseName);
  if (!group) {
    group = { name: parsed.baseName, options: [] };
    acc.push(group);
  }
  group.options.push({
    id: curr,
    label: parsed.version && parsed.difficulty ? `Version ${parsed.version.replace('v', '')} - ${parsed.difficulty}` : curr
  });
  return acc;
}, [] as { name: string, options: { id: string, label: string }[] }[]);


export function HierarchicalScenarioDropdown({ 
  selected, 
  onChange 
}: { 
  selected: string[], 
  onChange: (val: string[]) => void 
}) {
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGroup = (groupName: string) => {
     setExpandedGroups(prev => ({...prev, [groupName]: !prev[groupName]}));
  };

  const toggleOption = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected.includes(id)) {
      onChange(selected.filter(o => o !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div 
        onClick={() => setOpen(!open)}
        className={`flex min-h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none cursor-pointer transition-colors hover:bg-slate-50 ${open ? 'ring-2 ring-primary/20 border-primary/50' : ''}`}
      >
        <div className="flex flex-wrap gap-1 items-center max-w-[90%]">
          {selected.length === 0 ? (
            <span className="text-slate-500 font-normal">Select scenarios...</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
               {selected.slice(0, 3).map(s => {
                  const parsed = parseScenario(s);
                  return (
                    <span 
                       key={s} 
                       title={s}
                       className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-medium border border-indigo-100/50 flex items-center gap-1"
                    >
                       <span className="truncate max-w-[80px]">{parsed.baseName}</span>
                       <span className="opacity-70">({parsed.version})</span>
                    </span>
                  )
               })}
               {selected.length > 3 && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                    +{selected.length - 3} more
                  </span>
               )}
            </div>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 opacity-50 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      
      {open && (
        <div className="absolute z-[9999] top-full mt-2 left-0 right-0 max-h-80 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 focus:outline-none">
          {SCENARIO_GROUPS.map((group) => {
             // Check if any options in this group are selected
             const activeCount = group.options.filter(o => selected.includes(o.id)).length;
             return (
               <div key={group.name} className="border-b last:border-b-0 border-slate-100/80">
                  <div 
                    className="flex justify-between items-center px-3 py-2.5 cursor-pointer hover:bg-slate-50 select-none group transition-colors"
                    onClick={() => toggleGroup(group.name)}
                  >
                     <div className="flex items-center gap-2">
                       <span className="font-semibold text-slate-700 text-[13px]">{group.name}</span>
                       {activeCount > 0 && (
                         <span className="flex h-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[10px] font-bold text-blue-700">
                           {activeCount}
                         </span>
                       )}
                     </div>
                     <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expandedGroups[group.name] ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {expandedGroups[group.name] && (
                     <div className="bg-slate-50/50 py-1 border-t border-slate-50">
                        {group.options.map(opt => {
                           const isSelected = selected.includes(opt.id);
                           return (
                             <div 
                               key={opt.id}
                               onClick={(e) => toggleOption(opt.id, e)}
                               className="relative flex w-full select-none items-center py-2 pl-8 pr-3 text-sm outline-none hover:bg-blue-50/50 cursor-pointer transition-colors"
                             >
                                <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
                                  {isSelected ? (
                                    <div className="flex h-4 w-4 items-center justify-center rounded bg-blue-600 text-white">
                                      <Check className="h-3 w-3" strokeWidth={3} />
                                    </div>
                                  ) : (
                                    <div className="h-4 w-4 rounded border border-slate-300 bg-white" />
                                  )}
                                </span>
                                <span className={`text-[12px] ${isSelected ? 'font-medium text-blue-900' : 'font-medium text-slate-600'}`}>
                                  {opt.label}
                                </span>
                             </div>
                           )
                        })}
                     </div>
                  )}
               </div>
             )
          })}
        </div>
      )}
    </div>
  );
}
