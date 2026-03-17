import { z } from 'zod';

/**
 * Enum matching the Prisma Role enum
 */
export const RoleEnum = z.enum(['STAFF', 'ADMIN']);
export type Role = z.infer<typeof RoleEnum>;

/**
 * Base user schema for creating a new user
 * Matches the Prisma User model structure
 */
export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  
  phoneNumber: z
    .string()
    .regex(/^[+]?[\d\s-()]{10,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  
  staffId: z
    .string()
    .min(1, 'Staff ID must not be empty')
    .max(50, 'Staff ID must be less than 50 characters'),
  
  city: z
    .string()
    .max(100, 'City must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  
  department: z
    .string()
    .max(100, 'Department must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  
  unit: z
    .string()
    .max(100, 'Unit must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  
  role: RoleEnum.default('STAFF'),
});

/**
 * Type for creating a new user (input type)
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Schema for the API response (excludes password)
 */
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  staffId: z.string(),
  city: z.string().nullable(),
  department: z.string().nullable(),
  unit: z.string().nullable(),
  role: RoleEnum,
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

/**
 * Transform empty strings to null/undefined for database storage
 */
export function transformUserInput(data: CreateUserInput) {
  return {
    name: data.name,
    email: data.email || null,
    password: data.password,
    phoneNumber: data.phoneNumber || null,
    staffId: data.staffId,
    city: data.city || null,
    department: data.department || null,
    unit: data.unit || null,
    role: data.role,
  };
}
