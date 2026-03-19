"use client";

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
    <div className="sticky top-[73px] z-30 flex flex-col gap-4 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-4 sm:flex-row sm:items-center sm:justify-between -mx-4 md:-mx-8 px-4 md:px-8 mb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Assessment Command Center</h1>
        <p className="text-sm font-medium text-gray-500">
          Monitor completion, delays, escalations, and performance insights
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search staff, ID..." 
            className="pl-9 h-9 bg-white border-gray-200 text-sm focus-visible:ring-1 focus-visible:ring-gray-300" 
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
           <Select defaultValue="all-dept">
            <SelectTrigger className="h-9 w-[130px] border-gray-200 bg-white text-sm">
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
            <SelectTrigger className="h-9 w-[130px] border-gray-200 bg-white text-sm">
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
            <SelectTrigger className="h-9 w-[150px] border-gray-200 bg-white text-sm">
              <SelectValue placeholder="Assessment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-type">All Assessments</SelectItem>
              <SelectItem value="hipaa">HIPAA Recert</SelectItem>
              <SelectItem value="code-blue">Code Blue</SelectItem>
              <SelectItem value="deescalation">De-escalation</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-9 px-3 flex items-center justify-center gap-2 border border-gray-200 bg-white rounded-md text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
            <span>Date Range</span>
          </div>
          
          <div className="w-px h-6 bg-gray-200 mx-1 hidden xl:block"></div>
          
          <Button variant="outline" size="sm" className="h-9 gap-2 border-gray-200 text-gray-600">
             <Download className="h-4 w-4 text-gray-400" />
             <span className="hidden xl:inline">Export</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
