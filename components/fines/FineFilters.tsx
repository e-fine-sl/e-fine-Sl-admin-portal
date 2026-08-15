'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { FineService } from '@/services/fineService';
import { Search, RotateCcw, Download, Plus, Calendar, Building2, ChevronDown, Check, X } from 'lucide-react';
import { FineStatus } from '@/types/fine.types';

interface FineFiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
    status: 'ALL' | FineStatus;
    onStatusChange: (val: 'ALL' | FineStatus) => void;
    policeStation: string;
    onPoliceStationChange: (val: string) => void;
    startDate: string;
    onStartDateChange: (val: string) => void;
    endDate: string;
    onEndDateChange: (val: string) => void;
    onResetFilters: () => void;
    onOpenExport: () => void;
    onOpenCreate: () => void;
    canCreate: boolean;
    totalResults: number;
}

export const FineFilters: React.FC<FineFiltersProps> = ({
    search,
    onSearchChange,
    status,
    onStatusChange,
    policeStation,
    onPoliceStationChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    onResetFilters,
    onOpenExport,
    onOpenCreate,
    canCreate,
    totalResults
}) => {
    // Dynamic database stations
    const [stations, setStations] = useState<Array<{ _id: string; name: string; stationCode?: string; district?: string }>>([]);
    const [stationQuery, setStationQuery] = useState('');
    const [isStationOpen, setIsStationOpen] = useState(false);
    const stationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        FineService.getStations()
            .then((data) => setStations(data || []))
            .catch((err) => console.error('Failed to load stations in filters:', err));
    }, []);

    // Close station dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (stationRef.current && !stationRef.current.contains(e.target as Node)) {
                setIsStationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter stations by query
    const filteredStations = useMemo(() => {
        if (!stationQuery.trim()) return stations;
        const q = stationQuery.toLowerCase();
        return stations.filter(
            (s) =>
                (s.name || '').toLowerCase().includes(q) ||
                (s.stationCode || '').toLowerCase().includes(q) ||
                (s.district || '').toLowerCase().includes(q)
        );
    }, [stations, stationQuery]);

    const hasActiveFilters = search || status !== 'ALL' || policeStation !== 'ALL' || startDate || endDate;

    return (
        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
            {/* Top Bar: Search, Date Range, Status & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by license #, vehicle plate, offense, place, officer..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-9 text-xs"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Pickers */}
                    <div className="flex items-center gap-1.5 bg-gray-50 border rounded-lg px-2 py-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="bg-transparent text-xs text-gray-700 outline-none w-28"
                            title="Start Date"
                        />
                        <span className="text-gray-400 text-xs">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="bg-transparent text-xs text-gray-700 outline-none w-28"
                            title="End Date"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="w-36">
                        <Select value={status} onValueChange={(v) => onStatusChange(v as any)}>
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Payment Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="PAID">Paid / Settled</SelectItem>
                                <SelectItem value="UNPAID">Unpaid / Pending</SelectItem>
                                <SelectItem value="DISPUTED">Disputed</SelectItem>
                                <SelectItem value="REFUNDED">Refunded / Court</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Searchable Database Police Station Filter */}
                    <div className="relative w-52" ref={stationRef}>
                        <button
                            type="button"
                            onClick={() => setIsStationOpen(!isStationOpen)}
                            className="w-full h-9 px-3 border rounded-md text-xs bg-white flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                        >
                            <div className="truncate pr-1">
                                {policeStation === 'ALL' ? (
                                    <span className="text-gray-500 flex items-center gap-1">
                                        <Building2 className="h-3 w-3 text-gray-400" />
                                        All Police Stations ({stations.length})
                                    </span>
                                ) : (
                                    <span className="font-semibold text-gray-900">{policeStation}</span>
                                )}
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        </button>

                        {/* Searchable dropdown menu */}
                        {isStationOpen && (
                            <div className="absolute right-0 top-10 w-64 bg-white rounded-lg border shadow-lg z-50 p-2 space-y-1.5 text-xs">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                    <Input
                                        placeholder="Search station or district..."
                                        value={stationQuery}
                                        onChange={(e) => setStationQuery(e.target.value)}
                                        className="h-7 text-xs pl-8 bg-gray-50"
                                        autoFocus
                                    />
                                    {stationQuery && (
                                        <button
                                            onClick={() => setStationQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                                    <div
                                        onClick={() => {
                                            onPoliceStationChange('ALL');
                                            setIsStationOpen(false);
                                            setStationQuery('');
                                        }}
                                        className={`p-1.5 rounded cursor-pointer flex items-center justify-between ${
                                            policeStation === 'ALL' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        <span>All Police Stations</span>
                                        {policeStation === 'ALL' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                                    </div>

                                    {filteredStations.map((st) => (
                                        <div
                                            key={st._id}
                                            onClick={() => {
                                                onPoliceStationChange(st.name);
                                                setIsStationOpen(false);
                                                setStationQuery('');
                                            }}
                                            className={`p-1.5 rounded cursor-pointer flex items-center justify-between ${
                                                policeStation === st.name ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <div className="truncate pr-1">
                                                <div className="font-medium truncate">{st.name}</div>
                                                {st.district && (
                                                    <div className="text-[10px] text-gray-400">{st.district} Province</div>
                                                )}
                                            </div>
                                            {policeStation === st.name && (
                                                <Check className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    ))}

                                    {filteredStations.length === 0 && (
                                        <div className="p-2 text-center text-gray-400 text-[11px]">
                                            No police stations found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onResetFilters}
                            className="h-9 text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                        </Button>
                    )}

                    {/* Download Ledger Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenExport}
                        className="h-9 text-xs font-semibold text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center gap-1.5"
                    >
                        <Download className="h-3.5 w-3.5 text-blue-600" />
                        Download Fines Ledger
                    </Button>

                    {/* Issue Fine Button */}
                    {canCreate && (
                        <Button
                            size="sm"
                            onClick={onOpenCreate}
                            className="h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Issue Citation
                        </Button>
                    )}
                </div>
            </div>

            {/* Results Count & Filter Scope */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t">
                <div>
                    Found <strong className="text-gray-900">{totalResults.toLocaleString()}</strong> traffic citation records matching active filters.
                </div>
                {hasActiveFilters && (
                    <div className="text-blue-600 font-medium">
                        Filtered view active {policeStation !== 'ALL' && `• Station: ${policeStation}`}
                    </div>
                )}
            </div>
        </div>
    );
};
