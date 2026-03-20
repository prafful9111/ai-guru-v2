"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { UserResponse } from "@repo/validation";
import { STANDARD_SCENARIOS_VERSIONED, HierarchicalScenarioDropdown } from "./hierarchical-scenario-dropdown";
import toast from "react-hot-toast";
import { Calendar, KeyRound, Loader2, Save } from "lucide-react";

interface EditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: UserResponse;
}

export function EditStaffDialog({ open, onOpenChange, staff }: EditStaffDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [overrideScenarios, setOverrideScenarios] = useState<string[]>([]);
  
  // Local state for edits
  const [formData, setFormData] = useState({
    name: staff.name,
    department: staff.department || "",
    unit: staff.unit || "",
    role: staff.role,
    lastTrainingDate: (staff as any).lastTrainingDate 
      ? new Date((staff as any).lastTrainingDate).toISOString().split('T')[0] 
      : "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mock API Call to update user
      await new Promise((res) => setTimeout(res, 800));
      toast.success("Staff profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update staff profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setIsResettingPassword(true);
    try {
      // Mock API Call
      await new Promise((res) => setTimeout(res, 1000));
      toast.success("Password reset link sent to staff email");
    } catch (error) {
      toast.error("Failed to reset password");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Staff Profile</DialogTitle>
          <DialogDescription>
            Update details for {staff.name} or reset their access credentials.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label htmlFor="name">Full Name</Label>
               <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
               />
            </div>
            <div className="space-y-2">
               <Label htmlFor="staffId">Staff ID</Label>
               <Input id="staffId" value={staff.staffId} disabled className="bg-gray-50 text-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label htmlFor="department">Department</Label>
               <Input 
                  id="department" 
                  value={formData.department} 
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
               />
            </div>
            <div className="space-y-2">
               <Label htmlFor="unit">Unit</Label>
               <Input 
                  id="unit" 
                  value={formData.unit} 
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
               />
            </div>
          </div>

          <div className="space-y-2 border-t pt-4 mt-2 border-gray-100">
             <Label htmlFor="trainingDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Latest Training Date
             </Label>
             <div className="flex items-center gap-3">
                <Input 
                   type="date"
                   id="trainingDate" 
                   value={formData.lastTrainingDate} 
                   onChange={(e) => setFormData({ ...formData, lastTrainingDate: e.target.value })} 
                   className="flex-1"
                />
             </div>
             <p className="text-xs text-muted-foreground mt-1">
                Updating this will automatically flag the user as "Ready for Assessment".
             </p>
          </div>

          <div className="space-y-2 border-t pt-4 mt-2 border-gray-100">
             <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Individual Override</h4>
                  <p className="text-xs text-muted-foreground">Assign a specific scenario directly to this staff member.</p>
                </div>
             </div>
             <div className="flex flex-col gap-3 mt-3 pb-2">
                 <HierarchicalScenarioDropdown 
                     selected={overrideScenarios}
                     onChange={setOverrideScenarios}
                 />
                 <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                    disabled={overrideScenarios.length === 0}
                    onClick={() => {
                        toast.success(`Assigned ${overrideScenarios.length} scenario(s) to ${staff.name}`);
                        setOverrideScenarios([]);
                        onOpenChange(false);
                    }}
                 >
                    Directly Assign to Staff
                 </Button>
             </div>
          </div>

          <div className="space-y-2 border-t pt-4 mt-2 border-gray-100 pb-2">
             <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Security</h4>
                  <p className="text-xs text-muted-foreground mr-4">Send an automated link to allow the user to securely reset their password.</p>
                </div>
                <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={handleResetPassword}
                   disabled={isResettingPassword}
                   className="shrink-0 gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                   {isResettingPassword ? <Loader2 className="h-3 w-3 animate-spin"/> : <KeyRound className="h-3 w-3"/>}
                   Reset Password
                </Button>
             </div>
          </div>
        </div>

        <DialogFooter className="bg-gray-50/50 -mx-6 -mb-6 px-6 py-4 border-t border-gray-100">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
