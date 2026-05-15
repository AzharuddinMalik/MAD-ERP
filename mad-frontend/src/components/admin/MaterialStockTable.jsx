import React from 'react';
import { Package, Edit3, Trash2, Search, ArrowUpDown, AlertTriangle } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import SearchBar from '../ui/SearchBar';

const StockIndicator = ({ current, minimum }) => {
    const ratio = minimum > 0 ? current / (minimum * 2) : 1;
    const percentage = Math.min(100, Math.max(0, ratio * 100));
    const isCritical = current <= minimum;
    const isLow = current <= minimum * 1.5 && !isCritical;

    // Premium Color Tokens
    const color = isCritical ? '#EF4444' : isLow ? '#F59E0B' : '#10B981';
    const bgGradient = isCritical 
        ? 'linear-gradient(90deg, #EF4444 0%, #B91C1C 100%)' 
        : isLow 
            ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)' 
            : 'linear-gradient(90deg, #10B981 0%, #059669 100%)';

    return (
        <div className="flex flex-col gap-2 min-w-[160px] group/stock">
            <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-admin-text tracking-tighter">
                        {current}
                    </span>
                    <span className="text-[10px] font-bold text-admin-text-muted/60 uppercase">
                        / {minimum * 2}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {isCritical && <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />}
                    <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md border shadow-sm ${
                        isCritical ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        isLow ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                        {isCritical ? 'Critical' : isLow ? 'Low' : 'Manifest'}
                    </span>
                </div>
            </div>
            
            <div className="h-2 w-full bg-admin-bg-tertiary rounded-full overflow-hidden border border-admin-border/50 p-[1px]">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out relative"
                    style={{
                        width: `${percentage}%`,
                        background: bgGradient,
                        boxShadow: `0 0 12px ${color}30`,
                    }}
                >
                    {/* Gloss effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2 rounded-full" />
                </div>
            </div>
        </div>
    );
};

const MaterialStockTable = ({ items, searchTerm, onSearchChange, categories, filterCategory, onFilterChange, isAdmin, onEdit, onDelete }) => {
    return (
        <div className="space-y-4">
            {/* Search + Filter Bar */}
            <div className="bg-admin-bg-secondary rounded-xl p-3 border border-admin-border flex flex-col md:flex-row gap-3">
                <SearchBar 
                    value={searchTerm}
                    onChange={onSearchChange}
                    placeholder="Search materials (e.g. Cement, Wire, Pipe)..."
                    className="flex-1"
                />
                <select
                    className="bg-admin-bg border border-admin-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-admin-accent transition-all min-w-[140px] font-bold font-admin cursor-pointer"
                    value={filterCategory}
                    onChange={(e) => onFilterChange(e.target.value)}
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-admin-bg-secondary rounded-xl border border-admin-border overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-admin-bg/40">
                                {['Material', 'Category', 'Project', 'Stock Level', 'Supplier', isAdmin && 'Actions'].filter(Boolean).map(header => (
                                    <th key={header} className={`px-5 py-3.5 text-[10px] font-bold text-admin-text-muted uppercase tracking-[0.12em] border-b border-admin-border font-admin ${header === 'Actions' ? 'text-right' : 'text-left'}`}>
                                        <span className="flex items-center gap-1.5 cursor-pointer hover:text-admin-text transition-colors">
                                            {header}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border/50">
                             {items.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="px-5 py-8">
                                        <EmptyState 
                                            title="No materials found"
                                            description="Try adjusting your search or filter criteria to find what you are looking for."
                                            icon={Package}
                                            className="bg-transparent border-none py-10"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-admin-hover transition-colors duration-150 group">
                                        {/* Material Name */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        backgroundColor: item.currentQuantity <= item.minimumStockLevel ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
                                                        color: item.currentQuantity <= item.minimumStockLevel ? '#EF4444' : '#6366F1'
                                                    }}
                                                >
                                                    {item.currentQuantity <= item.minimumStockLevel
                                                        ? <AlertTriangle className="w-4 h-4" />
                                                        : <Package className="w-4 h-4" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-admin-text text-sm font-admin leading-tight">{item.name}</p>
                                                    <p className="text-[10px] text-admin-text-muted font-medium font-admin mt-0.5">
                                                        {item.unitOfMeasure}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-admin-text-secondary bg-admin-bg px-2.5 py-1 rounded-md border border-admin-border/50 font-admin">
                                                {item.category}
                                            </span>
                                        </td>

                                        {/* Project */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm font-medium text-admin-text-secondary font-admin">
                                                {item.project?.name || <span className="text-admin-text-muted italic text-xs">Unallocated</span>}
                                            </span>
                                        </td>

                                        {/* Stock Level */}
                                        <td className="px-5 py-3.5">
                                            <StockIndicator current={item.currentQuantity} minimum={item.minimumStockLevel} />
                                        </td>

                                        {/* Supplier */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm font-medium text-admin-text font-admin">
                                                {item.vendor?.name || <span className="text-admin-text-muted italic text-xs">Local Purchase</span>}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        {isAdmin && (
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => onEdit?.(item)}
                                                        className="p-2 rounded-lg bg-admin-bg-tertiary border border-admin-border text-admin-text-muted hover:text-admin-accent hover:border-admin-accent/40 transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
                                                        title="Edit Specifications"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete?.(item.id)}
                                                        className="p-2 rounded-lg bg-admin-bg-tertiary border border-admin-border text-admin-text-muted hover:text-red-500 hover:border-red-500/40 transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
                                                        title="Purge Record"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer row count */}
                {items.length > 0 && (
                    <div className="px-5 py-2.5 border-t border-admin-border/50 bg-admin-bg/30">
                        <p className="text-[11px] text-admin-text-muted font-medium font-admin">
                            Showing <span className="text-admin-text font-bold font-mono">{items.length}</span> materials
                        </p>
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {items.length === 0 ? (
                    <EmptyState 
                        title="No materials found"
                        description="Try adjusting your search or filter criteria."
                        icon={Package}
                    />
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="bg-admin-bg-secondary rounded-2xl border border-admin-border p-4 shadow-sm relative overflow-hidden">
                            {item.currentQuantity <= item.minimumStockLevel && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            backgroundColor: item.currentQuantity <= item.minimumStockLevel ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
                                            color: item.currentQuantity <= item.minimumStockLevel ? '#EF4444' : '#6366F1'
                                        }}
                                    >
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-admin-text leading-tight">{item.name}</p>
                                        <div className="flex gap-2 mt-1.5">
                                            <span className="text-[9px] font-bold uppercase tracking-widest bg-admin-bg px-2 py-0.5 rounded border border-admin-border/50 text-admin-text-muted">
                                                {item.category}
                                            </span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-admin-accent">
                                                {item.unitOfMeasure}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="flex gap-2">
                                        <button onClick={() => onEdit?.(item)} className="p-2 bg-admin-bg border border-admin-border rounded-lg text-admin-text-muted">
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => onDelete?.(item)} className="p-2 bg-admin-bg border border-admin-border rounded-lg text-red-500/70">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-[9px] font-bold text-admin-text-muted uppercase tracking-[0.1em] mb-1">Target Project</p>
                                    <p className="text-xs font-semibold text-admin-text truncate">
                                        {item.project?.name || 'Unallocated'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-admin-text-muted uppercase tracking-[0.1em] mb-1">Supplier</p>
                                    <p className="text-xs font-semibold text-admin-text truncate">
                                        {item.vendor?.name || 'Local Purchase'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-admin-border/50">
                                <p className="text-[9px] font-bold text-admin-text-muted uppercase tracking-[0.1em] mb-2">Stock Integrity</p>
                                <StockIndicator current={item.currentQuantity} minimum={item.minimumStockLevel} />
                            </div>
                        </div>
                    ))
                )}
                {items.length > 0 && (
                    <p className="text-[10px] text-center text-admin-text-muted font-bold uppercase tracking-widest pt-2">
                        Total {items.length} units listed
                    </p>
                )}
            </div>
        </div>
    );
};

export default MaterialStockTable;
