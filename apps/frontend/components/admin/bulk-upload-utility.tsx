"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet, X, CheckCircle2, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

type ParsedRow = {
  [key: string]: string; // Allow any column
};

const extractFields = (row: ParsedRow) => {
  const normRow: Record<string, string> = {};
  Object.entries(row).forEach(([k, v]) => {
    normRow[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = v as string;
  });
  
  const getV = (keys: string[]) => {
    for (const k of keys) {
       if (row[k]) return row[k];
       const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
       if (normRow[cleanK]) return normRow[cleanK];
    }
    return null;
  };

  return {
    name: getV(["Name", "EmployeeName", "StaffName", "FullName"]) || "Unknown",
    staffId: getV(["ID", "StaffID", "EmployeeID", "StaffCode"]) || "—",
    department: getV(["Dept", "Department", "Function", "Division"]) || "—",
    lastTrainingDate: getV(["LastTrainingDate", "TrainingDate", "Date"]) || "—",
  };
};

export function BulkUploadUtility() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ParsedRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file");
      return;
    }
    setFile(selectedFile);
    Papa.parse<ParsedRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Assume mapping based on general header names
        // In a real app, this is where we'd build a visual field mapper
        setData(results.data as ParsedRow[]);
      },
      error: () => {
        toast.error("Failed to parse CSV file.");
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setData([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!data.length) return;
    setIsUploading(true);
    try {
      const batchId = `BATCH-${Date.now()}`;
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const batchName = `Group: ${dateStr} (${data.length} users)`;

      const payload = data.map(row => {
         const extracted = extractFields(row);
         return {
            name: extracted.name,
            staffId: extracted.staffId === "—" ? null : extracted.staffId,
            department: extracted.department === "—" ? null : extracted.department,
            lastTrainingDate: extracted.lastTrainingDate === "—" ? null : extracted.lastTrainingDate,
            batchId,
         };
      });

      console.log("Bulk uploading:", payload);
      await new Promise(res => setTimeout(res, 1500));
      
      const existingBatches = JSON.parse(localStorage.getItem("mockBatches") || "[]");
      const newBatch = { id: batchId, name: batchName, createdAt: new Date().toISOString() };
      localStorage.setItem("mockBatches", JSON.stringify([...existingBatches, newBatch]));

      // Dump to localStorage to trick the frontend Directory Table into fetching them
      const existing = JSON.parse(localStorage.getItem("mockUploadedBatch") || "[]");
      const combined = [...existing, ...payload];
      localStorage.setItem("mockUploadedBatch", JSON.stringify(combined));
      
      // Dispatch a custom window event for instant table refresh
      window.dispatchEvent(new CustomEvent("bulk-upload-success"));

      toast.success(`Successfully uploaded ${data.length} staff records securely to ${batchId}!`);
      handleRemoveFile();
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl cursor-transition-all duration-200 cursor-pointer ${
            isDragging 
              ? "border-primary bg-primary/5 scale-[1.01]" 
              : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300"
          }`}
        >
          <div className="p-4 bg-white shadow-sm rounded-full mb-4">
             <UploadCloud className={`h-8 w-8 ${isDragging ? "text-primary" : "text-gray-400"}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Bulk Staff Data</h3>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
            Drag and drop your CSV file here, or click to browse. Ensure your file has <span className="font-medium text-gray-700">Name, ID, Dept, Last Training Date</span> headers.
          </p>
          <Button variant="outline" className="pointer-events-none bg-white">
            Select File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <FileSpreadsheet className="h-6 w-6" />
             </div>
             <div>
                <h4 className="font-semibold text-gray-900">{file.name}</h4>
                <p className="text-sm text-gray-500">{data.length} rows detected • {(file.size / 1024).toFixed(1)} KB</p>
             </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="text-gray-400 hover:text-red-500 hover:bg-red-50">
             <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Preview Section */}
      {data.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Data Preview
                <Badge variant="outline" className="text-xs font-normal">First 5 rows</Badge>
             </h3>
             <Button onClick={handleUpload} disabled={isUploading} className="gap-2">
                {isUploading ? <UploadCloud className="h-4 w-4 animate-pulse" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirm & Upload
             </Button>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/80 border-b border-gray-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-10 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</TableHead>
                  <TableHead className="h-10 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff ID</TableHead>
                  <TableHead className="h-10 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</TableHead>
                  <TableHead className="h-10 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Training Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 5).map((row, i) => {
                  const extracted = extractFields(row);
                  return (
                    <TableRow key={i} className="hover:bg-gray-50/50">
                      <TableCell className="py-2.5 font-medium">{extracted.name || <AlertCircle className="h-4 w-4 text-amber-500"/>}</TableCell>
                      <TableCell className="py-2.5 font-mono text-xs">{extracted.staffId}</TableCell>
                      <TableCell className="py-2.5 text-sm">{extracted.department}</TableCell>
                      <TableCell className="py-2.5 text-sm">{extracted.lastTrainingDate}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {data.length > 5 && (
            <div className="text-center text-sm text-gray-500 pt-2">
               ... and {data.length - 5} more rows
            </div>
          )}
        </div>
      )}
    </div>
  );
}
