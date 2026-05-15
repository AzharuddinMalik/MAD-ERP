import React from 'react';

/**
 * Skeleton — Shimmer loading placeholders
 * 
 * Usage:
 *   <Skeleton className="h-8 w-32" />
 *   <SkeletonCard />
 *   <SkeletonTable rows={5} cols={4} />
 *   <SkeletonText lines={3} />
 */

// ═══════════════════════════════════════════════════
// Base Skeleton Element
// ═══════════════════════════════════════════════════
export const Skeleton = ({ className = '' }) => (
    <div
        className={`animate-pulse bg-slate-800 rounded-lg ${className}`}
        aria-hidden="true"
    />
);

// ═══════════════════════════════════════════════════
// KPI Card Skeleton
// ═══════════════════════════════════════════════════
export const SkeletonCard = () => (
    <div className="bg-admin-card p-5 rounded-xl border border-admin-border space-y-3">
        <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
            </div>
            <Skeleton className="w-10 h-10 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-14 rounded" />
            <Skeleton className="h-3 w-20" />
        </div>
    </div>
);

// ═══════════════════════════════════════════════════
// Table Skeleton
// ═══════════════════════════════════════════════════
export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div className="bg-admin-card rounded-xl border border-admin-border overflow-hidden">
        {/* Header */}
        <div className="grid gap-4 p-4 border-b border-admin-border bg-admin-card-hover/50" 
             style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={`h-${i}`} className="h-4 w-3/4" />
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, r) => (
            <div
                key={`r-${r}`}
                className="grid gap-4 p-4 border-b border-admin-border last:border-0"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
                {Array.from({ length: cols }).map((_, c) => (
                    <Skeleton
                        key={`c-${r}-${c}`}
                        className={`h-4 ${c === 0 ? 'w-full' : 'w-2/3'}`}
                    />
                ))}
            </div>
        ))}
    </div>
);

// ═══════════════════════════════════════════════════
// Text Lines Skeleton
// ═══════════════════════════════════════════════════
export const SkeletonText = ({ lines = 3 }) => (
    <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                className={`h-3.5 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
            />
        ))}
    </div>
);

// ═══════════════════════════════════════════════════
// Project Card Grid Skeleton
// ═══════════════════════════════════════════════════
export const SkeletonProjectCard = () => (
    <div className="bg-admin-card p-5 rounded-xl border border-admin-border space-y-4">
        <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
    </div>
);

export default Skeleton;
