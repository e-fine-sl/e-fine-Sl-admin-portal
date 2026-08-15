'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FineMetricsDTO } from '@/types/fine.types';
import { formatCurrency } from '@/lib/utils';
import { 
    FileText, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    TrendingUp
} from 'lucide-react';

interface FineMetricsCardsProps {
    metrics: FineMetricsDTO | null;
    loading: boolean;
}

export const FineMetricsCards: React.FC<FineMetricsCardsProps> = ({ metrics, loading }) => {
    if (loading || !metrics) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="animate-pulse bg-gray-50/80 border">
                        <CardContent className="p-4 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-7 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Total Citations Issued */}
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Citations</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {metrics.totalFines.toLocaleString()}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">
                            {formatCurrency(metrics.totalAmount)}
                        </p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <FileText className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>

            {/* 2. Settled Payments */}
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settled Fines</p>
                        <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                            {metrics.paidFines.toLocaleString()}
                        </h3>
                        <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                            {formatCurrency(metrics.paidAmount)}
                        </p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>

            {/* 3. Outstanding Unpaid */}
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unpaid Fines</p>
                        <h3 className="text-2xl font-bold text-rose-600 mt-1">
                            {metrics.unpaidFines.toLocaleString()}
                        </h3>
                        <p className="text-xs text-rose-700 mt-0.5 font-medium">
                            {formatCurrency(metrics.unpaidAmount)}
                        </p>
                    </div>
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                        <Clock className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>

            {/* 4. Collection Rate */}
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Collection Rate</p>
                        <h3 className="text-2xl font-bold text-blue-600 mt-1">
                            {metrics.collectionRate}%
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">
                            Settled vs Imposed
                        </p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>

            {/* 5. Disputed Citations */}
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Disputed Tickets</p>
                        <h3 className="text-2xl font-bold text-amber-600 mt-1">
                            {metrics.disputedFines.toLocaleString()}
                        </h3>
                        <p className="text-xs text-amber-700 mt-0.5 font-medium">
                            Under Investigation
                        </p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
