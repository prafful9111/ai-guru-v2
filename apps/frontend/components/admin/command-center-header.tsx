import React from "react";
import { Search, Filter, SlidersHorizontal, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CommandCenterHeader() {
  return (
    <div className="sticky top-[73px] z-20 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 mb-6 shadow-sm shadow-slate-100/50">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 mr-2 py-1">
        <Filter className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Global Filters</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 ml-auto">
         <Select defaultValue="all-dept">
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

        <Select defaultValue="all-unit">
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

        <Select defaultValue="all-type">
          <SelectTrigger className="h-8 w-[120px] sm:w-[140px] border-slate-200 bg-white text-[12px] font-medium text-slate-700">
            <SelectValue placeholder="Assessment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-type">All Assessments</SelectItem>
            <SelectItem value="hipaa">HIPAA Recert</SelectItem>
            <SelectItem value="code-blue">Code Blue</SelectItem>
            <SelectItem value="deescalation">De-escalation</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="last-30">
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
