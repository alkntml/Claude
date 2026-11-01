"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "soft";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "text-white bg-gradient-to-b from-brand-500 to-brand-600 shadow-[0_1px_0_0_rgb(255_255_255/0.25)_inset,0_8px_20px_-8px_rgb(39_71_220/0.65)] hover:from-brand-500 hover:to-brand-700",
  secondary: "bg-white text-ink-800 border border-ink-200 hover:border-ink-300 hover:bg-ink-50 shadow-sm",
  ghost: "text-ink-600 hover:text-ink-900 hover:bg-ink-100/70",
  danger: "text-white bg-gradient-to-b from-rose-500 to-rose-600 hover:to-rose-700 shadow-[0_8px_20px_-10px_rgb(225_29_72/0.7)]",
  dark: "text-white bg-ink-900 hover:bg-ink-800 shadow-[0_8px_24px_-10px_rgb(11_13_24/0.7)]",
  soft: "text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-100",
};
const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-[10px] gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-[15px] rounded-2xl gap-2.5",
};

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }, ref) {
  return (
    <motion.button
      ref={ref}
      whileHover={disabled || loading ? undefined : { y: -1 }}
      whileTap={disabled || loading ? undefined : { scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex select-none items-center justify-center font-medium whitespace-nowrap transition-[background,box-shadow,color,border-color] duration-200 disabled:cursor-not-allowed disabled:opacity-55",
        VARIANTS[variant], SIZES[size], className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
});
