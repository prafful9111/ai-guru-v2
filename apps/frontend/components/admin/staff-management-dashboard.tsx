"use client";

import React, { useState } from "react";
import { StaffDirectoryTable } from "./staff-directory-table";
import { BulkUploadUtility } from "./bulk-upload-utility";
import { AssignmentEngine } from "./assignment-engine";
import { AddSingleUserTab } from "./add-single-user-tab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Upload, Network, UserPlus } from "lucide-react";

export function StaffManagementDashboard() {
  const [activeTab, setActiveTab] = useState("directory");

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Staff & Training Management</h1>
          <p className="text-sm text-gray-500">
            Transition from bulk data to individualized tracking and assignments.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full lg:max-w-[800px] grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="directory" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Staff Directory</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add User</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Upload</span>
          </TabsTrigger>
          <TabsTrigger value="assignment" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Assignment Engine</span>
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="directory" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
              <CardHeader className="pb-3 border-b border-gray-50 mb-4 bg-gray-50/50">
                <CardTitle className="text-lg">Unified Staff Directory</CardTitle>
                <CardDescription>
                  Manage individual staff members, edit details, and track training dates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StaffDirectoryTable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="add" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border border-gray-200 shadow-sm bg-white/50 backdrop-blur rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-50 mb-4 bg-gray-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100/50 rounded-md text-blue-600"><UserPlus className="h-4 w-4" /></div>
                  Create Single User
                </CardTitle>
                <CardDescription>
                  Manually add a single user directly into the system database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddSingleUserTab />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="upload" className="m-0 focus-visible:outline-none focus-visible:ring-0">
             <Card className="border border-gray-200 shadow-sm bg-white/50 backdrop-blur rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-50 mb-4 bg-gray-50/50">
                <CardTitle className="text-lg">Bulk Upload Utility</CardTitle>
                <CardDescription>
                  Drag and drop CSV/Excel files to map headers and bulk add/update staff.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkUploadUtility />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="assignment" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border border-gray-200 shadow-sm bg-white/50 backdrop-blur rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-50 mb-4 bg-gray-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100/50 rounded-md text-indigo-600"><Network className="h-4 w-4" /></div>
                  Assignment Engine
                </CardTitle>
                <CardDescription>
                  Rule-based allocation to assign specific scenarios based on department and role.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssignmentEngine />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
