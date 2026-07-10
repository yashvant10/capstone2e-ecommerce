import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({ icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in-up">
      <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-8 shadow-sm">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 40 })}
      </div>
      <h3 className="font-display font-bold text-2xl text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link to={actionHref} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
