import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseClass =
  "inline-flex items-center justify-center gap-2 border-2 border-ink px-4 py-3 font-pixel text-[10px] uppercase tracking-[0.05em] transition-all duration-150 rounded-none focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] min-h-[44px] sm:px-5";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm",
  secondary:
    "bg-card text-ink shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm hover:bg-card-hover",
  ghost:
    "border-transparent bg-transparent text-muted hover:border-ink hover:bg-card-hover hover:text-ink hover:shadow-hard-sm",
  danger:
    "bg-danger text-white shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm hover:bg-accent-strong",
};

export const Button = ({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) => {
  return <button className={`${baseClass} ${variantClass[variant]} ${className}`} {...props} />;
};
