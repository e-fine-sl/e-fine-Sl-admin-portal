'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PaymentMetricsDTO } from '@/types/payment.types';
import { formatCurrency } from '@/lib/utils';
import { 
    DollarSign, 
    Calendar, 
    CheckCircle2, 
    CreditCard, 
    Activity, 
    Info, 
    Calculator,
    Scale,
    FileCheck2,
    ShieldAlert
} from 'lucide-react';

interface PaymentMetricsCardsProps {
    metrics: PaymentMetricsDTO | null;
    loading: boolean;
}

export const PaymentMetricsCards: React.FC<PaymentMetricsCardsProps> = ({ metrics, loading }) => {
    const [showRateInfo, setShowRateInfo] = useState(false);

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

    const paidCount = metrics.totalPaymentsCount || 0;
    const unpaidCount = metrics.unpaidPaymentsCount || 0;
    const totalIssuedCount = paidCount + unpaidCount;

    return (
        <>
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
                <Card className="shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow relative">
                    <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Collection Rate
                            </CardTitle>
                            <button
                                type="button"
                                onClick={() => setShowRateInfo(true)}
                                className="text-gray-400 hover:text-purple-600 transition-colors p-0.5 rounded focus:outline-none"
                                title="Click to view calculation breakdown"
                            >
                                <Info className="h-3.5 w-3.5" />
                            </button>
                        </div>
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

            {/* Collection Rate Calculation Details Modal */}
            <Dialog open={showRateInfo} onOpenChange={setShowRateInfo}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Calculator className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-gray-900">
                                    Collection Rate & Compliance Calculation
                                </DialogTitle>
                                <DialogDescription className="text-xs text-gray-500">
                                    Methodology and real-time ledger metrics breakdown.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-2 text-xs">
                        {/* Mathematical Formula Box */}
                        <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-100 space-y-2">
                            <div className="font-semibold text-purple-900 flex items-center gap-1.5">
                                <Scale className="h-4 w-4 text-purple-700" />
                                Official Standard Formula
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-purple-200 text-center font-mono text-xs text-purple-950 font-bold">
                                Collection Rate (%) = ( Paid Fines / Total Issued Fines ) × 100
                            </div>
                        </div>

                        {/* Live Calculation Table */}
                        <div className="border rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b text-gray-600 font-semibold">
                                    <tr>
                                        <th className="px-3 py-2">Metric Component</th>
                                        <th className="px-3 py-2 text-right">Count</th>
                                        <th className="px-3 py-2 text-right">Volume (LKR)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-gray-700">
                                    <tr>
                                        <td className="px-3 py-2.5 flex items-center gap-1.5 font-medium text-emerald-700">
                                            <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                                            Paid / Settled Fines
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono font-bold text-gray-900">
                                            {paidCount.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-medium text-emerald-600">
                                            {formatCurrency(metrics.totalRevenue)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 flex items-center gap-1.5 font-medium text-rose-700">
                                            <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                                            Outstanding / Pending Fines
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono font-bold text-gray-900">
                                            {unpaidCount.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-medium text-rose-600">
                                            {formatCurrency(metrics.unpaidRevenue || 0)}
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-50 font-bold text-gray-900 border-t">
                                        <td className="px-3 py-2.5">
                                            Total Violations Issued
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono">
                                            {totalIssuedCount.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono">
                                            {formatCurrency(metrics.totalRevenue + (metrics.unpaidRevenue || 0))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Computed Result Banner */}
                        <div className="bg-gray-50 p-3 rounded-lg border flex items-center justify-between">
                            <div>
                                <span className="text-gray-500 block">Calculation:</span>
                                <span className="font-mono text-gray-800">
                                    ({paidCount} / {totalIssuedCount > 0 ? totalIssuedCount : 1}) × 100
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-500 block">Result:</span>
                                <span className="text-base font-bold text-purple-700 font-mono">
                                    {metrics.collectionEfficiencyRate}%
                                </span>
                            </div>
                        </div>

                        {/* Administrative Purpose */}
                        <div className="text-gray-600 leading-relaxed text-[11px] space-y-1">
                            <strong className="text-gray-800 block">Purpose & Operational Use:</strong>
                            <p>
                                Measures citizen compliance with traffic penalties. Used by Sri Lanka Police Traffic Headquarters and the Ministry of Transport to monitor voluntary settlements before the 14-day statutory deadline, identify overdue violation trends, and initiate judicial summonses or license suspensions.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-3">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowRateInfo(false)}
                            className="text-xs"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
