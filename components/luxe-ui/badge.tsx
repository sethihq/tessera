import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 hover:shadow-lg hover:scale-105",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md hover:scale-105",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80 hover:shadow-lg hover:scale-105",
        outline: 
          "text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:scale-105",
        neutral:
          "border-transparent bg-neutral-600 text-neutral-50 shadow hover:bg-neutral-700 hover:shadow-lg hover:scale-105 dark:bg-neutral-400 dark:text-neutral-900 dark:hover:bg-neutral-300",
        muted:
          "border-transparent bg-neutral-300 text-neutral-900 shadow hover:bg-neutral-400 hover:shadow-lg hover:scale-105 dark:bg-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-500",
        elevated:
          "border-transparent bg-neutral-800 text-neutral-50 shadow-lg hover:shadow-xl hover:scale-110 dark:bg-neutral-200 dark:text-neutral-900",
        smooth:
          "relative overflow-hidden border-transparent bg-neutral-700 text-neutral-50 shadow-lg before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 hover:scale-105 dark:bg-neutral-300 dark:text-neutral-900"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
