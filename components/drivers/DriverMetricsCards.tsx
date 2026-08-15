'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DriverMetricsDTO } from '@/types/driver.types';
import { 
    Users, 
    ShieldCheck, 
    ShieldAlert, 
    AlertTriangle, 
    UserCheck,
    Star
} from 'lucide-react';

interface DriverMetricsCardsProps {
    metrics: DriverMetricsDTO | null;
    loading: boolean;
}

export const DriverMetricsCards: React.FC<DriverMetricsCardsProps> = ({ metrics, loading }) => {
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
            {/* Total Registered Drivers */}
            <Card className="shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Total Motorists
                    </CardTitle>
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Users className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-gray-900">
                        {metrics.totalDrivers.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Star className="h-3 w-3 text-amber-500 fill-current" />
                        <span>Avg Rating: {metrics.averageRating.toFixed(1)} / 5.0</span>
                    </div>
                </CardContent>
            </Card>

            {/* Active Driving Licenses */}
            <Card className="shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Active Licenses
                    </CardTitle>
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <ShieldCheck className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-emerald-600">
                        {metrics.activeDrivers.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Authorized driving privileges
                    </p>
                </CardContent>
            </Card>

            {/* Suspended Licenses */}
            <Card className="shadow-sm border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Suspended Licenses
                    </CardTitle>
                    <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                        <ShieldAlert className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-rose-600">
                        {metrics.suspendedDrivers.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Revoked / Demerit exhausted
                    </p>
                </CardContent>
            </Card>

            {/* High-Risk Drivers */}
            <Card className="shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        High-Risk Drivers
                    </CardTitle>
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-amber-600">
                        {metrics.highRiskDrivers.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Demerit points below 10 pts
                    </p>
                </CardContent>
            </Card>

            {/* KYC Verified */}
            <Card className="shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        KYC Verified
                    </CardTitle>
                    <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                        <UserCheck className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-purple-600">
                        {metrics.kycVerifiedCount.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Biometric / Identity verified
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
