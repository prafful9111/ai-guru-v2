"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  useSessionReports,
  useFilters,
  useScenariosList,
} from "@/lib/hooks/use-dashboard";
import type { SessionReport } from "@/lib/services/dashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  FileText,
  Download,
  SlidersHorizontal,
  Filter,
  Building2,
  UserCog,
  Briefcase,
  X,
  Check,
  RefreshCcw,
  Calendar,
  BookOpen,
  CircleDot,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface SessionReportsTableProps {
  className?: string;
  onViewReport?: (sessionId: string) => void;
  onDownloadAudio?: (audioUrl: string, sessionId: string) => void;
}

export function SessionReportsTable({
  className,
  onViewReport,
  onDownloadAudio,
}: SessionReportsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Filter state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [appliedCity, setAppliedCity] = useState("");
  const [appliedUnit, setAppliedUnit] = useState("");
  const [appliedDept, setAppliedDept] = useState("");

  // New filter state
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [selectedRagStatus, setSelectedRagStatus] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedRagStatus, setAppliedRagStatus] = useState("");
  const [appliedScenario, setAppliedScenario] = useState("");
  const [appliedDifficulty, setAppliedDifficulty] = useState("");

  // Fetch filter hierarchy
  const { data: filterHierarchy } = useFilters();

  // Fetch scenarios list
  const { data: scenariosList } = useScenariosList();

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get available units based on selected city
  const availableUnits = useMemo(() => {
    if (!selectedCity || !filterHierarchy) return [];
    const cityData = filterHierarchy.find((c: any) => c.name === selectedCity);
    return cityData?.units || [];
  }, [selectedCity, filterHierarchy]);

  // Get available departments based on selected unit
  const availableDepartments = useMemo(() => {
    if (!selectedUnit || !availableUnits.length) return [];
    const unitData = availableUnits.find((u: any) => u.name === selectedUnit);
    return unitData?.departments || [];
  }, [selectedUnit, availableUnits]);

  // Reset subordinate filters when parent filter changes
  React.useEffect(() => {
    setSelectedUnit("");
    setSelectedDept("");
  }, [selectedCity]);

  React.useEffect(() => {
    setSelectedDept("");
  }, [selectedUnit]);

  // Reset page when applied filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    appliedCity,
    appliedUnit,
    appliedDept,
    appliedStartDate,
    appliedEndDate,
    appliedRagStatus,
    appliedScenario,
    appliedDifficulty,
  ]);

  const handleApplyFilters = () => {
    setAppliedCity(selectedCity);
    setAppliedUnit(selectedUnit);
    setAppliedDept(selectedDept);
    setAppliedStartDate(selectedStartDate);
    setAppliedEndDate(selectedEndDate);
    setAppliedRagStatus(selectedRagStatus);
    setAppliedScenario(selectedScenario);
    setAppliedDifficulty(selectedDifficulty);
    setIsFilterSheetOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedCity("");
    setSelectedUnit("");
    setSelectedDept("");
    setSelectedStartDate("");
    setSelectedEndDate("");
    setSelectedRagStatus("");
    setSelectedScenario("");
    setSelectedDifficulty("");
    setAppliedCity("");
    setAppliedUnit("");
    setAppliedDept("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setAppliedRagStatus("");
    setAppliedScenario("");
    setAppliedDifficulty("");
  };

  const activeFiltersCount = [
    appliedCity,
    appliedUnit,
    appliedDept,
    appliedStartDate,
    appliedEndDate,
    appliedRagStatus,
    appliedScenario,
    appliedDifficulty,
  ].filter(Boolean).length;

  const pendingFiltersCount = [
    selectedCity,
    selectedUnit,
    selectedDept,
    selectedStartDate,
    selectedEndDate,
    selectedRagStatus,
    selectedScenario,
    selectedDifficulty,
  ].filter(Boolean).length;

  const { data, isLoading, error } = useSessionReports(
    currentPage,
    pageSize,
    debouncedSearch,
    {
      city: appliedCity,
      unit: appliedUnit,
      department: appliedDept,
      startDate: appliedStartDate,
      endDate: appliedEndDate,
      ragStatus: appliedRagStatus,
      scenarioId: appliedScenario,
      difficulty: appliedDifficulty,
    },
  );

  const sessions = data?.data || [];
  const pagination = data?.meta;
  const stats = data?.stats;

  const handleDownloadAudio = (audioUrl: string | null, sessionId: string) => {
    if (!audioUrl) return;

    if (onDownloadAudio) {
      onDownloadAudio(audioUrl, sessionId);
    } else {
      // Default download behavior
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `session-${sessionId}-audio.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getRagBadgeVariant = (status: string) => {
    switch (status) {
      case "GREEN":
        return "default";
      case "AMBER":
        return "amber";
      case "RED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getDifficultyStyle = (difficulty: string) => {
    const level = difficulty?.toLowerCase();
    switch (level) {
      case "beginner":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "intermediate":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "advanced":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const columns: ColumnDef<SessionReport>[] = useMemo(
    () => [
      {
        accessorKey: "sessionId",
        header: "Session ID",
        cell: ({ row }) => (
          <div
            className="font-mono text-xs truncate max-w-25"
            title={row.getValue("sessionId") || "Unknown"}
          >
            {(row.getValue("sessionId") as string || "Unknown").slice(0, 8)}...
          </div>
        ),
      },
      {
        accessorKey: "dateTime",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Date & Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("dateTime"));
          return (
            <div className="text-sm pl-3">
              <div>{format(date, "MMM d, yyyy")}</div>
              <div className="text-muted-foreground text-xs">
                {format(date, "h:mm a")}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "difficulty",
        header: "Difficulty",
        cell: ({ row }) => {
          const difficulty = row.getValue("difficulty") as string;
          return (
            <Badge variant="outline" className={getDifficultyStyle(difficulty)}>
              {difficulty}
            </Badge>
          );
        },
      },
      {
        accessorKey: "language",
        header: "Language",
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("language")}</div>
        ),
      },
      {
        accessorKey: "staffId",
        header: "Staff ID",
        cell: ({ row }) => (
          <div className="font-mono text-sm">
            {row.getValue("staffId") || "—"}
          </div>
        ),
      },
      {
        accessorKey: "userName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            User Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("userName")}</div>
        ),
      },
      {
        accessorKey: "userDepartment",
        header: "Department",
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("userDepartment") || "—"}</div>
        ),
      },
      {
        accessorKey: "userUnit",
        header: "Unit",
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("userUnit") || "—"}</div>
        ),
      },
      {
        accessorKey: "scenarioTitle",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Scenario
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div
            className="text-sm"
            title={row.getValue("scenarioTitle")}
          >
            {row.getValue("scenarioTitle")}
          </div>
        ),
      },
      {
        accessorKey: "finalScore",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Final Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-semibold text-center">
            {(row.getValue("finalScore") as number).toFixed(1)}%
          </div>
        ),
      },
      // {
      //   accessorKey: "parameterScore",
      //   header: "Parameter",
      //   cell: ({ row }) => (
      //     <div className="text-sm text-center">
      //       {(row.getValue("parameterScore") as number).toFixed(1)}%
      //     </div>
      //   ),
      // },
      // {
      //   accessorKey: "sopScore",
      //   header: "SOP",
      //   cell: ({ row }) => (
      //     <div className="text-sm text-center">
      //       {(row.getValue("sopScore") as number).toFixed(1)}%
      //     </div>
      //   ),
      // },
      {
        accessorKey: "ragStatus",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("ragStatus") as string;
          return (
            <Badge variant={getRagBadgeVariant(status)} className="text-white!">
              {status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const session = row.original;
          return (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/report/${session.sessionId}`}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>View Report</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8"
                      disabled={!session.audioUrl}
                      onClick={() =>
                        handleDownloadAudio(session.audioUrl, session.sessionId)
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {session.audioUrl ? "Download Audio" : "No audio available"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
            </div>
          );
        },
      },
    ],
    [onViewReport],
  );

  const table = useReactTable({
    data: sessions,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    manualPagination: true,
    pageCount: pagination?.totalPages || 0,
  });

  if (error) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-4">
        <div className="text-sm text-destructive">
          Error loading session reports:{" "}
          {(error as any)?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-base md:text-xl font-semibold text-slate-800 tracking-tight leading-tight">
          All Assessment Sessions
        </h2>
        <div className="flex flex-row sm:items-center gap-3">
          <div className="relative flex-1 sm:min-w-xs sm:max-w-fit">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, staff ID, scenario..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>

          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant={activeFiltersCount > 0 ? "default" : "outline"}
                className={`flex items-center gap-2 ${activeFiltersCount > 0 ? "bg-[#2d87a4] hover:bg-[#236c84]" : ""}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-white text-[#2d87a4] rounded-full text-[10px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#2d87a4]" />
                  Advanced Filters
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4 py-0 px-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Date Range Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Date Range
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="date"
                        value={selectedStartDate}
                        onChange={(e) => setSelectedStartDate(e.target.value)}
                        placeholder="Start Date"
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="date"
                        value={selectedEndDate}
                        onChange={(e) => setSelectedEndDate(e.target.value)}
                        placeholder="End Date"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* RAG Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-slate-400" />
                    Status
                  </Label>
                  <Select
                    value={selectedRagStatus}
                    onValueChange={(value) =>
                      setSelectedRagStatus(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="GREEN">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          Green
                        </div>
                      </SelectItem>
                      <SelectItem value="AMBER">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          Amber
                        </div>
                      </SelectItem>
                      <SelectItem value="RED">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          Red
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Scenario Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    Scenario
                  </Label>
                  <Select
                    value={selectedScenario}
                    onValueChange={(value) =>
                      setSelectedScenario(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Scenarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scenarios</SelectItem>
                      {scenariosList?.map(
                        (scenario: { id: string; name: string }) => (
                          <SelectItem key={scenario.id} value={scenario.id}>
                            {scenario.name}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                    Difficulty
                  </Label>
                  <Select
                    value={selectedDifficulty}
                    onValueChange={(value) =>
                      setSelectedDifficulty(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="Beginner">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Beginner
                        </div>
                      </SelectItem>
                      <SelectItem value="Intermediate">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          Intermediate
                        </div>
                      </SelectItem>
                      <SelectItem value="Advanced">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          Advanced
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 my-2" />

                {/* City Dropdown */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    City
                  </Label>
                  <Select
                    value={selectedCity}
                    onValueChange={(value) =>
                      setSelectedCity(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {filterHierarchy?.map((city: any) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit Dropdown */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-slate-400" />
                    Unit
                  </Label>
                  <Select
                    value={selectedUnit}
                    onValueChange={(value) =>
                      setSelectedUnit(value === "all" ? "" : value)
                    }
                    disabled={!selectedCity}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {availableUnits.map((unit: any) => (
                        <SelectItem key={unit.name} value={unit.name}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department Dropdown */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    Department
                  </Label>
                  <Select
                    value={selectedDept}
                    onValueChange={(value) =>
                      setSelectedDept(value === "all" ? "" : value)
                    }
                    disabled={!selectedUnit}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {availableDepartments.map((dept: string) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected filters preview */}
                {pendingFiltersCount > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {selectedStartDate && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-medium text-slate-600">
                          From: {selectedStartDate}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => setSelectedStartDate("")}
                          />
                        </span>
                      )}
                      {selectedEndDate && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-medium text-slate-600">
                          To: {selectedEndDate}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => setSelectedEndDate("")}
                          />
                        </span>
                      )}
                      {selectedRagStatus && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-medium text-slate-600">
                          {selectedRagStatus}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => setSelectedRagStatus("")}
                          />
                        </span>
                      )}
                      {selectedScenario && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-medium text-slate-600">
                          {scenariosList?.find(
                            (s: any) => s.id === selectedScenario,
                          )?.name || selectedScenario}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => setSelectedScenario("")}
                          />
                        </span>
                      )}
                      {selectedDifficulty && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-medium text-slate-600">
                          {selectedDifficulty}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => setSelectedDifficulty("")}
                          />
                        </span>
                      )}
                      {selectedCity && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-medium text-slate-600">
                          {selectedCity}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => setSelectedCity("")}
                          />
                        </span>
                      )}
                      {selectedUnit && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-medium text-slate-600">
                          {selectedUnit}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => setSelectedUnit("")}
                          />
                        </span>
                      )}
                      {selectedDept && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-medium text-slate-600">
                          {selectedDept}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => setSelectedDept("")}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <SheetFooter className="mt-auto sm:flex-col gap-2">
                <Button
                  onClick={handleApplyFilters}
                  className="w-full bg-[#2d87a4] hover:bg-[#236c84] text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="w-full"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active filters display */}
        {/* {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {appliedStartDate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                From: {appliedStartDate}
              </Badge>
            )}
            {appliedEndDate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                To: {appliedEndDate}
              </Badge>
            )}
            {appliedRagStatus && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CircleDot className="h-3 w-3" />
                {appliedRagStatus}
              </Badge>
            )}
            {appliedScenario && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {scenariosList?.find((s: any) => s.id === appliedScenario)
                  ?.name || "Scenario"}
              </Badge>
            )}
            {appliedDifficulty && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3" />
                {appliedDifficulty}
              </Badge>
            )}
            {appliedCity && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {appliedCity}
              </Badge>
            )}
            {appliedUnit && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <UserCog className="h-3 w-3" />
                {appliedUnit}
              </Badge>
            )}
            {appliedDept && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {appliedDept}
              </Badge>
            )}
          </div>
        )} */}
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sessions.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No session reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          Showing {sessions.length} of {pagination?.total || 0} sessions
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20" id="rows-per-page">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {currentPage} of {pagination?.totalPages || 1}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(pagination?.totalPages || 1, prev + 1),
                )
              }
              disabled={currentPage >= (pagination?.totalPages || 1)}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(pagination?.totalPages || 1)}
              disabled={currentPage >= (pagination?.totalPages || 1)}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
