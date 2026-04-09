import * as React from "react"

import { cn } from "@/lib/utils"

const TooltipProvider: React.FC<{ children?: React.ReactNode; delayDuration?: number }> = ({ children }) => <>{children}</>

const Tooltip: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>

const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(props.children)) {
    return React.cloneElement(props.children as React.ReactElement, { ref } as any)
  }
  return <button ref={ref} {...props} />
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number; side?: string; align?: string }
>(({ className, sideOffset = 4, side, align, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
