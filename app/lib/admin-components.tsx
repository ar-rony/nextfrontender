// ============================================================================
// ADMIN UI COMPONENTS
// ============================================================================
// Reusable UI components specifically for the admin dashboard
// Includes: PageHeader, StatCard, AdminContainer, ConfirmDialog
// ============================================================================

"use client";

import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ============================================================================
// PAGE HEADER COMPONENT
// ============================================================================

/**
 * Props for PageHeader component
 */
export interface PageHeaderProps {
  /** Main page title */
  title: string;
  
  /** Optional subtitle or description */
  description?: string;
  
  /** Show back button */
  backButton?: boolean;
  
  /** URL to navigate when back button is clicked */
  backHref?: string;
  
  /** Optional action button configuration */
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline";
    className?: string;
  };
}

/**
 * PageHeader Component
 * Displays a page title with optional description and action buttons
 * Commonly used at the top of admin pages
 * @param {PageHeaderProps} props - Component props
 * @returns {React.ReactNode} Rendered header component
 */
export function PageHeader({
  title,
  description,
  backButton,
  backHref = "/admin",
  actionButton,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex justify-between items-start">
      <div>
        {/* Optional back navigation link */}
        {backButton && (
          <a
            href={backHref}
            className="text-slate-400 text-sm mb-4 inline-block hover:text-slate-300"
          >
            ← Back
          </a>
        )}
        
        {/* Page title */}
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        
        {/* Optional description */}
        {description && <p className="text-slate-400 mt-2">{description}</p>}
      </div>
      
      {/* Optional action button */}
      {actionButton && (
        <Button
          onClick={actionButton.onClick}
          className={actionButton.className}
        >
          {actionButton.label}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

/**
 * Props for StatCard component
 */
export interface StatCardProps {
  /** Label/title for the stat */
  label: string;
  
  /** The stat value (number or string) */
  value: string | number;
  
  /** Optional icon/emoji to display */
  icon?: ReactNode;
  
  /** Color scheme for the icon: 'blue' | 'green' | 'purple' | 'red' */
  color?: "blue" | "green" | "purple" | "red";
}

/**
 * StatCard Component
 * Displays a single dashboard statistic with label, value, and optional icon
 * Used in dashboard overview section
 * @param {StatCardProps} props - Component props
 * @returns {React.ReactNode} Rendered stat card
 */
export function StatCard({ label, value, icon, color = "blue" }: StatCardProps) {
  // Color classes for the icon based on selected color scheme
  const colorClasses = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    red: "text-red-500",
  };

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          {/* Stat label/title */}
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          
          {/* Stat value */}
          <p className="text-4xl font-bold text-white mt-2">{value}</p>
        </div>
        
        {/* Optional icon */}
        {icon && (
          <div className={`text-5xl opacity-10 ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// ADMIN CONTAINER COMPONENT
// ============================================================================

/**
 * Props for AdminContainer component
 */
export interface AdminContainerProps {
  /** Container content */
  children: ReactNode;
  
  /** Max width constraint: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl";
}

/**
 * Mapping of max width values to Tailwind CSS classes
 */
const maxWidthClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "7xl": "max-w-7xl",
};

/**
 * AdminContainer Component
 * Wrapper component that provides consistent styling and layout for admin pages
 * Includes gradient background and responsive max-width container
 * @param {AdminContainerProps} props - Component props
 * @returns {React.ReactNode} Rendered container
 */
export function AdminContainer({
  children,
  maxWidth = "7xl",
}: AdminContainerProps) {
  // Get max-width class or default to 7xl
  const width = maxWidthClasses[maxWidth] || "max-w-7xl";
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className={`${width} mx-auto`}>{children}</div>
    </div>
  );
}

// ============================================================================
// CONFIRM DIALOG COMPONENT
// ============================================================================

/**
 * Props for ConfirmDialog component
 */
export interface ConfirmDialogProps {
  /** Whether dialog is open/visible */
  isOpen: boolean;
  
  /** Dialog title */
  title: string;
  
  /** Dialog message/content */
  message: string;
  
  /** Callback when confirm button is clicked */
  onConfirm: () => void;
  
  /** Callback when cancel button is clicked */
  onCancel: () => void;
  
  /** Whether to show loading state on buttons */
  isLoading?: boolean;
}

/**
 * ConfirmDialog Component
 * Modal dialog for confirming destructive actions (delete, etc.)
 * Displays over a dark overlay with centered card
 * @param {ConfirmDialogProps} props - Component props
 * @returns {React.ReactNode | null} Rendered dialog or null if not open
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  // Don't render if dialog is not open
  if (!isOpen) return null;

  return (
    // Full-screen overlay with semi-transparent dark background
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Dialog card */}
      <Card className="bg-slate-800 border-slate-700 p-6 w-96">
        {/* Dialog title */}
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        
        {/* Dialog message */}
        <p className="text-slate-300 mb-6">{message}</p>
        
        {/* Action buttons */}
        <div className="flex gap-4">
          {/* Confirm button */}
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Confirming..." : "Confirm"}
          </Button>
          
          {/* Cancel button */}
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
