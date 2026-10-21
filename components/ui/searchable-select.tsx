//components/ui/searchable-select.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo, useId } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  label: string;
  value: string;
}

export interface SearchableSelectProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | SearchableSelectOption)[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
  error?: string;
  className?: string;
  required?: boolean;
  emptyMessage?: string;
}

export function SearchableSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  searchPlaceholder = "Type to search...",
  disabled = false,
  disabledMessage,
  error,
  className,
  required = false,
  emptyMessage = "No matching options found",
}: SearchableSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Normalize options into { label, value } objects
  const normalizedOptions: SearchableSelectOption[] = useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    );
  }, [options]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const lower = searchTerm.toLowerCase().trim();
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(lower)
    );
  }, [normalizedOptions, searchTerm]);

  // Current selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value);
  }, [normalizedOptions, value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
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

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeItem = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex].value);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          className="font-semibold text-black underline decoration-zinc-400 underline-offset-2 dark:text-white dark:decoration-zinc-500"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <div
        id={selectId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm transition-all duration-200 select-none",
          "focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:bg-zinc-900 dark:focus:ring-zinc-700",
          disabled
            ? "cursor-not-allowed opacity-50 bg-zinc-50 border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800"
            : "cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-500"
            : isOpen
            ? "border-black ring-2 ring-zinc-300 dark:border-white dark:ring-zinc-700"
            : "border-zinc-300 dark:border-zinc-700"
        )}
      >
        <span
          className={cn(
            "truncate pr-2",
            selectedOption
              ? "font-medium text-zinc-900 dark:text-zinc-100"
              : "text-zinc-400 dark:text-zinc-500"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1.5 shrink-0 text-zinc-400">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear selection"
              className="rounded p-0.5 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180 text-zinc-700 dark:text-zinc-200"
            )}
          />
        </div>
      </div>

      {disabled && disabledMessage && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {disabledMessage}
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {/* Dropdown Panel with Search Bar */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="flex items-center border-b border-zinc-100 bg-zinc-50/50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
            <Search className="h-4 w-4 shrink-0 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="ml-2 w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  searchInputRef.current?.focus();
                }}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Results count indicator */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-1.5 text-[11px] font-medium text-zinc-400 dark:border-zinc-800/80 dark:text-zinc-500">
            <span>
              {filteredOptions.length}{" "}
              {filteredOptions.length === 1 ? "option" : "options"} available
            </span>
            {searchTerm && <span>Filtering for &quot;{searchTerm}&quot;</span>}
          </div>

          {/* Options List */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto p-1.5 text-sm focus:outline-none"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      isHighlighted && !isSelected && "bg-zinc-100 dark:bg-zinc-800",
                      isSelected && "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-white",
                      !isHighlighted && !isSelected && "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <span className="truncate">
                      {highlightMatch(opt.label, searchTerm)}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-black dark:text-white" />
                    )}
                  </li>
                );
              })
            ) : (
              <div className="py-6 px-4 text-center">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {emptyMessage}
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  Try typing a different keyword or clear your search
                </p>
              </div>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
