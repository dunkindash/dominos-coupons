import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "./button-variants"

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      type={type}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size, className }))}
      // Ensure proper keyboard navigation
      tabIndex={disabled ? -1 : 0}
      // Add proper ARIA attributes
      aria-disabled={disabled}
      // Ensure button has accessible content
      {...(typeof children === 'string' && !props['aria-label'] && !props['aria-labelledby'] 
        ? { 'aria-label': children } 
        : {})}
      {...props}
    >
      {children}
    </Comp>
  )
}

export { Button }
