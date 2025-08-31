import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
  {
    variants: {
      variant: {
        default: 
          "bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
        destructive:
          "bg-neutral-800 text-neutral-50 shadow-sm hover:bg-neutral-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300",
        outline:
          "border border-neutral-300 bg-transparent shadow-sm hover:bg-neutral-100 hover:text-neutral-900 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
        secondary:
          "bg-neutral-200 text-neutral-900 shadow-sm hover:bg-neutral-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600",
        ghost: 
          "hover:bg-neutral-100 hover:text-neutral-900 hover:scale-[1.02] active:scale-[0.98] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
        link: 
          "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-100",
        elevated:
          "bg-neutral-900 text-neutral-50 shadow-lg hover:shadow-xl hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 dark:bg-neutral-100 dark:text-neutral-900",
        smooth:
          "relative overflow-hidden bg-neutral-800 text-neutral-50 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 dark:bg-neutral-200 dark:text-neutral-900"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
