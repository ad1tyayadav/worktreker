import React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = ({ label, error, className = "", id, ...props }: TextareaProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label className="font-retro text-xl uppercase tracking-[0.1em] text-muted" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <textarea
        id={id}
        className={`w-full rounded-none border-2 border-ink bg-paper px-3 py-2.5 font-body text-base text-ink placeholder:text-ghost focus:outline-none focus:shadow-[0_0_0_3px_rgba(232,49,42,0.3)] ${className}`}
        {...props}
      />
      {error ? <span className="font-retro text-lg text-accent">{error}</span> : null}
    </div>
  );
};
