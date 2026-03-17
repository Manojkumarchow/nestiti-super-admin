import React from 'react';

interface FormCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormCard: React.FC<FormCardProps> = ({ title, description, children, className = '' }) => (
  <div className={`bg-card border border-border rounded-xl p-6 shadow-sm ${className}`}>
    <div className="mb-5">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);
