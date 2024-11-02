import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to conditionally join class names with tailwind-merge, removing duplicates and resolving conflicts.
 *
 * @param {ClassValue[]} inputs - List of class names to combine.
 * @returns {string} - Merged and optimized class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a File object into a temporary URL for previewing.
 *
 * @param {File} file - File to convert.
 * @returns {string} - A URL that can be used as a src for images, etc.
 */
export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

/**
 * Format a date string into a more readable form.
 *
 * @param {string} dateString - ISO string representing the date.
 * @returns {string} - Formatted date and time in the "MMM D, YYYY at h:mm" format.
 */
export function formatDateString(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`;
}

/**
 * Format a timestamp into a relative time string like "5 minutes ago" or "Just now."
 * Falls back to full date formatting if the time difference is over a month.
 *
 * @param {string} timestamp - ISO string or date string to format.
 * @returns {string} - Relative time or formatted date.
 */
export const multiFormatDateString = (timestamp: string = ""): string => {
  const date = new Date(timestamp);
  const now = new Date();

  if (isNaN(date.getTime())) return ""; // Return empty if timestamp is invalid

  const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
  const diffInMinutes = diffInSeconds / 60;
  const diffInHours = diffInMinutes / 60;
  const diffInDays = diffInHours / 24;

  const pluralize = (value: number, unit: string) =>
    `${Math.floor(value)} ${unit}${Math.floor(value) > 1 ? "s" : ""} ago`;

  if (diffInDays >= 30) {
    return formatDateString(timestamp); // Use full date if more than a month
  } else if (diffInDays >= 1) {
    return pluralize(diffInDays, "day");
  } else if (diffInHours >= 1) {
    return pluralize(diffInHours, "hour");
  } else if (diffInMinutes >= 1) {
    return pluralize(diffInMinutes, "minute");
  } else {
    return "Just now";
  }
};

/**
 * Check if a user ID exists in a list of liked user IDs.
 *
 * @param {string[]} likeList - List of user IDs who liked an item.
 * @param {string} userId - The user ID to check.
 * @returns {boolean} - True if the user ID is in the list, false otherwise.
 */
export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};

/**
 * Sanitize a username by removing disallowed characters and converting to lowercase.
 * Only letters, numbers, dots, underscores, and hyphens are retained.
 *
 * @param {string} username - Username to sanitize.
 * @returns {string} - Sanitized username.
 */
export const sanitizeUsername = (username: string): string => {
  return username.replace(/[^a-zA-Z0-9.-_]/g, "").toLowerCase();
};

/**
 * Generate a random alphanumeric string for use as a unique identifier.
 *
 * @returns {string} - Randomly generated string.
 */
export const generateRandomString = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Process tags from a comma-separated string into an array.
 * Removes spaces and splits by commas.
 *
 * @param {string | undefined} tags - String of comma-separated tags.
 * @returns {string[]} - Array of individual tag strings.
 */
export const processTags = (tags: string | undefined): string[] => {
  return tags?.replace(/ /g, "").split(",") || [];
};
