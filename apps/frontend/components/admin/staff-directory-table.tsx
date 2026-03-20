"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useUsers } from "@/lib/hooks/use-users";
import type { UserResponse } from "@repo/validation";
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
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  Edit2,
  Mail,
  ShieldAlert,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { EditStaffDialog } from "./edit-staff-dialog";

const ScenarioCell = ({ scenarios }: { scenarios: string[] }) => {
   const [open, setOpen] = useState(false);
   
   // Handle clicks strictly inside the table container using a native overlay trick
   if (!scenarios || scenarios.length === 0 || !scenarios[0]) return <span className="text-gray-400 text-xs italic">Unassigned</span>;

   const firstScenario = scenarios[0];

   return (
     <div className="relative flex items-center gap-1.5 min-w-[120px]">
        <span 
           className="text-[11px] truncate max-w-[140px] bg-indigo-50/50 text-indigo-700 px-2 py-1 rounded font-medium border border-indigo-100/50"
           title={firstScenario}
        >
           {firstScenario.split(' (')[0]}
        </span>
        {scenarios.length > 1 && (
           <div className="relative">
             <Badge 
               variant="outline" 
               className="cursor-pointer hover:bg-slate-100 bg-white shadow-sm text-[10px] px-1.5 py-0 h-5"
               onClick={() => setOpen(!open)}
             >
               +{scenarios.length - 1}
             </Badge>
             
             {open && (
               <>
                 <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] p-3 bg-white border border-slate-200 shadow-xl rounded-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                   <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                      <h4 className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">All Assigned Modules</h4>
                      <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1 rounded-md transition-colors"><X className="h-3 w-3"/></button>
                   </div>
                   <ul className="text-[12px] space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {scenarios.map((s, i) => (
                         <li key={i} className="bg-slate-50/80 border border-slate-100 p-2 rounded-lg text-slate-700 font-medium leading-snug">
                            {s}
                         </li>
                      ))}
                   </ul>
                 </div>
               </>
             )}
           </div>
        )}
     </div>
   );
};

