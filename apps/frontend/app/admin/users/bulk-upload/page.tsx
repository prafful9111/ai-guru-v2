"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { AdminHeader } from "@/components/admin/admin-header";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import toast, { Toaster } from "react-hot-toast";

interface BulkUserData {
  name: string;
  email?: string;
  phoneNumber?: string;
  staffId?: string;
  city?: string;
  department?: string;
  unit?: string;
  role?: "STAFF" | "ADMIN";
}

interface UploadResults {
  successful: { row: number; user: any }[];
  failed: { row: number; data: BulkUserData; errors: string[] }[];
}

// Normalize header name for case-insensitive matching
const normalizeHeader = (header: string): string => {
  return header.toLowerCase().replace(/[\s_-]+/g, "");
};

// Map flexible CSV headers to expected field names
const mapCsvHeaders = (rawData: any[]): BulkUserData[] => {
  if (rawData.length === 0) return [];

  const headerMap: Record<string, string> = {
    staffid: "staffId",
    staffname: "name",
    name: "name",
    phonenumber: "phoneNumber",
    phone: "phoneNumber",
    emailid: "email",
    email: "email",
    department: "department",
    unit: "unit",
    city: "city",
  };

  return rawData.map((row) => {
    const mappedRow: any = {};

    Object.keys(row).forEach((key) => {
      const normalizedKey = normalizeHeader(key);
      const mappedKey = headerMap[normalizedKey];

      if (mappedKey && row[key]) {
        mappedRow[mappedKey] = row[key];
      }
    });

    return mappedRow as BulkUserData;
  });
};

export default function BulkUploadPage() {
  const router = useRouter();
  const { signout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [csvData, setCsvData] = useState<BulkUserData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(
    null,
  );
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleLogout = () => {
    signout();
    router.push("/auth/login");
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      {
        "Staff ID": "EMP001",
        "Staff Name": "John Doe",
        "Phone Number": "+1234567890",
        "Email ID": "john.doe@example.com",
        Department: "Cardiology",
        Unit: "ICU",
        City: "New York",
      },
      {
        "Staff ID": "EMP002",
        "Staff Name": "Jane Smith",
        "Phone Number": "+0987654321",
        "Email ID": "jane.smith@example.com",
        Department: "Neurology",
        Unit: "Emergency",
        City: "Los Angeles",
      },
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "users-sample.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample CSV downloaded successfully!");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const processFile = (file: File) => {
    if (file.type !== "text/csv") {
      toast.error("Please select a CSV file");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error("Error parsing CSV file");
          console.error("CSV parse errors:", results.errors);
          return;
        }

        // Map flexible headers to expected field names
        const parsedData = mapCsvHeaders(results.data as any[]);

        // Validate required fields
        const invalidRows = parsedData.filter(
          (row, index) => !row.name?.trim(),
        );
        if (invalidRows.length > 0) {
          toast.error(`Missing required 'name' field in some rows`);
          return;
        }

        setCsvData(parsedData);
        setShowPreview(true);
        setUploadResults(null);
        toast.success(
          `Successfully parsed ${parsedData.length} users from CSV`,
        );
      },
      error: (error) => {
        toast.error("Failed to parse CSV file");
        console.error("CSV parse error:", error);
      },
    });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUpload = async () => {
    if (csvData.length === 0) {
      toast.error("No data to upload");
      return;
    }

    setIsUploading(true);
    try {
      const response = await apiClient.post<{
        message: string;
        results: UploadResults;
      }>("/api/admin/users/bulk", {
        users: csvData,
      });

      setUploadResults(response.results);
      setShowPreview(false);

      if (response.results.successful.length > 0) {
        toast.success(
          `Successfully created ${response.results.successful.length} users!`,
        );
      }

      if (response.results.failed.length > 0) {
        toast.error(
          `${response.results.failed.length} users failed to create. Check results below.`,
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload users");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setCsvData([]);
    setShowPreview(false);
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    setCsvData([]);
    setShowPreview(false);
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader handleLogout={handleLogout} />
      <main className="max-w-480 mx-auto p-4 md:p-8 pt-4!">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/users")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>{" "}
              <span>Bulk Upload Users</span>
            </h1>
            <p className="text-sm text-gray-600">
              Upload multiple users at once using a CSV file
            </p>
          </div>
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>Upload CSV File</div>
                <Button
                  variant="outline"
                  onClick={downloadSampleCSV}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Sample CSV
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className={`flex items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <Upload
                      className={`mx-auto h-12 w-12 ${
                        isDragging ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                    <div className="mt-4">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        {isDragging
                          ? "Drop CSV file here"
                          : "Click to upload or drag and drop CSV file"}
                      </span>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                        onChange={handleFileSelect}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      CSV files only, up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSV Preview */}
          {showPreview && csvData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <span>Preview ({csvData.length} users)</span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="gap-2"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {isUploading ? "Uploading..." : "Proceed"}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-96 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white">
                      <TableRow>
                        <TableHead>Staff ID</TableHead>
                        <TableHead>Staff Name</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Email ID</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>City</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.slice(0, 50).map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>{user.staffId || "—"}</TableCell>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.phoneNumber || "—"}</TableCell>
                          <TableCell>{user.email || "—"}</TableCell>
                          <TableCell>{user.department || "—"}</TableCell>
                          <TableCell>{user.unit || "—"}</TableCell>
                          <TableCell>{user.city || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {csvData.length > 50 && (
                    <div className="p-4 text-center text-sm text-gray-500 border-t">
                      Showing first 50 rows. Total: {csvData.length} users
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <div className="space-y-4">
              {/* Success Results */}
              {uploadResults.successful.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Successfully Created ({uploadResults.successful.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border max-h-64 overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white">
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Staff ID</TableHead>
                            <TableHead>Role</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResults.successful.map((result) => (
                            <TableRow key={result.row}>
                              <TableCell>{result.row}</TableCell>
                              <TableCell className="font-medium">
                                {result.user.name}
                              </TableCell>
                              <TableCell>{result.user.email || "—"}</TableCell>
                              <TableCell>{result.user.phoneNumber || "—"}</TableCell>
                              <TableCell>{result.user.staffId || "—"}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    result.user.role === "ADMIN"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {result.user.role}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Results */}
              {uploadResults.failed.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      Failed to Create ({uploadResults.failed.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border max-h-64 overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white">
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Errors</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResults.failed.map((result, index) => (
                            <TableRow key={index}>
                              <TableCell>{result.row}</TableCell>
                              <TableCell className="font-medium">
                                {result.data.name}
                              </TableCell>
                              <TableCell>{result.data.email || "—"}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {result.errors.map((error, errorIndex) => (
                                    <div
                                      key={errorIndex}
                                      className="text-sm text-red-600"
                                    >
                                      {error}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reset Button */}
              <div className="flex justify-center">
                <Button onClick={handleReset} variant="outline">
                  Upload Another File
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#22c55e",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#ef4444",
            },
          },
        }}
      />
    </div>
  );
}
