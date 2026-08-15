'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, RotateCcw, Download, Calendar, Filter, X } from 'lucide-react';
import { DatePresetType } from '@/hooks/usePayments';
import { PaymentStatus } from '@/types/payment.types';
import { SL_PROVINCES } from '@/types';

interface PaymentFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: PaymentStatus | 'ALL';
    onStatusChange: (status: PaymentStatus | 'ALL') => void;
    province: string;
    onProvinceChange: (province: string) => void;
    datePreset: DatePresetType;
    onDatePresetChange: (preset: DatePresetType) => void;
    startDate: string;
    onStartDateChange: (date: string) => void;
    endDate: string;
    onEndDateChange: (date: string) => void;
    onResetFilters: () => void;
    onOpenExport: () => void;
    totalResults: number;
}

export const PaymentFilters: React.FC<PaymentFiltersProps> = ({
    search,
    onSearchChange,
    status,
    onStatusChange,
    province,
    onProvinceChange,
    datePreset,
    onDatePresetChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    onResetFilters,
    onOpenExport,
    totalResults
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
            {/* Top Row: Search & Quick Presets & Export */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search by license, vehicle, payment ID, officer..."
                        className="pl-9 pr-8 w-full bg-gray-50 focus:bg-white text-sm"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {search && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Quick Date Presets */}
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                    {[
                        { label: 'All Time', value: 'ALL' },
                        { label: 'Today', value: 'TODAY' },
                        { label: 'Yesterday', value: 'YESTERDAY' },
                        { label: 'Last 7 Days', value: 'LAST_7_DAYS' },
                        { label: 'This Month', value: 'THIS_MONTH' },
                    ].map((p) => (
                        <Button
                            key={p.value}
                            variant={datePreset === p.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onDatePresetChange(p.value as DatePresetType)}
                            className="text-xs h-8 px-2.5 font-medium"
                        >
                            {p.label}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenExport}
                        className="text-xs h-8 px-3 ml-auto md:ml-2 font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
                    >
                        <Download className="h-3.5 w-3.5 text-blue-600" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Bottom Row: Granular Filters (Status, Province, Custom Dates, Reset) */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t text-sm">
                {/* Status Dropdown */}
                <div className="w-40">
                    <Select value={status} onValueChange={(val) => onStatusChange(val as PaymentStatus | 'ALL')}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Payment Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="PAID">Paid / Settled</SelectItem>
                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                            <SelectItem value="DISPUTED">Disputed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Province Dropdown */}
                <div className="w-44">
                    <Select value={province} onValueChange={onProvinceChange}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Provinces" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Island (Provinces)</SelectItem>
                            {SL_PROVINCES.map((prov) => (
                                <SelectItem key={prov} value={prov}>{prov} Province</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Custom Date Range Picker Inputs */}
                <div className="flex items-center gap-1.5">
                    <Input
                        type="date"
                        className="h-8 w-36 text-xs"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        placeholder="Start Date"
                    />
                    <span className="text-gray-400 text-xs">to</span>
                    <Input
                        type="date"
                        className="h-8 w-36 text-xs"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        placeholder="End Date"
                    />
                </div>

                {/* Reset Filters */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onResetFilters}
                    className="h-8 px-2 text-xs text-gray-500 hover:text-gray-800 ml-auto flex items-center gap-1"
                >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                </Button>
            </div>
        </div>
    );
};
