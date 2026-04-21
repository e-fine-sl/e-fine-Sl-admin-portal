'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DashboardStats, RecentActivity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
    FileText,
    DollarSign,
    Users,
    Shield,
    TrendingUp,
    Clock
} from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/admin/dashboard/stats');
                setStats(response.data.stats);
                setRecentActivity(response.data.recentActivity);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Fines',
            value: stats?.totalFines || 0,
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats?.totalRevenue || 0),
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Pending Payments',
            value: stats?.pendingPayments || 0,
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            title: 'Completed Payments',
            value: stats?.completedPayments || 0,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        {
            title: 'Total Drivers',
            value: stats?.totalDrivers || 0,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Suspended Drivers',
            value: stats?.suspendedDrivers || 0,
            icon: Users,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            title: 'Total Officers',
            value: stats?.totalOfficers || 0,
            icon: Shield,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
        },
        {
            title: 'Fines This Month',
            value: stats?.finesThisMonth || 0,
            icon: FileText,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50'
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of your traffic fine management system</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Fines */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Fines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentActivity?.recentFines && recentActivity.recentFines.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.recentFines.map((fine) => (
                                    <div
                                        key={fine._id}
                                        className="flex items-center justify-between border-b pb-3 last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{fine.offenseName}</p>
                                            <p className="text-xs text-gray-500">
                                                {fine.licenseNumber} • {fine.vehicleNumber}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm">
                                                {formatCurrency(fine.amount)}
                                            </p>
                                            <p className={`text-xs ${fine.status === 'PAID' ? 'text-green-600' : 'text-orange-600'
                                                }`}>
                                                {fine.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No recent fines</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Payments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentActivity?.recentPayments && recentActivity.recentPayments.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.recentPayments.map((payment) => (
                                    <div
                                        key={payment._id}
                                        className="flex items-center justify-between border-b pb-3 last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{payment.offenseName}</p>
                                            <p className="text-xs text-gray-500">
                                                {payment.licenseNumber}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm text-green-600">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No recent payments</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
