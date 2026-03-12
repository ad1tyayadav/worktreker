import React from "react";

type BadgeVariant = "paid" | "pending" | "custom";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const baseClass =
  "inline-flex items-center rounded-full border-[1.5px] border-ink px-3 py-1 font-retro text-lg uppercase";

const variantClass: Record<BadgeVariant, string> = {
  paid: "bg-green text-white",
  pending: "bg-yellow text-ink",
  custom: "bg-blue text-white",
};

export const Badge = ({ variant = "custom", children, className = "" }: BadgeProps) => {
  return <span className={`${baseClass} ${variantClass[variant]} ${className}`}>{children}</span>;
};
