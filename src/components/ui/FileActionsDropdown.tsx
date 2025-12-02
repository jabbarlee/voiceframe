"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Trash2, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

interface FileActionsDropdownProps {
  onView: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  disabled?: boolean;
  className?: string;
}

export function FileActionsDropdown({
  onView,
  onDelete,
  onDownload,
  disabled = false,
  className = "",
}: FileActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const actions: FileAction[] = [
    {
      id: "view",
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => {
        onView();
        setIsOpen(false);
      },
    },
    ...(onDownload
      ? [
          {
            id: "download",
            label: "Download",
            icon: <Download className="h-4 w-4" />,
            onClick: () => {
              onDownload();
              setIsOpen(false);
            },
          },
        ]
      : []),
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => {
        onDelete();
        setIsOpen(false);
      },
      variant: "danger" as const,
    },
  ];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={disabled}
        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
        aria-label="File actions"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              disabled={action.disabled}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors ${
                action.variant === "danger"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50"
              } ${action.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              role="menuitem"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

