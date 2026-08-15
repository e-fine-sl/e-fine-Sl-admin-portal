'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OfficerMetricsDTO } from '@/types/officer.types';
import { 
    Users, 
    ShieldCheck, 
    ShieldAlert, 
    Building2, 
    FileText, 
    Radio
} from 'lucide-react';

interface OfficerMetricsCardsProps {
    metrics: OfficerMetricsDTO | null;
    loading: boolean;
}

export const OfficerMetricsCards: React.FC<OfficerMetricsCardsProps> = ({ metrics, loading }) => {
    if (loading || !metrics) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="animate-pulse shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-7 w-32 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Officers */}
            <Card className="shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Total Force
                    </CardTitle>
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Users className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-gray-900">
                        {metrics.totalOfficers.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Registered Police Officers
                    </p>
                </CardContent>
            </Card>

            {/* Active / Authorized Personnel */}
            <Card className="shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Active Officers
                    </CardTitle>
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <ShieldCheck className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-emerald-600">
                        {metrics.activeOfficers.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {metrics.onDutyOfficers} active mobile sessions
                    </p>
                </CardContent>
            </Card>

            {/* Suspended Accounts */}
            <Card className="shadow-sm border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Suspended / Inactive
                    </CardTitle>
                    <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                        <ShieldAlert className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-rose-600">
                        {metrics.suspendedOfficers.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Under inquiry or inactive
                    </p>
                </CardContent>
            </Card>

            {/* Stations Covered */}
            <Card className="shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Stations Covered
                    </CardTitle>
                    <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                        <Building2 className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-purple-600">
                        {metrics.stationsCoveredCount.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Police stations assigned
                    </p>
                </CardContent>
            </Card>

            {/* Total Violations Enforced */}
            <Card className="shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Citations Issued
                    </CardTitle>
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                        <FileText className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-gray-900">
                        {metrics.totalCitationsIssued.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Total tickets by force
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
