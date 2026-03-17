"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { SessionReportsTable } from "@/components/admin/session-reports-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function SessionReportsPage() {
  const router = useRouter();
  const { signout } = useAuth();

  const handleLogout = () => {
    signout();
    router.push("/auth/login");
  };

  return (
    <AdminLayoutShell>
      <AdminHeader handleLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Session Reports
              </h1>
              <p className="text-sm text-gray-600">
                View and manage all assessment session reports
              </p>
            </div>
          </div>

          {/* Session Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Sessions</CardTitle>
              <CardDescription>
                Browse through all assessment sessions with evaluation scores
                and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionReportsTable />
            </CardContent>
          </Card>
        </div>
      </main>
    </AdminLayoutShell>
  );
}
