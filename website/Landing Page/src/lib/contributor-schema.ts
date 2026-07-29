import { z } from "zod";

export const contributorApplicationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(255, "Email must be under 255 characters"),
  githubUsername: z
    .string()
    .trim()
    .min(1, "GitHub username is required")
    .max(39, "GitHub usernames are at most 39 characters")
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/, "Enter a valid GitHub username"),
  resumeUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .max(500, "URL is too long")
    .refine(
      (value) => value.startsWith("https://"),
      "Use an https:// link (e.g. a Google Drive share link)",
    ),
  motivation: z
    .string()
    .trim()
    .min(10, "Tell us a bit more (at least 10 characters)")
    .max(1000, "Keep it under 1000 characters"),
});

export type ContributorApplicationInput = z.infer<typeof contributorApplicationSchema>;
