"use client";

import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface PageHeaderProps {
  title: string;
  description?: string;
  backButton?: boolean;
  backHref?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline";
    className?: string;
  };
}

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
        {backButton && (
          <a
            href={backHref}
            className="text-slate-400 text-sm mb-4 inline-block hover:text-slate-300"
          >
            ← Back
          </a>
        )}
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {description && <p className="text-slate-400 mt-2">{description}</p>}
      </div>
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

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: "blue" | "green" | "purple" | "red";
}

export function StatCard({ label, value, icon, color = "blue" }: StatCardProps) {
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
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-4xl font-bold text-white mt-2">{value}</p>
        </div>
        {icon && <div className={`text-5xl opacity-10 ${colorClasses[color]}`}>{icon}</div>}
      </div>
    </Card>
  );
}

export interface AdminContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl";
}

const maxWidthClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "7xl": "max-w-7xl",
};

export function AdminContainer({
  children,
  maxWidth = "7xl",
}: AdminContainerProps) {
  const width = maxWidthClasses[maxWidth] || "max-w-7xl";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className={`${width} mx-auto`}>{children}</div>
    </div>
  );
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="bg-slate-800 border-slate-700 p-6 w-96">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-300 mb-6">{message}</p>
        <div className="flex gap-4">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Confirming..." : "Confirm"}
          </Button>
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