const SAMPLE_USERS: any[] = [
  {
    id: "1",
    name: "Michael Chang",
    email: "m.chang@hospital.org",
    phoneNumber: "+91 9876543210",
    staffId: "EMP-09231",
    city: "Mumbai",
    department: "Pediatrics",
    unit: "Pediatrics",
    role: "STAFF",
    scenarios: [
      "Delayed doctor appointment (v1) - Beginner",
      "Calming an anxious patient (v2) - Advanced"
    ],
    lastTrainingDate: "2026-03-10T11:45:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "p.sharma@hospital.org",
    phoneNumber: "+91 9876543211",
    staffId: "EMP-04821",
    city: "Jaipur",
    department: "Cardiology",
    unit: "ICU Wing",
    role: "STAFF",
    scenarios: [
      "Outside food request from patient (v2) - Intermediate"
    ],
    lastTrainingDate: "2026-03-14T14:30:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Alisha Davis",
    email: "a.davis@hospital.org",
    phoneNumber: "+91 9876543212",
    staffId: "EMP-05512",
    city: "Delhi",
    department: "Emergency",
    unit: "Emergency (ER)",
    role: "STAFF",
    scenarios: [
      "Angry patient overcharged (v1) - Intermediate", 
      "Breaking a bad news (v2) - Expert", 
      "Cold and late food (v1) - Beginner"
    ],
    lastTrainingDate: "2026-02-15T09:00:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Robert Jones",
    email: "r.jones@hospital.org",
    phoneNumber: "+91 9876543213",
    staffId: "EMP-01124",
    city: "Delhi",
    department: "Emergency",
    unit: "Emergency (ER)",
    role: "STAFF",
    scenarios: [
      "Patient requesting outside of visiting hours to meet a patient (v1) - Beginner"
    ],
    lastTrainingDate: "2026-03-01T10:00:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Lisa Smith",
    email: "l.smith@hospital.org",
    phoneNumber: "+91 9876543214",
    staffId: "EMP-03882",
    city: "Mumbai",
    department: "Administration",
    unit: "Front Desk",
    role: "ADMIN",
    scenarios: [],
    lastTrainingDate: "2026-02-28T14:00:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Tom Kumar",
    email: "t.kumar@hospital.org",
    phoneNumber: "+91 9876543215",
    staffId: "EMP-06771",
    city: "Bangalore",
    department: "Emergency",
    unit: "Emergency (ER)",
    role: "STAFF",
    scenarios: [
      "Delayed doctor appointment (v2) - Intermediate"
    ],
    lastTrainingDate: "2026-01-20T16:00:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function StaffDirectoryTableInner() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  // Advanced filters
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [unitFilter, setUnitFilter] = useState("ALL");
  const [staffTypeFilter, setStaffTypeFilter] = useState("ALL");
  const [localUsers, setLocalUsers] = useState(SAMPLE_USERS);

  useEffect(() => {
    const fetchLocalBatch = () => {
      const stored = localStorage.getItem("mockUploadedBatch");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const formatted = parsed.map((u: any, i: number) => ({
            id: `upload-${Date.now()}-${i}`,
            name: u.name,
            email: `${u.name.split(' ')[0].toLowerCase()}@hospital.org`,
            phoneNumber: "—",
            staffId: u.staffId,
            city: "—",
            department: u.department,
            unit: "—",
            role: "STAFF",
            scenarios: u.scenarios || [],
            lastTrainingDate: u.lastTrainingDate || null,
            batchId: u.batchId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          // Use a Map to deduplicate by staffId
          const allMap = new Map();
          [...SAMPLE_USERS, ...formatted].forEach(user => {
            allMap.set(user.staffId, user);
          });
          setLocalUsers(Array.from(allMap.values()));
        } catch(e) {}
      }
    };
    
    // Initial fetch
    fetchLocalBatch();
    
    // Listen for new uploads in other tabs
    window.addEventListener("bulk-upload-success", fetchLocalBatch as EventListener);
    return () => window.removeEventListener("bulk-upload-success", fetchLocalBatch as EventListener);
  }, []);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingStaff, setEditingStaff] = useState<UserResponse | null>(null);
  
  const searchParams = useSearchParams();
  const currentBatch = searchParams.get("batch") || "all-batches";

  // You would pass the advanced filters to `useUsers` backend if supported.
  // Assuming frontend filtering for department/unit/role if the API doesn't support it yet,
  // or passing them into useUsers. For now, we fetch base and filter locally if needed,
  // or assume useUsers is generic. Since useUsers only takes `search`, we filter clientside.
  const { users, pagination, isLoading, error } = useUsers({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
  });

  const filteredUsers = useMemo(() => {
    let result = localUsers;
    if (departmentFilter !== "ALL") {
      result = result.filter(u => u.department === departmentFilter);
    }
    if (unitFilter !== "ALL") {
      result = result.filter(u => u.unit === unitFilter);
    }
    if (staffTypeFilter !== "ALL") {
      result = result.filter(u => u.role === staffTypeFilter);
    }
    if (currentBatch !== "all-batches") {
      result = result.filter(u => u.batchId === currentBatch);
    }
    return result;
  }, [localUsers, departmentFilter, unitFilter, staffTypeFilter, currentBatch]);


  const columns: ColumnDef<UserResponse>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shadow-sm">
                {(row.getValue("name") as string).charAt(0).toUpperCase()}
             </div>
             <div>
                <div className="font-semibold text-gray-900">{row.getValue("name")}</div>
                <div className="text-xs text-muted-foreground">{row.original.email || "No email"}</div>
             </div>
          </div>
        ),
      },
      {
        accessorKey: "staffId",
        header: "Staff ID",
        cell: ({ row }) => (
          <div className="font-mono text-sm px-2 py-1 bg-gray-50 rounded w-fit border border-gray-100">
            {row.getValue("staffId") || "—"}
          </div>
        ),
      },
      {
        accessorKey: "department",
        header: "Dept / Unit",
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="font-medium text-gray-700">{row.getValue("department") || "—"}</div>
            <div className="text-xs text-muted-foreground">{row.original.unit || "—"}</div>
          </div>
        ),
      },
      {
        id: "assigned_scenarios",
        header: "Assigned Scenarios",
        cell: ({ row }) => <ScenarioCell scenarios={(row.original as any).scenarios} />
      },
      {
        accessorKey: "lastTrainingDate",
        header: "Last Training",
        cell: ({ row }) => {
          const date = (row.original as any).lastTrainingDate ? new Date((row.original as any).lastTrainingDate) : null;
          return (
            <div className="text-sm">
              {date ? format(date, "MMM d, yyyy") : <span className="text-gray-400 italic">Never</span>}
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          // Status Logic: if training date is recent, "Ready for Assessment"
          const date = (row.original as any).lastTrainingDate ? new Date((row.original as any).lastTrainingDate) : null;
          const isReady = date !== null; // Mock logic
          return isReady ? (
            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">
              Ready for Assessment
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
               Pending Training
            </Badge>
          );
        }
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setEditingStaff(row.original)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50" title="Dispatch Deep-Link">
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    // we handle pagination partly manual because of the backend hook, 
    // but right now it's a mix.
  });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-red-800">
        <ShieldAlert className="h-5 w-5 mt-0.5" />
        <div>
           <h4 className="font-semibold">Error Loading Staff Data</h4>
           <div className="text-sm opacity-90">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-white/50 p-2 rounded-xl border border-gray-100/50">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-white border-gray-200 focus-visible:ring-primary/20"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
           <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[140px] bg-white">
                 <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="ALL">All Depts</SelectItem>
                 <SelectItem value="Cardiology">Cardiology</SelectItem>
                 <SelectItem value="Neurology">Neurology</SelectItem>
                 <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
           </Select>
           <Select value={unitFilter} onValueChange={setUnitFilter}>
              <SelectTrigger className="w-[140px] bg-white">
                 <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="ALL">All Units</SelectItem>
                 <SelectItem value="ICU">ICU</SelectItem>
                 <SelectItem value="OPD">OPD</SelectItem>
                 <SelectItem value="Surgery">Surgery</SelectItem>
              </SelectContent>
           </Select>
           <Select value={staffTypeFilter} onValueChange={setStaffTypeFilter}>
              <SelectTrigger className="w-[140px] bg-white">
                 <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="ALL">All Types</SelectItem>
                 <SelectItem value="STAFF">Staff (Nurse/Doc)</SelectItem>
                 <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
           </Select>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/80 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-11 font-semibold text-gray-600">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j} className="py-4">
                      <Skeleton className="h-5 w-full bg-gray-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredUsers.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group hover:bg-gray-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <Search className="h-8 w-8 opacity-20" />
                    <p>No staff found matching the criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 text-sm text-gray-500">
        <div>
          Showing {filteredUsers.length} of {localUsers.length} users
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1">
              <Button
                 variant="outline"
                 size="icon"
                 className="h-8 w-8 rounded-full"
                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                 disabled={!pagination?.hasPreviousPage}
              >
                 <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 font-medium text-gray-700">Page {currentPage} of {pagination?.totalPages || 1}</span>
              <Button
                 variant="outline"
                 size="icon"
                 className="h-8 w-8 rounded-full"
                 onClick={() => setCurrentPage((p) => Math.min(pagination?.totalPages || 1, p + 1))}
                 disabled={!pagination?.hasNextPage}
              >
                 <ChevronRight className="h-4 w-4" />
              </Button>
           </div>
        </div>
      </div>

      {editingStaff && (
        <EditStaffDialog
           open={!!editingStaff}
           onOpenChange={(isOpen: boolean) => !isOpen && setEditingStaff(null)}
           staff={editingStaff}
        />
      )}
    </div>
  );
}

export function StaffDirectoryTable() {
  return (
    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-gray-50 rounded-xl" />}>
       <StaffDirectoryTableInner />
    </Suspense>
  );
}
