"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const POPOVER_WIDTH = 296;
const VIEWPORT_PAD = 12;
const GAP = 8;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function calendarCells(viewYear: number, viewMonth: number) {
  const first = new Date(viewYear, viewMonth, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: Array<{ date: Date; inMonth: boolean } | null> = [];

  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(viewYear, viewMonth, day), inMonth: true });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type PopoverPos = { top: number; left: number; width: number };

function placePopover(trigger: DOMRect, popoverHeight: number): PopoverPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(POPOVER_WIDTH, vw - VIEWPORT_PAD * 2);

  let left = trigger.right - width;
  left = Math.min(left, vw - VIEWPORT_PAD - width);
  left = Math.max(VIEWPORT_PAD, left);

  const spaceBelow = vh - trigger.bottom - VIEWPORT_PAD;
  const spaceAbove = trigger.top - VIEWPORT_PAD;
  const preferBelow = spaceBelow >= popoverHeight || spaceBelow >= spaceAbove;

  let top = preferBelow
    ? trigger.bottom + GAP
    : trigger.top - GAP - popoverHeight;

  top = Math.min(top, vh - VIEWPORT_PAD - popoverHeight);
  top = Math.max(VIEWPORT_PAD, top);

  return { top, left, width };
}

type DatePickerFieldProps = {
  id: string;
  name?: string;
  value: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
};

export default function DatePickerField({
  id,
  name = "date",
  value,
  onChange,
  placeholder = "When Would You Need This By?",
  className = "",
  minDate,
}: DatePickerFieldProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<PopoverPos | null>(null);

  const selected = value ? startOfDay(new Date(`${value}T00:00:00`)) : null;
  const today = startOfDay(new Date());
  const earliest = minDate ? startOfDay(minDate) : today;

  const initialView = selected ?? today;
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }

    const update = () => {
      const trigger = rootRef.current?.getBoundingClientRect();
      if (!trigger) return;
      const height = popoverRef.current?.offsetHeight ?? 300;
      setPos(placePopover(trigger, height));
    };

    update();
    // Re-measure after paint once real height is known
    const frame = requestAnimationFrame(update);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, viewYear, viewMonth]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const openCalendar = () => {
    const anchor = selected ?? today;
    setViewYear(anchor.getFullYear());
    setViewMonth(anchor.getMonth());
    setOpen((wasOpen) => !wasOpen);
  };

  const calendar = open && mounted && (
    <div
      ref={popoverRef}
      id={listboxId}
      role="dialog"
      aria-label="Choose a date"
      style={
        pos
          ? {
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 80,
            }
          : {
              position: "fixed",
              top: -9999,
              left: -9999,
              width: Math.min(POPOVER_WIDTH, window.innerWidth - VIEWPORT_PAD * 2),
              zIndex: 80,
              visibility: "hidden",
            }
      }
      className="rounded-xl border border-[#D4B89A]/40 bg-[#281006] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="rounded-lg p-1.5 text-[#F0DCC7] transition-colors hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p
          className="text-sm font-medium text-[#F0DCC7]"
          style={{ fontFamily: "var(--font-display-body)" }}
        >
          {monthLabel}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="rounded-lg p-1.5 text-[#F0DCC7] transition-colors hover:bg-white/10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#AFA599]"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {calendarCells(viewYear, viewMonth).map((cell, index) => {
          if (!cell) {
            return <span key={`empty-${index}`} className="h-9" />;
          }

          const iso = toISODate(cell.date);
          const disabled = cell.date < earliest;
          const isSelected = selected !== null && toISODate(selected) === iso;
          const isToday = toISODate(today) === iso;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => {
                onChange(iso);
                setOpen(false);
              }}
              className={[
                "h-9 rounded-lg text-sm transition-colors",
                disabled
                  ? "cursor-not-allowed text-white/25"
                  : "text-[#F0DCC7] hover:bg-[#A06B4A]/55",
                isSelected
                  ? "bg-[#A06B4A] font-semibold text-white hover:bg-[#A06B4A]"
                  : "",
                !isSelected && isToday ? "ring-1 ring-[#C5A880]/70" : "",
              ].join(" ")}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={openCalendar}
        className="group flex w-full items-center border-0 border-b border-white/70 bg-transparent pb-2 text-left font-[family-name:var(--font-ui)] text-base font-light outline-none transition-colors focus:border-white sm:text-lg"
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            selected ? "text-white" : "text-white/50"
          }`}
        >
          {selected ? formatDisplay(selected) : placeholder}
        </span>
        <Calendar
          aria-hidden="true"
          className="ml-2 h-5 w-5 shrink-0 text-[#F1D9C1] transition-opacity group-hover:opacity-90"
        />
      </button>

      {mounted && calendar ? createPortal(calendar, document.body) : null}
    </div>
  );
}
