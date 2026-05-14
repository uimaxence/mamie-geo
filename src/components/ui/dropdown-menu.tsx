"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight } from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

// Radix DropdownMenu — items hover gray-50, séparateurs `rule`,
// active state via accent ponctuel.

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(function DropdownMenuContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white p-1",
          "shadow-[var(--shadow-md)] focus:outline-none",
          "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    danger?: boolean;
  }
>(function DropdownMenuItem({ className, inset, danger, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm outline-none",
        "data-[highlighted]:bg-[color:var(--color-gray-100)] data-[highlighted]:text-[color:var(--color-ink)]",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        danger
          ? "text-[color:var(--color-error)] data-[highlighted]:bg-[color:var(--color-error-bg)]"
          : "text-[color:var(--color-ink-soft)]",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
});

export const DropdownMenuCheckboxItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(function DropdownMenuCheckboxItem({ className, children, checked, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      checked={checked}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-[var(--radius-sm)] py-1.5 pl-8 pr-2 text-sm outline-none",
        "data-[highlighted]:bg-[color:var(--color-gray-100)]",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check size={14} strokeWidth={2.5} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

export const DropdownMenuLabel = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(function DropdownMenuLabel({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn("type-eyebrow px-2.5 py-1.5", className)}
      {...props}
    />
  );
});

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-[color:var(--color-border)]", className)}
      {...props}
    />
  );
});

export function DropdownMenuShortcut({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-[color:var(--color-muted)]", className)}
      {...props}
    />
  );
}

export const DropdownMenuSubTrigger = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }
>(function DropdownMenuSubTrigger({ className, inset, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm outline-none",
        "data-[highlighted]:bg-[color:var(--color-gray-100)] data-[state=open]:bg-[color:var(--color-gray-100)]",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight size={14} className="ml-auto text-[color:var(--color-muted)]" />
    </DropdownMenuPrimitive.SubTrigger>
  );
});

export const DropdownMenuSubContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(function DropdownMenuSubContent({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        "z-50 min-w-[10rem] overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white p-1 shadow-[var(--shadow-md)]",
        "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
        className,
      )}
      {...props}
    />
  );
});
