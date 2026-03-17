import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-foreground/80 ml-0.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        {...props}
        className={`px-3 py-2 bg-card border rounded-lg outline-none transition-base text-foreground placeholder:text-muted-foreground text-sm ${
          error
            ? 'border-destructive ring-2 ring-destructive/10'
            : 'border-input focus:border-primary focus:ring-2 focus:ring-primary/10'
        } disabled:bg-muted disabled:cursor-not-allowed ${className}`}
      />
      {error && <span className="text-xs text-destructive mt-0.5 ml-0.5">{error}</span>}
    </div>
  )
);

FormInput.displayName = 'FormInput';
