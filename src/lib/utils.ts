import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleError = (error: unknown) => {
    if (error instanceof Error) {
        /*return {
            message: error.message,
            stack: error.stack,
        };*/

        return { errorMessage: error.message };
    }
    return {
        errorMessage: "An unknown error occurred",
    };
}