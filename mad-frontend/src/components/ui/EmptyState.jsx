import React from 'react';
import { Search, Plus } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ 
    title = 'No results found', 
    description = 'Try adjusting your search or filters to find what you are looking for.', 
    icon: Icon = Search,
    actionLabel,
    onAction,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-20 px-4 text-center bg-admin-card rounded-2xl border border-admin-border border-dashed ${className}`}>
            <div className="w-16 h-16 bg-admin-bg rounded-2xl flex items-center justify-center mb-6 border border-admin-border shadow-inner">
                <Icon className="w-8 h-8 text-admin-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-admin-text mb-2 tracking-tight">
                {title}
            </h3>
            <p className="text-admin-text-secondary text-sm max-w-sm mb-8 leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button 
                    onClick={onAction}
                    icon={Plus}
                    className="shadow-lg shadow-primary/20"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
