import { z } from "zod";

// Define the SignupValidation object using zod
export const SignupValidation = z.object({
  // Ensure name is a string with at least 2 characters
  name: z.string().min(2, { message: "Too short." }),
  // Ensure username is a string with at least 2 characters
  username: z.string().min(2, { message: "Too short." }),
  // Ensure email is a valid email format
  email: z.string().email({ message: "Invalid email address" }),
  // Ensure password is a string with at least 8 characters
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

// Define the SigninValidation object using zod
export const SigninValidation = z.object({
  // Ensure email is a valid email format
  email: z.string().email({ message: "Please enter a valid email address." }),
  // Ensure password is not empty
  password: z.string().min(1, { message: "Please enter your password." }),
});

// Define the PostValidation object using zod for validation
export const PostValidation = z.object({
  // Ensure caption is a string between 5 and 2200 characters long
  caption: z
    .string()
    .min(5, { message: "Caption must be at least 5 characters." })
    .max(2200, { message: "Caption must not exceed 2200 characters." }),
  // Ensure file is a custom type of an array of files
  file: z.custom<File[]>(),
  // Ensure location is a string between 2 and 100 characters long
  location: z
    .string()
    .min(2, { message: "Location must be at least 2 characters." })
    .max(100, { message: "Location must not exceed 100 characters." }),
  // Ensure tags is a string (further processing can split this into an array if needed)
  tags: z.string(),
});

export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  bio: z.string(),
});
