"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { UsersDataTable } from "@/components/admin/users-data-table";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Shield, Building, Upload } from "lucide-react";
import Link from "next/link";

export default function UsersPage() {
  const router = useRouter();
  const { signout } = useAuth();

  const handleLogout = () => {
    signout();
    router.push("/auth/login");
  };

  return (
    <AdminLayoutShell>
      <AdminHeader handleLogout={handleLogout} />
      <main className="max-w-480 mx-auto p-4 md:p-8 pt-4!">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-sm text-gray-600">
                Manage system users and their permissions
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={"/admin/users/bulk-upload"} className="w-full sm:w-fit">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Upload className="h-4 w-4" />
                  Bulk Upload
                </Button>
              </Link>
              <AddUserDialog />
            </div>
          </div>
          {/* Users Data Table */}
          {/* <Card>
            <CardContent> */}
              <UsersDataTable />
            {/* </CardContent>
          </Card> */}
        </div>
      </main>
    </AdminLayoutShell>
  );
}
