"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

type SheetSide = "right" | "left";

interface SheetContentProps extends DialogPrimitive.DialogContentProps {
  side?: SheetSide;
  showCloseButton?: boolean;
}

const sidePositionClass: Record<SheetSide, string> = {
  right:
    "inset-y-0 right-0 h-full w-[92vw] max-w-md border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
  left:
    "inset-y-0 left-0 h-full w-[92vw] max-w-md border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
};

export function SheetContent({
  className = "",
  side = "right",
  showCloseButton = true,
  children,
  ...props
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
      <DialogPrimitive.Content
        className={`fixed z-50 flex flex-col overflow-y-auto border-zinc-200 bg-white shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out ${sidePositionClass[side]} ${className}`}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            aria-label="关闭"
            className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border-b border-zinc-200 px-6 py-4 ${className}`}
      {...props}
    />
  );
}

export function SheetBody({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex-1 overflow-y-auto px-6 py-4 ${className}`} {...props} />;
}

export function SheetFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border-t border-zinc-200 px-6 py-4 ${className}`}
      {...props}
    />
  );
}
