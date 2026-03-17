import { NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/mock-data";
import { hashPassword } from "@/lib/auth/password";
import { createUserSchema, transformUserInput } from "@repo/validation";
import { ZodError } from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    let filteredUsers = MOCK_USERS.filter(u => u.role === 'STAFF');

    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(lowerSearch) || 
        u.email.toLowerCase().includes(lowerSearch) || 
        u.staffId.toLowerCase().includes(lowerSearch)
      );
    }

    const totalUsers = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      users: paginatedUsers.map(({ password, ...rest }) => rest), // Strip passwords just in case
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validatedData = createUserSchema.parse(body);

    // Transform empty strings to null for database
    const userData = transformUserInput(validatedData);

    // Check if user with email already exists (if email provided)
    if (userData.email) {
      const existingUserByEmail = MOCK_USERS.find(u => u.email === userData.email);

      if (existingUserByEmail) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 },
        );
      }
    }

    // Check if user with staffId already exists (if staffId provided)
    if (userData.staffId) {
      const existingUserByStaffId = MOCK_USERS.find(u => u.staffId === userData.staffId);

      if (existingUserByStaffId) {
        return NextResponse.json(
          { error: "A user with this Staff ID already exists" },
          { status: 400 },
        );
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create the mock user response
    const userWithoutPassword = {
        id: "MOCK_" + Date.now(),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "User created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user error:", error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: "Validation failed",
          details: formattedErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
