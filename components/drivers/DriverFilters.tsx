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
import { Search, RotateCcw, Download, Plus, X } from 'lucide-react';

interface DriverFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: 'ALL' | 'ACTIVE' | 'SUSPENDED';
    onStatusChange: (status: 'ALL' | 'ACTIVE' | 'SUSPENDED') => void;
    demeritLevel: 'ALL' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WARNING' | 'DANGER' | 'HIGH_RISK';
    onDemeritLevelChange: (level: any) => void;
    kycStatus: 'ALL' | 'VERIFIED' | 'PENDING';
    onKycStatusChange: (kyc: 'ALL' | 'VERIFIED' | 'PENDING') => void;
    onResetFilters: () => void;
    onOpenExport: () => void;
    onOpenCreate: () => void;
    canCreate: boolean;
    totalResults: number;
}

export const DriverFilters: React.FC<DriverFiltersProps> = ({
    search,
    onSearchChange,
    status,
    onStatusChange,
    demeritLevel,
    onDemeritLevelChange,
    kycStatus,
    onKycStatusChange,
    onResetFilters,
    onOpenExport,
    onOpenCreate,
    canCreate,
    totalResults
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
            {/* Top Row: Search & Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search by name, NIC, license, email, phone, vehicle..."
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

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenExport}
                        className="text-xs h-9 px-3 font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
                    >
                        <Download className="h-3.5 w-3.5 text-blue-600" />
                        Download Driver List
                    </Button>

                    {canCreate && (
                        <Button
                            size="sm"
                            onClick={onOpenCreate}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-3.5 font-semibold flex items-center gap-1.5 shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Register Driver
                        </Button>
                    )}
                </div>
            </div>

            {/* Bottom Row: Granular Filters (License Status, Demerit Risk Tier, KYC, Reset) */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t text-sm">
                {/* License Status Dropdown */}
                <div className="w-40">
                    <Select value={status} onValueChange={(v) => onStatusChange(v as any)}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="License Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All License Statuses</SelectItem>
                            <SelectItem value="ACTIVE">Active Authorized</SelectItem>
                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Demerit Risk Tier Dropdown */}
                <div className="w-48">
                    <Select value={demeritLevel} onValueChange={(v) => onDemeritLevelChange(v as any)}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Demerit Risk Tier" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Demerit Levels</SelectItem>
                            <SelectItem value="HIGH_RISK">⚠️ High Risk (Warning / Danger)</SelectItem>
                            <SelectItem value="EXCELLENT">Excellent (20 - 24 pts)</SelectItem>
                            <SelectItem value="GOOD">Good (15 - 19 pts)</SelectItem>
                            <SelectItem value="FAIR">Fair (10 - 14 pts)</SelectItem>
                            <SelectItem value="WARNING">Warning (5 - 9 pts)</SelectItem>
                            <SelectItem value="DANGER">Danger (1 - 4 pts)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* KYC Verification Status Dropdown */}
                <div className="w-40">
                    <Select value={kycStatus} onValueChange={(v) => onKycStatusChange(v as any)}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="KYC Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All KYC Statuses</SelectItem>
                            <SelectItem value="VERIFIED">KYC Verified</SelectItem>
                            <SelectItem value="PENDING">KYC Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Reset Filters */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onResetFilters}
                    className="h-8 px-2 text-xs text-gray-500 hover:text-gray-800 ml-auto flex items-center gap-1"
                >
                    <RotateCcw className="h-3 w-3" />
                    Reset Filters
                </Button>
            </div>
        </div>
    );
};
