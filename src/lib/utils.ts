import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOptimizedImageUrl(url: string | null | undefined): string {
  // If Supabase Image Transformations are not enabled (Pro plan), this will cause images to break.
  // Returning the original URL fixes the broken images. To optimize images, either enable 
  // Image Transformations in Supabase dashboard, or optimize images locally before uploading.
  return url || '';
}
