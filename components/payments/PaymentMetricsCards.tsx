'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentMetricsDTO } from '@/types/payment.types';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, Calendar, CheckCircle2, CreditCard, Activity } from 'lucide-react';

interface PaymentMetricsCardsProps {
    metrics: PaymentMetricsDTO | null;
    loading: boolean;
}

export const PaymentMetricsCards: React.FC<PaymentMetricsCardsProps> = ({ metrics, loading }) => {
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
            {/* Total Lifetime Revenue */}
            <Card className="shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Total Revenue
                    </CardTitle>
                    <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                        <DollarSign className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(metrics.totalRevenue)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {metrics.totalPaymentsCount.toLocaleString()} total settlements
                    </p>
                </CardContent>
            </Card>

            {/* Outstanding / Unpaid Fines */}
            <Card className="shadow-sm border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Outstanding Fines
                    </CardTitle>
                    <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                        <CreditCard className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-rose-600">
                        {formatCurrency(metrics.unpaidRevenue || 0)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {(metrics.unpaidPaymentsCount || 0).toLocaleString()} pending settlements
                    </p>
                </CardContent>
            </Card>

            {/* Today's Collections */}
            <Card className="shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Today's Revenue
                    </CardTitle>
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Activity className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-blue-600">
                        {formatCurrency(metrics.todayRevenue)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {metrics.todayPaymentsCount} collected today
                    </p>
                </CardContent>
            </Card>

            {/* This Month's Revenue */}
            <Card className="shadow-sm border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        This Month
                    </CardTitle>
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Calendar className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(metrics.thisMonthRevenue)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {metrics.thisMonthPaymentsCount} fines paid this month
                    </p>
                </CardContent>
            </Card>

            {/* Collection Efficiency Rate */}
            <Card className="shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Collection Rate
                    </CardTitle>
                    <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="text-xl font-bold text-purple-600">
                        {metrics.collectionEfficiencyRate}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Settled compliance rate
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
