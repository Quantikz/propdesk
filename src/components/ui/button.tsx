import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,border-color,transform,opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0 active:not-disabled:scale-[0.96]",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg hover:bg-accent-hover",
        secondary: "bg-elev text-fg border border-line hover:bg-hover",
        ghost:
          "border border-line text-muted hover:bg-hover hover:text-fg bg-transparent",
        outline: "border border-line bg-transparent text-fg hover:bg-hover",
        icon: "border border-line bg-transparent text-fg hover:bg-hover",
        send: "bg-fg text-bg hover:bg-fg/90 disabled:bg-hover disabled:text-dim",
        new: "border border-line bg-transparent text-fg hover:bg-hover justify-start",
      },
      size: {
        default: "h-11 min-h-11 px-4 rounded-md text-sm",
        sm: "h-9 min-h-9 px-3 rounded-md text-sm",
        lg: "h-12 min-h-12 px-5 rounded-lg text-sm",
        icon: "size-11 min-h-11 min-w-11 rounded-md",
        send: "size-11 min-h-11 min-w-11 rounded-md",
        pill: "h-9 min-h-9 px-3.5 rounded-md text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
