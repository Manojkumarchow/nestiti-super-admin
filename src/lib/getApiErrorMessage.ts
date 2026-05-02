import axios from "axios";

/** Same behavior as nestiti/app/services/error.ts */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    const responseMessage = data?.message || data?.error;
    if (responseMessage && typeof responseMessage === "string") {
      return responseMessage;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
