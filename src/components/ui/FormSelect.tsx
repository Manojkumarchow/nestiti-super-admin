import React from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-foreground/80 ml-0.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        {...props}
        className={`px-3 py-2 bg-card border rounded-lg outline-none transition-base text-foreground text-sm appearance-none cursor-pointer ${
          error
            ? 'border-destructive ring-2 ring-destructive/10'
            : 'border-input focus:border-primary focus:ring-2 focus:ring-primary/10'
        } disabled:bg-muted disabled:cursor-not-allowed ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-destructive mt-0.5 ml-0.5">{error}</span>}
    </div>
  )
);

FormSelect.displayName = 'FormSelect';
