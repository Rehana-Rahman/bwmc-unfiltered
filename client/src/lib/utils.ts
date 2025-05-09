import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsername(username: string | null | undefined): string {
  if (!username) return "User";
  return username.startsWith("@") ? username : `@${username}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(firstName?: string | null, lastName?: string | null, username?: string | null): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`;
  } else if (firstName) {
    return firstName[0];
  } else if (username) {
    return username[0];
  }
  return "U";
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
