import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
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

    // Build where clause for search
    let where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { staffId: { contains: search, mode: "insensitive" } },
      ];
    }

    where = { ...where, role: "STAFF" }; // Only fetch staff users
    
    // Get total count for pagination
    const totalUsers = await prisma.user.count({ where });

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        staffId: true,
        city: true,
        department: true,
        unit: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      users,
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
      const existingUserByEmail = await prisma.user.findFirst({
        where: { email: userData.email },
      });

      if (existingUserByEmail) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 },
        );
      }
    }

    // Check if user with staffId already exists (if staffId provided)
    if (userData.staffId) {
      const existingUserByStaffId = await prisma.user.findUnique({
        where: { staffId: userData.staffId },
      });

      if (existingUserByStaffId) {
        return NextResponse.json(
          { error: "A user with this Staff ID already exists" },
          { status: 400 },
        );
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

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

    // Handle Prisma unique constraint errors
    if ((error as any)?.code === "P2002") {
      const target = (error as any)?.meta?.target;
      if (target?.includes("staffId")) {
        return NextResponse.json(
          { error: "A user with this Staff ID already exists" },
          { status: 400 },
        );
      }
      if (target?.includes("email")) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
