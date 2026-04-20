import * as PopoverPrimitive from "@radix-ui/react-popover";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export function PopoverContent({
  className = "",
  align = "center",
  sideOffset = 8,
  ...props
}: PopoverPrimitive.PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={`z-50 w-72 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg outline-none ${className}`}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
