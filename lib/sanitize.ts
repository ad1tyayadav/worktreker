export const truncate = (value: string | null | undefined, maxLen: number): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > maxLen ? trimmed.substring(0, maxLen) : trimmed;
};

// Requires a string to not be empty after truncation
export const truncateRequired = (value: string | null | undefined, maxLen: number): string => {
  const truncated = truncate(value, maxLen);
  return truncated || "";
};

export const sanitizeDbError = (error: { message: string; code?: string }): string => {
  // Log the actual error for server-side debugging
  console.error("Database Error:", error.message, "Code:", error.code);

  // Return safe client-facing messages based on Postgres/Supabase error codes
  if (error.code === "23505") return "This record already exists.";
  if (error.code === "23503") return "A referenced record could not be found.";
  if (error.code === "23502") return "A required field is missing.";
  if (error.code === "23514") return "Provided data violates a strict check.";
  if (error.code === "42P01") return "Internal server error (table missing).";

  return "An unexpected error occurred. Please try again.";
};
