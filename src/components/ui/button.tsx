"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "soft";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // D148: düz indigo, hafif gölge
  primary: "text-brand-950 bg-brand-200 hover:bg-brand-300 shadow-sm shadow-brand-900/10",
  secondary: "bg-white text-ink-700 border border-ink-200 hover:bg-ink-50",
  ghost: "text-ink-600 hover:text-ink-900 hover:bg-ink-100/70",
  danger: "text-white bg-rose-600 hover:bg-rose-700 shadow-sm",
  dark: "text-brand-950 bg-brand-200 hover:bg-brand-300 shadow-sm shadow-brand-900/10",
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
