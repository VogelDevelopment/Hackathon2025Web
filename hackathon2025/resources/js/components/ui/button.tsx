import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Link } from "@inertiajs/react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 cursor-pointer",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground cursor-pointer",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 cursor-pointer",
        ghost: "hover:bg-accent hover:text-accent-foreground cursor-pointer",
        link: "text-primary underline-offset-4 hover:underline cursor-pointer",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-11 rounded-md px-8 py-8 has-[>svg]:px-6 text-lg",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  to?: string      // For internal routes (Inertia.js)
  href?: string    // For external URLs
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  to,
  href,
  children,
  ...props
}: ButtonProps) {
  const baseClassName = cn(buttonVariants({ variant, size, className }))

  // If asChild is true, use Slot (existing behavior)
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={baseClassName}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  // Internal link (Inertia.js routing)
  if (to) {
    return (
      <Link
        href={to}
        data-slot="button"
        className={baseClassName}
        {...(props as any)} // Cast needed because Link props differ from button props
      >
        {children}
      </Link>
    )
  }

  // External link
  if (href) {
    return (
      <a
        href={href}
        data-slot="button"
        className={baseClassName}
        target="_blank"
        rel="noopener noreferrer"
        {...(props as any)} // Cast needed because anchor props differ from button props
      >
        {children}
      </a>
    )
  }

  // Regular button (default behavior)
  return (
    <button
      data-slot="button"
      className={baseClassName}
      {...props}
    >
      {children}
    </button>
  )
}

export { Button, buttonVariants }
