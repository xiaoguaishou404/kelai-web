import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-[13px] font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tide/20 focus-visible:ring-offset-1",
  {
    variants: {
      variant: {
        primary:
          "bg-tide text-white hover:bg-tide-deep",
        secondary:
          "border border-line-control bg-white text-ink-soft hover:border-tide-border hover:bg-tide-mist hover:text-tide",
        ghost: "text-tide hover:bg-tide-mist",
        danger: "border border-danger/15 bg-danger-mist text-danger-deep hover:bg-danger hover:text-white",
      },
      size: {
        sm: "h-[34px] px-3",
        md: "h-9 px-4",
        lg: "h-10 px-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
