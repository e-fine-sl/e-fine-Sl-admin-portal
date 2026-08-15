'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Search, RotateCcw, Download, Plus, Calendar } from 'lucide-react';
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

const COMMON_STATIONS = [
    'ALL',
    'Colombo Fort Police Station',
    'Pettah Police Station',
    'Borella Police Station',
    'Kollupitiya Police Station',
    'Bambalapitiya Police Station',
    'Cinnamon Gardens Police Station',
    'Wellawatte Police Station',
    'Maradana Police Station',
    'Kandy Police Station',
    'Galle Police Station',
    'Court Administration'
];

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
    const hasActiveFilters = search || status !== 'ALL' || policeStation !== 'ALL' || startDate || endDate;

    return (
        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
            {/* Top Bar: Search, Date Range, Status & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[240px]">
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

                    {/* Police Station Filter */}
                    <div className="w-44">
                        <Select value={policeStation} onValueChange={(v) => onPoliceStationChange(v)}>
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Police Station" />
                            </SelectTrigger>
                            <SelectContent>
                                {COMMON_STATIONS.map((station) => (
                                    <SelectItem key={station} value={station}>
                                        {station === 'ALL' ? 'All Police Stations' : station}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                        Filtered view active
                    </div>
                )}
            </div>
        </div>
    );
};
