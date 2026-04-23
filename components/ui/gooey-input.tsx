"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  useMemo,
  useCallback,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

function GooeyFilter({ filterId, blur }: { filterId: string; blur: number }) {
  return (
    <svg className="absolute hidden h-0 w-0" aria-hidden>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchIcon({ layoutId }: { layoutId: string }) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className="size-4 shrink-0"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

function ChevronDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-3 shrink-0 text-background/50"
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const transition = {
  duration: 0.4,
  type: "spring" as const,
  bounce: 0.25,
};

const iconBubbleVariants = {
  collapsed: { scale: 0, opacity: 0, y: 0 },
  expanded: { scale: 1, opacity: 1, y: -20 },
};

export interface GooeyFilterOption {
  label: string;
  value: string;
}

export interface GooeyInputFilters {
  location?: {
    options: GooeyFilterOption[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
  };
  sort?: {
    options: GooeyFilterOption[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
  };
}

export interface GooeyInputClassNames {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  bubble?: string;
  bubbleSurface?: string;
}

export interface GooeyInputProps {
  placeholder?: string;
  className?: string;
  classNames?: GooeyInputClassNames;
  collapsedWidth?: number;
  expandedWidth?: number;
  expandedOffset?: number;
  gooeyBlur?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  filters?: GooeyInputFilters;
}

export function GooeyInput({
  placeholder = "Type to search...",
  className,
  classNames,
  collapsedWidth = 115,
  expandedWidth = 200,
  expandedOffset = 50,
  gooeyBlur = 5,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onOpenChange,
  disabled = false,
  filters,
}: GooeyInputProps) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, "");
  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const [locationVal, setLocationVal] = useState(filters?.location?.defaultValue ?? "");
  const [sortVal, setSortVal] = useState(filters?.sort?.defaultValue ?? "");

  const locValue = filters?.location?.value !== undefined ? filters.location.value : locationVal;
  const srtValue = filters?.sort?.value !== undefined ? filters.sort.value : sortVal;

  const isControlled = valueProp !== undefined;
  const searchText = isControlled ? valueProp : uncontrolledValue;
  const hasFilters = Boolean(filters);

  const setSearchText = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const setExpanded = useCallback(
    (next: boolean) => {
      setIsExpanded(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  // Close on outside click
  useEffect(() => {
    if (!isExpanded) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setExpanded(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isExpanded, setExpanded]);

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current && !hasFilters) {
      setSearchText("");
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, hasFilters, setSearchText]);

  const buttonVariants = useMemo(
    () => ({
      collapsed: { width: collapsedWidth, marginLeft: 0 },
      expanded: { width: expandedWidth, marginLeft: expandedOffset },
    }),
    [collapsedWidth, expandedWidth, expandedOffset],
  );

  const handleExpand = useCallback(() => {
    if (!disabled) setExpanded(true);
  }, [disabled, setExpanded]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value),
    [setSearchText],
  );

  // Only close on input blur if focus left the entire component
  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (rootRef.current?.contains(e.relatedTarget as Node)) return;
      if (!searchText && !hasFilters) setExpanded(false);
    },
    [searchText, hasFilters, setExpanded],
  );

  const handleLocationChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (filters?.location?.value === undefined) setLocationVal(e.target.value);
      filters?.location?.onChange?.(e.target.value);
    },
    [filters],
  );

  const handleSortChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (filters?.sort?.value === undefined) setSortVal(e.target.value);
      filters?.sort?.onChange?.(e.target.value);
    },
    [filters],
  );

  const locLabel =
    filters?.location?.options.find((o) => o.value === locValue)?.label ??
    filters?.location?.placeholder ??
    "All Locations";
  const srtLabel =
    filters?.sort?.options.find((o) => o.value === srtValue)?.label ??
    filters?.sort?.placeholder ??
    "Sort by Match";

  const surfaceClass = "bg-foreground text-background shadow-sm ring-1 ring-border/60";
  const totalWidth = expandedWidth + expandedOffset;

  return (
    <div
      ref={rootRef}
      className={cn("relative flex items-center justify-center", className, classNames?.root)}
      style={{ width: totalWidth }}
    >
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />

      <div
        className={cn("relative flex h-10 items-center justify-center", classNames?.filterWrap)}
        style={{ filter: `url(#${filterId})` }}
      >
        <motion.div
          className={cn("flex h-10 items-center justify-center", classNames?.buttonRow)}
          variants={buttonVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          {/* ── COLLAPSED ── */}
          {!isExpanded && (
            <button
              type="button"
              disabled={disabled}
              onClick={handleExpand}
              className={cn(
                "flex h-10 w-full cursor-pointer items-center gap-2 rounded-full px-4 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
                surfaceClass,
                classNames?.trigger,
              )}
            >
              <SearchIcon layoutId={iconLayoutId} />
              <span className="truncate text-background/60">{placeholder}</span>
            </button>
          )}

          {/* ── EXPANDED ── selects live in a div, never inside a button */}
          {isExpanded && (
            <div
              className={cn(
                "flex h-10 w-full items-center gap-2 rounded-full px-4",
                surfaceClass,
                classNames?.trigger,
              )}
            >
              <input
                ref={inputRef}
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                value={searchText}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={cn(
                  "h-full min-w-0 flex-1 bg-transparent text-sm text-background outline-none placeholder:text-background/40",
                  classNames?.input,
                )}
              />

              {hasFilters && filters?.location && (
                <>
                  <div className="h-4 w-px shrink-0 bg-background/20" />
                  {/* Styled label is visible; transparent select on top captures interaction */}
                  <div className="relative flex w-28 shrink-0 cursor-pointer items-center gap-1">
                    <span className="pointer-events-none flex min-w-0 flex-1 items-center gap-1 truncate text-sm text-background">
                      {locLabel}
                    </span>
                    <ChevronDown />
                    <select
                      value={locValue}
                      onChange={handleLocationChange}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    >
                      {filters.location.placeholder && (
                        <option value="">{filters.location.placeholder}</option>
                      )}
                      {filters.location.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {hasFilters && filters?.sort && (
                <>
                  <div className="h-4 w-px shrink-0 bg-background/20" />
                  <div className="relative flex w-32 shrink-0 cursor-pointer items-center gap-1">
                    <span className="pointer-events-none flex min-w-0 flex-1 items-center gap-1 truncate text-sm text-background">
                      {srtLabel}
                    </span>
                    <ChevronDown />
                    <select
                      value={srtValue}
                      onChange={handleSortChange}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    >
                      {filters.sort.placeholder && (
                        <option value="">{filters.sort.placeholder}</option>
                      )}
                      {filters.sort.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Bubble icon that pops up when expanded */}
        <motion.div
          className={cn(
            "absolute top-1/2 left-0 flex size-10 -translate-y-1/2 items-center justify-center",
            classNames?.bubble,
          )}
          variants={iconBubbleVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              surfaceClass,
              classNames?.bubbleSurface,
            )}
          >
            <SearchIcon layoutId={iconLayoutId} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
