import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const Card = ({ children, className = "", style }: CardProps) => {
  return (
    <div
      className={`border-2 border-ink bg-card rounded-none shadow-hard-lg transition-all duration-150 hover:-translate-y-[2px] hover:shadow-hard-hover ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
