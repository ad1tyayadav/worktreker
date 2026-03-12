import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = ({ label, error, className = "", id, ...props }: SelectProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label className="font-retro text-xl uppercase tracking-[0.1em] text-muted" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={`w-full rounded-none border-2 border-ink bg-paper px-3 py-2.5 font-body text-base text-ink focus:outline-none focus:shadow-[0_0_0_3px_rgba(232,49,42,0.3)] ${className}`}
        {...props}
      />
      {error ? <span className="font-retro text-lg text-accent">{error}</span> : null}
    </div>
  );
};
