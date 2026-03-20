"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@repo/validation";
import { useCreateUser } from "@/lib/hooks/use-create-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, UserPlus, Eye, EyeOff, Check, ChevronDown } from "lucide-react";

export const STANDARD_SCENARIOS_VERSIONED = [
  "Delayed doctor appointment (v1) - Beginner",
  "Delayed doctor appointment (v2) - Intermediate",
  "Outside food request from patient (v1) - Beginner",
  "Outside food request from patient (v2) - Intermediate",
  "Calming an anxious patient (v1) - Beginner",
  "Calming an anxious patient (v2) - Advanced",
  "Angry patient overcharged (v1) - Intermediate",
  "Angry patient overcharged (v2) - Advanced",
  "Breaking a bad news (v1) - Intermediate",
  "Breaking a bad news (v2) - Expert",
  "Patient requesting outside of visiting hours to meet a patient (v1) - Beginner",
  "Patient requesting outside of visiting hours to meet a patient (v2) - Intermediate",
  "Cold and late food (v1) - Beginner",
  "Cold and late food (v2) - Intermediate"
];

function MultiSelectDropdown({ options, selected, onChange }: { options: string[], selected: string[], onChange: (val: string[]) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((o: string) => o !== opt));
    else onChange([...selected, opt]);
  };

  return (
    <div className="relative" ref={ref}>
      <div 
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 cursor-pointer"
      >
        <div className="flex flex-wrap gap-1 items-center truncate max-w-[90%]">
          {selected.length === 0 ? (
            <span className="text-slate-500">Select scenarios...</span>
          ) : (
            <div className="flex gap-1 overflow-hidden truncate">
               {selected.slice(0, 2).map((s: string) => (
                  <span key={s} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-medium border border-slate-200 truncate max-w-[120px]">{s}</span>
               ))}
               {selected.length > 2 && (
                  <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-medium border border-slate-200">+{selected.length - 2}</span>
               )}
            </div>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </div>
      
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-base shadow-md focus:outline-none sm:text-sm">
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <div 
                key={opt}
                onClick={() => toggleOption(opt)}
                className="relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 cursor-pointer text-slate-700"
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {isSelected && <Check className="h-4 w-4" />}
                </span>
                <span className={`${isSelected ? 'font-semibold text-slate-900' : 'font-medium'}`}>{opt}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AddUserDialogProps {
  trigger?: React.ReactNode;
}

export function AddUserDialog({ trigger }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      staffId: "",
      city: "",
      department: "",
      unit: "",
      role: "STAFF",
      scenario: [],
      difficultyLevel: "",
    },
  });

  const {
    createUser,
    isLoading,
    serverError,
    reset: resetMutation,
  } = useCreateUser({
    onSuccess: (data) => {
      form.reset();
      toast.success(`User "${data.user.name}" created successfully!`);
      setOpen(false);
    },
  });

  const onSubmit = async (data: CreateUserInput) => {
    try {
      await createUser(data);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      resetMutation();
      setShowPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-90 sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-2 md:pb-3">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Add a new user to the system. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Server Error Display */}
            {serverError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {serverError}
              </div>
            )}

          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="text-sm font-medium text-slate-800">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-b border-gray-100 pb-2 pt-2">
              <h3 className="text-sm font-medium text-slate-800">Work & Training Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff ID</FormLabel>
                    <FormControl>
                      <Input placeholder="EMP001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Cardiology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ICU">ICU</SelectItem>
                        <SelectItem value="OPD">OPD</SelectItem>
                        <SelectItem value="Surgery">Surgery</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="General Ward">General Ward</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scenario"
                render={({ field }) => {
                  const selectedScenarios = Array.isArray(field.value) ? field.value : [];
                  return (
                    <FormItem className="md:col-span-2">
                       <FormLabel>Assigned Scenarios</FormLabel>
                       <FormControl>
                         <MultiSelectDropdown 
                           options={STANDARD_SCENARIOS_VERSIONED}
                           selected={selectedScenarios}
                           onChange={field.onChange}
                         />
                       </FormControl>
                       <FormDescription>Select one or more scenario versions from the dropdown.</FormDescription>
                       <FormMessage />
                    </FormItem>
                  )
                }}
              />

              {/* Difficulty Level removed because it is dictated by the selected scenario version. */}
            </div>
          </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create User
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
