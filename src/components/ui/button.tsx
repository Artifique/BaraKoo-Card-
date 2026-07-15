import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-98 cursor-pointer",
          // Variants
          variant === "primary" && "bg-brand-orange text-white hover:bg-brand-orange/90 glow-orange font-semibold",
          variant === "secondary" && "bg-brand-navy-light text-white hover:bg-brand-navy-light/80 border border-border/50",
          variant === "outline" && "border border-border/80 bg-transparent text-white hover:bg-brand-navy-light/50",
          variant === "ghost" && "bg-transparent text-white hover:bg-brand-navy-light/30",
          variant === "success" && "bg-brand-green text-white hover:bg-brand-green/90 glow-green font-semibold",
          variant === "destructive" && "bg-brand-red text-white hover:bg-brand-red/90",
          // Sizes
          size === "default" && "h-11 px-6 py-2.5",
          size === "sm" && "h-9 px-4 text-xs",
          size === "lg" && "h-13 px-8 text-base",
          size === "icon" && "h-10 w-10 rounded-full",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
