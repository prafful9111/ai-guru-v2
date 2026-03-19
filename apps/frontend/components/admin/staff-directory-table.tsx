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
} from "lucide-react";
import { format } from "date-fns";
import { EditStaffDialog } from "./edit-staff-dialog";

export function StaffDirectoryTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  // Advanced filters
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [unitFilter, setUnitFilter] = useState("ALL");
  const [staffTypeFilter, setStaffTypeFilter] = useState("ALL");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingStaff, setEditingStaff] = useState<UserResponse | null>(null);

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
    let result = users || [];
    if (departmentFilter !== "ALL") {
      result = result.filter(u => u.department === departmentFilter);
    }
    if (unitFilter !== "ALL") {
      result = result.filter(u => u.unit === unitFilter);
    }
    if (staffTypeFilter !== "ALL") {
      result = result.filter(u => u.role === staffTypeFilter);
    }
    return result;
  }, [users, departmentFilter, unitFilter, staffTypeFilter]);


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
        accessorKey: "lastTrainingDate",
        header: "Last Training",
        cell: ({ row }) => {
          const date = row.original.lastTrainingDate ? new Date(row.original.lastTrainingDate) : null;
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
          const date = row.original.lastTrainingDate ? new Date(row.original.lastTrainingDate) : null;
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
          Showing {filteredUsers.length} of {pagination?.totalUsers || 0} users
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
