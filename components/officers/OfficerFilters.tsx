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
import { Search, RotateCcw, Download, Plus, X, Building2, Shield, Radio } from 'lucide-react';
import { StationSimple } from '@/hooks/useOfficers';

interface OfficerFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    station: string;
    onStationChange: (station: string) => void;
    position: string;
    onPositionChange: (position: string) => void;
    status: 'ALL' | 'ACTIVE' | 'SUSPENDED';
    onStatusChange: (status: 'ALL' | 'ACTIVE' | 'SUSPENDED') => void;
    dutyState: 'ALL' | 'FOREGROUND' | 'BACKGROUND' | 'LOGGED_OUT';
    onDutyStateChange: (dutyState: 'ALL' | 'FOREGROUND' | 'BACKGROUND' | 'LOGGED_OUT') => void;
    stations: StationSimple[];
    onResetFilters: () => void;
    onOpenExport: () => void;
    onOpenCreate: () => void;
    canCreate: boolean;
    totalResults: number;
}

export const OfficerFilters: React.FC<OfficerFiltersProps> = ({
    search,
    onSearchChange,
    station,
    onStationChange,
    position,
    onPositionChange,
    status,
    onStatusChange,
    dutyState,
    onDutyStateChange,
    stations,
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
                        placeholder="Search by officer name, badge number, NIC, phone..."
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
                        Export Roster
                    </Button>

                    {canCreate && (
                        <Button
                            size="sm"
                            onClick={onOpenCreate}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-3.5 font-semibold flex items-center gap-1.5 shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Register Officer
                        </Button>
                    )}
                </div>
            </div>

            {/* Bottom Row: Granular Filters (Station, Position, Account Status, Duty State, Reset) */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t text-sm">
                {/* Police Station Dropdown */}
                <div className="w-48">
                    <Select value={station} onValueChange={onStationChange}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Police Stations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Police Stations</SelectItem>
                            {stations.map((st) => (
                                <SelectItem key={st._id || st.stationCode} value={st.name}>
                                    {st.name} {st.stationCode ? `(${st.stationCode})` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Position / Rank Dropdown */}
                <div className="w-44">
                    <Select value={position} onValueChange={onPositionChange}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Ranks / Positions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Ranks / Positions</SelectItem>
                            <SelectItem value="Constable">Constable</SelectItem>
                            <SelectItem value="Sergeant">Sergeant</SelectItem>
                            <SelectItem value="Sub-Inspector (SI)">Sub-Inspector (SI)</SelectItem>
                            <SelectItem value="Inspector (IP)">Inspector (IP)</SelectItem>
                            <SelectItem value="OIC">Officer-in-Charge (OIC)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Account Status Dropdown */}
                <div className="w-36">
                    <Select value={status} onValueChange={(v) => onStatusChange(v as any)}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Account Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="ACTIVE">Active Authorized</SelectItem>
                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Presence / Duty Status Dropdown */}
                <div className="w-40">
                    <Select value={dutyState} onValueChange={(v) => onDutyStateChange(v as any)}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Live Duty Presence" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Duty Presence</SelectItem>
                            <SelectItem value="FOREGROUND">On Duty (Foreground)</SelectItem>
                            <SelectItem value="BACKGROUND">Standby (Background)</SelectItem>
                            <SelectItem value="LOGGED_OUT">Offline (Logged Out)</SelectItem>
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
                    Reset
                </Button>
            </div>
        </div>
    );
};
