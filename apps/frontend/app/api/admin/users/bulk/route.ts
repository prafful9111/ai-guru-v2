import { NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/mock-data";
import { hashPassword } from "@/lib/auth/password";
import { createUserSchema, transformUserInput } from "@repo/validation";
import { ZodError } from "zod";

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

// Normalize phone number to 10 digits only
const normalizePhoneNumber = (phoneNumber: string): string => {
  // Remove all spaces, dashes, and special characters
  let normalized = phoneNumber.replace(/[\s\-\(\)]/g, "");

  // Remove + if present
  normalized = normalized.replace(/^\+/, "");

  // Remove country code (91 for India)
  if (normalized.startsWith("91") && normalized.length > 10) {
    normalized = normalized.substring(2);
  }

  // Return only the last 10 digits
  return normalized.slice(-10);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { users } = body as { users: BulkUserData[] };

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "No users data provided" },
        { status: 400 },
      );
    }

    const results = {
      successful: [] as any[],
      failed: [] as { row: number; data: BulkUserData; errors: string[] }[],
    };

    const defaultPassword = "qwerty";

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      if (!userData) continue; // Skip undefined entries

      const rowNumber = i + 1;

      try {
        // Normalize phone number and use as password if available, otherwise use default
        let passwordToUse = defaultPassword;
        if (userData.phoneNumber?.trim()) {
          const normalizedPhone = normalizePhoneNumber(
            userData.phoneNumber.trim(),
          );
          if (normalizedPhone.length === 10) {
            passwordToUse = normalizedPhone;
          }
        }

        // Log password information for tracking
        console.log(
          `[User Creation] Staff ID: ${userData.staffId || "N/A"} | Name: ${userData.name} | Password: ${passwordToUse} | Phone: ${userData.phoneNumber || "N/A"}`,
        );

        const hashedPassword = await hashPassword(passwordToUse);

        // Validate each user with Zod schema
        const validatedData = createUserSchema.parse({
          ...userData,
          password: passwordToUse,
          role: "STAFF", // Always default to STAFF`
        });

        // Transform empty strings to null
        const transformedData = transformUserInput(validatedData);

        // Check for existing user by email
        if (transformedData.email) {
          const existingByEmail = MOCK_USERS.find(u => u.email === transformedData.email);

          if (existingByEmail) {
            results.failed.push({
              row: rowNumber,
              data: userData,
              errors: [
                `User with email "${transformedData.email}" already exists`,
              ],
            });
            continue;
          }
        }

        // Check for existing user by staffId
        if (transformedData.staffId) {
          const existingByStaffId = MOCK_USERS.find(u => u.staffId === transformedData.staffId);

          if (existingByStaffId) {
            results.failed.push({
              row: rowNumber,
              data: userData,
              errors: [
                `User with Staff ID "${transformedData.staffId}" already exists`,
              ],
            });
            continue;
          }
        }

        // Create the user (Mock)
        const createdUser = {
            id: "MOCK_" + Date.now() + "_" + i,
            ...transformedData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Remove password from response
        const { password: _, ...userWithoutPassword } = createdUser as any;
        results.successful.push({
          row: rowNumber,
          user: userWithoutPassword,
        });
      } catch (error) {
        console.error(`Error processing user at row ${rowNumber}:`, error);

        let errorMessages: string[] = [];

        if (error instanceof ZodError) {
          errorMessages = error.errors.map((err) => err.message);
        } else {
          errorMessages.push("Failed to create user");
        }

        results.failed.push({
          row: rowNumber,
          data: userData,
          errors: errorMessages,
        });
      }
    }

    return NextResponse.json(
      {
        message: `Bulk upload completed. ${results.successful.length} users created, ${results.failed.length} failed.`,
        results,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { error: "Internal server error during bulk upload" },
      { status: 500 },
    );
  }
}
