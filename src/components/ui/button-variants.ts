import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Domino's Brand Button Variants - Enhanced for WCAG AA compliance
        "dominos-primary":
          "bg-dominos-red text-white shadow-md hover:bg-dominos-red-hover focus-visible:ring-dominos-red/30 focus-visible:ring-offset-2 font-semibold border border-transparent",
        "dominos-secondary":
          "bg-white text-dominos-red border-2 border-dominos-red shadow-sm hover:bg-dominos-red hover:text-white focus-visible:ring-dominos-red/30 focus-visible:ring-offset-2 font-semibold",
        "dominos-accent":
          "bg-dominos-blue text-white shadow-md hover:bg-dominos-blue-hover focus-visible:ring-dominos-blue/30 focus-visible:ring-offset-2 font-semibold border border-transparent",
        "dominos-ghost":
          "text-dominos-red hover:bg-dominos-red/10 hover:text-dominos-red focus-visible:ring-dominos-red/30 focus-visible:ring-offset-2 font-medium border border-transparent",
        "dominos-blue-ghost":
          "text-dominos-blue hover:bg-dominos-blue/10 hover:text-dominos-blue focus-visible:ring-dominos-blue/30 focus-visible:ring-offset-2 font-medium border border-transparent",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 sm:h-10 rounded-md px-4 sm:px-6 has-[>svg]:px-3 sm:has-[>svg]:px-4",
        xl: "h-12 sm:h-11 rounded-md px-6 sm:px-8 has-[>svg]:px-4 sm:has-[>svg]:px-6 text-base sm:text-sm",
        icon: "size-9",
        "icon-lg": "size-11 sm:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)