"use client";

import { cn } from "@/lib/utils";

interface SmoothLoadingProps {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SmoothLoading({
  isLoading,
  children,
  className,
}: SmoothLoadingProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg transition-opacity duration-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
            <span>Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function SmoothLoadingCard({
  isLoading,
  children,
  className,
}: SmoothLoadingProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-lg transition-all duration-300">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}
